"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle, User, Building } from "lucide-react";
import OTPVerificationModal from "@/components/ui/otp-verification-modal";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    tenantName: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [showOTPModal, setShowOTPModal] = React.useState(false);
  const [userId, setUserId] = React.useState("");
  const [apiError, setApiError] = React.useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const fullNameParts = formData.firstName.trim().split(' ');
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.tenantName.trim()) newErrors.tenantName = "Company name is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = "Password must contain at least one uppercase letter";
    else if (!/[a-z]/.test(formData.password)) newErrors.password = "Password must contain at least one lowercase letter";
    else if (!/[0-9]/.test(formData.password)) newErrors.password = "Password must contain at least one number";
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) newErrors.password = "Password must contain at least one special character";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!agreeTerms) newErrors.terms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setApiError('');
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          tenantName: formData.tenantName.trim(),
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }
      
      setIsSuccess(true);
      setUserId(data.data.userId);
      
      // Show OTP verification modal after a short delay
      setTimeout(() => {
        setShowOTPModal(true);
      }, 800);
      
    } catch (error) {
      console.error('Signup error:', error);
      setApiError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOTP = async (otp: string) => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          otp,
          type: 'EMAIL_VERIFICATION'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }
      
      // Wait a moment and redirect to login page
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      
      return true;
    } catch (error) {
      console.error('OTP verification error:', error);
      return false;
    }
  };
  
  const handleResendOTP = async () => {
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          type: 'EMAIL_VERIFICATION'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }
      
      return true;
    } catch (error) {
      console.error('Resend OTP error:', error);
      return false;
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear any errors for the field being changed
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Also clear API error when user makes any changes
    if (apiError) setApiError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Left Panel - Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 60px',
        backgroundColor: '#fafafa',
        overflowY: 'auto'
      }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: '440px' }}
        >
          {/* Logo for mobile */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '32px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
            }}>
              <MessageSquare style={{ width: '22px', height: '22px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#111' }}>DBULK</span>
          </Link>

          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#111',
            marginBottom: '8px'
          }}>Create your account</h2>
          <p style={{
            fontSize: '15px',
            color: '#666',
            marginBottom: '32px'
          }}>Start your 14-day free trial. No credit card required.</p>

          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                First name
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#999' }} />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="John"
                  disabled={isLoading || isSuccess}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '15px',
                    border: errors.firstName ? '2px solid #ef4444' : '2px solid #e5e5e5',
                    borderRadius: '12px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {errors.firstName && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{errors.firstName}</p>}
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                Last name
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#999' }} />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Doe"
                  disabled={isLoading || isSuccess}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '15px',
                    border: errors.lastName ? '2px solid #ef4444' : '2px solid #e5e5e5',
                    borderRadius: '12px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {errors.lastName && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{errors.lastName}</p>}
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                Work email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#999' }} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@company.com"
                  disabled={isLoading || isSuccess}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '15px',
                    border: errors.email ? '2px solid #ef4444' : '2px solid #e5e5e5',
                    borderRadius: '12px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {errors.email && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{errors.email}</p>}
            </div>

            {/* Company Field */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                Company name
              </label>
              <div style={{ position: 'relative' }}>
                <Building style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#999' }} />
                <input
                  type="text"
                  value={formData.tenantName}
                  onChange={(e) => handleChange('tenantName', e.target.value)}
                  placeholder="Your company"
                  disabled={isLoading || isSuccess}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '15px',
                    border: errors.tenantName ? '2px solid #ef4444' : '2px solid #e5e5e5',
                    borderRadius: '12px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#999' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Min. 8 characters"
                  disabled={isLoading || isSuccess}
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 48px',
                    fontSize: '15px',
                    border: errors.password ? '2px solid #ef4444' : '2px solid #e5e5e5',
                    borderRadius: '12px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff style={{ width: '20px', height: '20px', color: '#999' }} /> : <Eye style={{ width: '20px', height: '20px', color: '#999' }} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
                Confirm password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#999' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  disabled={isLoading || isSuccess}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '15px',
                    border: errors.confirmPassword ? '2px solid #ef4444' : '2px solid #e5e5e5',
                    borderRadius: '12px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{errors.confirmPassword}</p>}
            </div>

            {/* Terms Checkbox */}
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '24px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#25D366', marginTop: '2px' }}
              />
              <span style={{ fontSize: '14px', color: '#555', lineHeight: 1.5 }}>
                I agree to the{' '}
                <Link href="/terms" style={{ color: '#25D366', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" style={{ color: '#25D366', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
              </span>
            </label>
            {errors.terms && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '-16px', marginBottom: '16px' }}>{errors.terms}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 600,
                color: 'white',
                background: isSuccess 
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : 'linear-gradient(135deg, #25D366 0%, #1DA851 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: isLoading || isSuccess ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                opacity: isLoading ? 0.8 : 1
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                  Creating account...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle style={{ width: '20px', height: '20px' }} />
                  Account created!
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight style={{ width: '18px', height: '18px' }} />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#666' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ fontWeight: 600, color: '#25D366', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Branding */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorations */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '350px', height: '350px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '400px' }}
        >
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '20px', lineHeight: 1.3 }}>
            Start growing your business with WhatsApp
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, marginBottom: '40px' }}>
            Join 5,000+ businesses using DBULK to connect with their customers and drive growth.
          </p>

          {/* Testimonial Card */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '20px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
              {[1,2,3,4,5].map(i => (
                <svg key={i} style={{ width: '18px', height: '18px', fill: '#fbbf24' }} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <p style={{ fontSize: '15px', color: 'white', lineHeight: 1.6, marginBottom: '16px' }}>
              "DBULK helped us increase our customer engagement by 300%. The platform is incredibly easy to use and the results speak for themselves."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>
                SJ
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'white', fontSize: '14px' }}>Sarah Johnson</p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>Marketing Director, TechCorp</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

            {/* Display API errors */}
      {apiError && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px',
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          zIndex: 9999
        }}>
          {apiError}
        </div>
      )}

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        email={formData.email}
        type="EMAIL_VERIFICATION"
        onClose={() => setShowOTPModal(false)}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
      />

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
