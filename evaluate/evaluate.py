import argparse
import json
import os
from dataclasses import dataclass
from pathlib import Path

import imageio.v2 as imageio
import numpy as np
import torch
from torchmetrics.functional.image import (
    learned_perceptual_image_patch_similarity,
    peak_signal_noise_ratio,
    structural_similarity_index_measure,
)
from tqdm import tqdm


@dataclass
class Metrics:
    psnr: float
    ssim: float
    lpips: float


def get_image_pair_paths(data: str, method: str) -> list[tuple[Path, Path]]:
    gt_path = Path(f"/nvs-bench-data/{data}/images/")
    rendered_path = Path(f"/nvs-bench-output/{method}/{data}/test_renders/")
    gt_files = sorted([f for f in gt_path.iterdir() if f.is_file()])
    gt_files = [name for idx, name in enumerate(gt_files) if idx % 8 == 0]
    rendered_files = sorted([f for f in rendered_path.iterdir() if f.is_file()])

    if len(gt_files) != len(rendered_files):
        raise ValueError("The number of ground truth and rendered images do not match.")

    print(f"Loading {len(gt_files)} image pairs...")

    return list(zip(gt_files, rendered_files))


def evaluate_metrics(data: str, method: str) -> Metrics:
    """Evaluates rendered images against ground truth images using PSNR, SSIM, and LPIPS."""

    # Check if GPU is available
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Process metrics one image at a time to avoid GPU memory issues
    psnr_scores = []
    ssim_scores = []
    lpips_scores = []

    for i, (gt_file, rendered_file) in tqdm(enumerate(get_image_pair_paths(data, method))):
        # Load single image pair
        gt_image = imageio.imread(gt_file)
        rendered_image = imageio.imread(rendered_file)

        # Print image size information for first image
        if i == 0:
            print(f"Image size: {gt_image.shape}")

        # Convert to tensors and move to device
        gt_tensor = torch.from_numpy(gt_image).permute(2, 0, 1).float().unsqueeze(0).to(device)
        rendered_tensor = torch.from_numpy(rendered_image).permute(2, 0, 1).float().unsqueeze(0).to(device)

        # Calculate PSNR
        psnr = peak_signal_noise_ratio(rendered_tensor, gt_tensor, data_range=255.0)
        psnr_scores.append(psnr.item())

        # Calculate SSIM
        gt_tensor_ssim = gt_tensor / 255.0
        rendered_tensor_ssim = rendered_tensor / 255.0
        ssim = structural_similarity_index_measure(rendered_tensor_ssim, gt_tensor_ssim)
        # Handle SSIM tuple return
        if isinstance(ssim, tuple):
            ssim = ssim[0]
        ssim_scores.append(ssim.item())

        # Calculate LPIPS
        gt_tensor_lpips = gt_tensor / 255.0
        rendered_tensor_lpips = rendered_tensor / 255.0
        lpips = learned_perceptual_image_patch_similarity(
            gt_tensor_lpips, rendered_tensor_lpips, net_type="vgg", normalize=True
        )
        lpips_scores.append(lpips.item())

        # Clear GPU cache after each image to prevent memory accumulation
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    # Calculate averages
    avg_psnr = np.mean(psnr_scores).item()
    avg_ssim = np.mean(ssim_scores).item()
    avg_lpips = np.mean(lpips_scores).item()

    return Metrics(psnr=avg_psnr, ssim=avg_ssim, lpips=avg_lpips)


def read_time(data: str, method: str) -> float:
    """
    Reads and prints the training time from a file.
    """
    time_file = Path(f"/nvs-bench-output/{method}/{data}/time.txt")
    if time_file.exists():
        with open(time_file) as f:
            time = f.read().strip()
            return float(time)
    else:
        raise FileNotFoundError(f"Training time file not found at: {time_file}")


def read_memory(data: str, method: str) -> float:
    """
    Reads and prints the training memory from a file.
    """
    memory_file = Path(f"/nvs-bench-output/{method}/{data}/max_gpu_memory.txt")
    if memory_file.exists():
        with open(memory_file) as f:
            memory = f.read().strip()
            return float(memory)
    else:
        raise FileNotFoundError(f"Training memory file not found at: {memory_file}")


def write_result_to_json(data: str, method: str, metrics: Metrics, time: float):
    result_json_file_path = f"/nvs-bench-output/{method}/{data}/nvs-bench-result.json"

    result = {
        "method_name": method,
        "dataset_name": data.split("/")[0],
        "scene_name": data.split("/")[1],
        "psnr": metrics.psnr,
        "ssim": metrics.ssim,
        "lpips": metrics.lpips,
        "time": time,
        "max_gpu_memory": memory,
    }
    print(result)

    with open(result_json_file_path, "w") as f:
        json.dump(result, f)


def save_gt_and_render_image_pairs(data: str, method: str):
    image_pair_paths = get_image_pair_paths(data, method)

    # Select first, middle and last image pairs
    first_image_pair = image_pair_paths[0]
    middle_image_pair = image_pair_paths[len(image_pair_paths) // 2]
    last_image_pair = image_pair_paths[-1]

    os.makedirs(f"/nvs-bench-output/{method}/{data}/website_images/", exist_ok=True)
    os.system(f"cp {first_image_pair[0]} /nvs-bench-output/{method}/{data}/website_images/gt_0.png")
    os.system(f"cp {first_image_pair[1]} /nvs-bench-output/{method}/{data}/website_images/render_0.png")
    os.system(f"cp {middle_image_pair[0]} /nvs-bench-output/{method}/{data}/website_images/gt_1.png")
    os.system(f"cp {middle_image_pair[1]} /nvs-bench-output/{method}/{data}/website_images/render_1.png")
    os.system(f"cp {last_image_pair[0]} /nvs-bench-output/{method}/{data}/website_images/gt_2.png")
    os.system(f"cp {last_image_pair[1]} /nvs-bench-output/{method}/{data}/website_images/render_2.png")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate rendered images against ground truth.")
    parser.add_argument("--method", type=str, required=True, help="Method name.")
    parser.add_argument("--data", type=str, required=True, help="Data name. eg. mipnerf360/bicycle")
    args = parser.parse_args()

    metrics = evaluate_metrics(args.data, args.method)
    time = read_time(args.data, args.method)
    memory = read_memory(args.data, args.method)
    write_result_to_json(args.data, args.method, metrics, time)
    save_gt_and_render_image_pairs(args.data, args.method)
