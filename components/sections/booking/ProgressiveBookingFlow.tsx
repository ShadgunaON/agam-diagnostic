'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

type BookingStep = 1 | 2 | 3 | 4;
type LocationType = 'home' | 'lab';
type PatientType = 'myself' | 'family';

export function ProgressiveBookingFlow() {
  const { items, totalAmount, collectionFee, removeItem } = useCart();
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  
  // Booking State
  const [patientType, setPatientType] = useState<PatientType>('myself');
  const [locationType, setLocationType] = useState<LocationType>('home');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4) as BookingStep);
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1) as BookingStep);

  const isCartEmpty = items.length === 0;
  const finalTotal = locationType === 'home' ? totalAmount : totalAmount - collectionFee;

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 80px)', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* TOP STEPPER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '48px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '16px', left: '0', right: '0', height: '2px', background: 'var(--color-border)', zIndex: 0 }}>
            <div style={{ height: '100%', background: 'var(--color-primary)', width: `${((currentStep - 1) / 3) * 100}%`, transition: 'width 0.3s ease' }} />
          </div>
          <StepIndicator step={1} currentStep={currentStep} title="Cart" />
          <StepIndicator step={2} currentStep={currentStep} title="Details" />
          <StepIndicator step={3} currentStep={currentStep} title="Schedule" />
          <StepIndicator step={4} currentStep={currentStep} title="Payment" />
        </div>

        {/* MAIN CONTENT AREA */}
        <div style={{ display: 'grid', gridTemplateColumns: (currentStep === 1 || currentStep === 4) ? '1fr 320px' : 'minmax(0, 700px)', gap: '32px', alignItems: 'start', justifyContent: 'center' }}>
          
          {/* LEFT: STEP CONTENT */}
          <div style={{ minWidth: 0 }}>
            <button onClick={handleBack} style={{ display: currentStep === 1 ? 'none' : 'inline-flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--color-text-light)', cursor: 'pointer', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px' }}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back
            </button>

            {/* STEP 1: CART */}
            {currentStep === 1 && (
              <div className="fade-in-up">
                <h2 style={{ fontSize: '24px', color: 'var(--color-dark)', marginBottom: '24px' }}>Review your cart</h2>
                {isCartEmpty ? (
                  <div style={{ textAlign: 'center', padding: '48px', background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(11,27,61,0.04)' }}>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '16px' }}>Your cart is empty.</p>
                    <Link href="/services" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Browse Services</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(11,27,61,0.04)' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '4px' }}>{item.category}</div>
                          <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--color-dark)' }}>{item.title}</h4>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-dark)' }}>₹{item.price}</div>
                          <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', padding: 0, marginTop: '4px' }}>Remove</button>
                        </div>
                      </div>
                    ))}
                    <button onClick={handleNext} style={{ background: 'var(--color-primary)', color: '#fff', padding: '16px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer', marginTop: '16px', width: '100%' }}>
                      Proceed to Details
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: PATIENT & LOCATION */}
            {currentStep === 2 && (
              <div className="fade-in-up">
                <h2 style={{ fontSize: '20px', color: 'var(--color-dark)', marginBottom: '20px', textAlign: 'center' }}>Where should we meet you?</h2>
                
                <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* PATIENT SELECTION - Sleek Pills */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-light)', fontWeight: 600 }}>Booking For</span>
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '6px', borderRadius: '100px', gap: '4px' }}>
                      <button 
                        onClick={() => setPatientType('myself')}
                        style={{ padding: '10px 24px', borderRadius: '100px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', background: patientType === 'myself' ? '#fff' : 'transparent', color: patientType === 'myself' ? 'var(--color-primary)' : 'var(--color-text-light)', boxShadow: patientType === 'myself' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}
                      >
                        Myself
                      </button>
                      <button 
                        onClick={() => setPatientType('family')}
                        style={{ padding: '10px 24px', borderRadius: '100px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', background: patientType === 'family' ? '#fff' : 'transparent', color: patientType === 'family' ? 'var(--color-primary)' : 'var(--color-text-light)', boxShadow: patientType === 'family' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}
                      >
                        Family Member
                      </button>
                    </div>
                  </div>

                  {/* LOCATION SELECTION - Compact Square Bento Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label style={{ 
                      position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                      padding: '20px 16px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: locationType === 'home' ? 'linear-gradient(145deg, #fff, #f0f9ff)' : '#fff', 
                      border: locationType === 'home' ? '2px solid var(--color-primary)' : '2px solid transparent',
                      boxShadow: locationType === 'home' ? '0 8px 16px rgba(14, 165, 233, 0.15)' : '0 4px 12px rgba(11,27,61,0.04)',
                      transform: locationType === 'home' ? 'translateY(-2px)' : 'none'
                    }}>
                      <input type="radio" checked={locationType === 'home'} onChange={() => setLocationType('home')} style={{ display: 'none' }} />
                      <div style={{ fontSize: '32px', marginBottom: '8px', filter: locationType === 'home' ? 'drop-shadow(0 4px 8px rgba(14,165,233,0.3))' : 'grayscale(100%) opacity(60%)', transition: 'all 0.3s' }}>🏠</div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: locationType === 'home' ? 'var(--color-primary)' : 'var(--color-text-light)' }}>Home Collection</div>
                      {locationType === 'home' && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--color-primary)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '16px' }}><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </label>

                    <label style={{ 
                      position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                      padding: '20px 16px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: locationType === 'lab' ? 'linear-gradient(145deg, #fff, #f8fafc)' : '#fff', 
                      border: locationType === 'lab' ? '2px solid var(--color-dark)' : '2px solid transparent',
                      boxShadow: locationType === 'lab' ? '0 8px 16px rgba(11,27,61,0.1)' : '0 4px 12px rgba(11,27,61,0.04)',
                      transform: locationType === 'lab' ? 'translateY(-2px)' : 'none'
                    }}>
                      <input type="radio" checked={locationType === 'lab'} onChange={() => setLocationType('lab')} style={{ display: 'none' }} />
                      <div style={{ fontSize: '32px', marginBottom: '8px', filter: locationType === 'lab' ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' : 'grayscale(100%) opacity(60%)', transition: 'all 0.3s' }}>🏥</div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: locationType === 'lab' ? 'var(--color-dark)' : 'var(--color-text-light)' }}>Visit Lab</div>
                      {locationType === 'lab' && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--color-dark)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '16px' }}><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* DYNAMIC ADDRESS BLOCK - Smooth Expand */}
                  <div style={{ 
                    overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                    maxHeight: locationType === 'home' ? '220px' : '0', opacity: locationType === 'home' ? 1 : 0 
                  }}>
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.2)', boxShadow: '0 4px 12px rgba(14,165,233,0.08)', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '-6px', left: '25%', transform: 'translateX(-50%)', width: '12px', height: '12px', background: '#fff', borderTop: '1px solid rgba(14,165,233,0.2)', borderLeft: '1px solid rgba(14,165,233,0.2)', rotate: '45deg' }} />
                      
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" style={{ width: '14px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <h3 style={{ fontSize: '13px', margin: 0, color: 'var(--color-dark)' }}>Collection Address</h3>
                        </div>
                        
                        {address ? (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-dark)', lineHeight: 1.5, fontWeight: 500 }}>{address}</p>
                            <button onClick={() => setAddress('')} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '12px', padding: '2px 6px' }}>Edit</button>
                          </div>
                        ) : (
                          <div>
                            <textarea 
                              placeholder="Enter your complete address..." 
                              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', minHeight: '60px', fontFamily: 'inherit', resize: 'none', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' }}
                              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                              onBlur={(e) => {
                                e.target.style.borderColor = 'var(--color-border)';
                                setAddress(e.target.value);
                              }}
                            />
                            <p style={{ fontSize: '11px', color: '#ef4444', margin: '4px 0 0 0', fontWeight: 500 }}>* Address is mandatory</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleNext} 
                    disabled={locationType === 'home' && !address}
                    style={{ 
                      width: '100%', background: 'var(--color-dark)', color: '#fff', padding: '16px', borderRadius: '100px', border: 'none', 
                      fontSize: '15px', fontWeight: 600, cursor: (locationType === 'home' && !address) ? 'not-allowed' : 'pointer', 
                      opacity: (locationType === 'home' && !address) ? 0.5 : 1, transition: 'all 0.3s',
                      boxShadow: (locationType === 'home' && !address) ? 'none' : '0 4px 12px rgba(11,27,61,0.15)'
                    }}
                  >
                    Select Time Slot &nbsp;→
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SCHEDULE */}
            {currentStep === 3 && (
              <div className="fade-in-up">
                <h2 style={{ fontSize: '24px', color: 'var(--color-dark)', marginBottom: '24px' }}>Schedule Appointment</h2>
                
                <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '24px', boxShadow: '0 2px 8px rgba(11,27,61,0.04)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-dark)' }}>Select Date</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '16px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-dark)' }}>Select Time Slot</label>
                      <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '16px', background: '#fff' }}>
                        <option value="">Choose a time...</option>
                        <option value="06:30-08:00">06:30 AM - 08:00 AM</option>
                        <option value="08:00-10:00">08:00 AM - 10:00 AM</option>
                        <option value="10:00-12:00">10:00 AM - 12:00 PM</option>
                        <option value="16:00-18:00">04:00 PM - 06:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleNext} 
                  disabled={!date || !timeSlot}
                  style={{ width: '100%', background: 'var(--color-primary)', color: '#fff', padding: '16px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: 600, cursor: (!date || !timeSlot) ? 'not-allowed' : 'pointer', opacity: (!date || !timeSlot) ? 0.5 : 1 }}
                >
                  Review & Pay
                </button>
              </div>
            )}

            {/* STEP 4: PAYMENT */}
            {currentStep === 4 && (
              <div className="fade-in-up">
                <h2 style={{ fontSize: '24px', color: 'var(--color-dark)', marginBottom: '24px' }}>Final Review</h2>
                
                <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '24px', boxShadow: '0 2px 8px rgba(11,27,61,0.04)' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Appointment Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--color-dark)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                      <span style={{ color: 'var(--color-text-light)' }}>Patient:</span>
                      <span style={{ fontWeight: 500 }}>{patientType === 'myself' ? 'Self' : 'Family Member'}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                      <span style={{ color: 'var(--color-text-light)' }}>Date & Time:</span>
                      <span style={{ fontWeight: 500 }}>{date} | {timeSlot}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                      <span style={{ color: 'var(--color-text-light)' }}>Location:</span>
                      <span style={{ fontWeight: 500 }}>{locationType === 'home' ? address : 'Visit Agam Diagnostics Centre'}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => alert('Booking Confirmed! (Payment Gateway Integration Pending)')} 
                  style={{ width: '100%', background: '#10b981', color: '#fff', padding: '16px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Pay ₹{finalTotal} securely
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: ORDER SUMMARY (SHOW ON STEP 1 & 4) */}
          {(currentStep === 1 || currentStep === 4) && (
            <div style={{ position: 'sticky', top: '100px', background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(11,27,61,0.06)' }}>
              <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--color-dark)' }}>Order Summary</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: 'var(--color-text)' }}>
                <span>{items.length} {items.length === 1 ? 'Item' : 'Items'}</span>
                <span style={{ fontWeight: 600 }}>₹{totalAmount - collectionFee}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: 'var(--color-text)' }}>
                <span>Home Collection</span>
                {locationType === 'home' ? (
                  <span style={{ fontWeight: 600, color: collectionFee === 0 ? '#10b981' : 'var(--color-dark)' }}>
                    {collectionFee === 0 ? 'Free' : `₹${collectionFee}`}
                  </span>
                ) : (
                  <span style={{ fontWeight: 600, color: 'var(--color-text-light)' }}>Not Applicable</span>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--color-border)', paddingTop: '16px', fontSize: '20px', fontWeight: 'bold', color: 'var(--color-dark)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-primary)' }}>₹{finalTotal}</span>
              </div>
              
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--color-text-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" style={{ width: '14px' }}><polyline points="20 6 9 17 4 12"/></svg>
                  NABL Accredited Lab
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" style={{ width: '14px' }}><polyline points="20 6 9 17 4 12"/></svg>
                  Secure 256-bit encryption
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StepIndicator({ step, currentStep, title }: { step: number; currentStep: number; title: string }) {
  const isCompleted = step < currentStep;
  const isActive = step === currentStep;
  const isPending = step > currentStep;

  let bgColor = '#fff';
  let borderColor = 'var(--color-border)';
  let textColor = 'var(--color-text-light)';

  if (isActive) {
    borderColor = 'var(--color-primary)';
    textColor = 'var(--color-primary)';
  }
  if (isCompleted) {
    bgColor = 'var(--color-primary)';
    borderColor = 'var(--color-primary)';
    textColor = 'var(--color-primary)';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1 }}>
      <div style={{ 
        width: '32px', height: '32px', borderRadius: '16px', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: bgColor,
        border: `2px solid ${borderColor}`,
        color: isCompleted ? '#fff' : isActive ? 'var(--color-primary)' : 'var(--color-text-light)',
        fontWeight: 'bold', fontSize: '14px',
        transition: 'all 0.3s ease'
      }}>
        {isCompleted ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '16px' }}><polyline points="20 6 9 17 4 12"/></svg> : step}
      </div>
      <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 500, color: textColor }}>{title}</span>
    </div>
  );
}

function ToggleBtn({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      style={{ 
        flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        fontSize: '14px', fontWeight: 600, transition: 'all 0.2s',
        background: active ? 'var(--color-primary)' : '#f1f5f9',
        color: active ? '#fff' : 'var(--color-text-light)',
        boxShadow: active ? '0 4px 12px rgba(26,54,93,0.15)' : 'none'
      }}
    >
      {children}
    </button>
  );
}
