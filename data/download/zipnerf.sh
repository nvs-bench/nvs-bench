#! /bin/bash
set -e

mkdir -p /nvs-bench/temp_downloads/zipnerf
cd /nvs-bench/temp_downloads/zipnerf

if [ ! -f alameda.zip ]; then
    wget https://storage.googleapis.com/gresearch/refraw360/zipnerf-undistorted/alameda.zip
fi
if [ ! -f berlin.zip ]; then
    wget https://storage.googleapis.com/gresearch/refraw360/zipnerf-undistorted/berlin.zip
fi
if [ ! -f london.zip ]; then
    wget https://storage.googleapis.com/gresearch/refraw360/zipnerf-undistorted/london.zip
fi
if [ ! -f nyc.zip ]; then
    wget https://storage.googleapis.com/gresearch/refraw360/zipnerf-undistorted/nyc.zip
fi

unzip -o alameda.zip -d /nvs-bench/temp_downloads/zipnerf
unzip -o berlin.zip -d /nvs-bench/temp_downloads/zipnerf
unzip -o london.zip -d /nvs-bench/temp_downloads/zipnerf
unzip -o nyc.zip -d /nvs-bench/temp_downloads/zipnerf

# Downsample factor 4 based on 3dgrut (these are large scenes after all)
DATA_FACTOR=4

for scene in alameda berlin london nyc; do
    cd /nvs-bench/temp_downloads/zipnerf/$scene
    rm -rf images && mv images_$DATA_FACTOR images
    rm -rf images_[0-9]*

    python /root/data/utils/format_image_names.py /nvs-bench/temp_downloads/zipnerf/$scene

    cd /nvs-bench/temp_downloads/zipnerf
done

# Clean the dest folder
rm -rf /nvs-bench/data/zipnerf
mkdir -p /nvs-bench/data/zipnerf/

rsync -av /nvs-bench/temp_downloads/zipnerf/alameda/ /nvs-bench/data/zipnerf/alameda/
rsync -av /nvs-bench/temp_downloads/zipnerf/berlin/ /nvs-bench/data/zipnerf/berlin/
rsync -av /nvs-bench/temp_downloads/zipnerf/london/ /nvs-bench/data/zipnerf/london/
rsync -av /nvs-bench/temp_downloads/zipnerf/nyc/ /nvs-bench/data/zipnerf/nyc/

gsutil -m rsync -r -d /nvs-bench/data/zipnerf gs://nvs-bench/data/zipnerf