# TODO: Add an example
###### How to edit this file ######
# Docker and Dockerfiles are quite simple:
# - a dockerfile is the set of instructions for getting a fresh machine ready to run your code
# - start by defining a base image (FROM ...) based on the cuda and torch version you want. This gets the hard gpu driver stuff out of the way
# - set env vars with ENV ..., change directories with WORKDIR ..., and run commands with RUN ...
# - avoid using conda installs (just replace them with pip installs) because getting conda initialized in docker is a pain
# 
# Beam will handle building the docker image from this file, but you can also build it yourself and run it wherever you want

FROM pytorch/pytorch:2.4.1-cuda12.4-cudnn9-devel

# Set Torch CUDA Compatbility to be for RTX 4090, T4, and A100
# If using a different GPU, make sure its torch cuda architecture version is added to the list
ENV TORCH_CUDA_ARCH_LIST="7.5;8.0;8.9;9.0"

# Install git and various other helper dependencies
# Set environment variable to avoid interactive prompts from installing packages
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/New_York
RUN apt-get update && apt-get install -y \
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
    libxxf86vm-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /root/workspace

###### Method Installation ######
# Probably easiest to pull the repo from github, but you can also copy files from your local machine with COPY 
# eg: RUN git clone https://github.com/graphdeco-inria/gaussian-splatting.git . --recursive
# eg: COPY . .

# Install (avoid conda installs because they don't work well in dockerfile situations)
# Separating these on separate lines helps if there are errors (previous lines will be cached) especially on the large package installs
# eg:
# RUN pip install submodules/diff-gaussian-rasterization
# RUN pip install submodules/simple-knn
# RUN pip install submodules/fused-ssim
# RUN pip install -e .

# Note: If your install needs access to a gpu it's actually possible to do that through Beam's python sdk. Check their docs or reach out!