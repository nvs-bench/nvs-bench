#!/usr/bin/env python3
import argparse
import json
from collections import defaultdict


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--method", "-m", required=True, help="Method name")
    parser.add_argument("--results-file", "-f", default="website/lib/results.json", help="Results JSON file")
    args = parser.parse_args()

    # Load results
    with open(args.results_file) as f:
        results = json.load(f)

    # Filter by method
    method_results = [r for r in results if r["method_name"] == args.method]

    # Organize by dataset
    datasets = defaultdict(list)
    for result in method_results:
        datasets[result["dataset_name"]].append(
            {"scene": result["scene_name"], "psnr": result["psnr"], "ssim": result["ssim"], "lpips": result["lpips"]}
        )

    # Sort scenes
    for dataset in datasets:
        datasets[dataset].sort(key=lambda x: x["scene"])

    # Print markdown header
    print("# Results")

    dataset_averages = {}
    dataset_order = ["mipnerf360", "tanksandtemples", "deepblending", "zipnerf"]

    # Calculate dataset averages first
    for dataset in dataset_order:
        if dataset not in datasets:
            continue

        avg_psnr = sum(s["psnr"] for s in datasets[dataset]) / len(datasets[dataset])
        avg_ssim = sum(s["ssim"] for s in datasets[dataset]) / len(datasets[dataset])
        avg_lpips = sum(s["lpips"] for s in datasets[dataset]) / len(datasets[dataset])
        dataset_averages[dataset] = {"psnr": avg_psnr, "ssim": avg_ssim, "lpips": avg_lpips}

    overall_psnr = sum(avg["psnr"] for avg in dataset_averages.values()) / len(dataset_averages)
    overall_ssim = sum(avg["ssim"] for avg in dataset_averages.values()) / len(dataset_averages)
    overall_lpips = sum(avg["lpips"] for avg in dataset_averages.values()) / len(dataset_averages)

    print("Average across the whole benchmark (see renders at [nvs-bench.github.io](nvs-bench.github.io))")
    print()
    print(f"**PSNR:** {overall_psnr:.3f} | **SSIM:** {overall_ssim:.4f} | **LPIPS:** {overall_lpips:.4f}")
    print()

    # Print each dataset table
    for dataset in dataset_order:
        if dataset not in datasets:
            continue

        print(f"## {dataset.title()}")
        print()

        # Create markdown table
        print("| Scene | PSNR | SSIM | LPIPS |")
        print("|-------|------|------|-------|")

        for scene in datasets[dataset]:
            print(f"| {scene['scene']} | {scene['psnr']:.3f} | {scene['ssim']:.4f} | {scene['lpips']:.4f} |")

        # Add average row
        avg_data = dataset_averages[dataset]
        print(
            f"| **Average** | **{avg_data['psnr']:.3f}** | **{avg_data['ssim']:.4f}** | **{avg_data['lpips']:.4f}** |"
        )
        print()


if __name__ == "__main__":
    main()
