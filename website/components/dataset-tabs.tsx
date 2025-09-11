import { useState } from "react";
import { DatasetHeader } from "@/components/dataset-header";
import { SceneTabs } from "@/components/scene-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import datasets from "@/lib/datasets.json";
import type { DatasetMeta } from "@/lib/types";
import { ResultsTable } from "@/components/results-table";
import { PSNRTimePlot } from "@/components/psnr-time-plot";
import results from "@/lib/results.json";

export function DatasetTabs() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<string>("all");
  const [selectedDataset, setSelectedDataset] = useState<string>("all");

  const handleMethodSelect = (methodName: string | null) => {
    setSelectedMethod(methodName);
  };

  const handleSceneChange = (scene: string) => {
    setSelectedScene(scene);
  };

  const handleDatasetChange = (datasetName: string) => {
    setSelectedDataset(datasetName);
    // Reset scene selection when switching datasets
    setSelectedScene("all");
  };

  return (
    <Tabs
      value={selectedDataset}
      defaultValue="all"
      className="w-full"
      onValueChange={handleDatasetChange}
    >
      <div className="mb-4 flex w-full items-center justify-center gap-4">
        <TabsList className="w-fit">
          <TabsTrigger
            value="all"
            className="px-6 py-2 text-sm font-semibold"
          >
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
        <ResultsTable
          results={results}
          onMethodSelect={handleMethodSelect}
          selectedMethod={selectedMethod}
        />
        <PSNRTimePlot results={results} />
      </TabsContent>

      {/* Individual dataset content */}
      {(datasets as DatasetMeta[]).map((dataset) => (
        <TabsContent
          key={dataset.dataset_name}
          value={dataset.dataset_name}
          className="mt-0"
        >
          <DatasetHeader
            selectedDataset={dataset.dataset_name}
            selectedScene={selectedScene}
          />
          <SceneTabs
            dataset={dataset}
            selectedMethod={selectedMethod}
            selectedScene={selectedScene}
            onMethodSelect={handleMethodSelect}
            onSceneChange={handleSceneChange}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
