import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200": variant === "default",
          "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400": variant === "success",
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400": variant === "warning",
          "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400": variant === "danger",
          "bg-gray-200 text-gray-800 dark:bg-gray-700/40 dark:text-gray-400": variant === "info",
        },
        className
      )}
      {...props}
    />
  );
}
