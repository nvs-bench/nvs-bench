#! /bin/bash

#TODO: Download dataset

# Split train and test
mv db db_original

for scene in db_original/*/; do
    scene_name=$(basename "$scene")
    echo "Processing scene: $scene_name"
    python /root/workspace/split_train_test.py "$scene" "db/$scene_name"
done

rm -fr db_original