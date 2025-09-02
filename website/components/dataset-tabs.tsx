import { useState } from "react";
import { DatasetHeader } from "@/components/dataset-header";
import { PSNRTimePlot } from "@/components/psnr-time-plot";
import { ResultsTable } from "@/components/results-table";
import { SceneTabs } from "@/components/scene-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import datasets from "@/lib/datasets.json";
import results from "@/lib/results.json";
import type { DatasetMeta } from "@/lib/types";

export function DatasetTabs() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleMethodSelect = (methodName: string | null) => {
    setSelectedMethod(methodName);
  };

  return (
    <Tabs defaultValue="mipnerf360" className="w-full">
      <div className="mb-4 flex w-full items-center justify-center gap-4">
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

      {/* Individual dataset content */}
      {(datasets as DatasetMeta[]).map((dataset) => (
        <TabsContent
          key={dataset.dataset_name}
          value={dataset.dataset_name}
          className="mt-0"
        >
          <DatasetHeader selectedDataset={dataset.dataset_name} />
          <SceneTabs 
            dataset={dataset} 
            selectedMethod={selectedMethod}
            onMethodSelect={handleMethodSelect}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
