import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DatasetDownloadModalProps {
  datasetName: string;
  children: React.ReactNode;
}

const getDownloadInfo = (datasetName: string) => {
  const downloadInfo = {
    all: {
      gsutilCommand:
        "mkdir -p data/ && gsutil -m rsync -r -d gs://nvs-bench/data data",
      originalLink:
        "https://github.com/nvs-bench/nvs-bench",
    },
    mipnerf360: {
      gsutilCommand:
        "mkdir -p data/mipnerf360 && gsutil -m rsync -r -d gs://nvs-bench/data/mipnerf360 data/mipnerf360",
      originalLink:
        "https://github.com/nvs-bench/nvs-bench/blob/main/data/download/mipnerf360.sh",
    },
    tanksandtemples: {
      gsutilCommand:
        "mkdir -p data/tanksandtemples && gsutil -m rsync -r -d gs://nvs-bench/data/tanksandtemples data/tanksandtemples",
      originalLink:
        "https://github.com/nvs-bench/nvs-bench/blob/main/data/download/deepblending_and_tanksandtemples.sh",
    },
    deepblending: {
      gsutilCommand:
        "mkdir -p data/deepblending && gsutil -m rsync -r -d gs://nvs-bench/data/deepblending data/deepblending",
      originalLink:
        "https://github.com/nvs-bench/nvs-bench/blob/main/data/download/deepblending_and_tanksandtemples.sh",
    },
    zipnerf: {
      gsutilCommand:
        "mkdir -p data/zipnerf && gsutil -m rsync -r -d gs://nvs-bench/data/zipnerf data/zipnerf",
      originalLink:
        "https://github.com/nvs-bench/nvs-bench/blob/main/data/download/zipnerf.sh",
    },
  };

  return (
    downloadInfo[datasetName as keyof typeof downloadInfo] || {
      gsutilCommand:
        "gsutil -m cp -r gs://nvs-bench-datasets/[dataset-name] ./",
      originalLink: "#",
    }
  );
};

export function DatasetDownloadModal({
  datasetName,
  children,
}: DatasetDownloadModalProps) {
  const downloadInfo = getDownloadInfo(datasetName);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Download Instructions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Our Version</h4>
            <p className="text-sm text-muted-foreground mb-3">
              If you would like to download our version of the dataset (exact
              one used in the benchmark), first install the{" "}
              <a
                href="https://cloud.google.com/sdk/docs/install"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Google Cloud CLI
              </a>
              , then run the following command:
            </p>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-sm font-mono">
                {downloadInfo.gsutilCommand}
              </code>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Original</h4>
            <p className="text-sm text-muted-foreground mb-2">
              {datasetName === "all" 
                ? "Select a specific dataset first."
                : `For the original dataset, see `}
              {datasetName !== "all" && (
                <a
                  href={downloadInfo.originalLink}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  here
                </a>
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
