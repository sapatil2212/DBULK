"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  MessageSquare, 
  Users,
  Calendar,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/utils/api";

interface BillingSummary {
  totalConversations: number;
  billableConversations: number;
  totalSpend: string;
  currency: string;
  conversationsByCategory: Record<string, number>;
  recentCharges: Array<{
    id: string;
    type: string;
    amount: string;
    currency: string;
    description: string;
    date: string;
  }>;
}

export default function BillingPage() {
  const [summary, setSummary] = React.useState<BillingSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBillingSummary = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest<{ data: BillingSummary }>('/api/billing/summary', { method: 'GET' });
        setSummary(response.data);
      } catch (error) {
        console.error('Error fetching billing summary:', error);
        toast.error('Failed to load billing data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No billing data available</p>
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    MARKETING: '#8b5cf6',
    UTILITY: '#3b82f6',
    AUTHENTICATION: '#10b981',
    SERVICE: '#f59e0b',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Billing & Usage</h1>
        <p className="text-muted-foreground mt-2">
          Track your WhatsApp conversation costs and usage
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Spend</p>
          <p className="text-2xl font-bold">
            {summary.currency} {parseFloat(summary.totalSpend).toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Conversations</p>
          <p className="text-2xl font-bold">{summary.totalConversations}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Billable</p>
          <p className="text-2xl font-bold">{summary.billableConversations}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Users className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Avg Cost/Conv</p>
          <p className="text-2xl font-bold">
            {summary.currency}{' '}
            {summary.billableConversations > 0
              ? (parseFloat(summary.totalSpend) / summary.billableConversations).toFixed(4)
              : '0.00'}
          </p>
        </motion.div>
      </div>

      {/* Conversations by Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-xl p-6 border border-border"
      >
        <h2 className="text-xl font-semibold mb-6">Conversations by Category</h2>
        <div className="space-y-4">
          {Object.entries(summary.conversationsByCategory).map(([category, count]) => {
            const percentage = (count / summary.totalConversations) * 100;
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{category}</span>
                  <span className="text-sm text-muted-foreground">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: categoryColors[category] || '#6b7280',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Charges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-xl p-6 border border-border"
      >
        <h2 className="text-xl font-semibold mb-6">Recent Charges</h2>
        <div className="space-y-4">
          {summary.recentCharges.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No charges yet</p>
          ) : (
            summary.recentCharges.map((charge) => (
              <div
                key={charge.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{charge.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(charge.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {charge.currency} {parseFloat(charge.amount).toFixed(4)}
                  </p>
                  <p className="text-sm text-muted-foreground">{charge.type}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-500 mb-2">Meta WhatsApp Pricing</h3>
            <p className="text-sm text-muted-foreground">
              Costs are calculated based on Meta's official WhatsApp Business API pricing. 
              Charges are per conversation (24-hour window), not per message. 
              Rates vary by country and conversation type (Marketing, Utility, Authentication, Service).
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
