#! /bin/bash

cd /nvs-leaderboard-downloads/
rm -rf zipnerf
mkdir zipnerf
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

unzip alameda.zip -d /nvs-leaderboard-downloads/zipnerf/alameda
unzip berlin.zip -d /nvs-leaderboard-downloads/zipnerf/berlin
unzip london.zip -d /nvs-leaderboard-downloads/zipnerf/london
unzip nyc.zip -d /nvs-leaderboard-downloads/zipnerf/nyc

# Remove the downresolution images
for scene in */; do
    cd "$scene"
    rm -rf images_[0-9]*
    cd ..
done

rm -rf /nvs-leaderboard-data/zipnerf
mv /nvs-leaderboard-downloads/zipnerf /nvs-leaderboard-data/zipnerf
