"""
Script to take whatever image names there are and standardize them to be:
00001.JPG, 00002.JPG, 00003.JPG, etc.

Zero-padded naming convention is critical for correct sorting!
- Without zero-padding: "1.JPG", "10.JPG", "2.JPG" sorts incorrectly as "1.JPG", "10.JPG", "2.JPG"
- With zero-padding: "00001.JPG", "00010.JPG", "00002.JPG" sorts correctly as "00001.JPG", "00002.JPG", "00010.JPG"
- This ensures images are processed in the correct numerical order and downstream split into train/val sets reliably

Names aren't zero indexed, instead they match the image_ids.
This was done for simplicities sake to follow the existing COLMAP format, but
please mention any arguments for 0 indexing them.
"""

import argparse
import shutil
from pathlib import Path

from read_write_model import Image, read_model, write_model


def format_image_names(data_path: str | Path):
    """Format image names in both the images directory and the COLMAP model."""
    data_path = Path(data_path)
    images_path = data_path / "images"
    model_path = data_path / "sparse/0"

    cameras, images, points3D = read_model(model_path)  # type: ignore # noqa: N806

    image_names = sorted([img.name for img in images.values()])
    assert all(img.upper().endswith(".JPG") for img in image_names)

    old_name_to_new_name = {
        img_name: f"{i + 1:05d}.JPG" for i, img_name in enumerate(image_names)
    }  # i+1 = 1-indexed, 5-digit zero-padded

    # Create new Image objects with updated names and rename actual image files
    updated_images = {}
    for img_id, img in images.items():
        new_name = old_name_to_new_name[img.name]

        old_path = images_path / img.name
        new_path = images_path / new_name
        assert old_path.exists(), f"Image {img.name} does not exist... This should not happen!"
        old_path.rename(new_path)

        updated_images[img_id] = Image(
            id=img.id,
            qvec=img.qvec,
            tvec=img.tvec,
            camera_id=img.camera_id,
            name=new_name,
            xys=img.xys,
            point3D_ids=img.point3D_ids,
        )

    # Clear the model path folder
    shutil.rmtree(model_path)
    model_path.mkdir(parents=True, exist_ok=True)

    write_model(cameras, updated_images, points3D, model_path)

    return image_names


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Format image names to be zero-padded (00001.JPG, 00002.JPG, etc.)")
    parser.add_argument("data_path", help="Path to the dataset directory containing images/ and sparse/0/ folders")
    args = parser.parse_args()

    format_image_names(args.data_path)
