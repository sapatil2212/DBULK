"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Lock, 
  Bell, 
  Key,
  Shield,
  Mail,
  Phone,
  Building,
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  Save
} from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "api", label: "API Keys", icon: Key },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("profile");
  const [isSaving, setIsSaving] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [profileData, setProfileData] = React.useState({
    name: "John Doe",
    email: "john@company.com",
    phone: "+1 234 567 8901",
    company: "Acme Inc",
    timezone: "America/New_York"
  });
  const [notifications, setNotifications] = React.useState({
    emailCampaigns: true,
    emailReports: true,
    pushMessages: true,
    pushAlerts: false,
    weeklyDigest: true
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
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
        style={{ marginBottom: '32px' }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '8px' }}>
          Settings
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--muted-foreground)' }}>
          Manage your account settings and preferences
        </p>
      </motion.div>

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Sidebar Tabs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ width: '240px', flexShrink: 0 }}
        >
          <div style={{
            backgroundColor: 'var(--card-background)',
            borderRadius: '16px',
            padding: '8px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)'
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted-foreground)',
                  backgroundColor: activeTab === tab.id ? 'var(--primary-background)' : 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <tab.icon style={{ width: '20px', height: '20px' }} />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ flex: 1 }}
        >
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div style={{
              backgroundColor: 'var(--card-background)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '24px' }}>
                Profile Information
              </h2>

              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: 700
                }}>
                  JD
                </div>
                <div>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--foreground)',
                    backgroundColor: 'var(--card-background)',
                    border: '2px solid var(--border)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    marginBottom: '8px'
                  }}>
                    <Camera style={{ width: '16px', height: '16px' }} />
                    Change Photo
                  </button>
                  <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>JPG, PNG or GIF. Max 2MB</p>
                </div>
              </div>

              {/* Form Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--muted-foreground)' }} />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 48px',
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
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--muted-foreground)' }} />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 48px',
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
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                    Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--muted-foreground)' }} />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 48px',
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
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                    Company
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--muted-foreground)' }} />
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 48px',
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
                </div>
              </div>

              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 28px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save style={{ width: '18px', height: '18px' }} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div style={{
              backgroundColor: 'var(--card-background)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '24px' }}>
                Security Settings
              </h2>

              {/* Change Password */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '16px' }}>
                  Change Password
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                      Current Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--muted-foreground)' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        style={{
                          width: '100%',
                          padding: '14px 48px 14px 48px',
                          fontSize: '14px',
                          border: '2px solid #e5e5e5',
                          borderRadius: '12px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        {showPassword ? <EyeOff style={{ width: '20px', height: '20px', color: 'var(--muted-foreground)' }} /> : <Eye style={{ width: '20px', height: '20px', color: 'var(--muted-foreground)' }} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
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
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
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
                  <button style={{
                    padding: '14px 28px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    Update Password
                  </button>
                </div>
              </div>

              {/* Two-Factor Auth */}
              <div style={{ padding: '24px', backgroundColor: 'var(--background-secondary)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--success-background, rgba(34, 197, 94, 0.15))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Shield style={{ width: '24px', height: '24px', color: 'var(--success, #22c55e)' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
                        Two-Factor Authentication
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  <button style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    backgroundColor: 'var(--card-background)',
                    border: '2px solid var(--primary)',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}>
                    Enable
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div style={{
              backgroundColor: 'var(--card-background)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '24px' }}>
                Notification Preferences
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { key: 'emailCampaigns', label: 'Campaign Updates', description: 'Get notified when campaigns complete or fail' },
                  { key: 'emailReports', label: 'Weekly Reports', description: 'Receive weekly performance summaries' },
                  { key: 'pushMessages', label: 'Message Alerts', description: 'Get notified for new replies and messages' },
                  { key: 'pushAlerts', label: 'System Alerts', description: 'Important system and security notifications' },
                  { key: 'weeklyDigest', label: 'Marketing Tips', description: 'Tips and best practices for WhatsApp marketing' },
                ].map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '20px',
                      backgroundColor: 'var(--background-secondary)',
                      borderRadius: '12px'
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
                        {item.label}
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{item.description}</p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px' }}>
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications]}
                        onChange={(e) => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: notifications[item.key as keyof typeof notifications] ? '#25D366' : '#ccc',
                        borderRadius: '28px',
                        transition: 'all 0.3s'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '22px',
                          width: '22px',
                          left: notifications[item.key as keyof typeof notifications] ? '27px' : '3px',
                          bottom: '3px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'all 0.3s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} />
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Tab */}
          {activeTab === "api" && (
            <div style={{
              backgroundColor: 'var(--card-background)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '24px' }}>
                API Configuration
              </h2>

              <div style={{
                padding: '24px',
                backgroundColor: 'var(--success-background, rgba(34, 197, 94, 0.15))',
                borderRadius: '12px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <CheckCircle style={{ width: '24px', height: '24px', color: 'var(--success, #22c55e)' }} />
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--success-foreground, #166534)', marginBottom: '4px' }}>
                    WhatsApp API Connected
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--success-foreground, #15803d)' }}>
                    Your WhatsApp Business Account is connected and active
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                  API Key
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="password"
                    value="••••••••••••••••••••••••••••••••"
                    readOnly
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      fontSize: '14px',
                      border: '2px solid var(--border)',
                      borderRadius: '12px',
                      outline: 'none',
                      backgroundColor: 'var(--background-secondary)',
                      color: 'var(--foreground)',
                      fontFamily: 'monospace'
                    }}
                  />
                  <button style={{
                    padding: '14px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--foreground)',
                    backgroundColor: 'var(--card-background)',
                    border: '2px solid var(--border)',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}>
                    Copy
                  </button>
                  <button style={{
                    padding: '14px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--error, #ef4444)',
                    backgroundColor: 'var(--error-background, rgba(239, 68, 68, 0.15))',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}>
                    Regenerate
                  </button>
                </div>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: 'var(--warning-background, rgba(245, 158, 11, 0.15))',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <Shield style={{ width: '20px', height: '20px', color: 'var(--warning, #d97706)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--warning-foreground, #92400e)', marginBottom: '4px' }}>
                    Keep your API key secure
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--warning-foreground, #a16207)' }}>
                    Never share your API key publicly or commit it to version control. 
                    If you believe your key has been compromised, regenerate it immediately.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
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
