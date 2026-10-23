"use client";

import { useEffect, useState } from "react";
import { ServiceCard } from "./service-card";
import { supabase } from "@/lib/supabase-client";
import type { PingMetric } from "./uptime-chart";

// Mirrors the data structure generated in page.tsx
interface ServiceData {
  id: number;
  name: string;
  url: string;
  isActive: boolean;
  currentStatus: number;
  responseTimeMs: number;
  uptimePercent: number;
  pingHistory: PingMetric[];
}

export function RealtimeWrapper({ initialServices }: { initialServices: ServiceData[] }) {
  const [services, setServices] = useState<ServiceData[]>(initialServices);

  useEffect(() => {
    // Subscribe to new rows inserted into the 'pings' table
    const channel = supabase
      .channel("realtime-pings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pings" },
        (payload) => {
          const newPing = payload.new;

          setServices((prevServices) =>
            prevServices.map((service) => {
              if (service.id !== newPing.service_id) return service;

              const formattedPing: PingMetric = {
                timestamp: newPing.timestamp,
                responseTimeMs: newPing.response_time_ms,
                isUp: newPing.is_up,
                status: newPing.status,
              };

              // Append new ping, keep max 288 items (24 hours at 5 min intervals)
              const updatedHistory = [...service.pingHistory, formattedPing].slice(-288);
              
              const successfulPings = updatedHistory.filter((p) => p.isUp).length;
              const newUptime = (successfulPings / updatedHistory.length) * 100;

              return {
                ...service,
                currentStatus: newPing.status,
                responseTimeMs: newPing.response_time_ms || 0,
                uptimePercent: newUptime,
                pingHistory: updatedHistory,
              };
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((svc) => (
        <ServiceCard
          key={svc.id}
          name={svc.name}
          url={svc.url}
          isActive={svc.isActive}
          currentStatus={svc.currentStatus}
          responseTimeMs={svc.responseTimeMs}
          uptimePercent={svc.uptimePercent}
          pingHistory={svc.pingHistory}
        />
      ))}
    </div>
  );
}