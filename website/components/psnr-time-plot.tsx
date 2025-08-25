"use client";

import { ComposedChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { Result, MethodMeta } from '@/lib/types';
import methodsData from '@/lib/methods.json';

interface PSNRTimePlotProps {
  results: Result[];
}

export function PSNRTimePlot({ results }: PSNRTimePlotProps) {
//   // Define a color palette for different methods
//   const colors = [
//     '#3B82F6', // Blue
//     '#EF4444', // Red
//     '#10B981', // Green
//     '#F59E0B', // Yellow
//     '#8B5CF6', // Purple
//     '#F97316', // Orange
//     '#06B6D4', // Cyan
//     '#EC4899', // Pink
//   ];

  // Transform the data for the plot with unique colors for each datapoint
  const plotData = results.map((result, index) => {
    const methodMeta = methodsData.find((m: MethodMeta) => m.method_name === result.method_name);
    return {
      methodDisplayName: methodMeta?.method_display_name || result.method_name,
      psnr: result.psnr,
      timeMinutes: result.time / 60, // Convert to minutes for better readability
    //   color: colors[index % colors.length], // Assign unique color to each datapoint
    };
  });

  return (
    <div className="mt-12 bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">Training Time vs PSNR</h3>
      </div>
      
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            // data={plotData} // TODO: Not sure if this is needed here for other features to come
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
              label={{ value: 'PSNR (dB)', position: 'bottom', offset: 0 }}
              domain={[20, 35]}
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
              fontSize={12}
            />
            
            <Scatter
              data={plotData}
              shape="circle"
            >
              <LabelList 
                dataKey="methodDisplayName" 
                position="right" 
                offset={8}
                fontSize={12}
              />
            </Scatter>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
