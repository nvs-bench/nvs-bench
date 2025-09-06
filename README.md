# [wip] Novel-View Synthesis Benchmark
Reproducible, standardized


Evaluating a new method is as simple as rendering images on the test splits of the benchmark datasets (already have them? skip to **upload**) and running `evaluate.py`

NVS-bench also provides a framework for taking any repo and running it on serverless GPUs (via Beam). If you're using vscode/cursor you can even open up a native dev experience backed by cloud gpus for quick development!

Our preferred way of generating them for a new repo consists of three simple files (located in `boilerplate/`):

- `Dockerfile` —- Your installation instructions
- `nvs_bench.sh` -- Your training / rendering commands
- `nvs_bench.py` —- (does not need to be edited) Runs training/rendering on a serverless gpu provider (we chose Beam for their RTX 4090s, <$30 free tier, and simple python interface)


A summary of these steps is bundled with the boilerplate files in `boilerplate/README.md`

# New Methods

1) Clone the `nvs-bench` boilerplate files into a new method's repo with:
```
git remote add nvs-bench https://github.com/N-Demir/nvs-bench.git && git subtree add --prefix=nvs-bench nvs-bench boilerplate-branch --squash
```
(we use `git subtree` to make boilerplate versioning and distribution easier)

2) Fill out 
- `image.py` with steps needed to install your method on a new machine or use an existing Dockerfile
- `eval.sh` with the commands for training, rendering, and moving of test renders to the `$output_folder/test_renders` folder

Then try it out yourself then (see [Running](#Running))! Modal provides $30 of free credits per month.

To add your method to the leaderboard clone this repo and add your method as a submodule with:
`git submodule add -b <your-repos-branch> https://github.com/<your-repo>.git methods/<your-method-name>`

Then, run the evaluation script (TODO: Fill this out better) which will run your method across the benchmark scenes and download the results locally. See TODO: Website running on how to view your results on the website locally. Then open up a PR! It should have: 1) a method submodule pointing to your runnable code 2) results in websites/public 3) an entry in websites/lib/methods.json

# Running
You then have two ways to run the method on cloud gpus:
- vscode/cursor remote development server
- remote job/function

With Modal's $30 per month free credits you should have plenty to iterate and try out new methods

Note: beam's dockerfiles don't have layers cached yet but that is supposed to be coming soon.
Note 2: `modal run` will terminate if you close your laptop / lose connection. To avoid that, you can run `modal run -d` which will continue to run the modal functions remotely even if something happens locally (recommended when training and evaluating on benchmark).



TODO: Write down some stuff about evaluation steps

Evaluation:

Once the `test_renders` are uploaded for a method and data, you can run an evaluation run on modal which will calulate the metrics and download the results locally to be viewed on the website locally and merged into this repo.

```
modal run -m evaluate.run --method 3dgrut --data examples/kitchen
```

Note: your method's name is determined by your repo's name

To see your method's results add it to `website/lib/methods.json` and run `make run-website` (or from the `website/` folder `pnpm dev`)

To get your method checked in make a pull request on this repo after adding it as a submodule
```
git submodule add -b <source-branch> https://github.com/<your-repo> methods/<your-method-name>
```