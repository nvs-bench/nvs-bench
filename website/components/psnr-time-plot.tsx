"use client";

import { ComposedChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Result } from '@/lib/types';

interface PSNRTimePlotProps {
  results: Result[];
}

export function PSNRTimePlot({ results }: PSNRTimePlotProps) {
  // Transform the data for the plot
  const plotData = results.map(result => ({
    name: `${result.method_name} - ${result.scene_name}`,
    method: result.method_name,
    scene: result.scene_name,
    dataset: result.dataset_name,
    psnr: result.psnr,
    time: result.time,
    timeMinutes: result.time / 60, // Convert to minutes for better readability
    gpuMem: result.gpuMem,
    hasPaper: result.hasPaperPsnr || result.hasPaperSsim || result.hasPaperLpips,
  }));

  // Color scheme for different methods
  const methodColors: { [key: string]: string } = {
    h3dgs: "#8884d8",
    "3dgut": "#82ca9d",
  };

  // Get unique methods for legend
  const uniqueMethods = Array.from(new Set(results.map(r => r.method_name)));

  // Custom tooltip content
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">Method: {data.method}</p>
          <p className="text-sm text-gray-600">Scene: {data.scene}</p>
          <p className="text-sm text-gray-600">Dataset: {data.dataset}</p>
          <p className="text-sm text-gray-600">PSNR: {data.psnr.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Time: {(data.time / 60).toFixed(1)} minutes</p>
          <p className="text-sm text-gray-600">GPU Memory: {data.gpuMem.toFixed(2)} GB</p>
          {data.hasPaper && (
            <p className="text-sm text-blue-600 font-medium">📄 Paper Result</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-12 bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">Training Time vs PSNR</h3>
      </div>
      
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={plotData}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              type="number" 
              dataKey="psnr" 
              name="PSNR"
              label={{ value: 'PSNR (dB)', position: 'bottom', offset: 0 }}
              domain={[20, 35]}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              type="number" 
              dataKey="timeMinutes" 
              name="Time (minutes)"
              label={{ 
                value: 'Training Time (minutes)', 
                angle: -90, 
                position: 'left',
                style: { textAnchor: 'middle' }
              }}
              tickFormatter={(value) => `${value.toFixed(0)}m`}
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Scatter plots for each method */}
            {uniqueMethods.map((method) => (
              <Scatter
                key={method}
                name={method}
                data={plotData.filter(d => d.method === method)}
                fill={methodColors[method]}
                shape="circle"
                stroke={methodColors[method]}
                strokeWidth={2}
              >
                <LabelList 
                  dataKey="method" 
                  position="right" 
                  offset={8}
                  fontSize={12}
                  fill="#6b7280"
                />
              </Scatter>
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
