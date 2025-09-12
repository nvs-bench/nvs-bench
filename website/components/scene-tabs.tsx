import { MethodImages } from "@/components/method-images";
import { MetricsTimePlot } from "@/components/metrics-time-plot";
import { ResultsTable } from "@/components/results-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import results from "@/lib/results.json";
import type { DatasetMeta } from "@/lib/types";

type MetricType = "psnr" | "ssim" | "lpips";

interface SceneTabsProps {
  dataset: DatasetMeta;
  selectedMethod: string | null;
  selectedScene: string;
  selectedMetric: MetricType;
  onMethodSelect: (methodName: string | null) => void;
  onSceneChange: (scene: string) => void;
  onMetricChange: (metric: MetricType) => void;
}

export function SceneTabs({
  dataset,
  selectedMethod,
  selectedScene,
  selectedMetric,
  onMethodSelect,
  onSceneChange,
  onMetricChange,
}: SceneTabsProps) {
  const handleSceneChange = (scene: string) => {
    onSceneChange(scene);
    // Don't clear selected method when changing scenes
  };

  return (
    <div className="mb-6">
      <Tabs
        value={selectedScene}
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
                onMethodSelect={onMethodSelect}
                selectedMethod={selectedMethod}
              />
              <MetricsTimePlot 
                results={filteredResults} 
                selectedMetric={selectedMetric}
                onMetricChange={onMetricChange}
              />
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
