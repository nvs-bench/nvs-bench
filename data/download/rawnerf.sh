#! /bin/bash
set -e

mkdir -p /nvs-bench/temp_downloads/rawnerf

gsutil -m rsync -r -d gs://nvs-bench/download/rawnerf/ /nvs-bench/temp_downloads/rawnerf/

cd /nvs-bench/temp_downloads/rawnerf

for scene in sharpshadow windowlegovary; do
    # Remove everything that's not images/ and sparse/
    cd /nvs-bench/temp_downloads/rawnerf/$scene
    mv images ../images
    mv sparse ../sparse
    rm -rf *
    mv ../images .
    mv ../sparse .

    python /root/data/utils/format_image_names.py /nvs-bench/temp_downloads/rawnerf/$scene
    cd /nvs-bench/temp_downloads/rawnerf
done

rm -rf /nvs-bench/data/rawnerf
mkdir -p /nvs-bench/data/rawnerf
mv /nvs-bench/temp_downloads/rawnerf/sharpshadow /nvs-bench/data/rawnerf/sharpshadow
mv /nvs-bench/temp_downloads/rawnerf/windowlegovary /nvs-bench/data/rawnerf/windowlegovary

gsutil -m rsync -r -d /nvs-bench/data/rawnerf gs://nvs-bench/data/rawnerf