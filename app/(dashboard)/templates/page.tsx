"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  FileText, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Loader2,
  Send,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/utils/api";

interface Template {
  id: string;
  name: string;
  category: string;
  status: string;
  bodyContent: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

const getStatusConfig = (status: string) => {
  const normalizedStatus = status?.toLowerCase();
  switch (normalizedStatus) {
    case 'approved':
      return { color: 'var(--success, #22c55e)', bg: 'var(--success-background, rgba(34, 197, 94, 0.15))', icon: CheckCircle, label: 'Approved' };
    case 'pending':
    case 'submitted':
      return { color: 'var(--warning, #f59e0b)', bg: 'var(--warning-background, rgba(245, 158, 11, 0.15))', icon: Clock, label: 'Pending' };
    case 'rejected':
      return { color: 'var(--error, #ef4444)', bg: 'var(--error-background, rgba(239, 68, 68, 0.15))', icon: XCircle, label: 'Rejected' };
    case 'draft':
      return { color: 'var(--muted-foreground)', bg: 'var(--background-secondary)', icon: FileText, label: 'Draft' };
    default:
      return { color: 'var(--muted-foreground)', bg: 'var(--background-secondary)', icon: Clock, label: status || 'Unknown' };
  }
};

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState<string | null>(null);

  // Fetch templates from API
  const fetchTemplates = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<Template[]>('/api/templates', { method: 'GET' });
      if (Array.isArray(data)) {
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Submit template for approval
  const handleSubmitForApproval = async (templateId: string) => {
    setIsSubmitting(templateId);
    try {
      await apiRequest(`/api/templates/${templateId}/submit`, { method: 'POST' });
      toast.success('Template submitted for approval');
      fetchTemplates(); // Refresh list
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit template');
    } finally {
      setIsSubmitting(null);
    }
  };

  // Delete template
  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await apiRequest(`/api/templates/${templateId}`, { method: 'DELETE' });
      toast.success('Template deleted');
      fetchTemplates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete template');
    }
  };

  const filteredTemplates = templates.filter((template: Template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            Message Templates
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--muted-foreground)' }}>
            Create and manage your WhatsApp message templates
          </p>
        </div>

        <Link href="/templates/new" style={{
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
          Create Template
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {/* Search */}
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
            placeholder="Search templates..."
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

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'MARKETING', 'UTILITY'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 500,
                color: selectedCategory === category ? 'white' : 'var(--muted-foreground)',
                backgroundColor: selectedCategory === category ? 'var(--primary)' : 'var(--card-background)',
                border: selectedCategory === category ? 'none' : '2px solid var(--border)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {category === 'all' ? 'All' : category.charAt(0) + category.slice(1).toLowerCase()}
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

      {/* Templates Grid */}
      {!isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredTemplates.map((template: Template, index: number) => {
            const statusConfig = getStatusConfig(template.status);
            const isDraft = template.status?.toLowerCase() === 'draft';
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                style={{
                  backgroundColor: 'var(--card-background)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--primary-background, rgba(37, 211, 102, 0.1))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FileText style={{ width: '22px', height: '22px', color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
                        {template.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'var(--muted-foreground)',
                          backgroundColor: 'var(--background-secondary)',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {template.category}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          color: 'var(--muted-foreground)'
                        }}>
                          {template.language}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <p style={{
                  fontSize: '14px',
                  color: 'var(--muted-foreground)',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '63px'
                }}>
                  {template.bodyContent || 'No content'}
                </p>

                {/* Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: statusConfig.bg,
                    color: statusConfig.color,
                    fontSize: '13px',
                    fontWeight: 600
                  }}>
                    <statusConfig.icon style={{ width: '14px', height: '14px' }} />
                    {statusConfig.label}
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border)'
                }}>
                  {isDraft && (
                    <button 
                      onClick={() => handleSubmitForApproval(template.id)}
                      disabled={isSubmitting === template.id}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'white',
                        backgroundColor: 'var(--primary)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isSubmitting === template.id ? 'not-allowed' : 'pointer',
                        opacity: isSubmitting === template.id ? 0.7 : 1
                      }}
                    >
                      {isSubmitting === template.id ? (
                        <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Send style={{ width: '14px', height: '14px' }} />
                      )}
                      Submit for Approval
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteTemplate(template.id)}
                    style={{
                      flex: isDraft ? 0 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--error, #ef4444)',
                      backgroundColor: 'var(--error-background, rgba(239, 68, 68, 0.1))',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                    {isDraft ? '' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'var(--card-background)',
          borderRadius: '16px',
          border: '1px solid var(--border)'
        }}>
          <FileText style={{ width: '48px', height: '48px', color: 'var(--muted-foreground)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
            No templates found
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '24px' }}>
            Try adjusting your search or create a new template
          </p>
          <Link href="/templates/new" style={{
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
            Create Template
          </Link>
        </div>
      )}
    </div>
  );
}
