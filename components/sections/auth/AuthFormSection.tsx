"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, UserProfile } from '@/context/AuthContext';


export interface AuthFormSectionProps {
  className?: string;
}

export function AuthFormSection({ className = '' }: AuthFormSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrlFromQuery = searchParams.get('returnUrl');
  const { sendOtp, verifyOtp, updateProfile, skipProfile } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'input' | 'otp' | 'profile_onboarding'>('input');

  // Input states
  const [mobile, setMobile] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dobOrAge, setDobOrAge] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  // Extended Profile Onboarding states
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Madurai');
  const [pincode, setPincode] = useState('625001');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [existingConditions, setExistingConditions] = useState('');

  // Loading & error handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const effectiveReturnUrl = returnUrlFromQuery || '/';

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendOtp(mobile);
      setStep('otp');
    } catch {
      setErrorMsg('Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const fullOtp = otp.join('');

    if (fullOtp.length !== 4) {
      setErrorMsg('Please enter the 4-digit OTP.');
      return;
    }

    setIsSubmitting(true);
    try {
      const registrationData: Partial<UserProfile> = {
        fullName,
        email,
        gender,
        dobOrAge,
      };

      const result = await verifyOtp(
        mobile, 
        fullOtp, 
        mode === 'signup' ? registrationData : undefined
      );

      if (!result.success) {
        setErrorMsg('Invalid OTP. Please enter 1234 or any 4-digit code for testing.');
        setIsSubmitting(false);
        return;
      }

      if (mode === 'signup' || result.isNewUser) {
        // Show Profile Completion onboarding step
        setStep('profile_onboarding');
      } else {
        // Redirect back to intended URL or home
        if (effectiveReturnUrl) {
          router.push(effectiveReturnUrl);
        } else {
          router.push('/');
        }
      }
    } catch {
      setErrorMsg('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      address,
      city,
      state: 'Tamil Nadu',
      pincode,
      emergencyContact,
      existingConditions,
      preferredAddress: `${address}, ${city} - ${pincode}`,
      isProfileComplete: true,
    });

    if (effectiveReturnUrl) {
      router.push(effectiveReturnUrl);
    } else {
      router.push('/');
    }
  };

  const handleSkipProfile = () => {
    skipProfile();
    if (effectiveReturnUrl) {
      router.push(effectiveReturnUrl);
    } else {
      router.push('/');
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <>
      {/* STEP 1: MOBILE & DETAILS INPUT */}
      {step === 'input' && (
        <form onSubmit={handleSendOtp} className="fade-in-up">
          <div className="auth-badge">Sign In or Sign Up</div>
          <h2>Welcome to Agam</h2>
          <p className="step-subtitle">Please enter your mobile number or continue with social.</p>

          {errorMsg && (
            <div style={{ color: '#b91c1c', fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Mobile Number</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '60px', flexShrink: 0 }}>
                <input type="text" className="form-control" value="+91" disabled style={{ background: '#f1f5f9', textAlign: 'center', color: '#64748b', padding: '10px 4px' }} />
              </div>
              <input 
                type="tel" 
                className="form-control" 
                placeholder="Enter 10-digit number" 
                autoFocus
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required 
              />
            </div>
          </div>
          
          <p style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '-10px', marginBottom: '20px' }}>
            <em>Testing: Enter '9999999999' for New User.</em>
          </p>

          <button type="submit" className="btn-continue" style={{ width: '100%', justifyContent: 'center' }} disabled={isSubmitting}>
            {isSubmitting ? 'Loading...' : 'Continue'}
          </button>

          <div className="divider">OR</div>

          <button type="button" className="social-btn" onClick={() => alert('Google login placeholder')}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <button type="button" className="social-btn" onClick={() => alert('Apple login placeholder')}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.36 14.36c-.02-2.31 1.9-3.41 1.99-3.46-1.07-1.57-2.73-1.78-3.32-1.81-1.41-.14-2.76.83-3.48.83-.73 0-1.85-.81-3.03-.79-1.52.02-2.92.88-3.7 2.23-1.58 2.75-.4 6.81 1.14 9.03.76 1.09 1.65 2.31 2.85 2.26 1.16-.04 1.6-.74 3.01-.74 1.4 0 1.8.74 3.03.72 1.24-.02 2.01-1.12 2.76-2.21 1.14-1.66 1.61-3.27 1.63-3.35-.03-.01-2.85-1.09-2.88-3.37zm-2.07-5.18c.63-.76 1.05-1.82.93-2.88-.91.04-2.02.6-2.68 1.38-.53.62-1.02 1.7-.88 2.74 1.02.08 2.02-.48 2.63-1.24z"/></svg>
            Continue with Apple
          </button>
          <button type="button" className="social-btn" onClick={() => alert('Facebook login placeholder')}>
            <svg viewBox="0 0 24 24" fill="currentColor" color="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Continue with Facebook
          </button>
        </form>
      )}

      {/* STEP 2: OTP VERIFICATION */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="fade-in-up">
          <div className="auth-badge">Verification</div>
          <h2>Enter OTP</h2>
          <p className="step-subtitle">We've sent a 4-digit code to <strong>+91 {mobile}</strong></p>

          {errorMsg && (
            <div style={{ color: '#b91c1c', fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  className="form-control otp-input"
                  maxLength={1}
                  value={otp[idx]}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  autoFocus={idx === 0}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn-continue" style={{ width: '100%', justifyContent: 'center' }} disabled={isSubmitting}>
            {isSubmitting ? 'Loading...' : 'Verify & Proceed'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <a href="#" style={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); setStep('input'); }}>Wrong number?</a>
          </div>
        </form>
      )}

      {/* STEP 3: OPTIONAL PROFILE ONBOARDING */}
      {step === 'profile_onboarding' && (
        <form onSubmit={handleCompleteProfile} className="fade-in-up" id="step-signup">
          <div className="auth-badge">Registration</div>
          <h2>Create Account</h2>
          <p className="step-subtitle">Please enter your basic details to register.</p>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-row" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label>Gender</label>
              <select className="form-control" value={gender} onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date of Birth / Age</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 28 or YYYY-MM-DD"
                value={dobOrAge}
                onChange={(e) => setDobOrAge(e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="text"
              className="form-control"
              value={`+91 ${mobile}`}
              disabled
              style={{ background: '#f1f5f9', color: '#64748b' }}
            />
          </div>

          <button type="submit" className="btn-continue" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            Register & Continue
          </button>
        </form>
      )}

    </>
  );
}
