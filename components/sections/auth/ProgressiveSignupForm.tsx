'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type SignupStep = 'mobile' | 'otp' | 'profile';

export function ProgressiveSignupForm() {
  const router = useRouter();
  const { sendOtp, verifyOtp, updateProfile, skipProfile, user } = useAuth();
  
  const [step, setStep] = useState<SignupStep>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Optional profile fields
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [age, setAge] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setIsLoading(true);
    try {
      const success = await sendOtp(mobile);
      if (success) {
        setStep('otp');
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 4) {
      setError('OTP must be 4 digits. (Try 1234)');
      return;
    }
    setIsLoading(true);
    try {
      const { success, isNewUser } = await verifyOtp(mobile, otp, { fullName });
      if (success) {
        if (isNewUser || (user && !user.isProfileComplete)) {
          setStep('profile');
        } else {
          router.push('/');
        }
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    updateProfile({
      gender: gender || undefined,
      dobOrAge: age || undefined
    });
    setIsLoading(false);
    router.push('/');
  };

  const handleSkip = () => {
    skipProfile();
    router.push('/');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid rgba(14,165,233,0.15)', boxShadow: '0 12px 32px rgba(11,27,61,0.08)', maxWidth: '480px', width: '100%', position: 'relative', overflow: 'hidden' }}>
        
        {/* Step 1: Mobile */}
        {step === 'mobile' && (
          <form onSubmit={handleSendOtp} className="fade-in">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(145deg, #f0f9ff, #e0f2fe)', color: 'var(--color-primary)', marginBottom: '16px', boxShadow: '0 8px 16px rgba(14,165,233,0.1)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '32px' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <h1 style={{ fontSize: '24px', color: 'var(--color-dark)', margin: '0 0 8px 0' }}>Welcome to Agam</h1>
              <p style={{ color: 'var(--color-text-light)', margin: 0, fontSize: '15px' }}>Enter your mobile number to get started.</p>
            </div>

            {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: 500 }}>{error}</div>}

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)', fontWeight: 600 }}>+91</span>
                <input 
                  type="tel" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  style={{ width: '100%', padding: '16px 16px 16px 56px', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '16px', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} 
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(14,165,233,0.2)'}
                  autoFocus
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || mobile.length !== 10}
              style={{ width: '100%', background: 'var(--color-dark)', color: '#fff', padding: '18px', borderRadius: '100px', border: 'none', fontSize: '16px', fontWeight: 600, cursor: (isLoading || mobile.length !== 10) ? 'not-allowed' : 'pointer', opacity: (isLoading || mobile.length !== 10) ? 0.5 : 1, transition: 'all 0.3s', boxShadow: (isLoading || mobile.length !== 10) ? 'none' : '0 8px 20px rgba(11,27,61,0.15)' }}
            >
              {isLoading ? 'Sending...' : 'Get OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP & Basic Info */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="fade-in-up">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', color: 'var(--color-dark)', margin: '0 0 8px 0' }}>Verify your number</h2>
              <p style={{ color: 'var(--color-text-light)', margin: 0, fontSize: '15px' }}>We sent a 4-digit code to +91 {mobile}. <span onClick={() => setStep('mobile')} style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>Edit</span></p>
            </div>

            {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: 500 }}>{error}</div>}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Enter OTP</label>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="1234"
                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '24px', letterSpacing: '8px', textAlign: 'center', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} 
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(14,165,233,0.2)'}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '15px', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} 
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(14,165,233,0.2)'}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading || otp.length !== 4 || !fullName}
              style={{ width: '100%', background: 'var(--color-primary)', color: '#fff', padding: '18px', borderRadius: '100px', border: 'none', fontSize: '16px', fontWeight: 600, cursor: (isLoading || otp.length !== 4 || !fullName) ? 'not-allowed' : 'pointer', opacity: (isLoading || otp.length !== 4 || !fullName) ? 0.5 : 1, transition: 'all 0.3s', boxShadow: (isLoading || otp.length !== 4 || !fullName) ? 'none' : '0 8px 20px rgba(14,165,233,0.2)' }}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}

        {/* Step 3: Optional Demographic Info */}
        {step === 'profile' && (
          <form onSubmit={handleSaveProfile} className="fade-in-up">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '32px', background: '#dcfce7', color: '#10b981', marginBottom: '16px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '32px' }}><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{ fontSize: '24px', color: 'var(--color-dark)', margin: '0 0 8px 0' }}>Almost Done!</h2>
              <p style={{ color: 'var(--color-text-light)', margin: 0, fontSize: '15px' }}>Help us personalize your healthcare experience.</p>
            </div>

            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gender <span style={{ color: 'var(--color-text-light)', textTransform: 'none', fontWeight: 400 }}>(Optional)</span></label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Male', 'Female', 'Other'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g as any)}
                        style={{ flex: 1, padding: '12px 8px', borderRadius: '12px', border: gender === g ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', background: gender === g ? '#f0f9ff' : '#fff', color: gender === g ? 'var(--color-primary)' : 'var(--color-text-light)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Age <span style={{ color: 'var(--color-text-light)', textTransform: 'none', fontWeight: 400 }}>(Optional)</span></label>
                  <input 
                    type="number" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 32"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '15px', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} 
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(14,165,233,0.2)'}
                  />
                </div>

              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button 
                type="submit" 
                style={{ width: '100%', background: 'var(--color-dark)', color: '#fff', padding: '18px', borderRadius: '100px', border: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 8px 20px rgba(11,27,61,0.15)' }}
              >
                Save Details & Finish
              </button>
              <button 
                type="button" 
                onClick={handleSkip}
                style={{ width: '100%', background: 'transparent', color: 'var(--color-text-light)', padding: '16px', borderRadius: '100px', border: 'none', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-dark)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-light)'}
              >
                Skip for now
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
