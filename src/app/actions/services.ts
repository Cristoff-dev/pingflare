"use server";

import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Adds a new monitored service to the database
export async function addServiceAction(formData: FormData) {
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;

  if (!name || !url) {
    return { error: "Name and URL are required" };
  }

  try {
    await db.insert(services).values({
      name,
      url,
      isActive: true,
    });

    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Failed to insert service into database" };
  }
}

// Deletes a monitored service from the database
export async function deleteServiceAction(id: number) {
  try {
    await db.delete(services).where(eq(services.id, id));

    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Failed to delete service from database" };
  }
}