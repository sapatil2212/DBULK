"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type ConnectionStatus = "connected" | "not_connected" | "token_expired";

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
  className?: string;
}

export function ConnectionStatusBadge({
  status,
  className,
}: ConnectionStatusBadgeProps) {
  const statusConfig = {
    connected: {
      icon: CheckCircle2,
      text: "Connected",
      variant: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40",
    },
    not_connected: {
      icon: AlertCircle,
      text: "Not Connected",
      variant: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40",
    },
    token_expired: {
      icon: Clock,
      text: "Token Expired",
      variant: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/40",
    },
  };

  const { icon: Icon, text, variant } = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={className}
    >
      <Badge
        variant="outline"
        className={cn(
          "px-3 py-1 gap-1.5 text-xs font-medium rounded-full",
          variant
        )}
      >
        <Icon size={14} />
        {text}
      </Badge>
    </motion.div>
  );
}
