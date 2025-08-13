###### How to edit this file ######
# Docker and Dockerfiles are quite simple:
# - a dockerfile is the set of instructions for getting a fresh machine ready to run your code
# - start by defining a base image (FROM ...) based on the cuda and torch version you want. This gets the hard gpu driver stuff out of the way
# - set env vars with ENV ..., change directories with WORKDIR ..., and run commands with RUN ...
# - avoid using conda installs (just replace them with pip installs) because getting conda initialized in docker is a pain
# 
# Beam will handle building the docker image from this file, but you can also build it yourself and run it wherever you want
from modal import Image

image = (
    Image
    # Change this base image to whatever torch/cuda version you want
    .from_registry("pytorch/pytorch:2.4.1-cuda12.4-cudnn9-devel")
    .env(
        {
            # Set Torch CUDA Compatbility to be for RTX 4090, T4, L40s, and A100
            # If using a different GPU, make sure its torch cuda architecture version is added to the list
            "TORCH_CUDA_ARCH_LIST": "7.5;8.0;8.9;9.0;9.1",
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
    .workdir("/root/workspace")

    ###### Your Code Here ######
    # Would recommend pulling the repo from github (we later overwrite it with the current local directory) 
    # eg: .run_commands("git clone https://github.com/<repo-name>.git -b <optional-branch-name> --recursive .")

    # Install (avoid conda installs because they don't work well in dockerfile situations)
    # Separating these on separate lines helps if there are errors (previous lines will be cached) especially on the large package installs
    # eg:
    # .run_commands("pip install -e .")
    # .run_commands("pip install submodules/diff-gaussian-rasterization")
    # Note: If your run_commands step needs access to a gpu it's actually possible to do that through "run_commands(gpu='T4', ...)"
)