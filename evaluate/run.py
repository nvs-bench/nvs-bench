import os

import modal

# Create the Modal app
app = modal.App("nvs-bench-evaluate")

nvs_bench_output_volume = modal.Volume.from_name("nvs-bench-output", create_if_missing=True)
nvs_bench_gcs_bucket = modal.CloudBucketMount(
    bucket_name="nvs-bench",
    bucket_endpoint_url="https://storage.googleapis.com",
    secret=modal.Secret.from_name(
        "gcp-hmac-secret", required_keys=["GOOGLE_ACCESS_KEY_ID", "GOOGLE_ACCESS_KEY_SECRET"]
    ),
)


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
        .add_local_file("evaluate/evaluate.py", "/root/workspace/nvs-bench/evaluate.py")
    ),
    volumes={
        "/nvs-bench-data": modal.Volume.from_name("nvs-bench-data", create_if_missing=True),
        "/nvs-bench-output": nvs_bench_output_volume,
        "/nvs-bench": nvs_bench_gcs_bucket,
    },
    gpu="T4",
    timeout=3600,
)
def evaluate(method: str, scene: str):
    os.system(f"python /root/workspace/nvs-bench/evaluate.py --method {method} --scene {scene}")
    nvs_bench_output_volume.commit()

    # Upload result to gcs bucket
    upload_dir = f"/nvs-bench/output/{scene}/{method}/"
    os.makedirs(upload_dir, exist_ok=True)
    os.makedirs(f"{upload_dir}/test_renders", exist_ok=True)
    os.system(f"cp /nvs-bench-output/{scene}/{method}/nvs-bench-result.json {upload_dir}/result.json")
    os.system(
        f"cp -r /nvs-bench-output/{scene}/{method}/test_renders/* {upload_dir}/test_renders/"
    )  # rm or rsync approaches don't work with mountpoint... so we go for this approach
    print(f"Uploaded results for {method} on {scene} to {upload_dir}")
    # TODO: Probably will want otherways to upload results. Like from local files if users provide them.


@app.function(
    image=modal.Image.debian_slim().apt_install("jq"),
    volumes={
        "/nvs-bench": nvs_bench_gcs_bucket,
    },
)
def aggregate_results():
    """Find all result.json files and combine them into one results.json file with proper JSON array format"""
    os.system("find /nvs-bench/output -name 'result.json' -exec cat {} + | jq -s '.' > /nvs-bench/output/results.json")
    print("Combined all result.json files into results.json with proper JSON array format")


@app.local_entrypoint()
def main(method: str, data: str | None = None):
    if data is not None:
        evaluate.remote(method, data)
        aggregate_results.remote()
    else:
        BENCHMARK_DATA = [  # noqa: N806
            # Mipnerf360
            "mipnerf360/bicycle",
            "mipnerf360/treehill",
            "mipnerf360/stump",
            "mipnerf360/room",
            "mipnerf360/kitchen",
            "mipnerf360/garden",
            "mipnerf360/flowers",
            "mipnerf360/counter",
            "mipnerf360/bonsai",
            # Tanks and Temples
            "tanksandtemples/truck",
            "tanksandtemples/train",
            # DeepBlending
            "deepblending/playroom",
            "deepblending/drjohnson",
            # ZipNerf
            "zipnerf/alameda",
            "zipnerf/berlin",
            "zipnerf/london",
            "zipnerf/nyc",
        ]
        # Have to do something a bit unusual to allow modal to iterate over the second kwarg
        list(evaluate.starmap((method, data) for data in BENCHMARK_DATA))
        aggregate_results.remote()

    os.system(
        "curl -o website/lib/results.json https://storage.googleapis.com/nvs-bench/output/results.json?t=$(date +%s)"
    )
