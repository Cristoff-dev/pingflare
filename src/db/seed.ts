import "dotenv/config"; // Strictly as the first line
import { db } from "./index";
import { services, pings } from "./schema";

async function seed() {
  console.log("🌱 Starting database seeding...");

  await db.delete(pings);
  await db.delete(services);

  const insertedServices = await db.insert(services).values([
    { name: "Core Payment API", url: "https://api.mock-payments.com/health", isActive: true },
    { name: "User Authentication", url: "https://auth.pingflare.local/ping", isActive: true },
    { name: "Marketing Website", url: "https://www.pingflare.com", isActive: true },
    { name: "Legacy Database Replica", url: "https://db-replica.internal/status", isActive: false },
  ]).returning();

  console.log(`✅ Created ${insertedServices.length} services.`);

  const pingData = [];
  const now = new Date();

  for (const service of insertedServices) {
    if (!service.isActive) continue;

    for (let i = 0; i < 288; i++) {
      const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
      
      const isUp = Math.random() > 0.05; 
      const status = isUp ? 200 : (Math.random() > 0.5 ? 500 : 0);
      const responseTimeMs = isUp ? Math.floor(Math.random() * 200) + 30 : null;

      pingData.push({
        serviceId: service.id,
        status,
        responseTimeMs,
        isUp,
        timestamp,
      });
    }
  }

  const batchSize = 500;
  for (let i = 0; i < pingData.length; i += batchSize) {
    const batch = pingData.slice(i, i + batchSize);
    await db.insert(pings).values(batch);
  }

  console.log(`✅ Generated ${pingData.length} historical pings.`);
  console.log("🎉 Seeding complete!");
  
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});