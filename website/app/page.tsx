import { NvsBenchTable } from "@/components/nvs-bench-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import datasets from "@/lib/datasets.json";

interface DatasetMeta {
  dataset_name: string;
  dataset_description: string;
  dataset_source_link: string;
  dataset_download_link: string;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-left">
              <h1 className="text-6xl font-bold text-foreground leading-tight">
                nvs-bench
              </h1>
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-lg text-foreground leading-relaxed">
            Some text explaining what this is
          </div>
        </div>

        {/* Dataset Selection Tabs */}
        <div className="mb-8">
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
                {(datasets as DatasetMeta[]).map((d) => (
                  <TabsTrigger
                    key={d.dataset_name}
                    value={d.dataset_name}
                    className="px-4"
                  >
                    {d.dataset_name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tabs Content */}
            <TabsContent value="all" className="mt-0">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
                  All Datasets
                </h2>
                <p className="text-lg text-foreground leading-relaxed mb-8">
                  Comprehensive results across all benchmark datasets
                </p>
                <NvsBenchTable />
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
                  <NvsBenchTable />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
