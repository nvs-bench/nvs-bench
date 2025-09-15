"use client";

import { DatasetTabs } from "@/components/dataset-tabs";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-6xl mx-auto px-6 py-12 flex-1">
        <Header />
        <DatasetTabs />
      </div>
      <Footer />
    </div>
  );
}
