"use client";

import { Tabs } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import { DatasetTabs } from "@/components/dataset-tabs";
import { SceneTabs } from "@/components/scene-tabs";
import { DatasetContent } from "@/components/dataset-content";
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
            <SceneTabs selectedDataset={selectedDataset} />
            <DatasetContent />
          </Tabs>
        </div>
      </div>
    </div>
  );
}
