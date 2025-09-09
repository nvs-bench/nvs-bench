#! /bin/bash
# This dataset is just used for testing the end to end functionality of the pipeline on new techniques

# TODO: Download it from online

# Split train and test
mv examples examples_original

for scene in examples_original/*/; do
    scene_name=$(basename "$scene")
    echo "Processing scene: $scene_name"
    python /root/workspace/split_train_test.py "$scene" "examples/$scene_name"
done

rm -fr examples_original

gsutil -m rsync -r -d /nvs-bench/data/examples gs://nvs-bench/data/examples