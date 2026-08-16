'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { bookingService, invoiceService } from '@/services';
import { performGlobalSearch, SearchResultItem } from '@/app/actions/globalSearch';

type BookingStep = 1 | 2 | 3 | 4;
type LocationType = 'home' | 'lab';
type PatientType = 'myself' | 'family';

export function ProgressiveBookingFlow() {
  const { items, addItem, totalAmount, collectionFee, removeItem, duplicateWarnings, removeDuplicateTest, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  
  // Booking State
  const [patientType, setPatientType] = useState<PatientType>('myself');
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string>('');
  const [locationType, setLocationType] = useState<LocationType>('home');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Empty cart search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle search
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const results = await performGlobalSearch(searchQuery);
          setSearchResults(results.filter(r => r.type === 'test' || r.type === 'package' || r.type === 'service'));
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePayment = async () => {
    setIsSubmitting(true);
    setError(null);

    const familyMember = patientType === 'family' ? user?.savedPatients.find(p => p.id === selectedFamilyMemberId) : null;
    const finalPatientId = patientType === 'myself' ? user?.id : familyMember?.id;
    const finalPatientName = patientType === 'myself' ? (user?.fullName || 'Guest Patient') : (familyMember?.name || 'Family Member');
    const finalPatientAge = patientType === 'myself' ? parseInt(user?.dobOrAge || '30', 10) || 30 : parseInt(familyMember?.age || '30', 10) || 30;
    const finalPatientGender = patientType === 'myself' ? (user?.gender || 'Not Specified') : (familyMember?.gender || 'Not Specified');

    const bookingPayload = {
      patientId: finalPatientId,
      patient: {
        name: finalPatientName,
        phone: user?.mobile || '0000000000',
        email: user?.email || 'guest@example.com',
        age: finalPatientAge,
        gender: finalPatientGender
      },
      collection: {
        type: locationType === 'home' ? 'Home Collection' as const : 'Lab Visit' as const,
        date: date || 'Not specified',
        timeSlot: timeSlot || 'Not specified',
        address: locationType === 'home' ? address : 'Agam Diagnostics Centre'
      },
      items: items.map(item => ({
        name: item.title,
        type: item.type === 'package' ? 'Package' as const : 'Test' as const,
        price: item.price
      })),
      payment: {
        total: locationType === 'home' ? totalAmount : totalAmount - collectionFee,
        status: 'Pending' as const,
        method: 'Online Secure'
      },
      timeline: []
    };

    const result = await bookingService.createBooking(bookingPayload);
    setIsSubmitting(false);

    if (result.isSuccess && result.value) {
      clearCart();
      const invRes = await invoiceService.getAll();
      const invoice = invRes.isSuccess ? invRes.value.find(i => i.bookingId === result.value?.id) : null;
      if (invoice) {
        router.push(`/payment/${invoice.id}`);
      } else {
        router.push(`/book/success/${result.value.id}`);
      }
    } else {
      const errorMsg = !result.isSuccess ? result.error?.message : "Failed to create booking.";
      setError(errorMsg || "Failed to create booking. Please try again.");
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !user) {
      router.push('/login?returnUrl=/book');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4) as BookingStep);
  };
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
        <div className={`grid ${currentStep === 1 || currentStep === 4 ? 'grid-cols-1 lg:grid-cols-[1fr_320px]' : 'grid-cols-1 lg:max-w-[700px] lg:mx-auto'} gap-8 items-start justify-center`}>
          
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
                
                {duplicateWarnings.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 shadow-sm">
                    <div className="flex items-center gap-2 text-orange-800 font-bold mb-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <span>Smart Cart Intelligence Alert</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {duplicateWarnings.map((warning, idx) => (
                        <div key={idx} className="bg-white border border-orange-100 p-3 rounded-md text-sm flex justify-between items-center">
                          <div className="text-gray-700">
                            <p className="m-0">&quot;<strong>{warning.testTitle}</strong>&quot; is already included in the &quot;<strong>{warning.packageTitle}</strong>&quot; package.</p>
                          </div>
                          <button
                            type="button"
                            className="bg-orange-100 hover:bg-orange-200 text-orange-800 font-semibold py-1.5 px-4 rounded transition-colors text-sm whitespace-nowrap"
                            onClick={() => removeDuplicateTest(warning.testSlug)}
                          >
                            Remove & Save ₹{warning.savingsAmount}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {isCartEmpty ? (
                  <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(11,27,61,0.04)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '20px', color: 'var(--color-dark)', marginBottom: '8px' }}>What would you like to add?</h3>
                      <p style={{ color: 'var(--color-text-light)', fontSize: '14px', marginBottom: '0' }}>Search and add tests, packages or services to your booking.</p>
                    </div>

                    <div style={{ position: 'relative', marginBottom: '24px' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', color: 'var(--color-text-light)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <input 
                        type="text" 
                        placeholder="Search for a test, package, or service..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '15px', outline: 'none', transition: 'all 0.2s' }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                      />
                    </div>

                    {searchQuery.trim().length > 1 ? (
                      <div>
                        {isSearching ? (
                          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-light)', fontSize: '14px' }}>Searching...</div>
                        ) : searchResults.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {searchResults.map(result => (
                              <div key={result.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                <div>
                                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{result.type} • {result.category}</div>
                                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '4px' }}>{result.title}</div>
                                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-dark)' }}>₹{result.price || 499}</div>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn--primary btn--sm"
                                  onClick={() => addItem({
                                    id: `${result.type}-${result.slug}`,
                                    slug: result.slug,
                                    title: result.title,
                                    type: result.type as 'test'|'package'|'service',
                                    category: result.category,
                                    price: typeof result.price === 'string' ? parseInt(result.price.replace(/\D/g, ''), 10) : (result.price || 499),
                                    originalPrice: Math.round((typeof result.price === 'string' ? parseInt(result.price.replace(/\D/g, ''), 10) : (result.price || 499)) * 1.3),
                                  })}
                                >
                                  + Add
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-light)', fontSize: '14px' }}>No results found for &quot;{searchQuery}&quot;</div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Or browse catalog</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Link href="/tests" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-dark)', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}>
                            <span style={{ fontSize: '24px', marginBottom: '8px' }}>🔬</span>
                            Tests
                          </Link>
                          <Link href="/health-packages" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-dark)', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}>
                            <span style={{ fontSize: '24px', marginBottom: '8px' }}>📦</span>
                            Health Packages
                          </Link>
                          <Link href="/services" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-dark)', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}>
                            <span style={{ fontSize: '24px', marginBottom: '8px' }}>🏥</span>
                            Services
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border)', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                            </svg>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{item.category}</div>
                            <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--color-dark)', fontWeight: 600 }}>{item.title}</h4>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-dark)' }}>₹{item.price}</div>
                          <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-light)', fontSize: '12px', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-light)'}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    <Link href="/services" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#fff', borderRadius: '16px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '14px', border: '2px dashed rgba(14,165,233,0.3)', transition: 'all 0.2s', marginTop: '4px' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-bg-alt)'} onMouseOut={(e) => e.currentTarget.style.background = '#fff'}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      Add Extra Tests
                    </Link>

                    <button 
                      onClick={handleNext} 
                      style={{ 
                        width: '100%', background: 'var(--color-dark)', color: '#fff', padding: '16px', borderRadius: '100px', border: 'none', 
                        fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
                        boxShadow: '0 4px 12px rgba(11,27,61,0.15)', marginTop: '16px'
                      }}
                    >
                      Proceed to Details &nbsp;→
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
                    {patientType === 'family' && (
                      <div style={{ width: '100%', marginTop: '8px' }}>
                        <select 
                          value={selectedFamilyMemberId}
                          onChange={(e) => setSelectedFamilyMemberId(e.target.value)}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '14px', outline: 'none' }}
                        >
                          <option value="">-- Select Family Member --</option>
                          {user?.savedPatients.filter(p => p.relation !== 'Myself').map(member => (
                            <option key={member.id} value={member.id}>{member.name} ({member.relation})</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* LOCATION SELECTION - Compact Square Bento Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        
                        <div style={{ marginBottom: '16px' }}>
                          <textarea 
                            placeholder="Enter your complete address..." 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', minHeight: '60px', fontFamily: 'inherit', resize: 'none', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                          />
                          {!address && (
                            <p style={{ fontSize: '11px', color: '#ef4444', margin: '4px 0 0 0', fontWeight: 500 }}>* Address is mandatory</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleNext} 
                    disabled={(locationType === 'home' && !address) || (patientType === 'family' && !selectedFamilyMemberId)}
                    style={{ 
                      width: '100%', background: 'var(--color-dark)', color: '#fff', padding: '16px', borderRadius: '100px', border: 'none', 
                      fontSize: '15px', fontWeight: 600, cursor: ((locationType === 'home' && !address) || (patientType === 'family' && !selectedFamilyMemberId)) ? 'not-allowed' : 'pointer', 
                      opacity: ((locationType === 'home' && !address) || (patientType === 'family' && !selectedFamilyMemberId)) ? 0.5 : 1, transition: 'all 0.3s',
                      boxShadow: ((locationType === 'home' && !address) || (patientType === 'family' && !selectedFamilyMemberId)) ? 'none' : '0 4px 12px rgba(11,27,61,0.15)'
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
                <h2 style={{ fontSize: '20px', color: 'var(--color-dark)', marginBottom: '20px', textAlign: 'center' }}>When should we expect you?</h2>
                
                <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.2)', boxShadow: '0 4px 12px rgba(14,165,233,0.08)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '15px', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'} onBlur={(e) => e.target.style.borderColor = 'rgba(14,165,233,0.2)'} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Time Slot</label>
                        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '15px', background: '#fff', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'} onBlur={(e) => e.target.style.borderColor = 'rgba(14,165,233,0.2)'}>
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
                    style={{ 
                      width: '100%', background: 'var(--color-dark)', color: '#fff', padding: '16px', borderRadius: '100px', border: 'none', 
                      fontSize: '15px', fontWeight: 600, cursor: (!date || !timeSlot) ? 'not-allowed' : 'pointer', 
                      opacity: (!date || !timeSlot) ? 0.5 : 1, transition: 'all 0.3s',
                      boxShadow: (!date || !timeSlot) ? 'none' : '0 4px 12px rgba(11,27,61,0.15)'
                    }}
                  >
                    Review & Pay &nbsp;→
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: PAYMENT */}
            {currentStep === 4 && (
              <div className="fade-in-up">
                <h2 style={{ fontSize: '20px', color: 'var(--color-dark)', marginBottom: '20px', textAlign: 'center' }}>Final Review</h2>
                
                <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.2)', boxShadow: '0 4px 12px rgba(14,165,233,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" style={{ width: '18px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      <h3 style={{ fontSize: '15px', margin: 0, color: 'var(--color-dark)' }}>Appointment Details</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', color: 'var(--color-dark)' }}>
                      <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-2">
                        <span style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>Patient:</span>
                        <span style={{ fontWeight: 600 }}>
                          {patientType === 'myself' ? 'Self' : user?.savedPatients.find(p => p.id === selectedFamilyMemberId)?.name || 'Family Member'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-2">
                        <span style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>Date & Time:</span>
                        <span style={{ fontWeight: 600 }}>{date} <span style={{ color: 'var(--color-text-light)', margin: '0 4px' }}>|</span> {timeSlot}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-2">
                        <span style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>Location:</span>
                        <span style={{ fontWeight: 600, lineHeight: 1.5 }}>{locationType === 'home' ? address : 'Visit Agam Diagnostics Centre'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {error && (
                    <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '8px', fontSize: '14px', textAlign: 'center' }}>
                      {error}
                    </div>
                  )}

                  <button 
                    type="button"
                    onClick={handlePayment} 
                    disabled={isSubmitting}
                    style={{ 
                      width: '100%', background: '#10b981', color: '#fff', padding: '16px', borderRadius: '100px', border: 'none', 
                      fontSize: '15px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.2)', transition: 'all 0.3s', opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    {isSubmitting ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '18px' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        {finalTotal === 0 ? 'Confirm Free Booking' : `Pay ₹${finalTotal} Securely`}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: ORDER SUMMARY (SHOW ON STEP 1 & 4) */}
          {(currentStep === 1 || currentStep === 4) && (
            <div style={{ position: 'sticky', top: '100px', background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.15)', boxShadow: '0 4px 12px rgba(14,165,233,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" style={{ width: '18px' }}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--color-dark)' }}>Order Summary</h4>
              </div>
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
