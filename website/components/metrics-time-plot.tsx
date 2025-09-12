"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  ComposedChart,
  LabelList,
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
} from "recharts";
import methodsData from "@/lib/methods.json";
import type { MethodMeta, Result } from "@/lib/types";

interface MetricsTimePlotProps {
  results: Result[];
  selectedMetric: MetricType;
  onMetricChange: (metric: MetricType) => void;
}

type MetricType = "psnr" | "ssim" | "lpips";

// Interface for averaged results (same as in results table)
interface AveragedResult {
  method_name: string;
  psnr: number;
  ssim: number;
  lpips: number;
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
    const group = methodGroups.get(result.method_name);
    if (group) {
      group.push(result);
    }
  });

  // Calculate averages for each method
  return Array.from(methodGroups.entries()).map(
    ([methodName, methodResults]) => {
      const totalPsnr = methodResults.reduce((sum, r) => sum + r.psnr, 0);
      const totalSsim = methodResults.reduce((sum, r) => sum + r.ssim, 0);
      const totalLpips = methodResults.reduce((sum, r) => sum + r.lpips, 0);
      const totalTime = methodResults.reduce((sum, r) => sum + r.time, 0);

      return {
        method_name: methodName,
        psnr: totalPsnr / methodResults.length,
        ssim: totalSsim / methodResults.length,
        lpips: totalLpips / methodResults.length,
        time: totalTime / methodResults.length,
      };
    },
  );
}

export function MetricsTimePlot({ results, selectedMetric, onMetricChange }: MetricsTimePlotProps) {

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
      metric: result[selectedMetric],
      timeMinutes: result.time / 60, // Convert to minutes for better readability
    };
  });

  // Get metric display info
  const getMetricInfo = (metric: MetricType) => {
    switch (metric) {
      case "psnr":
        return { label: "PSNR (dB)", domain: [20, 35], higherIsBetter: true };
      case "ssim":
        return { label: "SSIM", domain: [0.7, 1.0], higherIsBetter: true };
      case "lpips":
        return { label: "LPIPS", domain: [0, 0.5], higherIsBetter: false };
      default:
        return { label: "PSNR (dB)", domain: [20, 35], higherIsBetter: true };
    }
  };

  const metricInfo = getMetricInfo(selectedMetric);

  return (
    <div className="mt-12 bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-2xl font-bold text-foreground">
            Training Time vs{" "}
          </h3>
          <select
            value={selectedMetric}
            onChange={(e) => onMetricChange(e.target.value as MetricType)}
            className="px-3 py-1 border border-border rounded-md bg-background text-foreground text-xl font-bold focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="psnr">PSNR</option>
            <option value="ssim">SSIM</option>
            <option value="lpips">LPIPS</option>
          </select>
        </div>
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
              dataKey="metric"
              name={metricInfo.label}
              label={{ value: metricInfo.label, position: "bottom", offset: 0 }}
              domain={metricInfo.domain}
              reversed={selectedMetric === "lpips"}
              fontSize={12}
              tickFormatter={(value) => {
                return value.toFixed(selectedMetric === "psnr" ? 1 : 2);
              }}
            />
            <YAxis
              type="number"
              dataKey="timeMinutes"
              name="Time (minutes)"
              label={{
                value: "Training Time (m)",
                angle: -90,
                position: "left",
                style: { textAnchor: "middle" },
              }}
              tickFormatter={(value) => `${value.toFixed(0)}m`}
              domain={[0, 100]}
              reversed={true}
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
              ↗ better
            </text>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
