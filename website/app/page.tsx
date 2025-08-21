import { NvsBenchTable } from "@/components/nvs-bench-table";

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

        {/* Mip-NeRF 360 Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
            Mip-NeRF 360
          </h2>
          <p className="text-lg text-foreground leading-relaxed mb-8">
            Some text explaining the dataset
          </p>

          {/* Results Table */}
          <NvsBenchTable />
        </div>
      </div>
    </div>
  );
}
