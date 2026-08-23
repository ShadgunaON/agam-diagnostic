'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FormField } from '@/components/ui/FormField';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { env } from '@/config/env';

type AuthMode =
  | 'signin'
  | 'signup'
  | 'confirm_signup'
  | 'forgot_password'
  | 'reset_password'
  | 'new_password';

export function ProgressiveSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = env.useMockData;

  const {
    signInWithPassword,
    completeNewPasswordChallenge,
    signUpWithPassword,
    confirmSignUp,
    forgotPassword,
    confirmForgotPassword,
  } = useAuth();

  const { isLoading, error, setError, execute } = useAsyncAction();
  const [successMessage, setSuccessMessage] = useState('');

  // Mode state
  const [mode, setMode] = useState<AuthMode>('signin');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Show/Hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Cognito NEW_PASSWORD_REQUIRED challenge state (in-memory only)
  const [challengeSession, setChallengeSession] = useState<string | null>(null);
  const [challengeEmail, setChallengeEmail] = useState<string>('');

  useEffect(() => {
    if (searchParams.get('reset') === 'true') {
      sessionStorage.clear();
      router.replace('/login');
    }
  }, [searchParams, router]);

  const navigateToDestination = (role?: string) => {
    if (role && role !== 'patient') {
      router.push('/admin');
      return;
    }
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('returnUrl');
      const queryString = newParams.toString();
      const destination = queryString ? `${returnUrl}?${queryString}` : returnUrl;
      router.push(destination);
    } else {
      router.push('/');
    }
  };

  // ==========================================
  // SIGN IN HANDLER
  // ==========================================
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    await execute(async () => {
      const res = await signInWithPassword(cleanEmail, password);
      if (res.success && res.user) {
        navigateToDestination(res.user.role);
      } else if (res.needsNewPassword && res.session) {
        // Cognito FORCE_CHANGE_PASSWORD — employee first login
        setChallengeSession(res.session);
        setChallengeEmail(res.challengeEmail || cleanEmail);
        setMode('new_password');
        setPassword(''); // Clear temporary password from state
      } else {
        throw new Error(res.error || 'Authentication failed. Please check your credentials.');
      }
    });
  };

  // ==========================================
  // SET NEW PASSWORD HANDLER (Cognito FORCE_CHANGE_PASSWORD)
  // ==========================================
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!challengeSession) {
      setError('Session expired. Please sign in again.');
      setMode('signin');
      return;
    }

    await execute(async () => {
      const res = await completeNewPasswordChallenge(challengeEmail, newPassword, challengeSession);
      if (res.success && res.user) {
        setChallengeSession(null);
        setChallengeEmail('');
        setNewPassword('');
        setConfirmNewPassword('');
        navigateToDestination(res.user.role);
      } else {
        throw new Error(res.error || 'Failed to set new password. Please try again.');
      }
    });
  };

  // ==========================================
  // SIGN UP HANDLER
  // ==========================================
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = email.trim();
    const cleanName = fullName.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    await execute(async () => {
      const res = await signUpWithPassword(cleanEmail, password, cleanName, phone.trim() || undefined);
      if (res.success) {
        if (res.isSignUpComplete) {
          const loginRes = await signInWithPassword(cleanEmail, password);
          if (loginRes.success && loginRes.user) {
            navigateToDestination(loginRes.user.role);
          } else {
            setMode('signin');
            setSuccessMessage('Account created successfully! Please sign in.');
          }
        } else {
          setMode('confirm_signup');
          setSuccessMessage(`Confirmation code sent to ${cleanEmail}. Please enter the code below.`);
        }
      } else {
        throw new Error(res.error || 'Registration failed. Please try again.');
      }
    });
  };

  // ==========================================
  // CONFIRM SIGN UP HANDLER
  // ==========================================
  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = email.trim();
    const cleanCode = code.trim();

    if (!cleanCode) {
      setError('Please enter the confirmation code sent to your email.');
      return;
    }

    await execute(async () => {
      const res = await confirmSignUp(cleanEmail, cleanCode);
      if (res.success) {
        if (password) {
          const loginRes = await signInWithPassword(cleanEmail, password);
          if (loginRes.success && loginRes.user) {
            navigateToDestination(loginRes.user.role);
            return;
          }
        }
        setMode('signin');
        setSuccessMessage('Email verified successfully! Please sign in with your credentials.');
      } else {
        throw new Error(res.error || 'Invalid confirmation code.');
      }
    });
  };

  // ==========================================
  // FORGOT PASSWORD HANDLER
  // ==========================================
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    await execute(async () => {
      const res = await forgotPassword(cleanEmail);
      if (res.success) {
        setMode('reset_password');
        setSuccessMessage(`Password reset code sent to ${cleanEmail}.`);
      } else {
        throw new Error(res.error || 'Failed to initiate password reset.');
      }
    });
  };

  // ==========================================
  // RESET PASSWORD HANDLER
  // ==========================================
  const handleConfirmForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = email.trim();
    const cleanCode = code.trim();

    if (!cleanCode) {
      setError('Please enter the reset code.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    await execute(async () => {
      const res = await confirmForgotPassword(cleanEmail, cleanCode, newPassword);
      if (res.success) {
        setMode('signin');
        setSuccessMessage('Password reset successful! Please sign in with your new password.');
      } else {
        throw new Error(res.error || 'Failed to reset password. Please verify the code.');
      }
    });
  };

  // Demo Quick-Fill Helper
  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ background: '#fff', padding: '40px 32px', borderRadius: '24px', border: '1px solid rgba(14,165,233,0.15)', boxShadow: '0 12px 32px rgba(11,27,61,0.08)', maxWidth: '460px', width: '100%' }}>
        
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(145deg, #f0f9ff, #e0f2fe)', color: 'var(--color-primary)', marginBottom: '14px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '30px' }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h1 style={{ fontSize: '24px', color: 'var(--color-dark)', margin: '0 0 6px 0', fontWeight: 700 }}>
            {mode === 'signin' && 'Sign In to Agam'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'confirm_signup' && 'Verify Email Address'}
            {mode === 'forgot_password' && 'Reset Password'}
            {mode === 'reset_password' && 'Set New Password'}
            {mode === 'new_password' && 'Set Your Password'}
          </h1>
          <p style={{ color: 'var(--color-text-light)', margin: 0, fontSize: '14px' }}>
            {mode === 'signin' && 'Enter your email address and password to continue.'}
            {mode === 'signup' && 'Register to manage diagnostic bookings and health records.'}
            {mode === 'confirm_signup' && `Enter the confirmation code sent to ${email}`}
            {mode === 'forgot_password' && 'Enter your email to receive a password reset code.'}
            {mode === 'reset_password' && 'Enter the reset code and your new password.'}
            {mode === 'new_password' && 'Welcome! Please create a permanent password for your account.'}
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: 500 }}>
            {error}
          </div>
        )}
        {successMessage && (
          <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: 500 }}>
            {successMessage}
          </div>
        )}

        {/* ==================================================== */}
        {/* MODE 1: SIGN IN (EMAIL + PASSWORD)                   */}
        {/* ==================================================== */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
              
              <FormField label="Email Address" htmlFor="signin-email" required>
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '15px', outline: 'none' }}
                  required
                />
              </FormField>

              <div>
                <FormField label="Password" htmlFor="signin-password" required>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '15px', outline: 'none' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-light)',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </FormField>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_password'); setError(''); setSuccessMessage(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password}
              style={{
                width: '100%',
                background: 'var(--color-dark)',
                color: '#fff',
                padding: '16px',
                borderRadius: '100px',
                border: 'none',
                fontSize: '15px',
                fontWeight: 600,
                cursor: (isLoading || !email.trim() || !password) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !email.trim() || !password) ? 0.5 : 1,
                marginBottom: '20px',
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-text-light)' }}>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); setSuccessMessage(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Register / Create Account
              </button>
            </div>

            {/* Demo Quick-Fill Pill options when running with mock data */}
            {isDemo && (
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--color-text-light)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Demo Quick Fill</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  <button type="button" onClick={() => handleDemoFill('john.doe@example.com', 'Password123!')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>Patient (John)</button>
                  <button type="button" onClick={() => handleDemoFill('admin@agamdiagnostics.com', 'Password123!')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>Admin</button>
                  <button type="button" onClick={() => handleDemoFill('sunita.r@agam.com', 'Password123!')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>Staff (Sunita)</button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* ==================================================== */}
        {/* MODE 2: SIGN UP (CREATE ACCOUNT)                     */}
        {/* ==================================================== */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              
              <FormField label="Full Name" htmlFor="signup-fullname" required>
                <input
                  id="signup-fullname"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '15px', outline: 'none' }}
                  required
                />
              </FormField>

              <FormField label="Email Address" htmlFor="signup-email" required>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '15px', outline: 'none' }}
                  required
                />
              </FormField>

              <FormField label="Password" htmlFor="signup-password" required>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '15px', outline: 'none' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-light)',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </FormField>

              <FormField label="Mobile Number (Optional)" htmlFor="signup-phone">
                <input
                  id="signup-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '15px', outline: 'none' }}
                />
              </FormField>

            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password || !fullName.trim()}
              style={{
                width: '100%',
                background: 'var(--color-primary)',
                color: '#fff',
                padding: '16px',
                borderRadius: '100px',
                border: 'none',
                fontSize: '15px',
                fontWeight: 600,
                cursor: (isLoading || !email.trim() || !password || !fullName.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !email.trim() || !password || !fullName.trim()) ? 0.5 : 1,
                marginBottom: '16px',
              }}
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-text-light)' }}>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); setSuccessMessage(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* MODE 3: CONFIRM SIGN UP (EMAIL CODE)                 */}
        {/* ==================================================== */}
        {mode === 'confirm_signup' && (
          <form onSubmit={handleConfirmSignUp} noValidate>
            <div style={{ marginBottom: '24px' }}>
              <FormField label="Enter Confirmation Code" htmlFor="confirm-code" required>
                <input
                  id="confirm-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '20px', letterSpacing: '6px', textAlign: 'center', outline: 'none' }}
                  required
                />
              </FormField>
            </div>

            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              style={{
                width: '100%',
                background: 'var(--color-primary)',
                color: '#fff',
                padding: '16px',
                borderRadius: '100px',
                border: 'none',
                fontSize: '15px',
                fontWeight: 600,
                cursor: (isLoading || !code.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !code.trim()) ? 0.5 : 1,
                marginBottom: '16px',
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify Email & Continue'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px' }}>
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); setSuccessMessage(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* MODE 4: FORGOT PASSWORD (REQUEST CODE)               */}
        {/* ==================================================== */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleForgotPassword} noValidate>
            <div style={{ marginBottom: '24px' }}>
              <FormField label="Registered Email Address" htmlFor="forgot-email" required>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '15px', outline: 'none' }}
                  required
                />
              </FormField>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              style={{
                width: '100%',
                background: 'var(--color-dark)',
                color: '#fff',
                padding: '16px',
                borderRadius: '100px',
                border: 'none',
                fontSize: '15px',
                fontWeight: 600,
                cursor: (isLoading || !email.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !email.trim()) ? 0.5 : 1,
                marginBottom: '16px',
              }}
            >
              {isLoading ? 'Sending Code...' : 'Send Reset Code'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px' }}>
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); setSuccessMessage(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* MODE 5: RESET PASSWORD (CONFIRM CODE & NEW PASSWORD) */}
        {/* ==================================================== */}
        {mode === 'reset_password' && (
          <form onSubmit={handleConfirmForgotPassword} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              
              <FormField label="Reset Code" htmlFor="reset-code" required>
                <input
                  id="reset-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '15px', outline: 'none' }}
                  required
                />
              </FormField>

              <FormField label="New Password" htmlFor="reset-newpassword" required>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reset-newpassword"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '15px', outline: 'none' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-light)',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showNewPassword ? (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </FormField>

            </div>

            <button
              type="submit"
              disabled={isLoading || !code.trim() || !newPassword}
              style={{
                width: '100%',
                background: 'var(--color-primary)',
                color: '#fff',
                padding: '16px',
                borderRadius: '100px',
                border: 'none',
                fontSize: '15px',
                fontWeight: 600,
                cursor: (isLoading || !code.trim() || !newPassword) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !code.trim() || !newPassword) ? 0.5 : 1,
                marginBottom: '16px',
              }}
            >
              {isLoading ? 'Resetting Password...' : 'Confirm New Password'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px' }}>
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); setSuccessMessage(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
        {/* ==================================================== */}
        {/* MODE 6: SET NEW PASSWORD (Cognito FORCE_CHANGE)       */}
        {/* ==================================================== */}
        {mode === 'new_password' && (
          <form onSubmit={handleSetNewPassword} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>

              {/* Info banner */}
              <div style={{ background: '#f0f9ff', color: '#0369a1', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 500, lineHeight: '1.5' }}>
                Your account has been created by an administrator. Please set a permanent password to continue.
              </div>

              <FormField label="New Password" htmlFor="new-password-set" required>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-password-set"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '15px', outline: 'none' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-light)',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showNewPassword ? (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </FormField>

              <FormField label="Confirm Password" htmlFor="confirm-new-password-set" required>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirm-new-password-set"
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '15px', outline: 'none' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-light)',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showConfirmNewPassword ? (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </FormField>

              {/* Password strength indicators */}
              <div style={{ fontSize: '12px', color: 'var(--color-text-light)', padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ color: newPassword.length >= 8 ? '#16a34a' : '#94a3b8' }}>
                    {newPassword.length >= 8 ? '✓' : '○'}
                  </span>
                  At least 8 characters
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ color: /[A-Z]/.test(newPassword) ? '#16a34a' : '#94a3b8' }}>
                    {/[A-Z]/.test(newPassword) ? '✓' : '○'}
                  </span>
                  One uppercase letter
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ color: /[0-9]/.test(newPassword) ? '#16a34a' : '#94a3b8' }}>
                    {/[0-9]/.test(newPassword) ? '✓' : '○'}
                  </span>
                  One number
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: confirmNewPassword && newPassword === confirmNewPassword ? '#16a34a' : '#94a3b8' }}>
                    {confirmNewPassword && newPassword === confirmNewPassword ? '✓' : '○'}
                  </span>
                  Passwords match
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={isLoading || !newPassword || newPassword.length < 8 || newPassword !== confirmNewPassword}
              style={{
                width: '100%',
                background: 'var(--color-primary)',
                color: '#fff',
                padding: '16px',
                borderRadius: '100px',
                border: 'none',
                fontSize: '15px',
                fontWeight: 600,
                cursor: (isLoading || !newPassword || newPassword.length < 8 || newPassword !== confirmNewPassword) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !newPassword || newPassword.length < 8 || newPassword !== confirmNewPassword) ? 0.5 : 1,
                marginBottom: '16px',
              }}
            >
              {isLoading ? 'Setting Password...' : 'Set Password & Continue'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px' }}>
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); setSuccessMessage(''); setChallengeSession(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
