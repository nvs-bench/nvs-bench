#!/usr/bin/env python3
"""
DeepBlending Dataset Download Script
Downloads and extracts DeepBlending datasets from the original source.
"""

import os
from pathlib import Path

DATASET = "deepblending"

# Original datasets taken from -- http://visual.cs.ucl.ac.uk/pubs/deepblending/datasets.html
SCENES = {
    "aquarium": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Aquarium-20_Reconstruction_Inputs_Outputs.zip",
    "bedroom": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Bedroom_Reconstruction_Inputs_Outputs.zip",
    "boats": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Boats_Reconstruction_Inputs_Outputs.zip",
    "bridge": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Bridge_Reconstruction_Inputs_Outputs.zip",
    "creepy_attic": "https://repo-sam.inria.fr/fungraph/deep-blending/data/CreepyAttic_Reconstruction_Inputs_Outputs.zip",
    "dr_johnson": "https://repo-sam.inria.fr/fungraph/deep-blending/data/DrJohnson_Reconstruction_Inputs_Outputs.zip",
    "hugo_1": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Hugo-1_Reconstruction_Inputs_Outputs.zip",
    "library": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Library_Reconstruction_Inputs_Outputs.zip",
    "lumber": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Lumber_Reconstruction_Inputs_Outputs.zip",
    "museum_1": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Museum-1_Reconstruction_Inputs_Outputs.zip",
    "museum_2": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Museum-2_Reconstruction_Inputs_Outputs.zip",
    "night_snow": "https://repo-sam.inria.fr/fungraph/deep-blending/data/NightSnow_Reconstruction_Inputs_Outputs.zip",
    "playroom": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Playroom_Reconstruction_Inputs_Outputs.zip",
    "ponche": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Ponche_Reconstruction_Inputs_Outputs.zip",
    "saint_anne": "https://repo-sam.inria.fr/fungraph/deep-blending/data/SaintAnne_Reconstruction_Inputs_Outputs.zip",
    "shed": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Shed_Reconstruction_Inputs_Outputs.zip",
    "street_10": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Street-10_Reconstruction_Inputs_Outputs.zip",
    "tree_18": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Tree-18_Reconstruction_Inputs_Outputs.zip",
    "yellowhouse_12": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Yellowhouse-12_Reconstruction_Inputs_Outputs.zip",
}


DOWNLOAD_FOLDER = Path(f"/nvs-leaderboard-downloads/{DATASET}")
DOWNLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
os.chdir(DOWNLOAD_FOLDER)

for scene_name, url in SCENES.items():
    filename = url.split("/")[-1]
    download_path = DOWNLOAD_FOLDER / filename

    if not download_path.exists():
        os.system(f'wget --tries=3 --waitretry=5 -O "{download_path}" "{url}"')

    os.system(f'unzip -o "{download_path}" -d unzip_folder')
    os.system(f'mv "unzip_folder/colmap" "{scene_name}"')

    os.system('rm -rf "unzip_folder"')
    os.system(f'rm -rf "{scene_name}/run-*" "{scene_name}/stereo"')
    # move things in scene_name/sparse into a subfolder scene_name/sparse/0
    sparse_dir = f"{scene_name}/sparse"
    temp_dir = f"{scene_name}/sparse_temp"

    # Create temporary directory and move sparse contents there
    os.system(f'mkdir -p "{temp_dir}"')
    os.system(f'mv "{sparse_dir}"/* "{temp_dir}/" 2>/dev/null || true')

    # Remove the original sparse directory
    os.system(f'rm -rf "{sparse_dir}"')

    # Create new sparse directory and move contents back
    os.system(f'mkdir -p "{sparse_dir}"')
    os.system(f'mv "{temp_dir}"/* "{sparse_dir}/" 2>/dev/null || true')

    # Clean up temporary directory
    os.system(f'rm -rf "{temp_dir}"')

    # remove the 0 folder from images if it exists
    os.system(f'rm -rf "{scene_name}/images/0" 2>/dev/null || true')
