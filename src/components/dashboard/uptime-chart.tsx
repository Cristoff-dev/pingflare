"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, Cell } from "recharts";

export interface PingMetric {
  timestamp: string;
  responseTimeMs: number | null;
  isUp: boolean;
  status: number;
}

interface UptimeChartProps {
  data: PingMetric[];
}

export function UptimeChart({ data }: UptimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-16 flex items-center justify-center text-xs text-neutral-400">
        No latency data available
      </div>
    );
  }

  return (
    <div className="h-16 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Tooltip
            cursor={{ fill: "rgba(163, 163, 163, 0.1)" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const metric = payload[0].payload as PingMetric;
                const time = new Date(metric.timestamp).toLocaleTimeString([], { 
                  hour: "2-digit", 
                  minute: "2-digit" 
                });
                
                return (
                  <div className="bg-neutral-900 text-white text-xs py-1 px-2 rounded shadow-lg border border-neutral-800">
                    <p className="font-medium">{time}</p>
                    <p className="text-neutral-300">
                      {metric.isUp ? `${metric.responseTimeMs}ms` : `Error: ${metric.status}`}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="responseTimeMs" radius={[2, 2, 0, 0]} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isUp ? "#22c55e" : "#ef4444"} 
                className="opacity-70 hover:opacity-100 transition-opacity"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}