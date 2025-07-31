import modal
import os

# Create the Modal app
app = modal.App("nvs-leaderboard-downloader")

@app.function(
    image=modal.Image.debian_slim().apt_install("wget", "unzip").add_local_dir(".", remote_path="/root/workspace"),
    volumes={"/nvs-leaderboard-data": modal.Volume.from_name("nvs-leaderboard-data", create_if_missing=True),
             "/nvs-leaderboard-output": modal.Volume.from_name("nvs-leaderboard-output", create_if_missing=True)
    },
    timeout=3600, 
)
def download_dataset():
    # os.system("cd /nvs-leaderboard-data && bash /root/workspace/dataset_downloads/mipnerf360.sh")
    os.system("cd /nvs-leaderboard-data && bash /root/workspace/dataset_downloads/examples.sh")


@app.function(
    image=modal.Image.debian_slim().pip_install_from_requirements("requirements.txt").add_local_dir(".", remote_path="/root/workspace"),
    volumes={"/nvs-leaderboard-data": modal.Volume.from_name("nvs-leaderboard-data", create_if_missing=True),
             "/nvs-leaderboard-output": modal.Volume.from_name("nvs-leaderboard-output", create_if_missing=True)
    },
    gpu="T4",
    timeout=3600, 
)
def evaluate(method: str, dataset_and_scene: str):
    os.system(f"python /root/workspace/evaluate.py /nvs-leaderboard-data/{dataset_and_scene}/test/images/ /nvs-leaderboard-output/{dataset_and_scene}/{method}/renders_test/")