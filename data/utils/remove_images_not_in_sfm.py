"""
Script to remove images from the images folder that are not in the SfM reconstruction.

This ensures that only images that were successfully reconstructed in COLMAP remain,
removing any images that failed to register or were excluded during reconstruction.

Note: this function is deployed as a modal function to be able to be called on demand
"""

import argparse
from pathlib import Path

import modal
from modal.volume import Volume

from data.utils.read_write_model import read_model

nvs_bench_volume = Volume.from_name("nvs-bench", create_if_missing=True)
app = modal.App(
    "nvs-bench",
    volumes={"/nvs-bench": nvs_bench_volume},
    image=modal.Image.debian_slim().pip_install("numpy"),
)


@app.function(volumes={"/nvs-bench": nvs_bench_volume})
def remove_images_not_in_sfm_modal(data: str):
    remove_images_not_in_sfm(Path("/nvs-bench/data") / data)
    nvs_bench_volume.commit()


def remove_images_not_in_sfm(data_path: str | Path):
    """Remove images from the images folder that are not in the SfM reconstruction."""
    data_path = Path(data_path)
    images_path = data_path / "images"
    model_path = data_path / "sparse/0"

    _, images, _ = read_model(model_path)  # type: ignore

    # Get set of image names that are in the reconstruction
    sfm_image_names = {img.name for img in images.values()}

    # Get all image files in the images directory
    image_extensions = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"}
    all_image_files = [f for f in images_path.iterdir() if f.is_file() and f.suffix in image_extensions]

    # Find images that are not in the reconstruction
    images_to_remove = [img_file for img_file in all_image_files if img_file.name not in sfm_image_names]

    # Remove the images
    removed_count = 0
    for img_file in images_to_remove:
        img_file.unlink()
        removed_count += 1

    print(f"Removed {removed_count} image(s) not in SfM reconstruction")
    print(f"Kept {len(sfm_image_names)} image(s) from SfM reconstruction")

    return removed_count


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Remove images from the images folder that are not in the SfM reconstruction"
    )
    parser.add_argument("data_path", help="Path to the dataset directory containing images/ and sparse/0/ folders")
    args = parser.parse_args()

    print(f"Removing images not in SfM reconstruction from {args.data_path}")
    remove_images_not_in_sfm(args.data_path)
