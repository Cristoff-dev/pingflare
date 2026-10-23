import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
      <DashboardSkeleton />
    </main>
  );
}