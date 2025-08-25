import { NvsBenchTable } from "@/components/nvs-bench-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DatasetMeta } from "@/lib/types";

interface SceneTabsProps {
  dataset: DatasetMeta;
}

export function SceneTabs({ dataset }: SceneTabsProps) {
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
            {dataset.scenes.map((scene: string) => (
              <TabsTrigger key={scene} value={scene} className="px-4">
                {scene}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Scene-specific content */}
        {["all", ...dataset.scenes].map((scene: string) => (
          <TabsContent key={scene} value={scene} className="mt-0">
            <NvsBenchTable
              datasetFilter={dataset.dataset_name}
              sceneFilter={scene}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
