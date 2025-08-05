# You shouldn't need to edit this file, but feel free to take a look at how things are called and run remotely
import os
from pathlib import Path
import socket
import subprocess
import threading
import time

import modal


nvs_leaderboard_data_volume = modal.Volume.from_name("nvs-leaderboard-data", create_if_missing=True)
nvs_leaderboard_output_volume = modal.Volume.from_name("nvs-leaderboard-output", create_if_missing=True)
MODAL_VOLUMES = {
    "/nvs-leaderboard-data": nvs_leaderboard_data_volume,
    "/nvs-leaderboard-output": nvs_leaderboard_output_volume,
}

app = modal.App("nvs-leaderboard-runner", 
                image=modal.Image.from_dockerfile("Dockerfile").run_commands(
                    "mkdir -p /run/sshd"
                ).add_local_file(Path.home() / ".ssh/id_rsa.pub", "/root/.ssh/authorized_keys")
                .add_local_file("nvs_leaderboard_eval.sh", "/root/workspace/nvs_leaderboard_eval.sh")
                )

@app.function(
    timeout=3600,
    gpu="T4",
    volumes=MODAL_VOLUMES,
)
def run(scene: str):
    # Kind of silly modal requires this to avoid race conditions while using volumes
    nvs_leaderboard_data_volume.reload()
    os.system(f"bash nvs_leaderboard_eval.sh {scene}")
    nvs_leaderboard_output_volume.commit()


###### Dev Server ######

LOCAL_PORT = 9090

def wait_for_port(host, port, q):
    start_time = time.monotonic()
    while True:
        try:
            with socket.create_connection(("localhost", 22), timeout=30.0):
                break
        except OSError as exc:
            time.sleep(0.01)
            if time.monotonic() - start_time >= 30.0:
                raise TimeoutError("Waited too long for port 22 to accept connections") from exc
        q.put((host, port))


@app.function(
    timeout=3600 * 24,
    gpu="T4",
    volumes=MODAL_VOLUMES
)
def run_server(q):
    with modal.forward(22, unencrypted=True) as tunnel:
        host, port = tunnel.tcp_socket
        threading.Thread(target=wait_for_port, args=(host, port, q)).start()

        # Added these commands to get the env variables that docker loads in through ENV to show up in my ssh
        import os
        import shlex
        from pathlib import Path

        output_file = Path.home() / "env_variables.sh"

        with open(output_file, "w") as f:
            for key, value in os.environ.items():
                escaped_value = shlex.quote(value)
                f.write(f'export {key}={escaped_value}\n')
        subprocess.run("echo 'source ~/env_variables.sh' >> ~/.bashrc", shell=True)

        subprocess.run(["/usr/sbin/sshd", "-D"])  # TODO: I don't know why I need to start this here


@app.local_entrypoint()
def run_server_and_tunnel():   
    import sshtunnel

    with modal.Queue.ephemeral() as q:
        run_server.spawn(q)
        host, port = q.get()
        print(f"SSH server running at {host}:{port}")

        ssh_tunnel = sshtunnel.SSHTunnelForwarder(
            (host, port),
            ssh_username="root",
            ssh_password=" ",
            remote_bind_address=("127.0.0.1", 22),
            local_bind_address=("127.0.0.1", LOCAL_PORT),
            allow_agent=False,
        )

        try:
            ssh_tunnel.start()
            print(f"SSH tunnel forwarded to localhost:{ssh_tunnel.local_bind_port}")
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nShutting down SSH tunnel...")
        finally:
            ssh_tunnel.stop()