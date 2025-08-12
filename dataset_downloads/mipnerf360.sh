#! /bin/bash

# Download dataset
wget http://storage.googleapis.com/gresearch/refraw360/360_v2.zip
wget https://storage.googleapis.com/gresearch/refraw360/360_extra_scenes.zip

unzip 360_v2.zip -d mipnerf360
unzip 360_extra_scenes.zip -d mipnerf360

rm 360_v2.zip 360_extra_scenes.zip

rm flowers.txt treehill.txt # These were disclaimers from the original dataset that the extra_scenes were not yet available

# Remove the different resolution image folders and select the remaining images folder as:
# outdoor scenes: images_4 -> images, indoor scenes: images_2 -> images
cd mipnerf360
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