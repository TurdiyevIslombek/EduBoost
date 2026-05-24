import type { LucideIcon } from "lucide-react";
import { SearchXIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

/**
 * Reusable empty-state block for "no results" cases — video grids,
 * comments, subscriptions, search results, etc.
 */
export const EmptyState = ({
  icon: Icon = SearchXIcon,
  title = "Nothing here yet",
  description = "Try a different filter or check back later.",
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mb-4 dark:bg-emerald-900/40 dark:text-emerald-400">
        <Icon className="size-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2 dark:text-slate-100">
        {title}
      </h3>
      <p className="text-sm text-slate-600 max-w-sm mb-6 leading-relaxed dark:text-slate-400">
        {description}
      </p>
      {action &&
        (action.href ? (
          <Link href={action.href}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button
            onClick={action.onClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {action.label}
          </Button>
        ))}
    </div>
  );
};
