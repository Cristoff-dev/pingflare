"use server";

import { db } from "@/db";
import { services } from "@/db/schema";
import { revalidatePath } from "next/cache";

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
  } catch (error) {
    return { error: "Failed to insert service into database" };
  }
}