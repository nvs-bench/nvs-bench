"use client";

import { Tabs } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import { DatasetTabs } from "@/components/dataset-tabs";
import { DatasetHeader } from "@/components/dataset-header";
import { SceneTabs } from "@/components/scene-tabs";
import { useState } from "react";

export default function Home() {
  const [selectedDataset, setSelectedDataset] = useState<string>("all");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Header />
        
        <div className="mb-8">
          <Tabs 
            defaultValue="all" 
            className="w-full"
            onValueChange={(value) => setSelectedDataset(value)}
          >
            <DatasetTabs />
            <DatasetHeader selectedDataset={selectedDataset} />
            <SceneTabs selectedDataset={selectedDataset} />
          </Tabs>
        </div>
      </div>
    </div>
  );
}
