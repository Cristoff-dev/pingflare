import { Activity, Globe, CheckCircle2, XCircle } from "lucide-react";
import { UptimeChart, type PingMetric } from "./uptime-chart";

interface ServiceCardProps {
  name: string;
  url: string;
  isActive: boolean;
  currentStatus?: number;
  responseTimeMs?: number;
  uptimePercent?: number;
  pingHistory?: PingMetric[];
}

export function ServiceCard({
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
      <div className="flex flex-col p-5 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 opacity-60">
        <h3 className="font-semibold text-neutral-500 text-lg">{name}</h3>
        <p className="text-sm text-neutral-400 mt-1">Monitoring Paused</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-5 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 pr-4">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg truncate">
            {name}
          </h3>
          <div className="flex items-center text-sm text-neutral-500 mt-1">
            <Globe className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">{url}</span>
          </div>
        </div>
        <div
          className={`flex items-center flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isOnline
              ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400"
              : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400"
          }`}
        >
          {isOnline ? (
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          ) : (
            <XCircle className="w-3.5 h-3.5 mr-1" />
          )}
          {isOnline ? "Operational" : "Outage"}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-900">
        <div>
          <p className="text-xs text-neutral-500 mb-1">Response Time</p>
          <div className="flex items-center font-medium text-neutral-900 dark:text-neutral-100">
            <Activity className="w-4 h-4 mr-1.5 text-neutral-400" />
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
        <div className="border-t border-neutral-100 dark:border-neutral-900 pt-4 mt-4">
          <p className="text-xs text-neutral-500 mb-2">Latency History (Last 24h)</p>
          <UptimeChart data={pingHistory} />
        </div>
      )}
    </div>
  );
}