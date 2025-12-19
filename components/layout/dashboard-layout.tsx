"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex',
      backgroundColor: 'var(--background)',
      fontFamily: 'var(--font-sans)'
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar />
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ flex: 1, overflowY: 'auto' }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
