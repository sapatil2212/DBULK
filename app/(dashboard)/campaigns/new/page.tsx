"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, CheckCircle2, Loader2, MessageSquare, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/ui/custom/file-upload";
import { apiRequest } from "@/lib/utils/api";

interface TemplateData {
  id: string;
  name: string;
  category: string;
  status: string;
  bodyContent: string;
  headerContent?: string;
  footerContent?: string;
  language: string;
}

const campaignSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters"),
  templateId: z.string().min(1, "Template selection is required"),
  sendingMode: z.enum(["immediate", "scheduled"]),
  scheduleDate: z.date().optional(),
  scheduleTime: z.string().optional(),
  variableMappings: z.record(z.string(), z.string()).optional(),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

export default function NewCampaignPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateData | null>(null);
  const [previewData, setPreviewData] = React.useState<Record<string, string>[]>([]);
  const [csvHeaders, setCsvHeaders] = React.useState<string[]>([]);
  
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      templateId: "",
      sendingMode: "immediate",
      variableMappings: {},
    },
  });

  const sendingMode = form.watch("sendingMode");
  const templateId = form.watch("templateId");
  const variableMappings = form.watch("variableMappings") || {};

  // Fetch WhatsApp accounts and templates
  const [whatsappAccounts, setWhatsappAccounts] = React.useState<Array<{id: string, name: string, phoneNumber: string}>>([]);
  const [selectedAccount, setSelectedAccount] = React.useState<string>("");
  const [templates, setTemplates] = React.useState<TemplateData[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = React.useState(true);
  
  // Update selected template when templateId changes
  React.useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find((t: TemplateData) => t.id === templateId);
      setSelectedTemplate(template || null);
    } else {
      setSelectedTemplate(null);
    }
  }, [templateId, templates]);

  // Parse CSV file
  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          const lines = text.split('\n').filter(line => line.trim());
          if (lines.length > 0) {
            // Parse headers
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            setCsvHeaders(headers);
            
            // Parse data rows (first 5 for preview)
            const dataRows = lines.slice(1, 6).map(line => {
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
              const row: Record<string, string> = {};
              headers.forEach((header, idx) => {
                row[header] = values[idx] || '';
              });
              return row;
            });
            setPreviewData(dataRows);
          }
        }
      };
      reader.readAsText(file);
    } else {
      setSelectedFile(null);
      setPreviewData([]);
      setCsvHeaders([]);
    }
  };

  const getPreviewText = (text: string, data: Record<string, string>) => {
    if (!text) return '';
    let previewText = text;
    const matches = [...text.matchAll(/{{(\d+)}}/g)];
    
    matches.forEach((match) => {
      const varNumber = match[1];
      const mappingKey = variableMappings[`var_${varNumber}`] || "";
      const value = data[mappingKey] || `[Variable ${varNumber}]`;
      previewText = previewText.replace(new RegExp(`{{${varNumber}}}`, "g"), value);
    });
    
    return previewText;
  };
  
  React.useEffect(() => {
    // Fetch WhatsApp accounts when component mounts
    const fetchWhatsappAccounts = async () => {
      try {
        const accounts = await apiRequest<Array<{ id: string; name: string; phoneNumber: string }>>(
          "/api/whatsapp/connect",
          { method: "GET" }
        );

        if (Array.isArray(accounts)) {
          setWhatsappAccounts(accounts);
          if (accounts.length > 0) {
            setSelectedAccount(accounts[0].id);
            // Fetch templates for this account
            fetchTemplatesForAccount(accounts[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching WhatsApp accounts:', error);
        toast.error("Failed to load WhatsApp accounts", {
          description: "Please make sure you've connected your WhatsApp Business account",
        });
      }
    };
    
    const fetchTemplatesForAccount = async (accountId: string) => {
      setIsLoadingTemplates(true);
      try {
        const templatesData = await apiRequest<TemplateData[]>(`/api/templates?whatsappAccountId=${accountId}`, {
          method: "GET",
        });

        if (Array.isArray(templatesData)) {
          // Filter to only show approved templates for campaigns
          const approvedTemplates = templatesData.filter(
            (t: TemplateData) => t.status?.toLowerCase() === 'approved'
          );
          setTemplates(approvedTemplates);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast.error("Failed to load message templates", {
          description: "Templates may not be available or approved yet",
        });
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    
    fetchWhatsappAccounts();
  }, []);

  const onSubmit = async (data: CampaignFormValues) => {
    if (!selectedFile) {
      toast.error("Please upload a contacts file");
      return;
    }
    
    if (!selectedAccount) {
      toast.error("WhatsApp account required", {
        description: "Please select a WhatsApp account to create a campaign",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Format data for API
      const campaignData = {
        name: data.name,
        whatsappAccountId: selectedAccount,
        templateId: data.templateId,
        status: data.sendingMode === "immediate" ? "READY" : "SCHEDULED",
        scheduledAt: data.sendingMode === "scheduled" ? 
          `${format(data.scheduleDate!, "yyyy-MM-dd")}T${data.scheduleTime}:00` : null,
        variableMappings: data.variableMappings || {},
        contactsCount: previewData.length
      };
      
      // Make API call to create campaign
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create campaign');
      }
      
      // Upload contacts file
      if (result.data?.id) {
        const campaignId = result.data.id;
        
        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const uploadResponse = await fetch(`/api/campaigns/${campaignId}/contacts`, {
          method: 'POST',
          body: formData
        });
        
        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error?.message || 'Failed to upload contacts');
        }
        
        // Start the campaign if immediate
        if (data.sendingMode === "immediate") {
          const startResponse = await fetch(`/api/campaigns/${campaignId}/start`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (!startResponse.ok) {
            const startError = await startResponse.json();
            throw new Error(startError.error?.message || 'Failed to start campaign');
          }
          
          toast.success("Campaign started successfully", {
            description: "Your campaign is now sending messages"
          });
        } else {
          toast.success("Campaign scheduled successfully", {
            description: `Your campaign is scheduled for ${format(data.scheduleDate!, "PP")} at ${data.scheduleTime}`
          });
        }
      }

      // Navigate back to campaigns page
      router.push("/campaigns");
    } catch (error) {
      console.error('Campaign creation error:', error);
      toast.error("Failed to create campaign", {
        description: error instanceof Error ? error.message : "Please try again later"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '32px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <Link 
            href="/campaigns"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--card-background)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </Link>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>
              Create Campaign
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: '4px 0 0 0' }}>
              Design and schedule your WhatsApp message campaign
            </p>
          </div>
        </div>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            {/* Left Column - Campaign Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div style={{
                backgroundColor: 'var(--card-background)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', margin: '0 0 4px 0' }}>
                  Campaign Details
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: '0 0 20px 0' }}>
                  Name your campaign and select a message template
                </p>

                {/* Campaign Name */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Summer Sale Announcements"
                    {...form.register("name")}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      borderRadius: '10px',
                      border: '2px solid var(--border)',
                      backgroundColor: 'var(--input-background)',
                      color: 'var(--foreground)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: '6px 0 0 0' }}>
                    A descriptive name to identify your campaign
                  </p>
                </div>

                {/* Message Template */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '12px' }}>
                    Message Template
                  </label>
                  
                  {isLoadingTemplates ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                      <Loader2 style={{ width: '24px', height: '24px', animation: 'spin 1s linear infinite', color: 'var(--muted-foreground)' }} />
                    </div>
                  ) : templates.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '32px',
                      backgroundColor: 'var(--muted)',
                      borderRadius: '12px'
                    }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--foreground)', margin: '0 0 4px 0' }}>
                        No approved templates available
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: '0 0 16px 0' }}>
                        Create and submit templates for approval first
                      </p>
                      <Link
                        href="/templates/new"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: 600,
                          borderRadius: '8px',
                          backgroundColor: '#25D366',
                          color: 'white',
                          textDecoration: 'none'
                        }}
                      >
                        Create Template
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {templates.map((template: TemplateData) => (
                        <label
                          key={template.id}
                          htmlFor={`template-${template.id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            padding: '16px',
                            borderRadius: '12px',
                            border: templateId === template.id ? '2px solid #25D366' : '2px solid var(--border)',
                            backgroundColor: templateId === template.id ? 'rgba(37, 211, 102, 0.05)' : 'var(--background)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <input
                            type="radio"
                            id={`template-${template.id}`}
                            value={template.id}
                            checked={templateId === template.id}
                            onChange={(e) => form.setValue("templateId", e.target.value)}
                            style={{ marginTop: '4px', accentColor: '#25D366' }}
                          />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', margin: '0 0 4px 0' }}>
                              {template.name}
                            </p>
                            <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: '0 0 8px 0' }}>
                              {template.category} • {template.language}
                            </p>
                            <div style={{
                              padding: '10px 12px',
                              backgroundColor: 'var(--muted)',
                              borderRadius: '8px',
                              fontSize: '12px',
                              color: 'var(--foreground)',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {template.bodyContent || 'No content'}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Upload & Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              {/* Upload Contacts Card */}
              <div style={{
                backgroundColor: 'var(--card-background)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', margin: '0 0 4px 0' }}>
                  Upload Contacts
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: '0 0 20px 0' }}>
                  Upload a CSV file with your contacts data
                </p>
                <FileUpload
                  accept=".csv"
                  onFilesChange={handleFileChange}
                  description="Drop your CSV file here or click to browse"
                />
              </div>

              {/* Send Options Card */}
              <div style={{
                backgroundColor: 'var(--card-background)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', margin: '0 0 4px 0' }}>
                  Send Options
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: '0 0 20px 0' }}>
                  Choose when to send your campaign
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <label
                    htmlFor="immediate"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px',
                      borderRadius: '12px',
                      border: sendingMode === 'immediate' ? '2px solid #25D366' : '2px solid var(--border)',
                      backgroundColor: sendingMode === 'immediate' ? 'rgba(37, 211, 102, 0.05)' : 'var(--background)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="radio"
                      id="immediate"
                      value="immediate"
                      checked={sendingMode === 'immediate'}
                      onChange={() => form.setValue("sendingMode", "immediate")}
                      style={{ display: 'none' }}
                    />
                    <Send style={{ width: '24px', height: '24px', marginBottom: '8px', color: sendingMode === 'immediate' ? '#25D366' : 'var(--muted-foreground)' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>Send Immediately</span>
                  </label>

                  <label
                    htmlFor="scheduled"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px',
                      borderRadius: '12px',
                      border: sendingMode === 'scheduled' ? '2px solid #25D366' : '2px solid var(--border)',
                      backgroundColor: sendingMode === 'scheduled' ? 'rgba(37, 211, 102, 0.05)' : 'var(--background)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="radio"
                      id="scheduled"
                      value="scheduled"
                      checked={sendingMode === 'scheduled'}
                      onChange={() => form.setValue("sendingMode", "scheduled")}
                      style={{ display: 'none' }}
                    />
                    <Calendar style={{ width: '24px', height: '24px', marginBottom: '8px', color: sendingMode === 'scheduled' ? '#25D366' : 'var(--muted-foreground)' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>Schedule</span>
                  </label>
                </div>

                {sendingMode === "scheduled" && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                        Date
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => form.setValue("scheduleDate", e.target.valueAsDate || undefined)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          fontSize: '14px',
                          borderRadius: '10px',
                          border: '2px solid var(--border)',
                          backgroundColor: 'var(--input-background)',
                          color: 'var(--foreground)',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                        Time
                      </label>
                      <input
                        type="time"
                        {...form.register("scheduleTime")}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          fontSize: '14px',
                          borderRadius: '10px',
                          border: '2px solid var(--border)',
                          backgroundColor: 'var(--input-background)',
                          color: 'var(--foreground)',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Variable Mapping Section */}
          {selectedTemplate && selectedFile && previewData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              style={{ marginTop: '24px' }}
            >
              <div style={{
                backgroundColor: 'var(--card-background)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', margin: '0 0 4px 0' }}>
                  Variable Mapping
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: '0 0 20px 0' }}>
                  Map template variables to your contact data fields
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  {(() => {
                    const bodyContent = selectedTemplate.bodyContent || '';
                    const matches = [...bodyContent.matchAll(/{{(\d+)}}/g)];
                    const uniqueVars = [...new Set(matches.map(m => m[1]))];
                    
                    return uniqueVars.map((varNumber: string) => (
                      <div key={`var_${varNumber}`}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                          Variable {`{{${varNumber}}}`}
                        </label>
                        <select
                          onChange={(e) => form.setValue(`variableMappings.var_${varNumber}`, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            fontSize: '14px',
                            borderRadius: '10px',
                            border: '2px solid var(--border)',
                            backgroundColor: 'var(--input-background)',
                            color: 'var(--foreground)',
                            outline: 'none',
                            cursor: 'pointer',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="">Select a field to map</option>
                          {csvHeaders.map((key: string) => (
                            <option key={key} value={key}>{key.replace(/_/g, " ")}</option>
                          ))}
                        </select>
                        <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', margin: '4px 0 0 0' }}>
                          Maps {`{{${varNumber}}}`} to contact data
                        </p>
                      </div>
                    ));
                  })()}
                </div>

                {/* Preview section */}
                <div style={{
                  backgroundColor: 'var(--background)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid var(--border)'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare style={{ width: '16px', height: '16px' }} />
                    Preview
                  </h4>
                  {previewData.slice(0, 2).map((data: Record<string, string>, idx: number) => (
                    <div key={idx} style={{
                      padding: '12px',
                      backgroundColor: 'var(--card-background)',
                      borderRadius: '8px',
                      marginBottom: idx < 1 ? '12px' : 0
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>
                          Contact: {data[csvHeaders[0]] || 'Unknown'}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          {data.phone || data.phone_number || ''}
                        </span>
                      </div>
                      <div style={{
                        padding: '12px',
                        backgroundColor: '#dcf8c6',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#303030',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {getPreviewText(selectedTemplate.bodyContent || '', data)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Link
              href="/campaigns"
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card-background)',
                color: 'var(--foreground)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile || !selectedTemplate}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '10px',
                border: 'none',
                background: (isSubmitting || !selectedFile || !selectedTemplate) ? 'var(--muted)' : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                color: 'white',
                cursor: (isSubmitting || !selectedFile || !selectedTemplate) ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  Creating Campaign...
                </>
              ) : (
                <>
                  <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                  Create Campaign
                </>
              )}
            </button>
          </div>
        </form>
      </Form>
      
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
