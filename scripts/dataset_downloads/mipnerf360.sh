#! /bin/bash

mkdir -p /nvs-bench/temp_downloads/mipnerf360
cd /nvs-bench/temp_downloads/mipnerf360

# Download dataset
if [ ! -f 360_v2.zip ]; then
    wget http://storage.googleapis.com/gresearch/refraw360/360_v2.zip
fi
if [ ! -f 360_extra_scenes.zip ]; then
    wget https://storage.googleapis.com/gresearch/refraw360/360_extra_scenes.zip
fi

unzip -o 360_v2.zip -d /nvs-bench/temp_downloads/mipnerf360
unzip -o 360_extra_scenes.zip -d /nvs-bench/temp_downloads/mipnerf360

rm /nvs-bench/temp_downloads/mipnerf360/flowers.txt /nvs-bench/temp_downloads/mipnerf360/treehill.txt # These were disclaimers from the original dataset that the extra_scenes were not yet available

# Remove the different resolution image folders and select the remaining images folder as:
# outdoor scenes: images_4 -> images, indoor scenes: images_2 -> images
for scene in bicycle flowers garden stump treehill room counter kitchen bonsai; do
    cd /nvs-bench/temp_downloads/mipnerf360/$scene
    case "$(basename "$scene")" in
        bicycle|flowers|garden|stump|treehill) echo "Processing $scene: selecting images_4" && rm -rf images && mv images_4 images ;;
        room|counter|kitchen|bonsai) echo "Processing $scene: selecting images_2" && rm -rf images && mv images_2 images ;;
    esac
    rm -rf images_[0-9]*
    cd /nvs-bench/temp_downloads/mipnerf360
done

# Remove poses_bounds.npy files from all scene folders
find . -name "poses_bounds.npy" -type f -delete

rm -rf /nvs-bench/data/mipnerf360
mkdir -p /nvs-bench/data/mipnerf360
mv /nvs-bench/temp_downloads/mipnerf360/bicycle /nvs-bench/data/mipnerf360/bicycle
mv /nvs-bench/temp_downloads/mipnerf360/flowers /nvs-bench/data/mipnerf360/flowers
mv /nvs-bench/temp_downloads/mipnerf360/garden /nvs-bench/data/mipnerf360/garden
mv /nvs-bench/temp_downloads/mipnerf360/stump /nvs-bench/data/mipnerf360/stump
mv /nvs-bench/temp_downloads/mipnerf360/treehill /nvs-bench/data/mipnerf360/treehill
mv /nvs-bench/temp_downloads/mipnerf360/room /nvs-bench/data/mipnerf360/room
mv /nvs-bench/temp_downloads/mipnerf360/counter /nvs-bench/data/mipnerf360/counter
mv /nvs-bench/temp_downloads/mipnerf360/kitchen /nvs-bench/data/mipnerf360/kitchen
mv /nvs-bench/temp_downloads/mipnerf360/bonsai /nvs-bench/data/mipnerf360/bonsai

gsutil -m rsync -r -d /nvs-bench/data/mipnerf360 gs://nvs-bench/data/mipnerf360
