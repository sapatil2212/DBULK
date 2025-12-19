"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errors, setErrors] = React.useState<{email?: string; password?: string}>({});
  const [apiError, setApiError] = React.useState("");
  
  // Get redirect URL from query parameter if any
  const [redirectUrl, setRedirectUrl] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    // Extract redirect URL from query parameters if present
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, []);

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setApiError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Success - store user data in localStorage
      localStorage.setItem('userData', JSON.stringify(data.data.user));
      
      // Save the authentication token for JavaScript access
      // The server also sets it as an HTTP-only cookie for secure API requests
      if (data.data.token) {
        localStorage.setItem('auth_token', data.data.token);
      }
      
      // Set a flag indicating we're authenticated
      localStorage.setItem('isAuthenticated', 'true');
      
      setIsSuccess(true);
      
      // Wait a moment and redirect to the specified URL or dashboard
      setTimeout(() => {
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push('/dashboard');
        }
      }, 800);
      
    } catch (error) {
      console.error('Login error:', error);
      setApiError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Left Panel - Branding */}
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
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '400px',
          height: '400px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '350px',
          height: '350px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%'
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
        >
          {/* Logo */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <MessageSquare style={{ width: '40px', height: '40px', color: 'white' }} />
          </div>

          <h1 style={{
            fontSize: '36px',
            fontWeight: 800,
            color: 'white',
            marginBottom: '16px'
          }}>DBULK</h1>
          
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.9)',
            maxWidth: '320px',
            lineHeight: 1.6
          }}>
            The most powerful WhatsApp marketing platform for growing businesses
          </p>

          {/* Features */}
          <div style={{ marginTop: '48px', textAlign: 'left' }}>
            {[
              'Send bulk messages instantly',
              'Track delivery & engagement',
              'Manage unlimited contacts'
            ].map((feature, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                color: 'rgba(255,255,255,0.9)',
                fontSize: '15px'
              }}>
                <CheckCircle style={{ width: '20px', height: '20px' }} />
                {feature}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        backgroundColor: '#fafafa'
      }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#111',
            marginBottom: '8px'
          }}>Welcome back</h2>
          <p style={{
            fontSize: '15px',
            color: '#666',
            marginBottom: '32px'
          }}>Sign in to your account to continue</p>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: '20px' }}>
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
                  disabled={isLoading || isSuccess}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '15px',
                    border: errors.email ? '2px solid #ef4444' : '2px solid #e5e5e5',
                    borderRadius: '12px',
                    outline: 'none',
                    backgroundColor: 'white',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {errors.email && (
                <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '8px'
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#999'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading || isSuccess}
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 48px',
                    fontSize: '15px',
                    border: errors.password ? '2px solid #ef4444' : '2px solid #e5e5e5',
                    borderRadius: '12px',
                    outline: 'none',
                    backgroundColor: 'white',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: '20px', height: '20px', color: '#999' }} />
                  ) : (
                    <Eye style={{ width: '20px', height: '20px', color: '#999' }} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#555'
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#25D366',
                    cursor: 'pointer'
                  }}
                />
                Remember me
              </label>
              <Link href="/forgot-password" style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#25D366',
                textDecoration: 'none'
              }}>
                Forgot password?
              </Link>
            </div>

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
                transition: 'all 0.2s',
                opacity: isLoading ? 0.8 : 1
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                  Signing in...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle style={{ width: '20px', height: '20px' }} />
                  Success!
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight style={{ width: '18px', height: '18px' }} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '32px 0',
            gap: '16px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e5e5' }} />
            <span style={{ fontSize: '13px', color: '#999' }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e5e5' }} />
          </div>

          {/* Social Login */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              flex: 1,
              padding: '14px',
              border: '2px solid #e5e5e5',
              borderRadius: '12px',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#333'
            }}>
              <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button style={{
              flex: 1,
              padding: '14px',
              border: '2px solid #e5e5e5',
              borderRadius: '12px',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#333'
            }}>
              <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="#333">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Sign Up Link */}
          <p style={{
            textAlign: 'center',
            marginTop: '32px',
            fontSize: '14px',
            color: '#666'
          }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{
              fontWeight: 600,
              color: '#25D366',
              textDecoration: 'none'
            }}>
              Sign up for free
            </Link>
          </p>
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

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
