"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteServiceAction } from "@/app/actions/services";

export function DeleteServiceButton({ serviceId }: { serviceId: number }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this monitored service?")) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteServiceAction(serviceId);
    setIsDeleting(false);

    if (result.error) {
      alert(result.error);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-50"
      title="Delete service"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}