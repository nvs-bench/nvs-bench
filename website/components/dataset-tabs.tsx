import { DatasetHeader } from "@/components/dataset-header";
import { ResultsTable } from "@/components/results-table";
import { SceneTabs } from "@/components/scene-tabs";
import { PSNRTimePlot } from "@/components/psnr-time-plot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import datasets from "@/lib/datasets.json";
import results from "@/lib/results.json";
import type { DatasetMeta } from "@/lib/types";

export function DatasetTabs() {
  return (
    <Tabs defaultValue="all" className="w-full">
      <div className="mb-4 flex w-full items-center justify-center gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="all" className="px-6 py-2 text-sm font-semibold">
            All
          </TabsTrigger>
        </TabsList>
        <div className="h-9 w-px bg-muted" />
        <TabsList className="w-fit gap-3">
          {(datasets as DatasetMeta[]).map((d) => (
            <TabsTrigger
              key={d.dataset_name}
              value={d.dataset_name}
              className="px-4"
            >
              {d.dataset_display_name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* All datasets content */}
      <TabsContent value="all" className="mt-0">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
            All Datasets
          </h2>
          <p className="text-lg text-foreground leading-relaxed mb-8">
            Comprehensive results across all benchmark datasets
          </p>
          <ResultsTable results={results} />
        </div>
        <PSNRTimePlot results={results} />
      </TabsContent>

      {/* Individual dataset content */}
      {(datasets as DatasetMeta[]).map((dataset) => (
        <TabsContent
          key={dataset.dataset_name}
          value={dataset.dataset_name}
          className="mt-0"
        >
          <DatasetHeader selectedDataset={dataset.dataset_name} />
          <SceneTabs dataset={dataset} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
