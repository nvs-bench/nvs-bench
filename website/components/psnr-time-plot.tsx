"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import methodsData from "@/lib/methods.json";
import type { MethodMeta, Result } from "@/lib/types";

interface PSNRTimePlotProps {
  results: Result[];
}

// Interface for averaged results (same as in results table)
interface AveragedResult {
  method_name: string;
  psnr: number;
  time: number;
}

// Function to calculate averages for a method (same as in results table)
function calculateMethodAverages(results: Result[]): AveragedResult[] {
  const methodGroups = new Map<string, Result[]>();

  // Group results by method
  results.forEach((result) => {
    if (!methodGroups.has(result.method_name)) {
      methodGroups.set(result.method_name, []);
    }
    methodGroups.get(result.method_name)!.push(result);
  });

  // Calculate averages for each method
  return Array.from(methodGroups.entries()).map(
    ([methodName, methodResults]) => {
      const totalPsnr = methodResults.reduce((sum, r) => sum + r.psnr, 0);
      const totalTime = methodResults.reduce((sum, r) => sum + r.time, 0);

      return {
        method_name: methodName,
        psnr: totalPsnr / methodResults.length,
        time: totalTime / methodResults.length,
      };
    },
  );
}

export function PSNRTimePlot({ results }: PSNRTimePlotProps) {
  // Calculate averages for methods using the same logic as results table
  const averagedResults = useMemo(() => {
    return calculateMethodAverages(results);
  }, [results]);

  // Transform the averaged data for the plot
  const plotData = averagedResults.map((result) => {
    const methodMeta = methodsData.find(
      (m: MethodMeta) => m.method_name === result.method_name,
    );
    return {
      methodDisplayName: methodMeta?.method_display_name || result.method_name,
      psnr: result.psnr,
      timeMinutes: result.time / 60, // Convert to minutes for better readability
    };
  });

  return (
    <div className="mt-12 bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Training Time vs PSNR
        </h3>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              type="number"
              dataKey="psnr"
              name="PSNR"
              label={{ value: "PSNR (dB)", position: "bottom", offset: 0 }}
              domain={[20, 35]}
              fontSize={12}
            />
            <YAxis
              type="number"
              dataKey="timeMinutes"
              name="Time (minutes)"
              label={{
                value: "Training Time (minutes)",
                angle: -90,
                position: "left",
                style: { textAnchor: "middle" },
              }}
              tickFormatter={(value) => `${value.toFixed(0)}m`}
              fontSize={12}
            />

            <Scatter data={plotData} shape="circle">
              <LabelList
                dataKey="methodDisplayName"
                position="right"
                offset={8}
                fontSize={12}
              />
            </Scatter>

            {/* Add text indicating direction is better */}
            <text
              x="95%"
              y="95%"
              textAnchor="end"
              dominantBaseline="text-before-edge"
              fontSize={14}
              fill="currentColor"
              className="text-muted-foreground"
            >
              ↘ better
            </text>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
