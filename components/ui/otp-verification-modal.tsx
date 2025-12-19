"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Loader2, CheckCircle, RefreshCw } from "lucide-react";

interface OTPVerificationModalProps {
  email: string;
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<boolean>;
  onResend: () => Promise<boolean>;
}

export default function OTPVerificationModal({
  email,
  type,
  isOpen,
  onClose,
  onVerify,
  onResend
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [activeInput, setActiveInput] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setOtp(Array(6).fill(''));
      setActiveInput(0);
      setIsLoading(false);
      setIsSuccess(false);
      setError('');
      setTimeLeft(300); // Reset timer to 5 minutes
      setCanResend(false);
      setResendCooldown(0);
      
      // Focus the first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // OTP expiration timer (5 minutes)
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          setError('OTP has expired. Please request a new one.');
          setCanResend(true);
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isOpen, timeLeft]);

  // Resend cooldown timer (1 minute)
  useEffect(() => {
    if (!isOpen || resendCooldown <= 0) return;
    
    const timer = setTimeout(() => {
      setResendCooldown(prevTime => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          setCanResend(true);
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isOpen, resendCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleInputChange = (index: number, value: string) => {
    // Only accept single digit
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    setError('');

    // Move to next input if current one is filled
    if (value && index < 5) {
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all fields are filled and auto-submit
    if (value && index === 5) {
      const completeOtp = newOtp.join('');
      if (completeOtp.length === 6) {
        handleVerify(completeOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index] === '') {
        // Move to previous input if current one is empty
        if (index > 0) {
          setActiveInput(index - 1);
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
    
    // Handle left arrow key
    else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveInput(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle right arrow key
    else if (e.key === 'ArrowRight' && index < 5) {
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted data is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      setActiveInput(5);
      inputRefs.current[5]?.focus();
      
      // Auto-submit after a brief delay
      setTimeout(() => {
        handleVerify(pastedData);
      }, 300);
    }
  };

  const handleVerify = async (completeOtp: string) => {
    if (completeOtp.length !== 6 || !/^\d{6}$/.test(completeOtp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await onVerify(completeOtp);
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await onResend();
      if (success) {
        // Reset timer and cooldown
        setTimeLeft(300);
        setCanResend(false);
        setResendCooldown(60); // 1-minute cooldown
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 600,
            color: '#111'
          }}>
            Verify your email
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              borderRadius: '50%'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <p style={{ margin: '0 0 20px 0', fontSize: '15px', color: '#555', lineHeight: 1.5 }}>
            We've sent a verification code to <strong>{email}</strong>. Enter the code below to continue.
          </p>

          {/* Timer */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '20px', 
            fontSize: '14px', 
            color: timeLeft <= 60 ? '#ef4444' : '#666' 
          }}>
            Code expires in: <strong>{formatTime(timeLeft)}</strong>
          </div>

          {/* OTP Input Fields */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={otp[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                disabled={isLoading || isSuccess}
                style={{
                  width: '50px',
                  height: '56px',
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#111',
                  backgroundColor: activeInput === index ? 'rgba(37, 211, 102, 0.08)' : 'white',
                  border: error ? '2px solid #ef4444' : '2px solid #e5e5e5',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <p style={{ 
              textAlign: 'center', 
              margin: '0 0 16px 0',
              color: '#ef4444', 
              fontSize: '14px' 
            }}>
              {error}
            </p>
          )}

          {/* Verify Button */}
          <button
            onClick={() => handleVerify(otp.join(''))}
            disabled={isLoading || isSuccess || otp.join('').length !== 6}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 600,
              color: 'white',
              background: isSuccess 
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : 'linear-gradient(135deg, #25D366 0%, #1DA851 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: isLoading || isSuccess || otp.join('').length !== 6 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
              opacity: isLoading || otp.join('').length !== 6 ? 0.7 : 1
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Verifying...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle size={18} />
                Verified!
              </>
            ) : (
              'Verify Email'
            )}
          </button>

          {/* Resend OTP */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              Didn't receive the code?
            </span>
            <button
              onClick={handleResendOtp}
              disabled={!canResend || isLoading || isSuccess}
              style={{
                background: 'none',
                border: 'none',
                padding: '0',
                fontSize: '14px',
                fontWeight: '600',
                color: canResend && !isLoading && !isSuccess ? '#25D366' : '#999',
                cursor: canResend && !isLoading && !isSuccess ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                <>
                  <RefreshCw size={14} />
                  Resend
                </>
              )}
            </button>
          </div>
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
