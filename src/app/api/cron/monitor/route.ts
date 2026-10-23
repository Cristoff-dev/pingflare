import { NextResponse } from "next/server";
import { db } from "@/db";
import { services, pings } from "@/db/schema";
import { redis } from "@/lib/redis";
import { qstashReceiver } from "@/lib/qstash";
import { sendOutageAlert, sendRecoveryAlert } from "@/lib/resend";
import { eq } from "drizzle-orm";

export const maxDuration = 10;

async function checkHealth(url: string) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { 
      method: "GET", 
      signal: controller.signal,
      cache: "no-store" 
    });
    
    clearTimeout(timeoutId);
    
    return { 
      status: response.status, 
      timeMs: Date.now() - start, 
      isUp: response.ok 
    };
  } catch (error) {
    return { status: 0, timeMs: Date.now() - start, isUp: false };
  }
}

export async function POST(req: Request) {
  const signature = req.headers.get("Upstash-Signature");
  
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  try {
    const body = await req.text();
    const isValid = await qstashReceiver.verify({ signature, body });
    if (!isValid) throw new Error("Invalid signature");
  } catch {
    return NextResponse.json({ error: "Unauthorized request" }, { status: 401 });
  }

  const activeServices = await db.select().from(services).where(eq(services.isActive, true));

  if (activeServices.length === 0) {
    return NextResponse.json({ status: "skipped", reason: "no_active_services" });
  }

  const monitoringTasks = activeServices.map(async (service) => {
    const result = await checkHealth(service.url);
    
    await db.insert(pings).values({
      serviceId: service.id,
      status: result.status,
      responseTimeMs: result.timeMs,
      isUp: result.isUp,
    });

    const alertKey = `alert_sent:${service.id}`;

    if (!result.isUp) {
      const failureTime = await redis.get<number>(alertKey);
      
      if (!failureTime) {
        await sendOutageAlert(service.name, service.url, result.status);
        await redis.set(alertKey, Date.now());
      }
    } else {
      const failureTime = await redis.get<number>(alertKey);
      
      if (failureTime) {
        const downtimeMinutes = Math.max(1, Math.round((Date.now() - failureTime) / 60000));
        await sendRecoveryAlert(service.name, service.url, downtimeMinutes);
        await redis.del(alertKey);
      }
    }
  });

  await Promise.allSettled(monitoringTasks);

  return NextResponse.json({ status: "success", processed: activeServices.length });
}