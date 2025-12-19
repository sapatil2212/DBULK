"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/contexts/user-context";
import { motion } from "framer-motion";
import {
  BarChart3,
  MessageSquare,
  Settings,
  Users,
  FileText,
  Phone,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Zap,
  DollarSign,
  Send
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const { user, logout } = useUser();

  const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Connect WhatsApp", href: "/connect", icon: Phone },
    { title: "Templates", href: "/templates", icon: FileText },
    { title: "Campaigns", href: "/campaigns", icon: Send },
    { title: "Contacts", href: "/contacts", icon: Users },
    { title: "Billing", href: "/billing", icon: DollarSign },
    { title: "Reports", href: "/reports", icon: BarChart3 },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <motion.div
      initial={{ width: collapsed ? 80 : 260 }}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{
        height: '100vh',
        backgroundColor: 'var(--background)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 16px' : '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border)'
      }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
          }}>
            <MessageSquare style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          {!collapsed && (
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--foreground)' }}>DBULK</span>
          )}
        </Link>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          right: '-14px',
          top: '72px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: 'var(--background)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 10
        }}
      >
        {collapsed ? (
          <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--muted-foreground)' }} />
        ) : (
          <ChevronLeft style={{ width: '16px', height: '16px', color: 'var(--muted-foreground)' }} />
        )}
      </button>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shimmer-button sidebar-menu-item ${isActive(item.href) ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '12px' : '12px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                backgroundColor: isActive(item.href) ? 'var(--primary-background)' : 'transparent',
                color: isActive(item.href) ? 'var(--primary, #25D366)' : 'var(--muted-foreground)',
                fontWeight: isActive(item.href) ? 600 : 500,
                fontSize: '14px',
                transition: 'all 0.2s',
                justifyContent: collapsed ? 'center' : 'flex-start'
              }}
            >
              <item.icon style={{ 
                width: '20px', 
                height: '20px',
                color: isActive(item.href) ? 'var(--primary, #25D366)' : 'var(--muted-foreground)'
              }} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Pro Badge */}
      {!collapsed && (
        <div style={{ padding: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Zap style={{ width: '18px', height: '18px', color: 'white' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Upgrade to Pro</span>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', marginBottom: '12px', lineHeight: 1.5 }}>
              Get unlimited messages and advanced features
            </p>
            <button style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'var(--background)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--primary, #25D366)',
              cursor: 'pointer'
            }}>
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* User Section */}
      <div style={{
        padding: collapsed ? '16px 12px' : '16px 20px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        justifyContent: collapsed ? 'center' : 'flex-start'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          {user ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}` : 'U'}
        </div>
        {!collapsed && user && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
              {`${user.firstName || ''} ${user.lastName || ''}`}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
              {user.email || ''}
            </div>
          </div>
        )}
        {!collapsed && (
          <button 
            onClick={() => logout()}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
            <LogOut style={{ width: '18px', height: '18px', color: 'var(--muted-foreground)' }} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
