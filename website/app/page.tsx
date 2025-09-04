"use client";

import { DatasetTabs } from "@/components/dataset-tabs";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Header />
        <DatasetTabs />
      </div>
    </div>
  );
}
