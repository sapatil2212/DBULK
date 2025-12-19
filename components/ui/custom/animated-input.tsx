"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AnimatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function AnimatedInput({
  className,
  type,
  label,
  error,
  ...props
}: AnimatedInputProps) {
  const [focused, setFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const handleFocus = () => setFocused(true);
  const handleBlur = () => {
    setFocused(false);
    setHasValue(!!inputRef.current?.value);
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className="relative space-y-1">
      <div
        className={cn(
          "relative rounded-md transition-all duration-200",
          focused
            ? "ring-2 ring-whatsapp/50"
            : error
            ? "ring-2 ring-destructive/50"
            : ""
        )}
      >
        <motion.div
          initial={false}
          animate={{
            top: focused || hasValue ? "-0.5rem" : "0.75rem",
            left: focused || hasValue ? "0.5rem" : "0.75rem",
            scale: focused || hasValue ? 0.85 : 1,
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "absolute z-10 px-1 bg-background pointer-events-none text-muted-foreground",
            (focused || hasValue) && "text-whatsapp"
          )}
        >
          {label}
        </motion.div>

        <Input
          ref={inputRef}
          type={inputType}
          className={cn(
            "pt-4",
            isPassword && "pr-10",
            error && "border-destructive focus-visible:ring-destructive/50",
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={(e) => setHasValue(!!e.target.value)}
          {...props}
        />

        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-full px-3 py-2"
            onClick={toggleShowPassword}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
