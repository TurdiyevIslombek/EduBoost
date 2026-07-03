"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Tailwind gradient stops for the icon bubble, e.g. "from-emerald-500 to-teal-600". */
  gradient?: string;
  isLoading?: boolean;
  error?: boolean;
}

// Consistent stat tile for every admin page: glass card, gradient icon
// bubble, gentle 3D lift on hover.
export const AdminStatCard = ({
  title,
  value,
  description,
  icon: Icon,
  gradient = "from-emerald-500 to-teal-600",
  isLoading,
  error,
}: AdminStatCardProps) => {
  return (
    <Card className="group bg-white/70 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 [transform-style:preserve-3d]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
            {isLoading ? (
              <div className="h-8 w-20 mt-1 rounded-md bg-gray-200 animate-pulse" />
            ) : (
              <p className={cn("text-2xl font-bold tabular-nums", error ? "text-red-500" : "text-gray-900")}>
                {error ? "—" : value}
              </p>
            )}
            {description && (
              <p className="text-xs text-gray-500 mt-1 truncate">{description}</p>
            )}
          </div>
          <div
            className={cn(
              "p-3 rounded-2xl bg-gradient-to-br text-white shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
              gradient
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
