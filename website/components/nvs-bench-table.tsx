"use client";

import type React from "react";

import { useState, useMemo } from "react";
import methods from "@/lib/methods.json";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  FileTextIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react";

interface Result {
  method_name: string;
  psnr: number;
  ssim: number;
  lpips: number;
  time: number; // time in seconds
  gpuMem: number; // memory in GB
  hasPaperPsnr?: boolean;
  hasPaperSsim?: boolean;
  hasPaperLpips?: boolean;
}

interface MethodMeta {
  method_name: string;
  method_display_name: string;
  method_url: string;
}

const results: Result[] = [
  {
    method_name: "h3dgs",
    psnr: 26.93,
    ssim: 0.79,
    lpips: 0.269,
    time: 3329, // 55m 29s in seconds
    gpuMem: 9.08,
  },
  {
    method_name: "3dgut",
    psnr: 27.04,
    ssim: 0.812,
    lpips: 0.252,
    time: 2074, // 34m 34s in seconds
    gpuMem: 14.92,
    hasPaperPsnr: true,
    hasPaperSsim: true,
  },
];

type SortKey = keyof Pick<
  Result,
  "psnr" | "ssim" | "lpips" | "time" | "gpuMem"
>;
type SortOrder = "asc" | "desc";

// Helper functions for formatting display
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function formatMemory(gb: number): string {
  if (gb < 1) {
    return `${gb.toFixed(2)} GB`;
  } else if (gb < 10) {
    return `${gb.toFixed(2)} GB`;
  } else {
    return `${gb.toFixed(2)} GB`;
  }
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
    if (currentSortKey !== sortKey) return null;
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
        {getSortIcon()}
        {children}
        <div className="ml-1">
          <HigherIsBetterIndicator higherIsBetter={higherIsBetter} />
        </div>
      </div>
    </TableHead>
  );
}

export function NvsBenchTable() {
  const [sortKey, setSortKey] = useState<SortKey>("psnr");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedData = useMemo(() => {
    return [...results].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      // All values are now numbers, so simple numeric comparison
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [sortKey, sortOrder]);

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
              LPIPS (VGG)
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
              sortKey="gpuMem"
              currentSortKey={sortKey}
              sortOrder={sortOrder}
              onSort={handleSort}
              higherIsBetter={false}
            >
              GPU mem.
            </SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row) => {
            const methodMeta = (methods as MethodMeta[]).find(
              (m) => m.method_name === row.method_name,
            );
            return (
              <TableRow key={row.method_name}>
                <TableCell className="font-medium">
                  {methodMeta ? (
                    <a
                      href={methodMeta.method_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
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
                    <span>{row.ssim.toFixed(3)}</span>
                    {row.hasPaperSsim && <PaperIcon />}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{row.lpips.toFixed(3)}</span>
                    {row.hasPaperLpips && <PaperIcon />}
                  </div>
                </TableCell>
                <TableCell>{formatTime(row.time)}</TableCell>
                <TableCell>{formatMemory(row.gpuMem)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
