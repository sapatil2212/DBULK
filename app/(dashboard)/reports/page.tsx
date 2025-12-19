"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Send,
  CheckCircle,
  Eye,
  MessageSquare,
  Calendar,
  Download,
  Filter
} from "lucide-react";

const stats = [
  { label: "Total Sent", value: "24,589", change: "+12.5%", trend: "up", icon: Send, color: "#25D366" },
  { label: "Delivered", value: "23,845", change: "+8.2%", trend: "up", icon: CheckCircle, color: "#3b82f6" },
  { label: "Read Rate", value: "78.5%", change: "+5.1%", trend: "up", icon: Eye, color: "#8b5cf6" },
  { label: "Reply Rate", value: "12.3%", change: "-2.1%", trend: "down", icon: MessageSquare, color: "#f97316" },
];

const campaignPerformance = [
  { name: "Summer Sale 2025", sent: 2450, delivered: 2380, read: 1890, replied: 245, rate: 77 },
  { name: "Product Launch", sent: 1850, delivered: 1820, read: 1456, replied: 189, rate: 80 },
  { name: "Weekly Newsletter", sent: 3200, delivered: 3150, read: 2520, replied: 312, rate: 80 },
  { name: "Flash Sale Alert", sent: 1500, delivered: 1480, read: 1110, replied: 156, rate: 75 },
  { name: "Customer Survey", sent: 890, delivered: 875, read: 612, replied: 89, rate: 70 },
];

const weeklyData = [
  { day: "Mon", sent: 1245, delivered: 1220, read: 980 },
  { day: "Tue", sent: 1456, delivered: 1430, read: 1150 },
  { day: "Wed", sent: 1678, delivered: 1650, read: 1320 },
  { day: "Thu", sent: 1234, delivered: 1210, read: 970 },
  { day: "Fri", sent: 1890, delivered: 1860, read: 1490 },
  { day: "Sat", sent: 987, delivered: 970, read: 780 },
  { day: "Sun", sent: 756, delivered: 740, read: 590 },
];

export default function ReportsPage() {
  const [timeRange, setTimeRange] = React.useState("7d");
  const maxSent = Math.max(...weeklyData.map(d => d.sent));

  return (
    <div style={{ 
      padding: '32px',
      fontFamily: 'var(--font-sans)',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)'
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '8px' }}>
            Reports & Analytics
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--muted-foreground)' }}>
            Track your campaign performance and messaging insights
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--card-background)', borderRadius: '12px', border: '2px solid var(--border)', overflow: 'hidden' }}>
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: timeRange === range ? 'white' : 'var(--muted-foreground)',
                  backgroundColor: timeRange === range ? 'var(--primary)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {range}
              </button>
            ))}
          </div>
          <button style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--foreground)',
            backgroundColor: 'var(--card-background)',
            border: '2px solid var(--border)',
            borderRadius: '12px',
            cursor: 'pointer'
          }}>
            <Download style={{ width: '18px', height: '18px' }} />
            Export
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            style={{
              backgroundColor: 'var(--card-background)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: stat.color + '15',
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
                backgroundColor: stat.trend === 'up' ? 'var(--success-background, rgba(34, 197, 94, 0.15))' : 'var(--error-background, rgba(239, 68, 68, 0.15))',
                fontSize: '13px',
                fontWeight: 600,
                color: stat.trend === 'up' ? 'var(--success, #16a34a)' : 'var(--error, #dc2626)'
              }}>
                {stat.trend === 'up' ? <TrendingUp style={{ width: '14px', height: '14px' }} /> : <TrendingDown style={{ width: '14px', height: '14px' }} />}
                {stat.change}
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Weekly Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            backgroundColor: 'var(--card-background)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>Weekly Performance</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>Messages sent, delivered, and read</p>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#25D366' }} />
                <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>Sent</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#3b82f6' }} />
                <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>Delivered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#8b5cf6' }} />
                <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>Read</span>
              </div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', gap: '16px' }}>
            {weeklyData.map((data, index) => (
              <div key={data.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '160px' }}>
                  <div style={{
                    width: '16px',
                    height: `${(data.sent / maxSent) * 160}px`,
                    backgroundColor: '#25D366',
                    borderRadius: '4px 4px 0 0'
                  }} />
                  <div style={{
                    width: '16px',
                    height: `${(data.delivered / maxSent) * 160}px`,
                    backgroundColor: '#3b82f6',
                    borderRadius: '4px 4px 0 0'
                  }} />
                  <div style={{
                    width: '16px',
                    height: `${(data.read / maxSent) * 160}px`,
                    backgroundColor: '#8b5cf6',
                    borderRadius: '4px 4px 0 0'
                  }} />
                </div>
                <span style={{ fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: 500 }}>{data.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Delivery Rate Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{
            backgroundColor: 'var(--card-background)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)'
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '24px' }}>Delivery Breakdown</h3>
          
          {/* Simple Donut Chart Representation */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: `conic-gradient(#25D366 0deg 324deg, #3b82f6 324deg 345deg, #ef4444 345deg 360deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'var(--card-background)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)' }}>97%</div>
                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>Delivered</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#25D366' }} />
                <span style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>Delivered</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>23,845</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#3b82f6' }} />
                <span style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>Pending</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>456</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#ef4444' }} />
                <span style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>Failed</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>288</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Campaign Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        style={{
          backgroundColor: 'var(--card-background)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)' }}>Campaign Performance</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--background-secondary)' }}>
              <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)' }}>Campaign</th>
              <th style={{ padding: '14px 24px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)' }}>Sent</th>
              <th style={{ padding: '14px 24px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)' }}>Delivered</th>
              <th style={{ padding: '14px 24px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)' }}>Read</th>
              <th style={{ padding: '14px 24px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)' }}>Replied</th>
              <th style={{ padding: '14px 24px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)' }}>Read Rate</th>
            </tr>
          </thead>
          <tbody>
            {campaignPerformance.map((campaign) => (
              <tr key={campaign.name} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--primary-background, rgba(37, 211, 102, 0.1))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MessageSquare style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>{campaign.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center', fontSize: '14px', color: 'var(--foreground)' }}>
                  {campaign.sent.toLocaleString()}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center', fontSize: '14px', color: 'var(--foreground)' }}>
                  {campaign.delivered.toLocaleString()}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center', fontSize: '14px', color: 'var(--foreground)' }}>
                  {campaign.read.toLocaleString()}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center', fontSize: '14px', color: 'var(--foreground)' }}>
                  {campaign.replied.toLocaleString()}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{
                      width: '60px',
                      height: '6px',
                      backgroundColor: 'var(--background-secondary)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${campaign.rate}%`,
                        height: '100%',
                        backgroundColor: 'var(--primary)',
                        borderRadius: '3px'
                      }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{campaign.rate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
