# You shouldn't need to edit this file, but feel free to take a look at how things are called and run remotely
import os
from pathlib import Path, PurePosixPath
import subprocess
import time

import modal
from nvs_leaderboard_image import image


nvs_leaderboard_data_volume = modal.Volume.from_name("nvs-leaderboard-data", create_if_missing=True)
nvs_leaderboard_output_volume = modal.Volume.from_name("nvs-leaderboard-output", create_if_missing=True)
MODAL_VOLUMES: dict[str | PurePosixPath, modal.Volume | modal.CloudBucketMount] = {
    "/nvs-leaderboard-data": nvs_leaderboard_data_volume,
    "/nvs-leaderboard-output": nvs_leaderboard_output_volume,
}

app = modal.App("nvs-leaderboard-runner", 
                image=image
                .apt_install("openssh-server")
                .run_commands("mkdir /run/sshd")
                .workdir("/root/workspace/")
                .add_local_file(Path.home() / ".ssh/id_rsa.pub", "/root/.ssh/authorized_keys") # If you don't have this keyfile locally, generate it with: ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
                # This overwrites the git cloned repo (used for install) with the current local directory
                .add_local_dir(Path.cwd(), "/root/workspace")
                )

@app.function(
    timeout=3600,
    gpu="L40S",
    volumes=MODAL_VOLUMES,
)
def run(scene: str):
    # Kind of silly but modal requires reload/commit to avoid race conditions while using volumes
    nvs_leaderboard_data_volume.reload()
    os.system(f"bash nvs_leaderboard_eval.sh {scene}")
    nvs_leaderboard_output_volume.commit()


###### Dev Server ######

HOSTNAME = "modal-vscode-server"

cursor_volume = modal.Volume.from_name("cursor-volume", create_if_missing=True)

def update_ssh_config(hostname, new_host, new_port):
    # Import here so we don't have to install it on the modal image
    from ssh_config.client import SSHConfig, Host

    ssh_config_path = Path.home() / ".ssh" / "config"
    
    # Create .ssh directory if it doesn't exist
    ssh_config_path.parent.mkdir(mode=0o700, exist_ok=True)
    
    # Create config file if it doesn't exist
    if not ssh_config_path.exists():
        ssh_config_path.touch(mode=0o600)
    
    # Parse existing config
    config = SSHConfig(str(ssh_config_path))
    
    # Check if host already exists
    if config.exists(hostname):
        config.update(hostname, {
            'HostName': new_host,
            'Port': int(new_port),
            'User': 'root',
            'StrictHostKeyChecking': "no",
        })
        print(f"Updated existing SSH config entry for {hostname}")
    else:
        # Add new host
        new_host_entry = Host(hostname, {
            'HostName': new_host,
            'Port': int(new_port),
            'User': 'root',
            'StrictHostKeyChecking': "no",
        })
        new_host_entry.attributes()
        config.add(new_host_entry)
        print(f"Added new SSH config entry for {hostname}")
    
    # Write back to file
    config.write()
    
    # Set proper permissions
    ssh_config_path.chmod(0o600)


@app.function(
    timeout=3600 * 24,
    gpu="T4",
    volumes={
        "/root/.cursor-server": cursor_volume,
        **MODAL_VOLUMES,
    }
)
def run_server(q: modal.Queue):
    with modal.forward(22, unencrypted=True) as tunnel:
        host, port = tunnel.tcp_socket
        q.put((host, port))

        # Added these commands to get the env variables that docker loads in through ENV to show up in my ssh when vscode connects
        import shlex

        output_file = Path.home() / "env_variables.sh"

        with open(output_file, "w") as f:
            for key, value in os.environ.items():
                escaped_value = shlex.quote(value)
                f.write(f'export {key}={escaped_value}\n')
        subprocess.run("echo 'source ~/env_variables.sh' >> ~/.bashrc", shell=True)

        # Run openssh so that we can connect to it
        os.system("/usr/sbin/sshd -D")


@app.local_entrypoint()
def run_server_and_tunnel():
    with modal.Queue.ephemeral() as q: 
        run_server.spawn(q)
        host, port = q.get(block=True) # type: ignore
        print(f"Server running at: {host}:{port}")

        # We need to create the ssh config entry before we can open vscode. For some reason
        # the remote-ssh extension doesn't work with full ssh urls, so it needs a config entry.
        update_ssh_config(HOSTNAME, host, port)

        # Open vscode for the user
        os.system(f"code --remote ssh-remote+{HOSTNAME} /root/workspace")

        while True:
            time.sleep(1)