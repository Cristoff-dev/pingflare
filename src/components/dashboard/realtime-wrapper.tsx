"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // 1. Listen to real-time pings updates
    const pingsChannel = supabase
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

    // 2. Listen to real-time service insertions and deletions
    const servicesChannel = supabase
      .channel("realtime-services")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "services" },
        (payload) => {
          const newService = payload.new;
          
          setServices((prev) => [
            {
              id: newService.id,
              name: newService.name,
              url: newService.url,
              isActive: newService.isActive ?? true, 
              currentStatus: 0,
              responseTimeMs: 0,
              uptimePercent: 0,
              pingHistory: [],
            },
            ...prev,
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "services" },
        (payload) => {
          const deletedService = payload.old;
          setServices((prev) => prev.filter((svc) => svc.id !== deletedService.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pingsChannel);
      supabase.removeChannel(servicesChannel);
    };
  }, []);

  // Real-time filtering by name or URL
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Modern Search Bar */}
      <div className="relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-neutral-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search by name or URL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 dark:border-neutral-800 rounded-xl leading-5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      {/* Animated Grid */}
      <motion.div 
        layout 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredServices.map((svc, index) => (
            <motion.div
              key={svc.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20, 
                delay: index * 0.05 
              }}
              whileHover={{ y: -4 }}
            >
              <ServiceCard
                id={svc.id}
                name={svc.name}
                url={svc.url}
                isActive={svc.isActive}
                currentStatus={svc.currentStatus}
                responseTimeMs={svc.responseTimeMs}
                uptimePercent={svc.uptimePercent}
                pingHistory={svc.pingHistory}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Empty State */}
        {filteredServices.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="col-span-full py-12 text-center text-neutral-500"
          >
            No services match your search criteria.
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}