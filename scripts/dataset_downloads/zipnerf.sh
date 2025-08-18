#! /bin/bash

if [ ! -d /nvs-leaderboard-downloads/zipnerf ]; then
    mkdir -p /nvs-leaderboard-downloads/zipnerf
fi
cd /nvs-leaderboard-downloads/zipnerf

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

unzip -o alameda.zip -d /nvs-leaderboard-downloads/zipnerf
unzip -o berlin.zip -d /nvs-leaderboard-downloads/zipnerf
unzip -o london.zip -d /nvs-leaderboard-downloads/zipnerf
unzip -o nyc.zip -d /nvs-leaderboard-downloads/zipnerf

# Remove the downresolution images
for scene in alameda berlin london nyc; do
    cd /nvs-leaderboard-downloads/zipnerf/$scene
    rm -rf images_[0-9]*
    cd /nvs-leaderboard-downloads/zipnerf
done

rm -rf /nvs-leaderboard-data/zipnerf
mkdir -p /nvs-leaderboard-data/zipnerf/
mv /nvs-leaderboard-downloads/zipnerf/alameda /nvs-leaderboard-data/zipnerf/alameda
mv /nvs-leaderboard-downloads/zipnerf/berlin /nvs-leaderboard-data/zipnerf/berlin
mv /nvs-leaderboard-downloads/zipnerf/london /nvs-leaderboard-data/zipnerf/london
mv /nvs-leaderboard-downloads/zipnerf/nyc /nvs-leaderboard-data/zipnerf/nyc