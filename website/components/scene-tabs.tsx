import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface SceneTabsProps {
  selectedDataset: string;
}

export function SceneTabs({ selectedDataset }: SceneTabsProps) {
  if (selectedDataset === "all") return null;

  const dataset = (datasets as DatasetMeta[]).find(d => d.dataset_name === selectedDataset);
  if (!dataset) return null;

  return (
    <div className="mb-6">
      <Tabs defaultValue="all" className="w-full">
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
            {dataset.scenes.map((scene) => (
              <TabsTrigger
                key={scene}
                value={scene}
                className="px-4"
              >
                {scene}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Scene-specific content */}
        <TabsContent value="all" className="mt-0">
          <NvsBenchTable 
            datasetFilter={selectedDataset} 
            sceneFilter="all" 
          />
        </TabsContent>

        {dataset.scenes.map((scene) => (
          <TabsContent
            key={scene}
            value={scene}
            className="mt-0"
          >
            <NvsBenchTable 
              datasetFilter={selectedDataset} 
              sceneFilter={scene} 
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
