#! /bin/bash

#TODO: Download dataset

# Split train and test
mv tandt tandt_original

for scene in tandt_original/*/; do
    scene_name=$(basename "$scene")
    echo "Processing scene: $scene_name"
    python /root/workspace/split_train_test.py "$scene" "tandt/$scene_name"
done

rm -fr tandt_original