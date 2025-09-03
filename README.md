# [wip] Novel-View Synthesis Benchmark
Reproducible, standardized


Evaluating a new method is as simple as rendering images on the test splits of the benchmark datasets (already have them? skip to **upload**) and running `evaluate.py`

NVS-bench also provides a framework for taking any repo and running it on serverless GPUs (via Beam). If you're using vscode/cursor you can even open up a native dev experience backed by cloud gpus for quick development!

Our preferred way of generating them for a new repo consists of three simple files (located in `boilerplate/`):

- `Dockerfile` —- Your installation instructions
- `nvs_bench.sh` -- Your training / rendering commands
- `nvs_bench.py` —- (does not need to be edited) Runs training/rendering on a serverless gpu provider (we chose Beam for their RTX 4090s, <$30 free tier, and simple python interface)

# New Methods

1) Clone the `nvs-bench` boilerplate files into a new method's repo with:
```
git remote add nvs-bench https://github.com/N-Demir/nvs-bench.git && git subtree add --prefix=nvs-bench nvs-bench boilerplate-branch --squash
```
(we use `git subtree` to make boilerplate versioning and distribution easier)

2) Fill out 
- `image.py` with steps needed to install your method on a new machine or use an existing Dockerfile
- `eval.sh` with the commands for training, rendering, and moving of test renders to the `$output_folder/test_renders` folder





In our experience, very few lines of code need to be changed from the base templates for a new method to integrate with nvs-bench:

- choose a base docker image that matches your desired pytorch and cuda version from: https://hub.docker.com/r/pytorch/pytorch/tags (e.g. pytorch/pytorch:2.4.1-cuda12.4-cudnn9-devel)
- add install instructions for the repo’s dependencies/submodules (replace `conda install` with `pip install` as conda doesn't work in docker instructions)
- fill out the `nvs_bench.sh` with your train and render commands

# Running
You then have two ways to run the method on cloud gpus:
- vscode/cursor remote development server
- remote job/function

With Beam's $30 per month free credits you should have plenty to iterate and try out new methods

Note: beam's dockerfiles don't have layers cached yet but that is supposed to be coming soon.
