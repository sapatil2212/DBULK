"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Building, Save } from 'lucide-react';
import { useUser } from '@/lib/contexts/user-context';

export default function ProfileSettingsPage() {
  const { user, updateUser, refreshUserData } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: ''
  });

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    companyName?: string;
  }>({});

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        companyName: user.tenantName || ''
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      companyName?: string;
    } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message || 'Failed to update profile');
      }

      // Update local user data
      updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      // Show success state
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      
    } catch (error) {
      console.error('Profile update error:', error);
      setApiError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading user information...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '32px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 style={{ 
          fontSize: '24px',
          fontWeight: 600,
          marginBottom: '24px',
          color: 'var(--foreground, #111)'
        }}>Profile Settings</h1>
        
        <div style={{ 
          backgroundColor: 'var(--background, white)',
          border: '1px solid var(--border, #eaeaea)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          {apiError && (
            <div style={{
              padding: '14px 16px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              {apiError}
            </div>
          )}
          
          {isSaved && (
            <div style={{
              padding: '14px 16px',
              backgroundColor: '#dcfce7',
              color: '#166534',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* First Name */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--foreground, #111)' }}>
                  First Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#999' }} />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 44px',
                      fontSize: '15px',
                      border: errors.firstName ? '1px solid #ef4444' : '1px solid var(--border, #eaeaea)',
                      borderRadius: '8px',
                      outline: 'none',
                      backgroundColor: 'var(--input-background, #fff)',
                      color: 'var(--foreground, #111)'
                    }}
                  />
                </div>
                {errors.firstName && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{errors.firstName}</p>}
              </div>
              
              {/* Last Name */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--foreground, #111)' }}>
                  Last Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#999' }} />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 44px',
                      fontSize: '15px',
                      border: errors.lastName ? '1px solid #ef4444' : '1px solid var(--border, #eaeaea)',
                      borderRadius: '8px',
                      outline: 'none',
                      backgroundColor: 'var(--input-background, #fff)',
                      color: 'var(--foreground, #111)'
                    }}
                  />
                </div>
                {errors.lastName && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{errors.lastName}</p>}
              </div>
              
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--foreground, #111)' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#999' }} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 44px',
                      fontSize: '15px',
                      border: errors.email ? '1px solid #ef4444' : '1px solid var(--border, #eaeaea)',
                      borderRadius: '8px',
                      outline: 'none',
                      backgroundColor: 'var(--input-background-disabled, #f5f5f5)',
                      color: 'var(--muted-foreground, #666)'
                    }}
                  />
                </div>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>Contact support to change your email address.</p>
                {errors.email && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{errors.email}</p>}
              </div>
              
              {/* Company */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--foreground, #111)' }}>
                  Company Name
                </label>
                <div style={{ position: 'relative' }}>
                  <Building style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#999' }} />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 44px',
                      fontSize: '15px',
                      border: errors.companyName ? '1px solid #ef4444' : '1px solid var(--border, #eaeaea)',
                      borderRadius: '8px',
                      outline: 'none',
                      backgroundColor: 'var(--input-background, #fff)',
                      color: 'var(--foreground, #111)'
                    }}
                  />
                </div>
                {errors.companyName && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{errors.companyName}</p>}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading || isSaved}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: '#25D366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: isLoading || isSaved ? 'not-allowed' : 'pointer',
                  opacity: isLoading || isSaved ? 0.7 : 1,
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isLoading && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></div>
                )}
                {!isLoading && <Save style={{ width: '18px', height: '18px' }} />}
                {isSaved ? 'Saved' : isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
      
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .submit-button:hover {
          background-color: #22c55e !important;
          box-shadow: 0 0 0 2px rgba(37, 211, 102, 0.2);
        }
        
        @media (prefers-color-scheme: dark) {
          .submit-button:hover {
            box-shadow: 0 0 0 2px rgba(37, 211, 102, 0.3);
          }
        }
      `}</style>
    </div>
  );
}
