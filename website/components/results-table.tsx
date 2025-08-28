"use client";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  FileTextIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import methods from "@/lib/methods.json";
import results from "@/lib/results.json";
import type { MethodMeta, Result } from "@/lib/types";

type SortKey = keyof Pick<
  Result,
  "psnr" | "ssim" | "lpips" | "time" | "max_gpu_memory"
>;
type SortOrder = "asc" | "desc";

// Helper functions for formatting display
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function formatGpuMemory(mb: number): string {
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}


function PaperIcon() {
  return (
    <div className="relative group">
      <FileTextIcon className="w-4 h-4 text-blue-500 cursor-help" />
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
        Result taken from the paper
      </div>
    </div>
  );
}

function HigherIsBetterIndicator({
  higherIsBetter,
}: {
  higherIsBetter: boolean;
}) {
  return (
    <div className="relative group">
      {higherIsBetter ? (
        <TrendingUpIcon className="w-4 h-4 text-muted-foreground" />
      ) : (
        <TrendingDownIcon className="w-4 h-4 text-muted-foreground" />
      )}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
        {higherIsBetter ? "Higher is better" : "Lower is better"}
      </div>
    </div>
  );
}

function SortableHeader({
  children,
  sortKey,
  currentSortKey,
  sortOrder,
  onSort,
  higherIsBetter = true,
}: {
  children: React.ReactNode;
  sortKey: SortKey;
  currentSortKey: SortKey;
  sortOrder: SortOrder;
  onSort: (key: SortKey) => void;
  higherIsBetter?: boolean;
}) {
  function getSortIcon() {
    if (currentSortKey !== sortKey) {
      // Return an invisible placeholder to maintain consistent spacing
      return <div className="w-4 h-4 ml-1" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUpIcon className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 ml-1" />
    );
  }

  return (
    <TableHead
      className="cursor-pointer hover:bg-muted/20 select-none transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center">
        {children}
        <div className="ml-1">
          <HigherIsBetterIndicator higherIsBetter={higherIsBetter} />
        </div>
        {getSortIcon()}
      </div>
    </TableHead>
  );
}

export function ResultsTable({
  results,
}: {
  results: Result[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("psnr");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedData = useMemo(() => {
    // Sort the results
    return results.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      // All values are now numbers, so simple numeric comparison
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [sortKey, sortOrder, results]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Method</TableHead>
            <SortableHeader
              sortKey="psnr"
              currentSortKey={sortKey}
              sortOrder={sortOrder}
              onSort={handleSort}
              higherIsBetter={true}
            >
              PSNR
            </SortableHeader>
            <SortableHeader
              sortKey="ssim"
              currentSortKey={sortKey}
              sortOrder={sortOrder}
              onSort={handleSort}
              higherIsBetter={true}
            >
              SSIM
            </SortableHeader>
            <SortableHeader
              sortKey="lpips"
              currentSortKey={sortKey}
              sortOrder={sortOrder}
              onSort={handleSort}
              higherIsBetter={false}
            >
              LPIPS
            </SortableHeader>
            <SortableHeader
              sortKey="time"
              currentSortKey={sortKey}
              sortOrder={sortOrder}
              onSort={handleSort}
              higherIsBetter={false}
            >
              Time
            </SortableHeader>
            <SortableHeader
              sortKey="max_gpu_memory"
              currentSortKey={sortKey}
              sortOrder={sortOrder}
              onSort={handleSort}
              higherIsBetter={false}
            >
              GPU Memory
            </SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row) => {
            const methodMeta = (methods as MethodMeta[]).find(
              (m) => m.method_name === row.method_name,
            );
            return (
              <TableRow key={`${row.method_name}-${row.dataset_name}-${row.scene_name}`}>
                <TableCell className="font-medium">
                  {methodMeta ? (
                    <a
                      href={methodMeta.method_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-foreground hover:text-foreground/80 underline underline-offset-2"
                    >
                      {methodMeta.method_display_name}
                    </a>
                  ) : (
                    row.method_name
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{row.psnr.toFixed(2)}</span>
                    {row.hasPaperPsnr && <PaperIcon />}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{row.ssim.toFixed(4)}</span>
                    {row.hasPaperSsim && <PaperIcon />}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{row.lpips.toFixed(4)}</span>
                    {row.hasPaperLpips && <PaperIcon />}
                  </div>
                </TableCell>
                <TableCell>{formatTime(row.time)}</TableCell>
                <TableCell>{formatGpuMemory(row.max_gpu_memory)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
