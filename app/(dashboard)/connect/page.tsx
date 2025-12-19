"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/utils/api";
import { 
  Phone, 
  CheckCircle, 
  ArrowRight, 
  Loader2, 
  Shield, 
  Zap, 
  HelpCircle,
  ExternalLink,
  Key,
  Hash,
  Smartphone,
  Send,
  MessageCircle,
  Trash2,
  Plus
} from "lucide-react";

export default function ConnectWhatsAppPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [formData, setFormData] = React.useState({
    wabaId: "",
    phoneNumberId: "",
    accessToken: ""
  });

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [existingAccounts, setExistingAccounts] = React.useState<any[]>([]);
  
  // Test message state
  const [showTestMessage, setShowTestMessage] = React.useState(false);
  const [testPhone, setTestPhone] = React.useState("");
  const [isSendingTest, setIsSendingTest] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(null);
  
  // Disconnect state
  const [isDisconnecting, setIsDisconnecting] = React.useState<string | null>(null);
  const [showAddNew, setShowAddNew] = React.useState(false);
  
  // Check if user is authenticated and fetch existing accounts
  React.useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    const authStatus = localStorage.getItem('isAuthenticated');
    
    console.log('Auth check:', { hasToken: !!authToken, authStatus });
    
    if (authToken && authStatus === 'true') {
      setIsAuthenticated(true);
      // Fetch existing WhatsApp accounts
      fetchExistingAccounts();
    } else {
      setIsAuthenticated(false);
      setError('Please login to connect your WhatsApp account.');
    }
    setIsAuthChecked(true);
  }, []);
  
  const fetchExistingAccounts = async () => {
    try {
      const accounts = await apiRequest('/api/whatsapp/connect', { method: 'GET' });
      console.log('Existing accounts:', accounts);
      if (accounts && accounts.length > 0) {
        setExistingAccounts(accounts);
        setIsConnected(true);
      }
    } catch (err) {
      console.log('No existing accounts or error fetching:', err);
    }
  };
  
  // Disconnect account function
  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this WhatsApp account? This action cannot be undone.')) {
      return;
    }
    
    setIsDisconnecting(accountId);
    setError(null);
    
    try {
      await apiRequest(`/api/whatsapp/accounts/${accountId}`, {
        method: 'DELETE'
      });
      
      // Remove from local state
      setExistingAccounts(prev => prev.filter(acc => acc.id !== accountId));
      setSuccess('WhatsApp account disconnected successfully');
      
      // If no more accounts, reset connection state
      if (existingAccounts.length <= 1) {
        setIsConnected(false);
        setShowAddNew(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect account');
    } finally {
      setIsDisconnecting(null);
    }
  };
  
  // Send test message function
  const handleSendTestMessage = async () => {
    if (!testPhone.trim()) {
      setTestResult({ success: false, message: 'Please enter a phone number' });
      return;
    }
    
    setIsSendingTest(true);
    setTestResult(null);
    
    try {
      const result = await apiRequest('/api/whatsapp/send-test-message', {
        method: 'POST',
        body: {
          recipientPhone: testPhone.trim(),
          templateName: 'hello_world',
          languageCode: 'en_US'
        }
      });
      
      setTestResult({ 
        success: true, 
        message: result.message || 'Test message sent successfully!' 
      });
    } catch (err) {
      setTestResult({ 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to send test message' 
      });
    } finally {
      setIsSendingTest(false);
    }
  };
  
  const handleConnect = async () => {
    console.log('handleConnect called with formData:', formData);
    setIsConnecting(true);
    setError(null);
    setSuccess(null);
    
    // Check authentication first
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      console.log('No auth token found');
      setError('Please login to connect your WhatsApp account.');
      setIsConnecting(false);
      router.push('/login?redirect=/connect');
      return;
    }
    
    // Validate form data
    if (!formData.wabaId || !formData.phoneNumberId || !formData.accessToken) {
      console.log('Validation failed - missing fields');
      setError('Please fill in all required fields');
      setIsConnecting(false);
      return;
    }
    
    console.log('Making API request to connect WhatsApp...');
    console.log('Auth token present:', !!authToken);
    
    try {
      // Authentication will be handled by the apiRequest utility
      const data = await apiRequest('/api/whatsapp/connect', {
        method: 'POST',
        body: {
          name: `WhatsApp Account (${formData.phoneNumberId.slice(-4)})`,
          wabaId: formData.wabaId,
          phoneNumberId: formData.phoneNumberId,
          accessToken: formData.accessToken
        },
      });
      
      setIsConnected(true);
      setSuccess('WhatsApp Business Account connected successfully!');
      
      // Reset form data
      setFormData({
        wabaId: '',
        phoneNumberId: '',
        accessToken: ''
      });
      
      // Redirect to templates page after short delay
      setTimeout(() => {
        router.push('/templates');
      }, 2000);
      
    } catch (err) {
      console.error('WhatsApp connection error:', err);
      // Handle API errors specifically
      if (err instanceof Error) {
        if (err.message.includes('token') || err.message.includes('auth') || err.message.includes('No token')) {
          setError('Authentication error: ' + err.message);
          // Redirect to login if token is invalid
          setTimeout(() => {
            router.push('/login?redirect=/connect');
          }, 2000);
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to connect WhatsApp account. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const steps = [
    { 
      number: 1, 
      title: "WABA ID", 
      description: "WhatsApp Business Account ID",
      icon: Hash,
      field: "wabaId",
      placeholder: "Enter your WABA ID (e.g., 123456789012345)",
      help: "Find this in Meta Business Manager under WhatsApp Accounts"
    },
    { 
      number: 2, 
      title: "Phone Number ID", 
      description: "Your WhatsApp Phone Number ID",
      icon: Smartphone,
      field: "phoneNumberId",
      placeholder: "Enter your Phone Number ID",
      help: "Found in Meta Developer Dashboard under WhatsApp API Setup"
    },
    { 
      number: 3, 
      title: "Access Token", 
      description: "Permanent Access Token",
      icon: Key,
      field: "accessToken",
      placeholder: "Enter your permanent access token",
      help: "Generate this from your Meta Developer App settings"
    }
  ];

  return (
    <div style={{ 
      padding: '32px',
      maxWidth: '900px',
      margin: '0 auto',
      fontFamily: 'var(--font-sans)',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)'
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '32px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(37, 211, 102, 0.3)'
          }}>
            <Phone style={{ width: '28px', height: '28px', color: 'white' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '4px' }}>
              Connect WhatsApp
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--muted-foreground)' }}>
              Link your WhatsApp Business Account to start sending messages
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '100px',
          backgroundColor: isConnected ? 'var(--success-background, rgba(34, 197, 94, 0.15))' : 'var(--warning-background, rgba(245, 158, 11, 0.15))',
          color: isConnected ? 'var(--success, #16a34a)' : 'var(--warning, #d97706)',
          fontSize: '14px',
          fontWeight: 600
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#22c55e' : '#f59e0b'
          }} />
          {isConnected ? 'Connected' : 'Not Connected'}
        </div>
      </motion.div>

      {/* Success or Error Messages */}
      {(success || error) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            padding: "16px",
            borderRadius: "10px",
            marginBottom: "20px",
            backgroundColor: success ? 'var(--success-background, rgba(34, 197, 94, 0.15))' : 'var(--error-background, rgba(239, 68, 68, 0.15))',
            color: success ? 'var(--success-foreground, #166534)' : 'var(--error-foreground, #b91c1c)',
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {success ? (
              <CheckCircle size={20} />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
            <span style={{ fontSize: "14px", fontWeight: 500 }}>
              {success || error}
            </span>
          </div>
          {error && error.includes('login') && (
            <button
              onClick={() => router.push('/login?redirect=/connect')}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 600,
                color: "white",
                backgroundColor: "var(--primary, #25D366)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Login Now
            </button>
          )}
        </motion.div>
      )}

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }}>
        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              style={{
                backgroundColor: 'var(--card-background)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: currentStep === step.number ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                border: currentStep === step.number ? '2px solid var(--primary)' : '1px solid var(--border)',
                opacity: currentStep >= step.number ? 1 : 0.5,
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: currentStep > step.number ? 'var(--success-background, rgba(34, 197, 94, 0.15))' : currentStep === step.number ? 'var(--primary)' : 'var(--background-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {currentStep > step.number ? (
                    <CheckCircle style={{ width: '22px', height: '22px', color: 'var(--success, #22c55e)' }} />
                  ) : (
                    <step.icon style={{ 
                      width: '22px', 
                      height: '22px', 
                      color: currentStep === step.number ? 'white' : 'var(--muted-foreground)' 
                    }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      color: 'var(--primary)',
                      backgroundColor: 'var(--primary-background, rgba(37, 211, 102, 0.1))',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      Step {step.number}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '16px' }}>
                    {step.description}
                  </p>
                  
                  <input
                    type={step.field === 'accessToken' ? 'password' : 'text'}
                    placeholder={step.placeholder}
                    value={formData[step.field as keyof typeof formData]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [step.field]: e.target.value }))}
                    disabled={isConnected}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      border: '2px solid var(--border)',
                      borderRadius: '10px',
                      outline: 'none',
                      backgroundColor: 'var(--input-background, #fff)',
                      color: 'var(--foreground)',
                      boxSizing: 'border-box',
                      marginBottom: '12px'
                    }}
                  />
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                      <HelpCircle style={{ width: '14px', height: '14px' }} />
                      {step.help}
                    </div>
                    
                    {currentStep === step.number && step.number < 3 && (
                      <button
                        onClick={() => {
                          if (formData[step.field as keyof typeof formData]) {
                            setCurrentStep(step.number + 1);
                          }
                        }}
                        disabled={!formData[step.field as keyof typeof formData]}
                        className="shimmer-button"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'white',
                          background: formData[step.field as keyof typeof formData] 
                            ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' 
                            : 'var(--muted)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: formData[step.field as keyof typeof formData] ? 'pointer' : 'not-allowed',
                          boxShadow: formData[step.field as keyof typeof formData] ? 'var(--shadow-sm)' : 'none'
                        }}
                      >
                        Next
                        <ArrowRight style={{ width: '14px', height: '14px' }} />
                      </button>
                    )}
                    
                    {currentStep === 3 && step.number === 3 && !isConnected && (
                      <button
                        onClick={handleConnect}
                        disabled={!formData.accessToken || isConnecting}
                        className="shimmer-button"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'white',
                          background: formData.accessToken 
                            ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' 
                            : 'var(--muted)',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: formData.accessToken ? 'pointer' : 'not-allowed',
                          boxShadow: formData.accessToken ? 'var(--shadow-md)' : 'none'
                        }}
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Zap style={{ width: '18px', height: '18px' }} />
                            Test Connection
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Main Connect Button - Always visible when all fields are filled */}
          {!isConnected && formData.wabaId && formData.phoneNumberId && formData.accessToken && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '16px' }}
            >
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="shimmer-button"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'white',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isConnecting ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow-md)',
                  opacity: isConnecting ? 0.8 : 1
                }}
              >
                {isConnecting ? (
                  <>
                    <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                    Connecting to WhatsApp...
                  </>
                ) : (
                  <>
                    <Phone style={{ width: '20px', height: '20px' }} />
                    Connect WhatsApp Account
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Connected Accounts */}
          {isConnected && existingAccounts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                backgroundColor: 'var(--success-background, rgba(34, 197, 94, 0.15))',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--success, #22c55e)', marginBottom: '4px' }}>
                    WhatsApp Connected!
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>
                    You have {existingAccounts.length} connected account{existingAccounts.length > 1 ? 's' : ''}.
                  </p>
                </div>
              </div>
                            {/* List of connected accounts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {existingAccounts.map((account: any) => (
                  <div 
                    key={account.id}
                    style={{
                      backgroundColor: 'var(--background)',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Phone style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
                          {account.name}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                          {account.phoneNumber}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '100px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: account.status === 'CONNECTED' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: account.status === 'CONNECTED' ? '#22c55e' : '#ef4444'
                      }}>
                        {account.status}
                      </span>
                      {account.isDefault && (
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '100px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          color: '#3b82f6'
                        }}>
                          Default
                        </span>
                      )}
                      <button
                        onClick={() => handleDisconnect(account.id)}
                        disabled={isDisconnecting === account.id}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#ef4444',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          cursor: isDisconnecting === account.id ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          opacity: isDisconnecting === account.id ? 0.6 : 1
                        }}
                      >
                        {isDisconnecting === account.id ? (
                          <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <Trash2 style={{ width: '14px', height: '14px' }} />
                        )}
                        {isDisconnecting === account.id ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action buttons */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowTestMessage(!showTestMessage)}
                  style={{
                    flex: 1,
                    minWidth: '140px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Send style={{ width: '16px', height: '16px' }} />
                  Test Connection
                </button>
                <button
                  onClick={() => setShowAddNew(!showAddNew)}
                  style={{
                    flex: 1,
                    minWidth: '140px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: showAddNew ? 'white' : 'var(--foreground)',
                    background: showAddNew ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'var(--background)',
                    border: showAddNew ? 'none' : '1px solid var(--border)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  {showAddNew ? 'Cancel' : 'Add New Account'}
                </button>
                <button
                  onClick={() => router.push('/templates')}
                  style={{
                    flex: 1,
                    minWidth: '140px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Create Templates
                </button>
              </div>
              
              {/* Add New Account Form */}
              {showAddNew && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    marginTop: '16px',
                    padding: '20px',
                    backgroundColor: 'var(--background)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)'
                  }}
                >
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />
                    Connect New WhatsApp Account
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="WABA ID"
                      value={formData.wabaId}
                      onChange={(e) => setFormData(prev => ({ ...prev, wabaId: e.target.value }))}
                      style={{ width: '100%', padding: '12px 16px', fontSize: '14px', border: '2px solid var(--border)', borderRadius: '10px', outline: 'none', backgroundColor: 'var(--input-background, #fff)', color: 'var(--foreground)', boxSizing: 'border-box' }}
                    />
                    <input
                      type="text"
                      placeholder="Phone Number ID"
                      value={formData.phoneNumberId}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                      style={{ width: '100%', padding: '12px 16px', fontSize: '14px', border: '2px solid var(--border)', borderRadius: '10px', outline: 'none', backgroundColor: 'var(--input-background, #fff)', color: 'var(--foreground)', boxSizing: 'border-box' }}
                    />
                    <input
                      type="password"
                      placeholder="Access Token"
                      value={formData.accessToken}
                      onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
                      style={{ width: '100%', padding: '12px 16px', fontSize: '14px', border: '2px solid var(--border)', borderRadius: '10px', outline: 'none', backgroundColor: 'var(--input-background, #fff)', color: 'var(--foreground)', boxSizing: 'border-box' }}
                    />
                    <button
                      onClick={async () => {
                        await handleConnect();
                        if (!error) {
                          setShowAddNew(false);
                          fetchExistingAccounts();
                        }
                      }}
                      disabled={isConnecting || !formData.wabaId || !formData.phoneNumberId || !formData.accessToken}
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'white',
                        background: formData.wabaId && formData.phoneNumberId && formData.accessToken && !isConnecting
                          ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)'
                          : 'var(--muted)',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: formData.wabaId && formData.phoneNumberId && formData.accessToken && !isConnecting ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Phone style={{ width: '16px', height: '16px' }} />
                          Connect Account
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
              
              {/* Test Message Section */}
              {showTestMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    marginTop: '16px',
                    padding: '20px',
                    backgroundColor: 'var(--background)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <MessageCircle style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
                      Send Test Message
                    </h4>
                  </div>
                  
                  <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '16px' }}>
                    Send a test message using the <strong>hello_world</strong> template to verify your WhatsApp connection is working.
                    The recipient must be a verified number in your Meta sandbox.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      placeholder="Enter phone number (e.g., +919876543210)"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        fontSize: '14px',
                        border: '2px solid var(--border)',
                        borderRadius: '10px',
                        outline: 'none',
                        backgroundColor: 'var(--input-background, #fff)',
                        color: 'var(--foreground)'
                      }}
                    />
                    <button
                      onClick={handleSendTestMessage}
                      disabled={isSendingTest || !testPhone.trim()}
                      style={{
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'white',
                        background: testPhone.trim() && !isSendingTest
                          ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)'
                          : 'var(--muted)',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: testPhone.trim() && !isSendingTest ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {isSendingTest ? (
                        <>
                          <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send style={{ width: '16px', height: '16px' }} />
                          Send Test
                        </>
                      )}
                    </button>
                  </div>
                  
                  {testResult && (
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: testResult.success 
                        ? 'var(--success-background, rgba(34, 197, 94, 0.15))' 
                        : 'var(--error-background, rgba(239, 68, 68, 0.15))',
                      color: testResult.success 
                        ? 'var(--success, #16a34a)' 
                        : 'var(--error, #dc2626)',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {testResult.success ? (
                        <CheckCircle style={{ width: '16px', height: '16px' }} />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                      )}
                      {testResult.message}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
          
          {/* Success Message for new connection */}
          {isConnected && existingAccounts.length === 0 && success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                backgroundColor: 'var(--success-background, rgba(34, 197, 94, 0.15))',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--success, #22c55e)', marginBottom: '4px' }}>
                  Successfully Connected!
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--success, #22c55e)' }}>
                  Your WhatsApp Business Account is now linked and ready to use.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Help Card */}
          <div style={{
            backgroundColor: 'var(--card-background)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '16px' }}>
              Need Help?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href="https://business.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: 'var(--background-secondary)',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: 'var(--foreground)',
                  fontSize: '14px'
                }}
              >
                <ExternalLink style={{ width: '18px', height: '18px', color: 'var(--muted-foreground)' }} />
                Meta Business Manager
              </a>
              <a
                href="https://developers.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: 'var(--background-secondary)',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: 'var(--foreground)',
                  fontSize: '14px'
                }}
              >
                <ExternalLink style={{ width: '18px', height: '18px', color: 'var(--muted-foreground)' }} />
                Meta Developer Portal
              </a>
            </div>
          </div>

          {/* Security Notice */}
          <div style={{
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Shield style={{ width: '20px', height: '20px', color: 'white' }} />
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>Secure Connection</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
              Your credentials are encrypted and stored securely. We never share your data with third parties.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
