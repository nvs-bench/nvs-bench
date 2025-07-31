import argparse
from pathlib import Path
import numpy as np
import imageio.v2 as imageio
from torchmetrics.functional.image import peak_signal_noise_ratio, structural_similarity_index_measure, learned_perceptual_image_patch_similarity

import torch

def evaluate(gt_dir, rendered_dir):
    """
    Evaluates rendered images against ground truth images using PSNR, SSIM, and LPIPS.
    """
    gt_path = Path(gt_dir)
    rendered_path = Path(rendered_dir)
    
    gt_files = sorted([f.name for f in gt_path.iterdir() if f.is_file()])
    rendered_files = sorted([f.name for f in rendered_path.iterdir() if f.is_file()])

    # Filter out non-image files
    gt_files = [f for f in gt_files if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    rendered_files = [f for f in rendered_files if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

    if len(gt_files) != len(rendered_files):
        print("Error: The number of ground truth and rendered images do not match.")
        return

    print(f"Loading {len(gt_files)} image pairs...")
    
    # Load all images into tensors
    gt_tensors = []
    rendered_tensors = []

    for gt_file, rendered_file in zip(gt_files, rendered_files):
        gt_image = imageio.imread(gt_path / gt_file)
        rendered_image = imageio.imread(rendered_path / rendered_file)
        
        gt_tensors.append(torch.from_numpy(gt_image).permute(2, 0, 1).float())
        rendered_tensors.append(torch.from_numpy(rendered_image).permute(2, 0, 1).float())

    gt_batch = torch.stack(gt_tensors)  # Shape: [N, C, H, W]
    rendered_batch = torch.stack(rendered_tensors)  # Shape: [N, C, H, W]
    
    # PSNR
    psnr_scores = peak_signal_noise_ratio(rendered_batch, gt_batch, data_range=255.0)
    
    # SSIM
    gt_batch_ssim = gt_batch / 255.0
    rendered_batch_ssim = rendered_batch / 255.0
    ssim_scores = structural_similarity_index_measure(rendered_batch_ssim, gt_batch_ssim)
    
    # LPIPS
    gt_batch_lpips = gt_batch / 255.0
    rendered_batch_lpips = rendered_batch / 255.0
    lpips_scores = learned_perceptual_image_patch_similarity(gt_batch_lpips, rendered_batch_lpips, net_type='vgg', normalize=True)

    avg_psnr = psnr_scores.mean().item()
    avg_ssim = ssim_scores.mean().item()
    avg_lpips = lpips_scores.mean().item()

    print("\n" + "="*20)
    print("Metrics:")
    print(f"  PSNR: {avg_psnr:.4f}")
    print(f"  SSIM: {avg_ssim:.4f}")
    print(f"  LPIPS: {avg_lpips:.4f}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate rendered images against ground truth.")
    parser.add_argument("gt_dir", type=str, help="Directory containing ground truth images.")
    parser.add_argument("rendered_dir", type=str, help="Directory containing rendered images.")
    args = parser.parse_args()

    evaluate(args.gt_dir, args.rendered_dir)
