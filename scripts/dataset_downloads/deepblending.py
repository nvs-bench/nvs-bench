# DEPRECATED: Instead of downloading from the source, we now use the Inria 3DGS version that contains also processed
# tanks and temples scenes.
# See scripts/dataset_downloads/db_and_tandt.sh for the new script.

"""DeepBlending Dataset Download Script.

Only the most commonly used scenes are downloaded (dr_johnson, playroom), but you can uncomment the others
if you want them as well.
"""

import os
from pathlib import Path

DATASET = "deepblending"

# Original datasets taken from -- http://visual.cs.ucl.ac.uk/pubs/deepblending/datasets.html
SCENES = {
    # "aquarium": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Aquarium-20_Reconstruction_Inputs_Outputs.zip",
    # "bedroom": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Bedroom_Reconstruction_Inputs_Outputs.zip",
    # "boats": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Boats_Reconstruction_Inputs_Outputs.zip",
    # "bridge": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Bridge_Reconstruction_Inputs_Outputs.zip",
    # "creepy_attic": "https://repo-sam.inria.fr/fungraph/deep-blending/data/CreepyAttic_Reconstruction_Inputs_Outputs.zip",
    "dr_johnson": "https://repo-sam.inria.fr/fungraph/deep-blending/data/DrJohnson_Reconstruction_Inputs_Outputs.zip",
    # "hugo_1": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Hugo-1_Reconstruction_Inputs_Outputs.zip",
    # "library": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Library_Reconstruction_Inputs_Outputs.zip",
    # "lumber": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Lumber_Reconstruction_Inputs_Outputs.zip",
    # "museum_1": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Museum-1_Reconstruction_Inputs_Outputs.zip",
    # "museum_2": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Museum-2_Reconstruction_Inputs_Outputs.zip",
    # "night_snow": "https://repo-sam.inria.fr/fungraph/deep-blending/data/NightSnow_Reconstruction_Inputs_Outputs.zip",
    "playroom": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Playroom_Reconstruction_Inputs_Outputs.zip",
    # "ponche": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Ponche_Reconstruction_Inputs_Outputs.zip",
    # "saint_anne": "https://repo-sam.inria.fr/fungraph/deep-blending/data/SaintAnne_Reconstruction_Inputs_Outputs.zip",
    # "shed": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Shed_Reconstruction_Inputs_Outputs.zip",
    # "street_10": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Street-10_Reconstruction_Inputs_Outputs.zip",
    # "tree_18": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Tree-18_Reconstruction_Inputs_Outputs.zip",
    # "yellowhouse_12": "https://repo-sam.inria.fr/fungraph/deep-blending/data/Yellowhouse-12_Reconstruction_Inputs_Outputs.zip",
}


DOWNLOAD_FOLDER = Path(f"/nvs-leaderboard-downloads/{DATASET}")
DOWNLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
os.chdir(DOWNLOAD_FOLDER)

DATASET_FOLDER = Path(f"/nvs-leaderboard-data/{DATASET}")
DATASET_FOLDER.mkdir(parents=True, exist_ok=True)

for scene_name, url in SCENES.items():
    filename = url.split("/")[-1]
    download_path = DOWNLOAD_FOLDER / filename

    if not download_path.exists():
        os.system(f"wget --tries=3 --waitretry=5 -O {download_path} {url}")

    os.system(f"unzip -o {download_path} -d unzip_folder")
    os.system(f"mv unzip_folder/colmap {scene_name}")

    os.system("rm -rf unzip_folder")
    # Remove everything but the images and sparse folders inside of scene_name/
    os.system(f"mv {scene_name}/images images")
    os.system(f"mv {scene_name}/sparse sparse")
    os.system(f"rm -rf {scene_name}/*")
    os.system(f"mv images {scene_name}/images")
    os.system(f"mv sparse {scene_name}/sparse")

    # Nest the contents in sparse/ within sparse/0/
    os.system(f"mv {scene_name}/sparse {scene_name}/0")
    os.system(f"mkdir {scene_name}/sparse")
    os.system(f"mv {scene_name}/0 {scene_name}/sparse/0")

    os.system(f"mv {scene_name} {DATASET_FOLDER}/{scene_name}")
