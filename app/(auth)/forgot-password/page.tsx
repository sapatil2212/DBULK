"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare, Mail, ArrowRight, Loader2, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    
    setError("");
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSuccess(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '40px 20px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0'
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
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
              <MessageSquare style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
          </Link>
        </div>

        {!isSuccess ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>
                Forgot your password?
              </h1>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.6 }}>
                No worries! Enter your email and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '8px'
                }}>Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: '#999'
                  }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 48px',
                      fontSize: '15px',
                      border: error ? '2px solid #ef4444' : '2px solid #e5e5e5',
                      borderRadius: '12px',
                      outline: 'none',
                      backgroundColor: 'white',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {error && (
                  <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'white',
                  background: 'linear-gradient(135deg, #25D366 0%, #1DA851 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                  opacity: isLoading ? 0.8 : 1,
                  marginBottom: '24px'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight style={{ width: '18px', height: '18px' }} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <CheckCircle style={{ width: '36px', height: '36px', color: '#22c55e' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>
              Check your email
            </h2>
            <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.6, marginBottom: '32px' }}>
              We've sent a password reset link to<br />
              <strong style={{ color: '#111' }}>{email}</strong>
            </p>
            <p style={{ fontSize: '14px', color: '#999', marginBottom: '24px' }}>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setIsSuccess(false)}
                style={{ color: '#25D366', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                try again
              </button>
            </p>
          </div>
        )}

        {/* Back to Login */}
        <div style={{ textAlign: 'center' }}>
          <Link href="/login" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#666',
            textDecoration: 'none'
          }}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Back to login
          </Link>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
