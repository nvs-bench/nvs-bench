import os

import modal

# Create the Modal app
app = modal.App("nvs-leaderboard-downloader")


# TODO: Delete if we don't need anymore: "/tour-storage": modal.CloudBucketMount(
# "tour_storage", bucket_endpoint_url="https://storage.googleapis.com",
# secret=modal.Secret.from_name("gcp-hmac-secret")
@app.function(
    image=(
        modal.Image.debian_slim()
        .apt_install("wget", "unzip", "imagemagick")
        .add_local_dir(".", remote_path="/root/workspace")
    ),
    volumes={
        "/nvs-leaderboard-data": modal.Volume.from_name("nvs-leaderboard-data", create_if_missing=True),
        "/nvs-leaderboard-output": modal.Volume.from_name("nvs-leaderboard-output", create_if_missing=True),
        "/nvs-leaderboard-downloads": modal.Volume.from_name("nvs-leaderboard-downloads", create_if_missing=True),
    },
    timeout=3600,
)
def download_dataset():
    # TODO: These probably should be parallelized across different modal workers
    # os.system("cd /nvs-leaderboard-data && bash /root/workspace/dataset_downloads/mipnerf360.sh")
    # os.system("cd /nvs-leaderboard-data && bash /root/workspace/dataset_downloads/examples.sh")
    # os.system("cd /nvs-leaderboard-data && bash /root/workspace/dataset_downloads/tandt.sh")
    # os.system("cd /nvs-leaderboard-data && bash /root/workspace/dataset_downloads/db.sh")
    os.system("cd /nvs-leaderboard-data && bash /root/workspace/dataset_downloads/zipnerf.sh")


@app.function(
    image=(
        modal.Image.debian_slim()
        .pip_install_from_requirements("requirements.txt")
        # Download lpips model to the image
        .run_commands(
            'python -c "'
            "from torchmetrics.functional.image import learned_perceptual_image_patch_similarity; "
            "import torch; "
            "learned_perceptual_image_patch_similarity(torch.rand(1, 3, 512, 512), torch.rand(1, 3, 512, 512), "
            "net_type='vgg', normalize=True)"
            '"'
        )
        .add_local_dir(".", remote_path="/root/workspace")
    ),
    volumes={
        "/nvs-leaderboard-data": modal.Volume.from_name("nvs-leaderboard-data", create_if_missing=True),
        "/nvs-leaderboard-output": modal.Volume.from_name("nvs-leaderboard-output", create_if_missing=True),
    },
    gpu="T4",
    timeout=3600,
)
def evaluate(method: str, scene: str):
    os.system(f"python /root/workspace/evaluate.py --method {method} --scene {scene}")
