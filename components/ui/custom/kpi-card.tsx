"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import CountUp from "react-countup";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KpiCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  change?: {
    value: number;
    trend: "up" | "down" | "neutral";
  };
  variant?: "default" | "success" | "warning" | "danger";
  formatValue?: (value: number) => string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  change,
  variant = "default",
  formatValue = (value) => value.toString(),
  className,
}: KpiCardProps) {
  const variantStyles = {
    default: "",
    success: "border-green-200 dark:border-green-800/30 bg-green-50/50 dark:bg-green-900/10",
    warning: "border-amber-200 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10",
    danger: "border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10",
  };

  const iconVariantStyles = {
    default: "bg-whatsapp/10 text-whatsapp",
    success: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    warning: "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    danger: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ translateY: -2 }}
      className={cn("cursor-pointer", className)}
    >
      <Card className={cn("overflow-hidden border border-[var(--card-border)] shadow-none", variantStyles[variant])}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={cn("p-2 rounded-full", iconVariantStyles[variant])}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <CountUp
              end={value}
              duration={2}
              separator=","
              formattingFn={formatValue}
            />
          </div>
          {(description || change) && (
            <div className="flex items-center pt-1">
              {change && (
                <Badge
                  variant="outline"
                  className={cn(
                    "mr-2 px-1 py-0 text-xs",
                    change.trend === "up"
                      ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/30"
                      : change.trend === "down"
                      ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30"
                      : "bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800/30"
                  )}
                >
                  {change.trend === "up" && "↑"}
                  {change.trend === "down" && "↓"}
                  {change.trend === "neutral" && "→"} {Math.abs(change.value)}%
                </Badge>
              )}
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
