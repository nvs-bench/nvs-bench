#! /bin/bash
set -e

mkdir -p /nvs-bench/temp_downloads/deepblending_and_tanksandtemples
cd /nvs-bench/temp_downloads/deepblending_and_tanksandtemples

if [ ! -f tandt_db.zip ]; then
    wget https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/datasets/input/tandt_db.zip
fi

unzip -o tandt_db.zip

rm -rf /nvs-bench/data/deepblending/
mv db /nvs-bench/data/deepblending

# for every scene in deepblending/
for scene_full_path in /nvs-bench/data/deepblending/*; do
    python /root/data/utils/format_image_names.py $scene_full_path
done

rm -rf /nvs-bench/data/tanksandtemples/
mv tandt /nvs-bench/data/tanksandtemples/

# for every scene in tanksandtemples/
for scene_full_path in /nvs-bench/data/tanksandtemples/*; do
    python /root/data/utils/format_image_names.py $scene_full_path
done

gsutil -m rsync -r -d /nvs-bench/data/deepblending gs://nvs-bench/data/deepblending 
gsutil -m rsync -r -d /nvs-bench/data/tanksandtemples gs://nvs-bench/data/tanksandtemples