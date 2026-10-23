"use client";

import { Activity, Globe, CheckCircle2, XCircle } from "lucide-react";
import { UptimeChart, type PingMetric } from "./uptime-chart";
import { DeleteServiceButton } from "./delete-service-button";

interface ServiceCardProps {
  id: number; // Added to handle deletion
  name: string;
  url: string;
  isActive: boolean;
  currentStatus?: number;
  responseTimeMs?: number;
  uptimePercent?: number;
  pingHistory?: PingMetric[];
}

export function ServiceCard({
  id,
  name,
  url,
  isActive,
  currentStatus = 200,
  responseTimeMs = 0,
  uptimePercent = 100,
  pingHistory,
}: ServiceCardProps) {
  const isOnline = currentStatus >= 200 && currentStatus < 300;

  if (!isActive) {
    return (
      <div className="flex flex-col p-5 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 opacity-60 justify-between">
        <div>
          <h3 className="font-semibold text-neutral-500 text-lg">{name}</h3>
          <p className="text-sm text-neutral-400 mt-1">Monitoring Paused</p>
        </div>
        <div className="flex justify-end mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <DeleteServiceButton serviceId={id} />
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col p-5 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/20 dark:hover:border-neutral-700 overflow-hidden">
      
      {/* Absolute glow background layer on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="min-w-0 pr-2">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg truncate transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {name}
          </h3>
          <div className="flex items-center text-sm text-neutral-500 mt-1">
            <Globe className="w-4 h-4 mr-1.5 flex-shrink-0 group-hover:animate-pulse" />
            <span className="truncate">{url}</span>
          </div>
        </div>

        {/* Status Badge & Delete Button Container */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors duration-300 ${
              isOnline
                ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400 group-hover:border-green-500/50"
                : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400 group-hover:border-red-500/50"
            }`}
          >
            {isOnline ? (
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            ) : (
              <XCircle className="w-3.5 h-3.5 mr-1" />
            )}
            {isOnline ? "Operational" : "Outage"}
          </div>
          <DeleteServiceButton serviceId={id} />
        </div>
      </div>

      <div className="relative z-10 mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-900 transition-colors duration-300 group-hover:border-neutral-200 dark:group-hover:border-neutral-800">
        <div>
          <p className="text-xs text-neutral-500 mb-1">Response Time</p>
          <div className="flex items-center font-medium text-neutral-900 dark:text-neutral-100">
            <Activity className="w-4 h-4 mr-1.5 text-neutral-400 group-hover:text-blue-500 transition-colors" />
            {responseTimeMs > 0 ? `${responseTimeMs}ms` : "--"}
          </div>
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-1">24h Uptime</p>
          <div className="font-medium text-neutral-900 dark:text-neutral-100">
            {uptimePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {pingHistory && pingHistory.length > 0 && (
        <div className="relative z-10 border-t border-neutral-100 dark:border-neutral-900 pt-4 mt-4 transition-colors duration-300 group-hover:border-neutral-200 dark:group-hover:border-neutral-800">
          <p className="text-xs text-neutral-500 mb-2">Latency History (Last 24h)</p>
          <div className="opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            <UptimeChart data={pingHistory} />
          </div>
        </div>
      )}
    </div>
  );
}