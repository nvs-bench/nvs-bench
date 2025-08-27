import os

import modal

# Create the Modal app
app = modal.App("nvs-leaderboard-downloader")

nvs_leaderboard_output_volume = modal.Volume.from_name("nvs-leaderboard-output", create_if_missing=True)


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
        .add_local_file("nvs_leaderboard/evaluate.py", "/root/workspace/nvs_leaderboard/evaluate.py")
    ),
    volumes={
        "/nvs-leaderboard-data": modal.Volume.from_name("nvs-leaderboard-data", create_if_missing=True),
        "/nvs-leaderboard-output": nvs_leaderboard_output_volume,
    },
    gpu="T4",
    timeout=3600,
)
def evaluate(method: str, scene: str):
    os.system(f"python /root/workspace/nvs_leaderboard/evaluate.py --method {method} --scene {scene}")
    nvs_leaderboard_output_volume.commit()


@app.function(
    image=modal.Image.debian_slim().apt_install("jq"),
    volumes={
        "/nvs-leaderboard-data": modal.Volume.from_name("nvs-leaderboard-data", create_if_missing=True),
        "/nvs-leaderboard-output": modal.Volume.from_name("nvs-leaderboard-output", create_if_missing=True),
        "/nvs-bench": modal.CloudBucketMount(
            bucket_name="nvs-bench",
            bucket_endpoint_url="https://storage.googleapis.com",
            secret=modal.Secret.from_name(
                "gcp-hmac-secret", required_keys=["GOOGLE_ACCESS_KEY_ID", "GOOGLE_ACCESS_KEY_SECRET"]
            ),
        ),
    },
    timeout=3600,
)
def upload_results(method: str, scene: str):
    # TODO: Probably will want otherways to upload results. Like from local files if users provide them.
    upload_dir = f"/nvs-bench/output/{scene}/{method}/"
    os.makedirs(upload_dir, exist_ok=True)
    os.system(f"cp /nvs-leaderboard-output/{scene}/{method}/nvs-bench-result.json {upload_dir}/result.json")
    os.system(f"cp -r /nvs-leaderboard-output/{scene}/{method}/test_renders/ {upload_dir}/test_renders/")
    print(f"Uploaded results for {method} on {scene} to {upload_dir}")

    # Find all result.json files and combine them into one results.json file with proper JSON array format
    # TODO: Edit this to only look for results in the following subfolders of /nvs-bench/output:
    # # Mipnerf360
    # "mipnerf360/bicycle",
    # "mipnerf360/treehill",
    # "mipnerf360/stump",
    # "mipnerf360/room",
    # "mipnerf360/kitchen",
    # "mipnerf360/garden",
    # "mipnerf360/flowers",
    # "mipnerf360/counter",
    # "mipnerf360/bonsai",
    # # Tanks and Temples
    # "tanksandtemples/truck",
    # "tanksandtemples/train",
    # # DeepBlending
    # "deepblending/playroom",
    # "deepblending/drjohnson",
    # # ZipNerf
    # "zipnerf/alameda",
    # "zipnerf/berlin",
    # "zipnerf/london",
    # "zipnerf/nyc",
    os.system("find /nvs-bench/output -name 'result.json' -exec cat {} + | jq -s '.' > /nvs-bench/output/results.json")
    print("Combined all result.json files into results.json with proper JSON array format")


@app.local_entrypoint()
def main(method: str, scene: str):
    evaluate.remote(method, scene)
    upload_results.remote(method, scene)

    os.system(
        "curl -o website/lib/results.json https://storage.googleapis.com/nvs-bench/output/results.json?t=$(date +%s)"
    )
