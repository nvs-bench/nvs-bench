import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import datasets from "@/lib/datasets.json";

interface DatasetMeta {
  dataset_name: string;
  dataset_display_name: string;
  dataset_description: string;
  dataset_source_link: string;
  dataset_download_link: string;
  scenes: string[];
}

export function DatasetTabs() {
  return (
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
  );
}
