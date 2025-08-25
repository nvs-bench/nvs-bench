import { TabsContent } from "@/components/ui/tabs";
import { NvsBenchTable } from "@/components/nvs-bench-table";
import datasets from "@/lib/datasets.json";

interface DatasetMeta {
  dataset_name: string;
  dataset_display_name: string;
  dataset_description: string;
  dataset_source_link: string;
  dataset_download_link: string;
  scenes: string[];
}

export function DatasetContent() {
  return (
    <>
      <TabsContent value="all" className="mt-0">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
            All Datasets
          </h2>
          <p className="text-lg text-foreground leading-relaxed mb-8">
            Comprehensive results across all benchmark datasets
          </p>
          <NvsBenchTable datasetFilter="all" sceneFilter="all" />
        </div>
      </TabsContent>

      {(datasets as DatasetMeta[]).map((d) => (
        <TabsContent
          key={d.dataset_name}
          value={d.dataset_name}
          className="mt-0"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
              {d.dataset_name}
            </h2>
            <p className="text-lg text-foreground leading-relaxed mb-6">
              {d.dataset_description}
            </p>
            <div className="flex items-center gap-4 mb-8 text-sm">
              <a
                href={d.dataset_source_link}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                Source
              </a>
              <span className="text-muted-foreground">•</span>
              <a
                href={d.dataset_download_link}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                Download
              </a>
            </div>
            <p className="text-lg text-foreground leading-relaxed mb-6">
              Please select a scene from the tabs above to view results for this dataset.
            </p>
          </div>
        </TabsContent>
      ))}
    </>
  );
}
