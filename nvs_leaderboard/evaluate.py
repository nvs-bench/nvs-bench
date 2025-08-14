import argparse
from pathlib import Path

import imageio.v2 as imageio
import numpy as np
import torch
from torchmetrics.functional.image import (
    learned_perceptual_image_patch_similarity,
    peak_signal_noise_ratio,
    structural_similarity_index_measure,
)


def evaluate_metrics(gt_dir, rendered_dir):
    """
    Evaluates rendered images against ground truth images using PSNR, SSIM, and LPIPS.
    """
    gt_path = Path(gt_dir)
    rendered_path = Path(rendered_dir)

    gt_files = sorted([f.name for f in gt_path.iterdir() if f.is_file()])
    rendered_files = sorted([f.name for f in rendered_path.iterdir() if f.is_file()])

    # Filter out non-image files
    gt_files = [f for f in gt_files if f.lower().endswith((".png", ".jpg", ".jpeg"))]
    rendered_files = [f for f in rendered_files if f.lower().endswith((".png", ".jpg", ".jpeg"))]

    if len(gt_files) != len(rendered_files):
        print("Error: The number of ground truth and rendered images do not match.")
        return

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
    avg_psnr = np.mean(psnr_scores)
    avg_ssim = np.mean(ssim_scores)
    avg_lpips = np.mean(lpips_scores)

    print("\n" + "=" * 20)
    print("Metrics:")
    print(f"  PSNR: {avg_psnr:.4f}")
    print(f"  SSIM: {avg_ssim:.4f}")
    print(f"  LPIPS: {avg_lpips:.4f}")


def read_training_time(scene, method):
    """
    Reads and prints the training time from a file.
    """
    time_file = Path(f"/nvs-leaderboard-output/{scene}/{method}/training_time.txt")
    if time_file.exists():
        with open(time_file) as f:
            training_time = f.read().strip()
            print(f"Training took {training_time} seconds")
    else:
        print(f"Training time file not found at: {time_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate rendered images against ground truth.")
    parser.add_argument("--method", type=str, required=True, help="Method name.")
    parser.add_argument("--scene", type=str, required=True, help="Scene name.")
    args = parser.parse_args()

    # Hardcoding the base paths for now.
    # User might need to change these depending on their setup.
    gt_dir = f"/nvs-leaderboard-data/{args.scene}/test/images/"
    rendered_dir = f"/nvs-leaderboard-output/{args.scene}/{args.method}/renders_test/"

    evaluate_metrics(gt_dir, rendered_dir)
    read_training_time(args.scene, args.method)
