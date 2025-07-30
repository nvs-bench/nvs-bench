import shutil
import numpy as np
from pathlib import Path
from read_write_model import read_model, write_model, Image


def split_colmap_dataset(input_path, output_path, test_every_nth=8):
    """
    Split a COLMAP dataset into train and test sets using systematic sampling.
    Takes every Nth image for the test set, following the original Gaussian Splatting approach.
    
    Args:
        input_path: Path to the COLMAP dataset (contains images/ and sparse/ folders)
        output_path: Path where train/ and test/ folders will be created
        test_every_nth: Take every Nth image for test set (default: 8, same as Gaussian Splatting)
        
    Returns:
        tuple: (train_path, test_path) - paths to the created train and test folders
    """
    input_path = Path(input_path).expanduser()
    output_path = Path(output_path).expanduser()
    images_dir = input_path / "images"
    sparse_dir = input_path / "sparse" / "0"
    
    # Validate input paths exist
    if not input_path.exists():
        raise ValueError(f"Input path does not exist: {input_path}")
    if not images_dir.exists():
        raise ValueError(f"Images directory not found: {images_dir}")
    if not sparse_dir.exists():
        raise ValueError(f"Sparse directory not found: {sparse_dir}")
    
    # Create output directory if it doesn't exist
    output_path.mkdir(parents=True, exist_ok=True)
    
    print(f"Reading COLMAP model from {sparse_dir}")
    
    # Read the COLMAP model
    model_data = read_model(str(sparse_dir))  # read_model expects string path
    if model_data is None:
        raise ValueError(f"Could not read COLMAP model from {sparse_dir}. "
                        "Make sure the directory contains cameras.bin, images.bin, and points3D.bin "
                        "(or .txt equivalents)")
    
    cameras, images, points3d = model_data
    
    print(f"Loaded {len(cameras)} cameras, {len(images)} images, {len(points3d)} 3D points")
    
    # Split using systematic sampling: every Nth image goes to test
    train_names = set()
    test_names = set()
    
    sorted_image_items = sorted(images.items(), key=lambda x: x[1].name)  # Sort by image name
    for i, (_, img) in enumerate(sorted_image_items):
        if i % test_every_nth == 0:
            test_names.add(img.name)
        else:
            train_names.add(img.name)
    
    
    # Create output directories
    train_path = output_path / "train"
    test_path = output_path / "test"
    
    for split_path in [train_path, test_path]:
        (split_path / "images").mkdir(parents=True, exist_ok=True)
        (split_path / "sparse" / "0").mkdir(parents=True, exist_ok=True)
    
    # Process train and test splits
    for split_names, split_path, split_name in [(train_names, train_path, "train"), 
                                                (test_names, test_path, "test")]:
        
        print(f"\nProcessing {split_name} split...")
        
        # Filter images for this split
        split_images = {}
        split_image_ids = set()
        
        for img_id, img in images.items():
            if img.name in split_names:
                split_images[img_id] = img
                split_image_ids.add(img_id)
        
        # Copy image files
        images_out_dir = split_path / "images"
        for img_name in split_names:
            src_path = images_dir / img_name
            dst_path = images_out_dir / img_name
            if src_path.exists():
                shutil.copy2(src_path, dst_path)
            else:
                print(f"Warning: Image file not found: {src_path}")
        
        # Filter 3D points: keep only points observed by at least 2 images in this split (COLMAP minimum)
        split_points3d = {}
        
        for point_id, point in points3d.items():
            # Check if any of the observing images are in this split
            observing_images_in_split = [img_id for img_id in point.image_ids 
                                       if img_id in split_image_ids]
            
            # Only keep points observed by at least 2 cameras (COLMAP's minimum condition for triangulation)
            if len(observing_images_in_split) >= 2:
                # Find the corresponding 2D point indices for the remaining images
                new_image_ids = []
                new_point2d_idxs = []
                
                for i, img_id in enumerate(point.image_ids):
                    if img_id in split_image_ids:
                        new_image_ids.append(img_id)
                        new_point2d_idxs.append(point.point2D_idxs[i])
                
                # Create new point with filtered observations
                split_points3d[point_id] = point._replace(
                    image_ids=np.array(new_image_ids),
                    point2D_idxs=np.array(new_point2d_idxs)
                )
        
        # Update images to remove references to filtered-out 3D points
        updated_split_images = {}
        valid_point_ids = set(split_points3d.keys())
        
        for img_id, img in split_images.items():
            # Filter point3D_ids to only include valid points
            valid_mask = np.isin(img.point3D_ids, list(valid_point_ids)) | (img.point3D_ids == -1)
            
            # Keep corresponding 2D points
            new_xys = img.xys[valid_mask]
            new_point3d_ids = img.point3D_ids[valid_mask]
            
            updated_split_images[img_id] = img._replace(
                xys=new_xys,
                point3D_ids=new_point3d_ids
            )
        
        print(f"  Filtered to {len(split_points3d)} 3D points (from {len(points3d)})")
        print(f"  Updated {len(updated_split_images)} images")
        
        # Write the split model
        sparse_out_dir = split_path / "sparse" / "0"
        write_model(cameras, updated_split_images, split_points3d, str(sparse_out_dir))  # write_model expects string path
        
        print(f"  Wrote {split_name} model to {sparse_out_dir}")
    
    total_images = len(train_names) + len(test_names)
    train_pct = len(train_names) / total_images * 100
    test_pct = len(test_names) / total_images * 100
    print("Split complete!")
    print(f"Train data: {train_path} - {len(train_names)} images ({train_pct:.1f}%)")
    print(f"Test data: {test_path} - {len(test_names)} images ({test_pct:.1f}%)")
    
    return train_path, test_path


def main():
    """Command-line interface for the dataset splitting function."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Split COLMAP dataset into train and test sets using systematic sampling (Gaussian Splatting style)")
    parser.add_argument("input_path", help="Path to COLMAP dataset directory")
    parser.add_argument("output_path", help="Path where train/ and test/ folders will be created")
    parser.add_argument("--test_every_nth", type=int, default=8, 
                       help="Take every Nth image for test set (default: 8, same as Gaussian Splatting)")
    
    args = parser.parse_args()
    
    split_colmap_dataset(
        args.input_path,
        args.output_path,
        test_every_nth=args.test_every_nth
    )
    print("Split completed successfully!")


if __name__ == "__main__":
    main()
