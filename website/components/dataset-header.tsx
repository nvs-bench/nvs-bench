import datasets from "@/lib/datasets.json";
import { DatasetDownloadModal } from "@/components/dataset-download-modal";
import { DatasetImages } from "./dataset-images";

interface DatasetMeta {
  dataset_name: string;
  dataset_display_name: string;
  dataset_description: string;
  dataset_source_link: string;
  dataset_download_link: string;
  scenes: string[];
}

export function DatasetHeader({
  selectedDataset,
  selectedScene,
}: {
  selectedDataset: string;
  selectedScene: string;
}) {
  if (selectedDataset === "all") return null;

  const dataset = (datasets as DatasetMeta[]).find(
    (d) => d.dataset_name === selectedDataset,
  );
  if (!dataset) return null;

  return (
    <div className="mb-4">
      <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
        {dataset.dataset_display_name}
      </h2>
      <DatasetImages
        selectedDataset={dataset.dataset_name}
        selectedScene={selectedScene}
      />
      <p className="text-lg text-foreground leading-relaxed mb-4">
        {dataset.dataset_description}
      </p>
      <div className="flex items-center gap-4 text-sm">
        <a
          href={dataset.dataset_source_link}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          Source
        </a>
        <span className="text-muted-foreground">•</span>
        <DatasetDownloadModal datasetName={dataset.dataset_name}>
          <button
            type="button"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Download
          </button>
        </DatasetDownloadModal>
      </div>
    </div>
  );
}
