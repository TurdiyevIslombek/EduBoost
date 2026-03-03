"use client";

import { trpc } from "@/trpc/client";
import { AlertTriangleIcon } from "lucide-react";

export const MaintenanceBanner = () => {
  const { data } = trpc.admin.getMaintenanceBanner.useQuery(undefined, {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  if (!data?.enabled || !data.message) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <AlertTriangleIcon className="size-5 text-amber-600" />
        <span className="font-semibold text-amber-800">Notice</span>
      </div>
      <p className="text-amber-700">{data.message}</p>
    </div>
  );
};
