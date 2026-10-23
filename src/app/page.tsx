import { db } from "@/db";
import { services, pings } from "@/db/schema";
import { desc, eq, gte, and } from "drizzle-orm";
import { RealtimeWrapper } from "@/components/dashboard/realtime-wrapper";
import { ServiceRegistrationDialog } from "@/components/dashboard/service-registration-dialog";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

export default async function DashboardPage() {
  const allServices = await db.select().from(services).orderBy(desc(services.createdAt));
  
// eslint-disable-next-line react-hooks/purity
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const servicesWithMetrics = await Promise.all(
    allServices.map(async (service) => {
      const recentPings = await db
        .select()
        .from(pings)
        .where(
          and(
            eq(pings.serviceId, service.id),
            gte(pings.timestamp, oneDayAgo)
          )
        )
        .orderBy(desc(pings.timestamp));

      const totalPings = recentPings.length;
      const successfulPings = recentPings.filter((p) => p.isUp).length;
      const uptimePercent = totalPings > 0 ? (successfulPings / totalPings) * 100 : 0;

      const latestPing = recentPings[0];

      const pingHistory = recentPings.reverse().map((p) => ({
        timestamp: p.timestamp?.toISOString() || new Date().toISOString(),
        responseTimeMs: p.responseTimeMs,
        isUp: p.isUp,
        status: p.status,
      }));

      return {
        ...service,
        isActive: service.isActive ?? false,
        currentStatus: latestPing?.status || 0,
        responseTimeMs: latestPing?.responseTimeMs || 0,
        uptimePercent,
        pingHistory,
      };
    })
  );

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white">
              Pingflare Status
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Real-time infrastructure monitoring and alert suppression.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ServiceRegistrationDialog />
          </div>
        </header>

        <RealtimeWrapper initialServices={servicesWithMetrics} />
      </div>
    </main>
  );
}