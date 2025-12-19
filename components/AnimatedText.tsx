"use client";

import { useState, useEffect } from "react";

interface AnimatedTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export function AnimatedText({ text, delay = 0, className = '' }: AnimatedTextProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span 
      style={{
        display: 'inline-block',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.8s ease-out',
      }}
      className={className}
    >
      {text}
    </span>
  );
}
