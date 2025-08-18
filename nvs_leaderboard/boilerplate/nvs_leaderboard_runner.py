# You shouldn't need to edit this file, but feel free to take a look at how things are called and run remotely
import os
import subprocess
import time
from pathlib import Path, PurePosixPath

import modal
from nvs_leaderboard_image import image

nvs_leaderboard_data_volume = modal.Volume.from_name("nvs-leaderboard-data", create_if_missing=True)
nvs_leaderboard_output_volume = modal.Volume.from_name("nvs-leaderboard-output", create_if_missing=True)
cursor_volume = modal.Volume.from_name("cursor-volume", create_if_missing=True)

MODAL_VOLUMES: dict[str | PurePosixPath, modal.Volume] = {
    "/nvs-leaderboard-data": nvs_leaderboard_data_volume,
    "/nvs-leaderboard-output": nvs_leaderboard_output_volume,
    "/root/.cursor-server": cursor_volume,
}

app = modal.App(
    "nvs-leaderboard-" + Path.cwd().name,
    image=(
        # If you've already got a Dockerfile, just replace image with:
        # modal.Image.from_dockerfile("Dockerfile")
        image.apt_install("openssh-server", "wget", "unzip")
        .run_commands("mkdir /run/sshd")
        .add_local_file(
            Path.home() / ".ssh/id_rsa.pub", "/root/.ssh/authorized_keys"
        )  # If you don't have this keyfile locally, generate it with: ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
        # This overwrites the git cloned repo (used for install) with the current local directory
        .add_local_dir(Path.cwd(), f"/root/{Path.cwd().name}")
    ),
    volumes=MODAL_VOLUMES,
)


@app.function(
    timeout=3600,
    gpu="L40S",
)
def run(scene: str):
    # Kind of silly but modal requires reload/commit to avoid race conditions while using volumes
    nvs_leaderboard_data_volume.reload()
    os.system(f"bash nvs_leaderboard_eval.sh {scene}")
    nvs_leaderboard_output_volume.commit()


###### Dev Server ######

HOSTNAME = "modal-vscode-server"


def update_ssh_config(hostname, new_host, new_port):
    # Import here so we don't have to install it on the modal image
    from sshconf import read_ssh_config

    ssh_config_path = Path.home() / ".ssh" / "config"

    ssh_config_path.parent.mkdir(mode=0o700, exist_ok=True)
    if not ssh_config_path.exists():
        ssh_config_path.touch(mode=0o600)

    config = read_ssh_config(str(ssh_config_path))
    config.set(hostname, HostName=new_host, Port=new_port, User="root", StrictHostKeyChecking="no")
    config.write(str(ssh_config_path))

    ssh_config_path.chmod(0o600)


@app.function(
    timeout=3600 * 24,
    gpu="T4",
)
def start_ssh_tunnel(q: modal.Queue):
    with modal.forward(22, unencrypted=True) as tunnel:
        host, port = tunnel.tcp_socket
        q.put((host, port))

        # Added these commands to get the env variables that docker loads in through ENV to show up in the dev shell
        import shlex

        output_file = Path.home() / "env_variables.sh"

        with open(output_file, "w") as f:
            for key, value in os.environ.items():
                escaped_value = shlex.quote(value)
                f.write(f"export {key}={escaped_value}\n")
        subprocess.run("echo 'source ~/env_variables.sh' >> ~/.bashrc", shell=True)

        # Run openssh so that we can connect to it
        os.system("/usr/sbin/sshd -D")


def open_dev_environment():
    with modal.Queue.ephemeral() as q:
        start_ssh_tunnel.spawn(q)
        host, port = q.get(block=True)  # type: ignore
        print(f"Dev environment running at: {host}:{port}")

        # We need to create the ssh config entry before we can open vscode. For some reason
        # the remote-ssh extension doesn't work with full ssh urls, so it needs a config entry.
        update_ssh_config(HOSTNAME, host, port)

        # Open vscode/cursor for the user
        os.system(f"code --remote ssh-remote+{HOSTNAME} /root/workspace")

        while True:
            time.sleep(1)


@app.local_entrypoint()
def main(scene: str | None = None):
    """Run train/render on a scene or, if scene not provided, open a dev environment."""
    if scene is not None:
        run.remote(scene)
    else:
        open_dev_environment()
