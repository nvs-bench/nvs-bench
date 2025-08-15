#! /bin/bash

cd /nvs-leaderboard-downloads/

# Download dataset
if [ ! -f 360_v2.zip ]; then
    wget http://storage.googleapis.com/gresearch/refraw360/360_v2.zip
fi
if [ ! -f 360_extra_scenes.zip ]; then
    wget https://storage.googleapis.com/gresearch/refraw360/360_extra_scenes.zip
fi

unzip 360_v2.zip -d /nvs-leaderboard-data/mipnerf360
unzip 360_extra_scenes.zip -d /nvs-leaderboard-data/mipnerf360

rm /nvs-leaderboard-data/mipnerf360/flowers.txt /nvs-leaderboard-data/mipnerf360/treehill.txt # These were disclaimers from the original dataset that the extra_scenes were not yet available

# Remove the different resolution image folders and select the remaining images folder as:
# outdoor scenes: images_4 -> images, indoor scenes: images_2 -> images
cd /nvs-leaderboard-data/mipnerf360
for scene in */; do
    cd "$scene"
    case "$(basename "$scene")" in
        bicycle|flowers|garden|stump|treehill) rm -rf images && mv images_4 images ;;
        room|counter|kitchen|bonsai) rm -rf images && mv images_2 images ;;
    esac
    rm -rf images_[0-9]*
    cd ..
done

# Remove poses_bounds.npy files from all scene folders
find . -name "poses_bounds.npy" -type f -delete
