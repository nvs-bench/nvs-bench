# Novel-View Synthesis Leaderboard
Evaluating a new method is as simple as rendering images on the test splits of the benchmark datasets (already have them? skip to **upload**) and running `evaluate.py`

NVS-leaderboard also provides a framework for taking any repo and running it on serverless GPUs (via Beam). If you're using vscode/cursor you can even open up a native dev experience backed by cloud gpus for quick development!

Our preferred way of generating them for a new repo consists of two simple components:

- `Dockerfile` — simple machine environment configuration (cuda, pytorch versions etc)
- `nvs_leaderboard.sh` -- user filled bash script for training / rendering images
- `nvs_leaderboard.py` — code to run training/eval on a serverless gpu provider (we chose Beam for their RTX 4090s, <$30 free tier, and simple python interface)

# Adding a New Method
In our experience, very few lines of code need to be changed from the base templates for a new method to integrate with nvs-leaderboard:

- choose a base docker image that matches your desired pytorch and cuda version from: https://hub.docker.com/r/pytorch/pytorch/tags (e.g. pytorch/pytorch:2.4.1-cuda12.4-cudnn9-devel)
- add install instructions for the repo’s dependencies/submodules (replace `conda install` with `pip install` as conda doesn't work in docker instructions)
- fill out the `nvs_leaderboard.sh` with your train and render commands

# Running
You then have two ways to run the method on cloud gpus:
- vscode/cursor remote development server
- remote job/function

With Beam's $30 per month free credits you should have plenty to iterate and try out new methods

Note: beam's dockerfiles don't have layers cached yet but that is supposed to be coming soon. 