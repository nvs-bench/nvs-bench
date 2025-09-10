"""Modal script to run the dataset download scripts and upload to GCS

!! ONLY MEANT FOR GCS BUCKET OWNER TO RUN (requires gcs bucket write access) !!

If you are running nvs-bench methods, the datasets should get downloaded
from the public nvs-bench bucket automatically.

Or you can download them yourself with `gsutil rsync -r gs://nvs-bench/data/<dataset-name> ./<dataset-name>`
(see the exact usage in `boilerplate/run.py`).
"""

import os
from pathlib import Path

import modal

app = modal.App("nvs-bench-dataset-downloads")

nvs_bench_volume = modal.Volume.from_name("nvs-bench", create_if_missing=True)


@app.function(
    image=modal.Image.debian_slim(python_version="3.12")
    # Install gsutil (for downloading datasets the first time)
    .run_commands(
        "apt-get update && apt-get install -y apt-transport-https ca-certificates gnupg curl wget unzip rsync"
    )
    .run_commands(
        'echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg && apt-get update -y && apt-get install google-cloud-cli -y'
    )
    # Authenticate to gcloud with a service account key
    .add_local_file(
        Path.home() / "gcs-tour-project-service-account-key.json", "/root/gcs-service-account-key.json", copy=True
    )
    .run_commands("gcloud auth activate-service-account --key-file=/root/gcs-service-account-key.json")
    .workdir("/root")
    .add_local_dir("data", "/root/data"),
    volumes={"/nvs-bench": nvs_bench_volume},
    timeout=60 * 60,
)
def run(data_script: str | None = None):
    """data_script eg: zipnerf, mipnerf360, deepblending_and_tanksandtemples"""
    os.system(f"bash /root/data/download/{data_script}.sh")


@app.local_entrypoint()
def main(data_script: str | None = None):
    if data_script is None:
        DATA_SCRIPTS = [  # noqa: N806
            "zipnerf",
            "mipnerf360",
            "deepblending_and_tanksandtemples",
        ]
        run.for_each(DATA_SCRIPTS, ignore_exceptions=True)
    else:
        run.remote(data_script)
