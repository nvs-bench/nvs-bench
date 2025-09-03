import os

import modal

# Create the Modal app
app = modal.App("nvs-bench-evaluate")

nvs_bench_volume = modal.Volume.from_name("nvs-bench", create_if_missing=True)


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
        "/nvs-bench": nvs_bench_volume,
    },
    gpu="T4",
    timeout=3600,
)
def evaluate(method: str, data: str):
    os.system(f"python /root/workspace/nvs-bench/evaluate.py --method {method} --data {data}")
    nvs_bench_volume.commit()

    # Upload result to gcs bucket
    upload_dir = f"/nvs-bench/results/{method}/{data}/"
    os.makedirs(upload_dir, exist_ok=True)
    os.makedirs(f"{upload_dir}/test_renders", exist_ok=True)
    os.makedirs(f"{upload_dir}/website_images", exist_ok=True)
    os.system(f"cp /nvs-bench/output/{method}/{data}/nvs-bench-result.json {upload_dir}/result.json")
    os.system(
        f"cp -r /nvs-bench/output/{method}/{data}/test_renders/* {upload_dir}/test_renders/"
    )  # rm or rsync approaches don't work with mountpoint... so we go for this approach
    os.system(f"cp -r /nvs-bench/output/{method}/{data}/website_images/* {upload_dir}/website_images/")
    print(f"Uploaded results for {method} on {data} to {upload_dir}")
    # TODO: Probably will want otherways to upload results. Like from local files if users provide them.


@app.function(
    image=modal.Image.debian_slim().apt_install("jq"),
    volumes={
        "/nvs-bench": nvs_bench_volume,
    },
)
def aggregate_results():
    """Find all result.json files and combine them into one results.json file with proper JSON array format"""
    os.system(
        "find /nvs-bench/results -name 'result.json' -exec cat {} + | jq -s '.' > /nvs-bench/results/results.json"
    )
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

    # TODO: Need to add a way to download the files from the volume locally or something...
    # os.system(
    #     "curl -o website/lib/results.json https://storage.googleapis.com/nvs-bench/output/results.json?t=$(date +%s)"
    # )
