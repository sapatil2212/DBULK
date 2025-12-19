"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Send, 
  CheckCircle, 
  XCircle, 
  Users, 
  TrendingUp, 
  TrendingDown,
  MessageSquare,
  Phone,
  PlusCircle,
  UserPlus,
  ArrowRight,
  BarChart3,
  Clock,
  Zap
} from "lucide-react";

const stats = [
  { 
    title: "Messages Sent", 
    value: "8,547", 
    change: "+12.5%", 
    trend: "up",
    icon: Send,
    color: "#25D366",
    bgColor: "#dcfce7"
  },
  { 
    title: "Delivered", 
    value: "8,249", 
    change: "+3.2%", 
    trend: "up",
    icon: CheckCircle,
    color: "#3b82f6",
    bgColor: "#dbeafe"
  },
  { 
    title: "Failed", 
    value: "298", 
    change: "-0.8%", 
    trend: "down",
    icon: XCircle,
    color: "#ef4444",
    bgColor: "#fee2e2"
  },
  { 
    title: "Active Campaigns", 
    value: "5", 
    change: "+2",
    trend: "up",
    icon: MessageSquare,
    color: "#8b5cf6",
    bgColor: "#ede9fe"
  },
];

const recentCampaigns = [
  { name: "Summer Sale Promo", date: "2 hours ago", status: "Active", sent: 1245, delivered: 1230, color: "#25D366" },
  { name: "Product Launch", date: "Yesterday", status: "Completed", sent: 845, delivered: 840, color: "#3b82f6" },
  { name: "Customer Survey", date: "3 days ago", status: "Completed", sent: 1050, delivered: 1020, color: "#8b5cf6" },
  { name: "Weekly Newsletter", date: "5 days ago", status: "Completed", sent: 2340, delivered: 2310, color: "#f97316" },
];

const quickActions = [
  { title: "New Campaign", description: "Create a new marketing campaign", icon: PlusCircle, href: "/campaigns/new", color: "#25D366" },
  { title: "Upload Contacts", description: "Import contacts from CSV", icon: UserPlus, href: "/contacts", color: "#3b82f6" },
  { title: "Connect WhatsApp", description: "Link your WhatsApp Business", icon: Phone, href: "/connect", color: "#8b5cf6" },
  { title: "View Reports", description: "Analyze campaign performance", icon: BarChart3, href: "/reports", color: "#f97316" },
];

export default function DashboardPage() {
  return (
    <div style={{ 
      padding: '32px',
      backgroundColor: 'var(--background)',
      minHeight: '100vh',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '8px' }}>
            Welcome back! 👋
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--muted-foreground)' }}>
            Here's an overview of your WhatsApp marketing performance
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ display: 'flex', gap: '12px' }}
        >
          <Link href="/contacts" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--foreground)',
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            textDecoration: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
          }}>
            <UserPlus style={{ width: '18px', height: '18px' }} />
            Upload Contacts
          </Link>
          <Link href="/campaigns/new" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'white',
            background: 'linear-gradient(135deg, #25D366 0%, #1DA851 100%)',
            borderRadius: '12px',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
          }}>
            <PlusCircle style={{ width: '18px', height: '18px' }} />
            New Campaign
          </Link>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            style={{
              backgroundColor: 'var(--card-background)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'none',
              border: '1px solid var(--card-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: stat.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <stat.icon style={{ width: '24px', height: '24px', color: stat.color }} />
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '20px',
                backgroundColor: stat.trend === 'up' ? '#dcfce7' : '#fee2e2',
                fontSize: '13px',
                fontWeight: 600,
                color: stat.trend === 'up' ? '#16a34a' : '#dc2626'
              }}>
                {stat.trend === 'up' ? <TrendingUp style={{ width: '14px', height: '14px' }} /> : <TrendingDown style={{ width: '14px', height: '14px' }} />}
                {stat.change}
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>{stat.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          style={{
            backgroundColor: 'var(--card-background)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'none',
            border: '1px solid var(--card-border)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '4px' }}>Recent Campaigns</h2>
              <p style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>Your latest marketing campaigns</p>
            </div>
            <Link href="/campaigns" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#25D366',
              textDecoration: 'none'
            }}>
              View all
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentCampaigns.map((campaign, index) => (
              <div
                key={campaign.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: 'var(--background-secondary)',
                  borderRadius: '12px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: campaign.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MessageSquare style={{ width: '22px', height: '22px', color: campaign.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>{campaign.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted-foreground)' }}>
                      <Clock style={{ width: '14px', height: '14px' }} />
                      {campaign.date}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: campaign.status === 'Active' ? 'rgba(22, 163, 74, 0.15)' : 'var(--background-secondary)',
                    color: campaign.status === 'Active' ? '#16a34a' : 'var(--muted-foreground)',
                    marginBottom: '4px'
                  }}>
                    {campaign.status}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                    {campaign.delivered.toLocaleString()} / {campaign.sent.toLocaleString()} delivered
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          style={{
            backgroundColor: 'var(--card-background)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'none',
            border: '1px solid var(--card-border)'
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '20px' }}>Quick Actions</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                href={action.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: 'var(--background-secondary)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: action.color + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <action.icon style={{ width: '22px', height: '22px', color: action.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '2px' }}>{action.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{action.description}</div>
                </div>
                <ArrowRight style={{ width: '18px', height: '18px', color: 'var(--muted-foreground)' }} />
              </Link>
            ))}
          </div>

          {/* Performance Summary */}
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Zap style={{ width: '20px', height: '20px', color: 'white' }} />
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>Performance Summary</span>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, marginBottom: '16px' }}>
              Your campaigns are performing 12% better than last month. Keep up the great work!
            </p>
            <Link href="/reports" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'white',
              textDecoration: 'none'
            }}>
              View detailed report
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
