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


def list_modal_subdirs(path: str, volume: str = "nvs-bench"):
    """List all subdirectories in a given path in the modal volume.

    Args:
        path: The path to list subdirectories from (e.g., 'methods', 'results/method', 'results/method/dataset')

    Returns:
        List of subdirectory names
    """
    result = subprocess.run(
        f"modal volume ls {volume} {path} --json", shell=True, check=True, capture_output=True, text=True
    )
    volume_data = json.loads(result.stdout)

    # Extract subdirectory names from the directory listing
    subdirs = []
    for item in volume_data:
        if item["Type"] == "dir":
            # Extract the last part of the path as the subdirectory name
            subdir_name = item["Filename"].split("/")[-1]
            subdirs.append(subdir_name)

    return subdirs


def download_results(method: str, data: str | None = None):
    """Download only website_images and result.json files for a specific method."""
    subprocess.run("mkdir -p website/public/results/", shell=True, check=True)

    # Get all datasets for this method
    datasets = list_modal_subdirs(f"results/{method}") if data is None else [data.split("/")[0]]
    print(f"Found datasets for {method}: {datasets}")

    for dataset in datasets:
        # Get all scenes for this dataset
        scenes = list_modal_subdirs(f"results/{method}/{dataset}") if data is None else [data.split("/")[1]]
        print(f"Found scenes for {method}/{dataset}: {scenes}")

        for scene in scenes:
            try:
                # Create the local directory structure
                local_dir = f"website/public/results/{method}/{dataset}/{scene}"
                subprocess.run(f"mkdir -p {local_dir}", shell=True, check=True)

                # Download only the result.json file
                result_json_path = f"results/{method}/{dataset}/{scene}/result.json"
                subprocess.run(
                    f"modal volume get --force nvs-bench {result_json_path} {local_dir}/result.json",
                    shell=True,
                    check=True,
                )

                # Download only the website_images directory
                website_images_path = f"results/{method}/{dataset}/{scene}/website_images"
                subprocess.run(
                    f"modal volume get --force nvs-bench {website_images_path} {local_dir}", shell=True, check=True
                )

                print(f"Downloaded results for {method}/{dataset}/{scene}")

            except subprocess.CalledProcessError as e:
                print(f"Failed to download results for {method}/{dataset}/{scene}: {e}")
                continue


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
        methods = list_modal_subdirs("methods")
        print("Running evaluation on all methods with outputs in modal://nvs-bench/methods/")
    else:
        methods = [method]

    # Run evaluation for each method
    for method_name in tqdm(methods):
        print(f"Evaluating method: {method_name}")

        if data is not None:
            evaluate.remote(method_name, data)
            download_results(method_name, data)
        else:
            list(evaluate.starmap([(method_name, data) for data in BENCHMARK_DATA], return_exceptions=True))
            download_results(method_name)

    # Build the website with the downloaded results
    subprocess.run("cd website && pnpm run build", shell=True, check=True)
