import argparse
import json
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


@dataclass
class Metrics:
    psnr: float
    ssim: float
    lpips: float


def evaluate_metrics(scene: str, method: str) -> Metrics:
    """Evaluates rendered images against ground truth images using PSNR, SSIM, and LPIPS."""
    gt_path = Path(f"/nvs-leaderboard-data/{scene}/images/")
    rendered_path = Path(f"/nvs-leaderboard-output/{scene}/{method}/test_renders/")

    gt_files = sorted([f.name for f in gt_path.iterdir() if f.is_file()])
    # Create the test dataset by selecting every 8th image
    gt_files = [name for idx, name in enumerate(gt_files) if idx % 8 == 0]

    rendered_files = sorted([f.name for f in rendered_path.iterdir() if f.is_file()])

    if len(gt_files) != len(rendered_files):
        raise ValueError("The number of ground truth and rendered images do not match.")

    print(f"Loading {len(gt_files)} image pairs...")

    # Check if GPU is available
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Process metrics one image at a time to avoid GPU memory issues
    psnr_scores = []
    ssim_scores = []
    lpips_scores = []

    for i, (gt_file, rendered_file) in enumerate(zip(gt_files, rendered_files)):
        print(f"Processing image {i + 1}/{len(gt_files)}: {gt_file}")

        # Load single image pair
        gt_image = imageio.imread(gt_path / gt_file)
        rendered_image = imageio.imread(rendered_path / rendered_file)

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


def read_time(scene: str, method: str) -> float:
    """
    Reads and prints the training time from a file.
    """
    time_file = Path(f"/nvs-leaderboard-output/{scene}/{method}/time.txt")
    if time_file.exists():
        with open(time_file) as f:
            time = f.read().strip()
            return float(time)
    else:
        raise FileNotFoundError(f"Training time file not found at: {time_file}")


def write_result_to_json(scene: str, method: str, metrics: Metrics, time: float):
    result_json_file_path = f"/nvs-leaderboard-output/{scene}/{method}/nvs-bench-result.json"

    result = {
        "method_name": method,
        "dataset_name": scene.split("/")[0],
        "scene_name": scene.split("/")[1],
        "psnr": metrics.psnr,
        "ssim": metrics.ssim,
        "lpips": metrics.lpips,
        "time": time,
    }
    print(result)

    with open(result_json_file_path, "w") as f:
        json.dump(result, f)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate rendered images against ground truth.")
    parser.add_argument("--method", type=str, required=True, help="Method name.")
    parser.add_argument("--scene", type=str, required=True, help="Scene name.")
    args = parser.parse_args()

    metrics = evaluate_metrics(args.scene, args.method)
    time = read_time(args.scene, args.method)
    write_result_to_json(args.scene, args.method, metrics, time)
