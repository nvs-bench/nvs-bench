#! /bin/bash

if [ ! -d /nvs-bench-downloads/zipnerf ]; then
    mkdir -p /nvs-bench-downloads/zipnerf
fi
cd /nvs-bench-downloads/zipnerf

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

unzip -o alameda.zip -d /nvs-bench-downloads/zipnerf
unzip -o berlin.zip -d /nvs-bench-downloads/zipnerf
unzip -o london.zip -d /nvs-bench-downloads/zipnerf
unzip -o nyc.zip -d /nvs-bench-downloads/zipnerf

# Remove the downresolution images
for scene in alameda berlin london nyc; do
    cd /nvs-bench-downloads/zipnerf/$scene
    rm -rf images_[0-9]*
    cd /nvs-bench-downloads/zipnerf
done

rm -rf /nvs-bench-data/zipnerf
mkdir -p /nvs-bench-data/zipnerf/
mv /nvs-bench-downloads/zipnerf/alameda /nvs-bench-data/zipnerf/alameda
mv /nvs-bench-downloads/zipnerf/berlin /nvs-bench-data/zipnerf/berlin
mv /nvs-bench-downloads/zipnerf/london /nvs-bench-data/zipnerf/london
mv /nvs-bench-downloads/zipnerf/nyc /nvs-bench-data/zipnerf/nyc