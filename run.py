import modal
import os

# Create the Modal app
app = modal.App("nvs-leaderboard-downloader")

@app.function(
    image=modal.Image.debian_slim().apt_install("wget", "unzip").add_local_dir("dataset_downloads", remote_path="/dataset_downloads"),
    volumes={"/nvs-leaderboard": modal.Volume.from_name("nvs-leaderboard", create_if_missing=True)},
    timeout=3600, 
)
def download_dataset():
    os.system("cd /nvs-leaderboard/data && bash /dataset_downloads/mipnerf360.sh")

@app.local_entrypoint()
def main():
    """Run the dataset download function"""
    download_dataset.remote()

if __name__ == "__main__":
    main()
