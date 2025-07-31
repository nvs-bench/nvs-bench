import argparse
import os
import numpy as np
import imageio.v2 as imageio
from torchmetrics.functional.image import peak_signal_noise_ratio, structural_similarity_index_measure, learned_perceptual_image_patch_similarity

import torch
from tqdm import tqdm

def evaluate(gt_dir, rendered_dir):
    """
    Evaluates rendered images against ground truth images using PSNR, SSIM, and LPIPS.
    """
    gt_files = sorted(os.listdir(gt_dir))
    rendered_files = sorted(os.listdir(rendered_dir))

    # Filter out non-image files
    gt_files = [f for f in gt_files if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    rendered_files = [f for f in rendered_files if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

    if len(gt_files) != len(rendered_files):
        print("Error: The number of ground truth and rendered images do not match.")
        return

    psnr_scores = []
    ssim_scores = []
    lpips_scores = []

    for gt_file, rendered_file in tqdm(zip(gt_files, rendered_files), total=len(gt_files)):
        gt_path = os.path.join(gt_dir, gt_file)
        rendered_path = os.path.join(rendered_dir, rendered_file)

        gt_image = imageio.imread(gt_path)
        rendered_image = imageio.imread(rendered_path)

        gt_tensor = torch.from_numpy(gt_image).permute(2, 0, 1).float()
        rendered_tensor = torch.from_numpy(rendered_image).permute(2, 0, 1).float()

        # PSNR
        psnr_score = peak_signal_noise_ratio(rendered_tensor, gt_tensor, data_range=255.0)
        psnr_scores.append(psnr_score.item())

        # SSIM
        gt_tensor_ssim = (gt_tensor / 255.0).unsqueeze(0)
        rendered_tensor_ssim = (rendered_tensor / 255.0).unsqueeze(0)
        ssim_score = structural_similarity_index_measure(rendered_tensor_ssim, gt_tensor_ssim)
        ssim_scores.append(ssim_score.item())

        # LPIPS
        gt_tensor_lpips = (gt_tensor / 255.0).unsqueeze(0)
        rendered_tensor_lpips = (rendered_tensor / 255.0).unsqueeze(0)
        lpips_score = learned_perceptual_image_patch_similarity(gt_tensor_lpips, rendered_tensor_lpips, net_type='vgg', normalize=True)
        lpips_scores.append(lpips_score.item())

        print(f"Image: {gt_file}")
        print(f"  PSNR: {psnr_score:.4f}")
        print(f"  SSIM: {ssim_score:.4f}")
        print(f"  LPIPS: {lpips_score.item():.4f}")

    avg_psnr = np.mean(psnr_scores)
    avg_ssim = np.mean(ssim_scores)
    avg_lpips = np.mean(lpips_scores)

    print("\n" + "="*20)
    print("Average Scores:")
    print(f"  PSNR: {avg_psnr:.4f}")
    print(f"  SSIM: {avg_ssim:.4f}")
    print(f"  LPIPS: {avg_lpips:.4f}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate rendered images against ground truth.")
    parser.add_argument("gt_dir", type=str, help="Directory containing ground truth images.")
    parser.add_argument("rendered_dir", type=str, help="Directory containing rendered images.")
    args = parser.parse_args()

    evaluate(args.gt_dir, args.rendered_dir)
