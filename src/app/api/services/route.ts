import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { desc } from "drizzle-orm";


export async function GET() {
  try {
    const allServices = await db
      .select()
      .from(services)
      .orderBy(desc(services.createdAt));
      
    return NextResponse.json(allServices);
  } catch {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, url } = body;

    if (!name || !url) {
      return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });
    }

    const newService = await db.insert(services).values({
      name,
      url,
      isActive: true,
    }).returning();

    return NextResponse.json(newService[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}