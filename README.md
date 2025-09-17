# Novel-View Synthesis Benchmark
<p align="center">
  <img src="website/public/logo.png" alt="NVS-Bench Logo" width="400"/>
</p>


**nvs-bench** is a standardized and easily reproducible novel-view synthesis (3D Gaussian Splats, NeRFs etc.) benchmark that anyone can set up on a new method in **~5 minutes** and **~10 lines of code**. It started from the following observations: 
- The NVS research community commonly evaluates on the same datasets.
- These datasets have different sourcing and preprocessing steps. 
- All methods expect the same input format and can output rendered images.
- Rendered images are all you need for evaluation.


It uses Modal to take any method and run it on a serverless L40S GPU (the cloud version of an RTX 4090). If you're using vscode/cursor you can even open up a native dev experience backed by cloud GPUs. Or, try the methods out in a browser with a hosted jupyter lab, vscode, or modal's new notebook experience. Their generous free tier ($30 a month) should be plenty.

After a method is run, it saves renders on the validation split of the dataset to a `test_renders` folder on the `nvs-bench` modal volume. Evalution can then be run separately to compare these renders to ground truth and calculate metrics. Because of this decoupling, it's also possible to submit results just by providing the `test_render` images and skip the integration. It's open ended, so just open a PR and we can discuss!

The main files for adding a new method are in `boilerplate/`:

- `image.py` — (Needs to be filled in) Your installation instructions, similar to a Dockerfile.
- `eval.sh` — (Needs to be filled in) Your training / rendering commands.
- `run.py` — Runs `eval.sh` with an image built from `image.py` on Modal.
- `dev_env.py` — if you have vscode/cursor, opens up a remote GPU-backed dev environment.

A summary of how to use these files is in `boilerplate/README.md` and each file should have plenty of instructional comments as well.

The boilerplate files are copied via `git subtree` into an `nvs-bench/` folder in the target method's repo. See some examples under `methods/`

# New Methods
## Installing
1) Clone the `nvs-bench` boilerplate files into a new method's repo with:
```
git remote add nvs-bench https://github.com/nvs-bench/nvs-bench.git && git subtree add --prefix=nvs-bench nvs-bench boilerplate-branch --squash
```
(we use `git subtree` to make boilerplate versioning and distribution easier)

2) Fill out 
- `image.py` with steps needed to install your method on a new machine or use an existing Dockerfile.
- `eval.sh` with the commands for training, rendering, and moving of test renders to the necessary `$output_folder/test_renders` folder.

## Running
Then, [install modal](https://modal.com/docs/guide#getting-started) and run it with `modal run -m nvs_bench.run --data <mipnerf360/bicycle>`

You also have the option of starting a remote dev vscode/cursor environment backed by cloud GPUs by running `modal run -m nvs_bench.dev_env`

## Evaluating
To evaluate, clone this repo locally (sorry, for now it will take a while because of all the website assets) and run `modal run -m evaluate.run --method <your-methods-name>` (the method name is automatically the folder `nvs_bench.run` runs from).


## Submitting Results
Evaluating should download the results locally, which you can view by running the website with `cd website/ && pnpm dev` (may need to install pnpm first).

To submit results, open up a PR with the following:
- the generated files from `evaluate.run`
- your method's info filled out in `website/lib/methods.json`
- the method repo added as a submodule to this repo with `git submodule add <git-url-to-your-repo> nvs-bench/`


# Acknowledgements
Machine Learning research is incredible because of the openness of its authors' contributions. This benchmark builds upon the foundational work of countless researchers and we thank them for open-sourcing their code and making research more reproducible.

We also want to highlight [nerfbaselines](https://nerfbaselines.github.io) for being the first to do something like this! Our hope is to improve on their work by offering a simpler integration method with some new bells and whistles. But, to accomplish that, we also had to drop some functionality. Check them out for an in-browser navigable viewer and additional datasets.

We also acknowledge Modal for providing the infrastructure that makes this benchmark accessible to everyone, and the broader computer vision and graphics community for their continued efforts in advancing the field.

Finally, thank YOU for any contributions or feedback that help us improve this benchmark!