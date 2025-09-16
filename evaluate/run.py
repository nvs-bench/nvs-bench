import json
import os
import subprocess

import modal
from tqdm import tqdm

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
    subprocess.run(
        f"python /root/workspace/nvs-bench/evaluate.py --method {method} --data {data}", shell=True, check=True
    )

    # Upload result to gcs bucket
    upload_dir = f"/nvs-bench/results/{method}/{data}/"
    os.makedirs(upload_dir, exist_ok=True)
    os.makedirs(f"{upload_dir}/test_renders", exist_ok=True)
    os.makedirs(f"{upload_dir}/website_images", exist_ok=True)
    subprocess.run(
        f"cp /nvs-bench/methods/{method}/{data}/nvs-bench-result.json {upload_dir}/result.json", shell=True, check=True
    )
    subprocess.run(
        f"cp -r /nvs-bench/methods/{method}/{data}/test_renders/* {upload_dir}/test_renders/", shell=True, check=True
    )  # rm or rsync approaches don't work with mountpoint... so we go for this approach
    subprocess.run(
        f"cp -r /nvs-bench/methods/{method}/{data}/website_images/* {upload_dir}/website_images/",
        shell=True,
        check=True,
    )
    print(f"Uploaded results for {method} on {data} to {upload_dir}")

    nvs_bench_volume.commit()


def get_all_methods():
    """Get all method names from the modal volume nvs-bench methods/ folder.

    Runs 'modal volume ls nvs-bench methods --json' to get a JSON listing of all directories
    in the methods/ folder, then extracts the method names from the directory paths.

    Example command output:
    [
      {
        "Filename": "methods/3DGS-LM",
        "Type": "dir",
        "Created/Modified": "2025-09-08 13:58 EDT",
        "Size": "52 B"
      },
      {
        "Filename": "methods/gsplat",
        "Type": "dir",
        "Created/Modified": "2025-09-10 21:40 EDT",
        "Size": "52 B"
      },
      ...
    ]

    Returns a list of method names like ['3DGS-LM', 'gsplat', 'ever_training', ...]
    """
    result = subprocess.run(
        "modal volume ls nvs-bench methods --json", shell=True, check=True, capture_output=True, text=True
    )
    volume_data = json.loads(result.stdout)

    # Extract method names from the directory listing
    methods = []
    for item in volume_data:
        if item["Type"] == "dir":
            # Extract method name from "methods/method_name" format
            method_name = item["Filename"].split("/")[-1]
            methods.append(method_name)

    return methods


def download_results(method: str):
    subprocess.run("mkdir -p results/", shell=True, check=True)
    subprocess.run(
        f"modal volume get --force nvs-bench results/{method}/ website/public/results/", shell=True, check=True
    )
    subprocess.run(
        f"find website/public/results/{method} -type d -name 'test_renders' -exec rm -rf {{}} +", shell=True, check=True
    )
    subprocess.run("cd website && pnpm run build", shell=True, check=True)


@app.local_entrypoint()
def main(method: str | None = None, data: str | None = None):
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

    # Determine which methods to evaluate
    if method is None:
        methods = get_all_methods()
        print("Running evaluation on all methods with outputs in modal://nvs-bench/methods/")
    else:
        methods = [method]

    # Run evaluation for each method
    for method_name in tqdm(methods):
        print(f"Evaluating method: {method_name}")

        if data is not None:
            evaluate.remote(method_name, data)
        else:
            list(evaluate.starmap([(method_name, data) for data in BENCHMARK_DATA], return_exceptions=True))

        # Download results
        try:
            download_results(method_name)
        except subprocess.CalledProcessError as e:
            print(f"Failed to download results for method {method_name}: {e}")
            if method is not None:  # Only continue if evaluating all methods
                continue
