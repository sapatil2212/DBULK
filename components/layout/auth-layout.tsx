"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Animated Background */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col relative bg-whatsapp/10 dark:bg-whatsapp/5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-whatsapp/30 to-whatsapp/5 dark:from-whatsapp/20 dark:to-secondary/80" />
        
        {/* Logo */}
        <div className="relative z-10 p-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-whatsapp flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <h1 className="font-bold text-2xl">DBULK</h1>
          </div>
        </div>
        
        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Image 
              src="/whatsapp-marketing.svg" 
              alt="WhatsApp Marketing" 
              width={400} 
              height={400} 
              className="mb-8"
              priority
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center max-w-md"
          >
            <h2 className="text-3xl font-bold mb-4">WhatsApp Marketing Platform</h2>
            <p className="text-lg text-muted-foreground">
              The most powerful way to reach your customers directly through WhatsApp. Boost engagement and drive conversions with personalized messaging.
            </p>
          </motion.div>
        </div>
        
        {/* Footer */}
        <div className="relative z-10 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Digiworld Technology. All rights reserved.
          </p>
        </div>
      </motion.div>
      
      {/* Right Side - Auth Forms */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-center p-8 lg:p-12"
      >
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center lg:hidden mb-8">
              <div className="w-10 h-10 rounded-full bg-whatsapp flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <h1 className="font-bold text-2xl ml-2">DBULK</h1>
            </div>
            
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          
          {children}
        </div>
      </motion.div>
    </div>
  );
}
