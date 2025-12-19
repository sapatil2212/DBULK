"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Users, 
  MoreVertical, 
  Upload,
  Download,
  Mail,
  Phone,
  Tag,
  Filter,
  CheckSquare,
  Trash2,
  Edit,
  FileText,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  status: string;
  createdAt?: string;
}

const tagColors: Record<string, string> = {
  "VIP": "#8b5cf6",
  "Active": "#22c55e",
  "New": "#3b82f6"
};

// Sample CSV content for download
const SAMPLE_CSV_CONTENT = `name,phone,email,tags
John Smith,+919876543210,john@example.com,VIP
Sarah Johnson,+919876543211,sarah@example.com,Active
Michael Chen,+919876543212,michael@example.com,New
Emily Davis,+919876543213,emily@example.com,VIP;Active
Robert Wilson,+919876543214,robert@example.com,`;

const downloadSampleCSV = () => {
  const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'sample_contacts.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success('Sample CSV downloaded');
};

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedContacts, setSelectedContacts] = React.useState<string[]>([]);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [importPreview, setImportPreview] = React.useState<Contact[]>([]);

  // Handle file selection for import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      // Parse CSV for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const lines = text.split('\n').filter(line => line.trim());
          if (lines.length > 1) {
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const preview = lines.slice(1, 6).map((line, idx) => {
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
              const nameIdx = headers.findIndex(h => h.toLowerCase() === 'name');
              const phoneIdx = headers.findIndex(h => h.toLowerCase() === 'phone');
              const emailIdx = headers.findIndex(h => h.toLowerCase() === 'email');
              const tagsIdx = headers.findIndex(h => h.toLowerCase() === 'tags');
              
              return {
                id: `preview-${idx}`,
                name: nameIdx >= 0 ? values[nameIdx] : '',
                phone: phoneIdx >= 0 ? values[phoneIdx] : '',
                email: emailIdx >= 0 ? values[emailIdx] : '',
                tags: tagsIdx >= 0 && values[tagsIdx] ? values[tagsIdx].split(';') : [],
                status: 'subscribed'
              };
            });
            setImportPreview(preview);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  // Import contacts from CSV
  const handleImport = () => {
    if (!importFile || importPreview.length === 0) return;
    
    setIsImporting(true);
    // Simulate import - in production this would call an API
    setTimeout(() => {
      const newContacts = importPreview.map((c, idx) => ({
        ...c,
        id: `imported-${Date.now()}-${idx}`,
        createdAt: new Date().toISOString()
      }));
      setContacts(prev => [...prev, ...newContacts]);
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview([]);
      setIsImporting(false);
      toast.success(`${newContacts.length} contacts imported successfully`);
    }, 1000);
  };

  const filteredContacts = contacts.filter((contact: Contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery) ||
    (contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

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
            Contacts
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--muted-foreground)' }}>
            Manage your contact list and segments
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowImportModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--foreground)',
              backgroundColor: 'var(--card-background)',
              border: '2px solid var(--border)',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            <Upload style={{ width: '18px', height: '18px' }} />
            Import CSV
          </button>
          <Link href="/contacts/new" style={{
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
            Add Contact
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: "Total Contacts", value: contacts.length, icon: Users, color: "#25D366" },
          { label: "Subscribed", value: contacts.filter((c: Contact) => c.status === 'subscribed').length, icon: CheckSquare, color: "#22c55e" },
          { label: "VIP Contacts", value: contacts.filter((c: Contact) => c.tags.includes('VIP')).length, icon: Tag, color: "#8b5cf6" },
          { label: "New This Week", value: contacts.filter((c: Contact) => c.tags.includes('New')).length, icon: Plus, color: "#3b82f6" }
        ].map((stat, index) => (
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

      {/* Search & Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}
      >
        <div style={{ position: 'relative', width: '400px' }}>
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
            placeholder="Search by name, phone, or email..."
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

        {selectedContacts.length > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--muted-foreground)', alignSelf: 'center', marginRight: '8px' }}>
              {selectedContacts.length} selected
            </span>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--muted-foreground)',
              backgroundColor: 'var(--card-background)',
              border: '2px solid var(--border)',
              borderRadius: '10px',
              cursor: 'pointer'
            }}>
              <Tag style={{ width: '16px', height: '16px' }} />
              Add Tag
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#ef4444',
              backgroundColor: 'var(--error-background, rgba(239, 68, 68, 0.15))',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
            }}>
              <Trash2 style={{ width: '16px', height: '16px' }} />
              Delete
            </button>
          </div>
        )}
      </motion.div>

      {/* Contacts Table */}
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
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--background-secondary)' }}>
              <th style={{ padding: '16px 20px', textAlign: 'left', width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                  onChange={toggleSelectAll}
                  style={{ width: '18px', height: '18px', accentColor: '#25D366' }}
                />
              </th>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)' }}>Contact</th>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)' }}>Phone</th>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)' }}>Tags</th>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)' }}>Last Message</th>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)' }}>Status</th>
              <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((contact: Contact) => (
              <tr key={contact.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 20px' }}>
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => toggleSelect(contact.id)}
                    style={{ width: '18px', height: '18px', accentColor: '#25D366' }}
                  />
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '14px'
                    }}>
                      {contact.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>{contact.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{contact.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--foreground)' }}>
                  {contact.phone}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {contact.tags.map((tag: string) => (
                      <span key={tag} style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        backgroundColor: (tagColors[tag] || '#666') + '20',
                        color: tagColors[tag] || '#666',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--muted-foreground)' }}>
                  {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: contact.status === 'subscribed' ? 'var(--success-background, rgba(34, 197, 94, 0.15))' : 'var(--error-background, rgba(239, 68, 68, 0.15))',
                    color: contact.status === 'subscribed' ? 'var(--success, #16a34a)' : 'var(--error, #dc2626)',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {contact.status === 'subscribed' ? 'Subscribed' : 'Unsubscribed'}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <button style={{
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    <MoreVertical style={{ width: '18px', height: '18px', color: 'var(--muted-foreground)' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Import Modal */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: 'var(--card-background)',
              borderRadius: '20px',
              padding: '32px',
              width: '560px',
              maxWidth: '90%',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '8px' }}>
              Import Contacts
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '16px' }}>
              Upload a CSV file with your contacts. Required columns: <strong>name</strong>, <strong>phone</strong>
            </p>

            {/* Sample CSV Download */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: 'var(--info-background, rgba(59, 130, 246, 0.1))',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              <FileText style={{ width: '20px', height: '20px', color: 'var(--info, #3b82f6)' }} />
              <span style={{ flex: 1, fontSize: '13px', color: 'var(--foreground)' }}>
                Need help with the format?
              </span>
              <button
                onClick={downloadSampleCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--info, #3b82f6)',
                  backgroundColor: 'white',
                  border: '1px solid var(--info, #3b82f6)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <Download style={{ width: '14px', height: '14px' }} />
                Download Sample CSV
              </button>
            </div>

            {/* File Upload Area */}
            <div style={{
              border: importFile ? '2px solid var(--primary)' : '2px dashed var(--border)',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              marginBottom: '20px',
              backgroundColor: importFile ? 'var(--primary-background, rgba(37, 211, 102, 0.05))' : 'var(--background-secondary)',
              position: 'relative'
            }}>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              {importFile ? (
                <>
                  <FileText style={{ width: '48px', height: '48px', color: 'var(--primary)', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
                    {importFile.name}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                    {importPreview.length} contacts found
                  </p>
                </>
              ) : (
                <>
                  <Upload style={{ width: '48px', height: '48px', color: 'var(--muted-foreground)', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '8px' }}>
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                    Supports .csv files
                  </p>
                </>
              )}
            </div>

            {/* Preview */}
            {importPreview.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '12px' }}>
                  Preview (first {importPreview.length} contacts)
                </h4>
                <div style={{
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--background-secondary)' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Name</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Phone</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((contact: Contact, idx: number) => (
                        <tr key={idx} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 12px' }}>{contact.name}</td>
                          <td style={{ padding: '10px 12px' }}>{contact.phone}</td>
                          <td style={{ padding: '10px 12px' }}>{contact.email || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportPreview([]);
                }}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--muted-foreground)',
                  backgroundColor: 'var(--background-secondary)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleImport}
                disabled={!importFile || importPreview.length === 0 || isImporting}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'white',
                  background: importFile && importPreview.length > 0 && !isImporting
                    ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)'
                    : 'var(--muted)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: importFile && importPreview.length > 0 && !isImporting ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isImporting ? (
                  <>
                    <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload style={{ width: '16px', height: '16px' }} />
                    Import {importPreview.length > 0 ? `${importPreview.length} Contacts` : ''}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
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
