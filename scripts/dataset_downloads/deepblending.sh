#! /bin/bash
set -euo pipefail # exit on error, treat use of unset variables as an error, return exit status of first fail

DATASET_NAME="deepblending"

######## Download From Original Source ########

# Original datasets taken from -- http://visual.cs.ucl.ac.uk/pubs/deepblending/datasets.html
URLS=(
    "https://repo-sam.inria.fr/fungraph/deep-blending/data/Aquarium-20_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/Bedroom_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/Boats_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/Bridge_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/CreepyAttic_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/DrJohnson_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/Hugo-1_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/Library_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/Lumber_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/Museum-1_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/Museum-2_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/NightSnow_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/Playroom_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/Ponche_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/SaintAnne_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/Shed_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/Street-10_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/Tree-18_Reconstruction_Inputs_Outputs.zip"
    # "https://repo-sam.inria.fr/fungraph/deep-blending/data/Yellowhouse-12_Reconstruction_Inputs_Outputs.zip"
)

ORIGINAL_DOWNLOAD_FOLDER="/nvs-leaderboard-downloads/$DATASET_NAME"

mkdir -p $ORIGINAL_DOWNLOAD_FOLDER
cd $ORIGINAL_DOWNLOAD_FOLDER

for url in "${URLS[@]}"; do
	echo "Downloading $url"
	filename=$(basename "$url")
	if [ ! -f "$ORIGINAL_DOWNLOAD_FOLDER/$filename" ]; then
		wget --no-verbose --tries=3 --waitretry=5 -O "$ORIGINAL_DOWNLOAD_FOLDER/$filename" "$url"
	fi
	echo "Unzipping $filename"
	unzip -o "$ORIGINAL_DOWNLOAD_FOLDER/$filename" > /dev/null # /dev/null to suppress noisy output
done

# rm -rf downloads

# # Split train and test
# mv db db_original

# for scene in db_original/*/; do
# 	scene_name=$(basename "$scene")
# 	echo "Processing scene: $scene_name"
# 	python /root/workspace/split_train_test.py "$scene" "db/$scene_name"
# done

# rm -fr db_original
