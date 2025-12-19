"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, MessageCircle, Plus, Save, Trash } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/utils/api";

const templateSchema = z.object({
  name: z.string().min(2, "Template name must be at least 2 characters"),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]),
  language: z.string().min(2, "Language code must be at least 2 characters"),
  components: z.array(
    z.object({
      type: z.enum(["HEADER", "BODY", "FOOTER", "BUTTONS"]),
      format: z.enum(["TEXT", "IMAGE", "DOCUMENT", "VIDEO"]),
      text: z.string(),
    })
  ).min(1, "At least one component is required"),
  buttons: z.array(
    z.object({
      type: z.enum(["QUICK_REPLY", "URL", "PHONE_NUMBER"]),
      text: z.string().min(1, "Button text is required"),
      url: z.string().optional(),
      phoneNumber: z.string().optional(),
    })
  ).max(3).optional(),
});

type TemplateFormValues = z.input<typeof templateSchema>;
type ButtonType = { type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER"; text: string; url?: string; phoneNumber?: string };

export default function NewTemplatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("edit");
  const [variables, setVariables] = React.useState<Record<string, string>>({});
  const [buttons, setButtons] = React.useState<ButtonType[]>([]);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      category: "UTILITY",
      language: "en",
      components: [
        {
          type: "HEADER",
          format: "TEXT",
          text: "",
        },
        {
          type: "BODY",
          format: "TEXT",
          text: "",
        },
        {
          type: "FOOTER",
          format: "TEXT",
          text: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "components",
  });

  // Extract variables from template text
  React.useEffect(() => {
    const extractVariables = () => {
      const allVariables: Record<string, string> = {};
      
      const formValues = form.getValues();
      formValues.components.forEach((component) => {
        const matches = [...component.text.matchAll(/{{(\d+)}}/g)];
        matches.forEach((match) => {
          const varNumber = match[1];
          if (!allVariables[varNumber]) {
            allVariables[varNumber] = "";
          }
        });
      });
      
      setVariables(allVariables);
    };
    
    extractVariables();
  }, [form.watch("components")]);

  // Preview text with variables replaced
  const getPreviewText = (text: string) => {
    let previewText = text;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      previewText = previewText.replace(regex, value || `[Variable ${key}]`);
    });
    return previewText;
  };

  const [whatsappAccounts, setWhatsappAccounts] = React.useState<Array<{id: string, name: string, phoneNumber: string}>>([]);
  const [selectedAccount, setSelectedAccount] = React.useState<string>("");
  
  React.useEffect(() => {
    // Fetch WhatsApp accounts when component mounts (authenticated)
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
          }
        }
      } catch (error) {
        console.error("Error fetching WhatsApp accounts:", error);
        toast.error("Failed to load WhatsApp accounts", {
          description: "Please make sure you've connected your WhatsApp Business account and are logged in.",
        });
      }
    };

    fetchWhatsappAccounts();
  }, []);
  
  const onSubmit = async (data: TemplateFormValues) => {
    if (!selectedAccount) {
      toast.error("WhatsApp account required", {
        description: "Please select a WhatsApp account to create a template",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Extract component data correctly
      const headerComponent = data.components.find(c => c.type === 'HEADER');
      const bodyComponent = data.components.find(c => c.type === 'BODY');
      const footerComponent = data.components.find(c => c.type === 'FOOTER');
      
      // Extract variables for API
      const variableList = Object.entries(variables).map(([key, value]) => ({
        index: parseInt(key),
        example: value || `Example for {{${key}}}`
      }));
      
      // Create API payload - ensure name is lowercase with underscores only
      const sanitizedName = data.name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      
      const templatePayload = {
        whatsappAccountId: selectedAccount,
        name: sanitizedName,
        language: data.language,
        category: data.category,
        headerType: headerComponent?.format,
        headerContent: headerComponent?.text,
        bodyContent: bodyComponent?.text || "",
        footerContent: footerComponent?.text,
        buttons: buttons.length > 0 ? buttons : undefined,
        variables: variableList.length > 0 ? variableList : undefined
      };
      
      // Make authenticated API call to create template
      const createdTemplate = await apiRequest<{ id: string }>("/api/templates", {
        method: "POST",
        body: templatePayload,
      });

      // Success message
      toast.success("Template created successfully", {
        description: "Your template has been saved as a draft",
      });
      
      // Submit the template for approval
      if (createdTemplate?.id) {
        try {
          await apiRequest(`/api/templates/${createdTemplate.id}/submit`, {
            method: "POST",
          });

          toast.success("Template submitted for approval", {
            description: "WhatsApp will review your template",
          });
        } catch (submitError) {
          console.error("Template submit error:", submitError);
          toast.error("Template created but submission failed", {
            description:
              submitError instanceof Error
                ? submitError.message
                : "You can submit it later from the Templates page.",
          });
        }
      }
      
      // Navigate back to templates page
      router.push("/templates");
    } catch (error) {
      console.error('Template creation error:', error);
      toast.error("Failed to create template", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '32px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <Link 
            href="/templates"
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
              Create Template
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: '4px 0 0 0' }}>
              Design a new WhatsApp message template with variables
            </p>
          </div>
        </div>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
            {/* Left Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* WhatsApp Account Selection Card */}
              <div style={{
                backgroundColor: 'var(--card-background)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)', margin: '0 0 4px 0' }}>
                      WhatsApp Business Account
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: 0 }}>
                      {whatsappAccounts.length > 0 
                        ? "Choose which connected WhatsApp account this template belongs to."
                        : "No WhatsApp accounts found. Connect an account first to create templates."}
                    </p>
                  </div>
                  {whatsappAccounts.length > 0 ? (
                    <select
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                      style={{
                        padding: '10px 16px',
                        fontSize: '14px',
                        borderRadius: '10px',
                        border: '2px solid var(--border)',
                        backgroundColor: 'var(--input-background)',
                        color: 'var(--foreground)',
                        minWidth: '280px',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      {whatsappAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name} • {account.phoneNumber}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Link
                      href="/connect"
                      style={{
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: 600,
                        borderRadius: '10px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        textDecoration: 'none'
                      }}
                    >
                      Connect WhatsApp
                    </Link>
                  )}
                </div>
              </div>

              {/* Template Details Card */}
              <div style={{
                backgroundColor: 'var(--card-background)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', margin: '0 0 20px 0' }}>
                  Template Details
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {/* Template Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                      Template Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Order Confirmation"
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
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: '6px 0 0 0' }}>
                      A unique name for your template (will be converted to lowercase with underscores)
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                      Category
                    </label>
                    <select
                      {...form.register("category")}
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
                      <option value="UTILITY">Utility</option>
                      <option value="MARKETING">Marketing</option>
                      <option value="AUTHENTICATION">Authentication</option>
                    </select>
                    <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: '6px 0 0 0' }}>
                      Category affects approval process and usage limits
                    </p>
                  </div>

                  {/* Language */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                      Language Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., en"
                      {...form.register("language")}
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
                      ISO language code (e.g., en, es, fr, hi)
                    </p>
                  </div>
                </div>
              </div>

              {/* Template Components Card */}
              <div style={{
                backgroundColor: 'var(--card-background)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
                    Template Components
                  </h3>
                  <button
                    type="button"
                    onClick={() => append({ type: "BODY", format: "TEXT", text: "" })}
                    disabled={fields.length >= 5}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--card-background)',
                      color: 'var(--foreground)',
                      cursor: fields.length >= 5 ? 'not-allowed' : 'pointer',
                      opacity: fields.length >= 5 ? 0.5 : 1
                    }}
                  >
                    <Plus style={{ width: '16px', height: '16px' }} />
                    Add Component
                  </button>
                </div>

                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    style={{
                      backgroundColor: 'var(--background)',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '16px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '6px' }}>
                            Component Type
                          </label>
                          <select
                            {...form.register(`components.${index}.type`)}
                            style={{
                              padding: '8px 12px',
                              fontSize: '13px',
                              borderRadius: '8px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--input-background)',
                              color: 'var(--foreground)',
                              cursor: 'pointer',
                              minWidth: '140px'
                            }}
                          >
                            <option value="HEADER">Header</option>
                            <option value="BODY">Body</option>
                            <option value="FOOTER">Footer</option>
                            <option value="BUTTONS">Buttons</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '6px' }}>
                            Format
                          </label>
                          <select
                            {...form.register(`components.${index}.format`)}
                            style={{
                              padding: '8px 12px',
                              fontSize: '13px',
                              borderRadius: '8px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--input-background)',
                              color: 'var(--foreground)',
                              cursor: 'pointer',
                              minWidth: '120px'
                            }}
                          >
                            <option value="TEXT">Text</option>
                            <option value="IMAGE">Image</option>
                            <option value="DOCUMENT">Document</option>
                            <option value="VIDEO">Video</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: fields.length <= 1 ? 'var(--muted-foreground)' : '#ef4444',
                          cursor: fields.length <= 1 ? 'not-allowed' : 'pointer',
                          opacity: fields.length <= 1 ? 0.5 : 1
                        }}
                      >
                        <Trash style={{ width: '18px', height: '18px' }} />
                      </button>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '6px' }}>
                        Content
                      </label>
                      <textarea
                        {...form.register(`components.${index}.text`)}
                        placeholder="Add your template content here. Use {{1}}, {{2}}, etc. for variables."
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          padding: '12px 16px',
                          fontSize: '14px',
                          borderRadius: '10px',
                          border: '2px solid var(--border)',
                          backgroundColor: 'var(--input-background)',
                          color: 'var(--foreground)',
                          outline: 'none',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      />
                      <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: '6px 0 0 0' }}>
                        Use {"{{1}}"}, {"{{2}}"}, etc. to add variables
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons Card */}
              <div style={{ backgroundColor: 'var(--card-background)', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>CTA Buttons (Optional)</h3>
                    <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: '4px 0 0 0' }}>Add up to 3 call-to-action buttons</p>
                  </div>
                  <button type="button" onClick={() => buttons.length < 3 && setButtons([...buttons, { type: 'QUICK_REPLY', text: '' }])} disabled={buttons.length >= 3} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card-background)', color: 'var(--foreground)', cursor: buttons.length >= 3 ? 'not-allowed' : 'pointer', opacity: buttons.length >= 3 ? 0.5 : 1 }}>
                    <Plus style={{ width: '16px', height: '16px' }} />Add Button
                  </button>
                </div>
                {buttons.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', textAlign: 'center', padding: '20px' }}>No buttons added. Click "Add Button" to add CTA buttons.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {buttons.map((btn, idx) => (
                      <div key={idx} style={{ backgroundColor: 'var(--background)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>Button {idx + 1}</span>
                          <button type="button" onClick={() => setButtons(buttons.filter((_, i) => i !== idx))} style={{ padding: '4px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash style={{ width: '16px', height: '16px' }} />
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '6px' }}>Type</label>
                            <select value={btn.type} onChange={(e) => { const newButtons = [...buttons]; newButtons[idx] = { ...btn, type: e.target.value as ButtonType['type'] }; setButtons(newButtons); }} style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-background)', color: 'var(--foreground)', cursor: 'pointer' }}>
                              <option value="QUICK_REPLY">Quick Reply</option>
                              <option value="URL">URL</option>
                              <option value="PHONE_NUMBER">Phone Number</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '6px' }}>Button Text</label>
                            <input type="text" value={btn.text} onChange={(e) => { const newButtons = [...buttons]; newButtons[idx] = { ...btn, text: e.target.value }; setButtons(newButtons); }} placeholder="e.g., Learn More" style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-background)', color: 'var(--foreground)', outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                        </div>
                        {btn.type === 'URL' && (
                          <div style={{ marginTop: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '6px' }}>URL</label>
                            <input type="url" value={btn.url || ''} onChange={(e) => { const newButtons = [...buttons]; newButtons[idx] = { ...btn, url: e.target.value }; setButtons(newButtons); }} placeholder="https://example.com" style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-background)', color: 'var(--foreground)', outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                        )}
                        {btn.type === 'PHONE_NUMBER' && (
                          <div style={{ marginTop: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '6px' }}>Phone Number</label>
                            <input type="tel" value={btn.phoneNumber || ''} onChange={(e) => { const newButtons = [...buttons]; newButtons[idx] = { ...btn, phoneNumber: e.target.value }; setButtons(newButtons); }} placeholder="+1234567890" style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-background)', color: 'var(--foreground)', outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <Link href="/templates" style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 600, borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--card-background)', color: 'var(--foreground)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Cancel</Link>
                <button type="submit" disabled={isSubmitting} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 600, borderRadius: '10px', border: 'none', background: isSubmitting ? 'var(--muted)' : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', color: 'white', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {isSubmitting ? (<><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />Submitting...</>) : (<><Save style={{ width: '16px', height: '16px' }} />Save Template</>)}
                </button>
              </div>
            </motion.div>

            {/* Right Column - WhatsApp Preview */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }} style={{ position: 'sticky', top: '24px' }}>
              <div style={{ backgroundColor: 'var(--card-background)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                {/* Phone Header */}
                <div style={{ background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: 'white', margin: 0 }}>WhatsApp Preview</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Real-time template preview</p>
                  </div>
                </div>
                {/* Chat Area */}
                <div style={{ backgroundColor: '#e5ddd5', padding: '20px', minHeight: '350px' }}>
                  <div style={{ maxWidth: '95%', marginLeft: 'auto' }}>
                    <div style={{ backgroundColor: '#dcf8c6', borderRadius: '8px', padding: '12px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                      {form.watch("components").map((component, index) => (
                        <div key={index} style={{ marginBottom: index < form.watch("components").length - 1 ? '8px' : 0 }}>
                          {component.type === 'HEADER' && component.text && (<p style={{ fontSize: '14px', fontWeight: 600, color: '#303030', margin: 0 }}>{getPreviewText(component.text)}</p>)}
                          {component.type === 'BODY' && (<p style={{ fontSize: '14px', color: '#303030', margin: 0, whiteSpace: 'pre-wrap' }}>{getPreviewText(component.text) || '[Body text]'}</p>)}
                          {component.type === 'FOOTER' && component.text && (<p style={{ fontSize: '12px', color: '#667781', margin: '8px 0 0 0' }}>{getPreviewText(component.text)}</p>)}
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#667781' }}>12:00 PM ✓✓</span>
                      </div>
                    </div>
                    {/* CTA Buttons Preview */}
                    {buttons.length > 0 && (
                      <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {buttons.map((btn, idx) => (
                          <div key={idx} style={{ backgroundColor: '#dcf8c6', borderRadius: '8px', padding: '10px 16px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                            <span style={{ fontSize: '14px', color: '#00a5f4', fontWeight: 500 }}>
                              {btn.type === 'URL' && '🔗 '}
                              {btn.type === 'PHONE_NUMBER' && '📞 '}
                              {btn.text || '[Button text]'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Variables Section */}
                {Object.keys(variables).length > 0 && (
                  <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', margin: '0 0 12px 0' }}>Test Variables</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.keys(variables).map((varKey) => (
                        <input key={varKey} type="text" value={variables[varKey]} onChange={(e) => setVariables({ ...variables, [varKey]: e.target.value })} placeholder={`{{${varKey}}} value`} style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-background)', color: 'var(--foreground)', outline: 'none', boxSizing: 'border-box' }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
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
