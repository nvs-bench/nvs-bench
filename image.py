from pathlib import Path, PurePosixPath

from modal import Image, Volume

method_name = Path.cwd().name
assert method_name != "nvs-bench", (
    "nvs-bench must be called from the method's directory, not the nvs-bench subdirectory. Eg: `modal run nvs-bench/image.py`."
)

data_volume = Volume.from_name("nvs-bench-data", create_if_missing=True)
output_volume = Volume.from_name("nvs-bench-output", create_if_missing=True)

modal_volumes: dict[str | PurePosixPath, Volume] = {
    "/nvs-bench-data": data_volume,
    "/nvs-bench-output": output_volume,
    # "/root/.cursor-server": Volume.from_name("cursor-volume", create_if_missing=True),
}


image = (
    Image.from_registry("pytorch/pytorch:2.4.1-cuda12.1-cudnn9-devel")
    .env(
        {
            # Set Torch CUDA Compatbility to be for RTX 4090, T4, L40s, and A100
            # If using a different GPU, make sure its torch cuda architecture version is added to the list
            "TORCH_CUDA_ARCH_LIST": "7.5;8.0;8.9;9.0",
            # Set environment variable to avoid interactive prompts from installing packages
            "DEBIAN_FRONTEND": "noninteractive",
            "TZ": "America/New_York",
        }
    )
    # Install git and various other helper dependencies
    .run_commands(
        "apt-get update && apt-get install -y \
            openssh-server \
            git \
            wget \
            unzip \
            cmake \
            build-essential \
            ninja-build \
            libglew-dev \
            libassimp-dev \
            libboost-all-dev \
            libgtk-3-dev \
            libopencv-dev \
            libglfw3-dev \
            libavdevice-dev \
            libavcodec-dev \
            libeigen3-dev \
            libtbb-dev \
            libopenexr-dev \
            libxi-dev \
            libxrandr-dev \
            libxxf86vm-dev \
            libxxf86dga-dev \
            libxxf86vm-dev \
            && rm -rf /var/lib/apt/lists/*"
    )
    .workdir(f"/root/{Path.cwd().name}")
    ###### Your Code Here ######
    # Probably easiest to pull the repo from github, but you can also copy files from your local machine with add_local_dir
    # eg: .run_commands("git clone https://github.com/graphdeco-inria/gaussian-splatting.git . --recursive")
    # Install (avoid conda installs because they don't work well in dockerfile situations)
    # Separating these on separate lines helps if there are errors (previous lines will be cached) especially on the large package installs
    # eg:
    # .run_commands("pip install submodules/diff-gaussian-rasterization")
    # .run_commands("pip install -e .")
    # Note: If your run_commands step needs access to a gpu it's actually possible to do that through "run_commands(gpu='T4', ...)"
)
