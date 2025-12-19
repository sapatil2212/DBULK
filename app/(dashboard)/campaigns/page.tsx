"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  MessageSquare, 
  MoreVertical, 
  Play, 
  Pause,
  CheckCircle,
  Clock,
  Users,
  Send,
  TrendingUp,
  Calendar,
  Loader2,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/utils/api";

interface Campaign {
  id: string;
  name: string;
  status: string;
  totalContacts: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  scheduledAt: string | null;
  createdAt: string;
  template?: {
    name: string;
  };
}

const getStatusConfig = (status: string) => {
  const normalizedStatus = status?.toLowerCase();
  switch (normalizedStatus) {
    case 'active':
    case 'in_progress':
      return { color: 'var(--success, #22c55e)', bg: 'var(--success-background, rgba(34, 197, 94, 0.15))', label: 'Active' };
    case 'completed':
      return { color: 'var(--info, #3b82f6)', bg: 'var(--info-background, rgba(59, 130, 246, 0.15))', label: 'Completed' };
    case 'scheduled':
      return { color: 'var(--primary, #8b5cf6)', bg: 'var(--primary-background, rgba(139, 92, 246, 0.15))', label: 'Scheduled' };
    case 'paused':
      return { color: 'var(--warning, #f59e0b)', bg: 'var(--warning-background, rgba(245, 158, 11, 0.15))', label: 'Paused' };
    case 'draft':
    case 'ready':
      return { color: 'var(--muted-foreground, #6b7280)', bg: 'var(--background-secondary)', label: status === 'READY' ? 'Ready' : 'Draft' };
    case 'failed':
      return { color: 'var(--error, #ef4444)', bg: 'var(--error-background, rgba(239, 68, 68, 0.15))', label: 'Failed' };
    default:
      return { color: 'var(--muted-foreground)', bg: 'var(--background-secondary)', label: status || 'Unknown' };
  }
};

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch campaigns from API
  const fetchCampaigns = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<Campaign[]>('/api/campaigns', { method: 'GET' });
      if (Array.isArray(data)) {
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Start campaign
  const handleStartCampaign = async (campaignId: string) => {
    try {
      await apiRequest(`/api/campaigns/${campaignId}/start`, { method: 'POST' });
      toast.success('Campaign started');
      fetchCampaigns();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start campaign');
    }
  };

  const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || campaign.status?.toLowerCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "Total Campaigns", value: campaigns.length, icon: MessageSquare, color: "#25D366" },
    { label: "Active", value: campaigns.filter((c: Campaign) => ['active', 'in_progress'].includes(c.status?.toLowerCase())).length, icon: Play, color: "#22c55e" },
    { label: "Scheduled", value: campaigns.filter((c: Campaign) => c.status?.toLowerCase() === 'scheduled').length, icon: Calendar, color: "#8b5cf6" },
    { label: "Total Sent", value: campaigns.reduce((acc: number, c: Campaign) => acc + (c.sentCount || 0), 0).toLocaleString(), icon: Send, color: "#3b82f6" }
  ];

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
            Campaigns
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--muted-foreground)' }}>
            Create, manage, and track your WhatsApp marketing campaigns
          </p>
        </div>

        <Link href="/campaigns/new" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: 600,
          color: 'white',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
          borderRadius: '12px',
          textDecoration: 'none',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <Plus style={{ width: '18px', height: '18px' }} />
          New Campaign
        </Link>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            style={{
              backgroundColor: 'var(--card-background)',
              borderRadius: '14px',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: stat.color + '15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <stat.icon style={{ width: '22px', height: '22px', color: stat.color }} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)' }}>{stat.value}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}
      >
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            color: 'var(--muted-foreground)'
          }} />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              fontSize: '14px',
              border: '2px solid var(--border)',
              borderRadius: '12px',
              outline: 'none',
              backgroundColor: 'var(--input-background)',
              color: 'var(--foreground)',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'active', 'scheduled', 'completed', 'draft'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 500,
                color: selectedStatus === status ? 'white' : 'var(--muted-foreground)',
                backgroundColor: selectedStatus === status ? 'var(--primary)' : 'var(--card-background)',
                border: selectedStatus === status ? 'none' : '2px solid var(--border)',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '60px',
          backgroundColor: 'var(--card-background)',
          borderRadius: '16px',
          border: '1px solid var(--border)'
        }}>
          <Loader2 style={{ width: '32px', height: '32px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Campaigns Table */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{
            backgroundColor: 'var(--card-background)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)',
            overflow: 'hidden'
          }}
        >
          {filteredCampaigns.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: 'var(--muted-foreground)'
            }}>
              <MessageSquare style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--foreground)' }}>No campaigns yet</h3>
              <p style={{ fontSize: '14px', marginBottom: '24px' }}>Create your first campaign to start sending messages</p>
              <Link href="/campaigns/new" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                borderRadius: '12px',
                textDecoration: 'none'
              }}>
                <Plus style={{ width: '18px', height: '18px' }} />
                New Campaign
              </Link>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--background-secondary)' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>Campaign</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>Status</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>Contacts</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>Sent</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>Delivered</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>Read Rate</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign: Campaign) => {
                  const statusConfig = getStatusConfig(campaign.status);
                  const readRate = campaign.deliveredCount > 0 ? Math.round((campaign.readCount / campaign.deliveredCount) * 100) : 0;
                  const canStart = ['draft', 'ready'].includes(campaign.status?.toLowerCase());
                  
                  return (
                    <tr key={campaign.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px' }}>
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
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>{campaign.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{campaign.template?.name || 'No template'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          backgroundColor: statusConfig.bg,
                          color: statusConfig.color,
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px', color: 'var(--foreground)' }}>
                        {(campaign.totalContacts || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px', color: 'var(--foreground)' }}>
                        {(campaign.sentCount || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px', color: 'var(--foreground)' }}>
                        {(campaign.deliveredCount || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <div style={{
                            width: '60px',
                            height: '6px',
                            backgroundColor: 'var(--background-secondary)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${readRate}%`,
                              height: '100%',
                              backgroundColor: 'var(--primary)',
                              borderRadius: '3px'
                            }} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{readRate}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {canStart && (
                            <button 
                              onClick={() => handleStartCampaign(campaign.id)}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                fontWeight: 600
                              }}
                            >
                              <Play style={{ width: '14px', height: '14px' }} />
                              Start
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </motion.div>
      )}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
