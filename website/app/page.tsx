import { NvsBenchTable } from "@/components/nvs-bench-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
                <TabsTrigger value="all" className="px-6 py-2 text-sm font-semibold">
                  All
                </TabsTrigger>
              </TabsList>
              <div className="h-9 w-px bg-muted" />
              <TabsList className="w-fit gap-3">
                {["mipnerf360", "tanks", "synthetic"].map((dataset) => (
                  <TabsTrigger key={dataset} value={dataset} className="px-4">
                    {dataset === "mipnerf360" ? "Mip-NeRF 360" :
                     dataset === "tanks" ? "Tanks & Temples" : "Synthetic"}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tabs Content */}
            {[
              { value: "all", title: "All Datasets", description: "Comprehensive results across all benchmark datasets" },
              { value: "mipnerf360", title: "Mip-NeRF 360", description: "Some text explaining the dataset" },
              { value: "tanks", title: "Tanks & Temples", description: "Some text explaining the dataset" },
              { value: "synthetic", title: "Synthetic", description: "Some text explaining the dataset" }
            ].map(({ value, title, description }) => (
              <TabsContent key={value} value={value} className="mt-0">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
                    {title}
                  </h2>
                  <p className="text-lg text-foreground leading-relaxed mb-8">
                    {description}
                  </p>
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
