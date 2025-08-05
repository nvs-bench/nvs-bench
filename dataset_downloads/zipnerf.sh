#! /bin/bash

cd /nvs-leaderboard-data/
rm -rf zipnerf
mkdir zipnerf

wget https://storage.googleapis.com/gresearch/refraw360/zipnerf-undistorted/alameda.zip
wget https://storage.googleapis.com/gresearch/refraw360/zipnerf-undistorted/berlin.zip
wget https://storage.googleapis.com/gresearch/refraw360/zipnerf-undistorted/london.zip
wget https://storage.googleapis.com/gresearch/refraw360/zipnerf-undistorted/nyc.zip

unzip alameda.zip -d zipnerf/alameda
unzip berlin.zip -d zipnerf/berlin
unzip london.zip -d zipnerf/london
unzip nyc.zip -d zipnerf/nyc

# rm alameda.zip berlin.zip london.zip nyc.zip

# Remove the downresolution images
for scene in */; do
    cd "$scene"
    rm -rf images_[0-9]*
    cd ..
done

# Split train and test
cd /nvs-leaderboard-data/
mv zipnerf zipnerf_original

# for scene in zipnerf_original/*/; do
#     scene_name=$(basename "$scene")
#     echo "Processing scene: $scene_name"
#     python /root/workspace/split_train_test.py "$scene" "zipnerf/$scene_name"
# done

# rm -fr zipnerf_original