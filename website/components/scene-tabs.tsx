import { useState } from "react";
import { MethodImages } from "@/components/method-images";
import { PSNRTimePlot } from "@/components/psnr-time-plot";
import { ResultsTable } from "@/components/results-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import results from "@/lib/results.json";
import type { DatasetMeta } from "@/lib/types";

interface SceneTabsProps {
  dataset: DatasetMeta;
}

export function SceneTabs({ dataset }: SceneTabsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<string>("all");

  const handleMethodSelect = (methodName: string | null) => {
    setSelectedMethod(methodName);
  };

  const handleSceneChange = (scene: string) => {
    setSelectedScene(scene);
    // Don't clear selected method when changing scenes
  };

  return (
    <div className="mb-6">
      <Tabs
        defaultValue="all"
        className="w-full"
        onValueChange={handleSceneChange}
      >
        <div className="mb-8 flex w-full items-center justify-center gap-4">
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
            {dataset.scenes.map((scene: string) => (
              <TabsTrigger key={scene} value={scene} className="px-4">
                {scene}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Scene-specific content */}
        {["all", ...dataset.scenes].map((scene: string) => {
          // Filter results for this dataset and scene
          const filteredResults = results.filter(
            (r) =>
              r.dataset_name === dataset.dataset_name &&
              (scene === "all" || r.scene_name === scene),
          );

          return (
            <TabsContent key={scene} value={scene} className="mt-0">
              <ResultsTable
                results={filteredResults}
                onMethodSelect={handleMethodSelect}
                selectedMethod={selectedMethod}
              />
              <PSNRTimePlot results={filteredResults} />
              <MethodImages
                selectedMethod={selectedMethod}
                datasetName={dataset.dataset_name}
                sceneName={scene}
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
