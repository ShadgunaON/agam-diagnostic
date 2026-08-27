'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminCard } from '@/components/admin/primitives/AdminCard';
import { AdminInput } from '@/components/admin/primitives/AdminInput';
import { AdminButton } from '@/components/admin/primitives/AdminButton';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { patientService, bookingService, testCatalogService, packageService } from '@/services';
import { PatientModel } from '@/domains/patient/model';
import { useToast } from '@/components/admin/feedback/Toast';

type Step = 1 | 2 | 3 | 4;

export default function AdminCreateBookingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<any>(null);

  // --- Step 1: Patient Data ---
  const [patients, setPatients] = useState<PatientModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientModel | null>(null);
  const [isCreatingNewPatient, setIsCreatingNewPatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    name: '', phone: '', email: '', age: 30, gender: 'Male', bloodGroup: 'O+'
  });

  // --- Step 2: Catalog Data ---
  const [tests, setTests] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Array<{ id: string, name: string, price: number, type: 'Test' | 'Package' }>>([]);

  // --- Step 3: Appointment Data ---
  const [locationType, setLocationType] = useState<'Home Collection' | 'Lab Visit'>('Home Collection');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      const [patientsRes, testsRes, packagesRes] = await Promise.all([
        patientService.getAll(1, 1000),
        testCatalogService.getCatalog(1, 1000),
        packageService.getCatalog(1, 1000)
      ]);
      
      if (patientsRes.isSuccess) setPatients(patientsRes.value.data);
      if (testsRes.isSuccess) setTests(testsRes.value.data);
      if (packagesRes.isSuccess) setPackages(packagesRes.value.data);
    };
    loadData();
  }, []);

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients.slice(0, 5);
    const q = searchQuery.toLowerCase();
    return patients.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.phone.includes(q) || 
      p.id.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [patients, searchQuery]);

  const filteredCatalog = useMemo(() => {
    const q = catalogQuery.toLowerCase();
    const matchedTests = tests.filter(t => t.title.toLowerCase().includes(q)).map(t => ({ id: t.id, name: t.title, price: t.price, type: 'Test' as const }));
    const matchedPackages = packages.filter(p => p.title.toLowerCase().includes(q)).map(p => ({ id: p.id, name: p.title, price: p.price, type: 'Package' as const }));
    return [...matchedPackages, ...matchedTests];
  }, [tests, packages, catalogQuery]);

  const toggleItem = (item: { id: string, name: string, price: number, type: 'Test' | 'Package' }) => {
    const exists = selectedItems.find(i => i.id === item.id);
    if (exists) {
      setSelectedItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.price, 0);
  }, [selectedItems]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4) as Step);
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1) as Step);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let finalPatient = selectedPatient;

      // 1. Create patient if needed
      if (isCreatingNewPatient) {
        if (!newPatientData.name || !newPatientData.phone) {
          toast({ title: 'Error', description: 'Name and phone are required for new patient.', variant: 'danger' });
          setIsSubmitting(false);
          return;
        }
        const createRes = await patientService.create({
          name: newPatientData.name,
          phone: newPatientData.phone,
          email: newPatientData.email || '',
          age: newPatientData.age,
          gender: newPatientData.gender,
          bloodGroup: newPatientData.bloodGroup,
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        if (!createRes.isSuccess) {
          throw new Error(createRes.error?.message || 'Failed to create patient');
        }
        if (!createRes.value) {
          throw new Error('Failed to create patient: Missing response data');
        }
        finalPatient = createRes.value;
      }

      if (!finalPatient) throw new Error('No patient selected or created');

      // 2. Create Booking
      const bookingPayload = {
        patientId: finalPatient.id,
        patient: {
          name: finalPatient.name,
          phone: finalPatient.phone,
          email: finalPatient.email,
          age: finalPatient.age,
          gender: finalPatient.gender
        },
        collection: {
          type: locationType,
          date: date,
          timeSlot: timeSlot,
          address: locationType === 'Home Collection' ? address : 'Agam Diagnostics Centre'
        },
        items: selectedItems.map(i => ({
          name: i.name,
          type: i.type,
          price: i.price
        })),
        payment: {
          total: totalAmount,
          status: 'Pending' as const,
          method: 'Pay at Center'
        },
        timeline: [
          {
            id: `TL-${Date.now()}`,
            title: 'Booking Created',
            description: 'Booking created by Admin',
            timestamp: new Date().toISOString(),
            status: 'success' as const,
            actor: 'Admin'
          }
        ]
      };

      const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const bookingRes = await bookingService.createBooking(bookingPayload, { idempotencyKey });
      if (bookingRes.isSuccess && bookingRes.value) {
        setSuccessBooking(bookingRes.value);
        toast({ title: 'Success', description: 'Booking created successfully.', variant: 'success' });
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'An error occurred', variant: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (successBooking) {
    return (
      <AdminPageTemplate title="Booking Confirmed">
        <div className="max-w-2xl mx-auto mt-8">
          <AdminCard className="text-center p-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <AdminIcon name="check" className="w-8 h-8" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Created Successfully</h2>
            <p className="text-slate-500 mb-8">Order ID: <span className="font-bold text-slate-800">{successBooking.id}</span></p>

            <div className="bg-slate-50 rounded-xl p-6 w-full text-left mb-8 border border-slate-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">Patient</span>
                  <span className="font-semibold text-slate-900">{successBooking.patient.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Schedule</span>
                  <span className="font-semibold text-slate-900">{successBooking.collection.date} | {successBooking.collection.timeSlot}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Amount</span>
                  <span className="font-semibold text-slate-900">₹{successBooking.payment.total}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Status</span>
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold text-xs">{successBooking.status}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <AdminButton onClick={() => router.push(`/admin/patients/${successBooking.patientId}`)} variant="primary">
                View Patient Profile
              </AdminButton>
              <AdminButton onClick={() => router.push('/admin/bookings')} variant="secondary">
                Back to Bookings
              </AdminButton>
              <AdminButton onClick={() => window.location.reload()} variant="secondary">
                Create Another
              </AdminButton>
            </div>
          </AdminCard>
        </div>
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate 
      title="Create Booking" 
      headerActions={
        <AdminButton variant="secondary" onClick={() => router.push('/admin/bookings')}>
          Cancel
        </AdminButton>
      }
    >
      <div className="max-w-4xl mx-auto">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -z-10" />
          <div className="absolute left-0 top-1/2 h-0.5 bg-blue-500 -z-10 transition-all duration-300" style={{ width: `${((currentStep - 1) / 3) * 100}%` }} />
          
          {[1, 2, 3, 4].map(step => (
            <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
              step === currentStep ? 'bg-white border-blue-500 text-blue-500' :
              step < currentStep ? 'bg-blue-500 border-blue-500 text-white' :
              'bg-white border-slate-300 text-slate-400'
            }`}>
              {step < currentStep ? '✓' : step}
            </div>
          ))}
        </div>

        <AdminCard className="p-6 md:p-8 min-h-[500px] flex flex-col">
          
          {/* STEP 1: PATIENT */}
          {currentStep === 1 && (
            <div className="flex-1 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Select or Create Patient</h2>
              
              <div className="flex gap-4 border-b border-slate-200 mb-6">
                <button 
                  className={`pb-3 px-2 font-semibold text-sm border-b-2 transition-colors ${!isCreatingNewPatient ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}`}
                  onClick={() => setIsCreatingNewPatient(false)}
                >
                  Search Existing
                </button>
                <button 
                  className={`pb-3 px-2 font-semibold text-sm border-b-2 transition-colors ${isCreatingNewPatient ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}`}
                  onClick={() => { setIsCreatingNewPatient(true); setSelectedPatient(null); }}
                >
                  Create New
                </button>
              </div>

              {!isCreatingNewPatient ? (
                <div className="space-y-4">
                  <AdminInput 
                    type="text" 
                    placeholder="Search by name, phone, or ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<AdminIcon name="search" className="w-4 h-4 text-slate-400" />}
                  />
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {filteredPatients.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => setSelectedPatient(p)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedPatient?.id === p.id 
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-900">{p.name}</div>
                            <div className="text-sm text-slate-500">{p.phone} • {p.id}</div>
                          </div>
                          {selectedPatient?.id === p.id && <AdminIcon name="check" className="text-blue-500 w-5 h-5" />}
                        </div>
                      </div>
                    ))}
                    {filteredPatients.length === 0 && (
                      <div className="text-center py-8 text-slate-500">No patients found. Create a new one.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
                    <AdminInput value={newPatientData.name} onChange={e => setNewPatientData({...newPatientData, name: e.target.value})} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number *</label>
                    <AdminInput value={newPatientData.phone} onChange={e => setNewPatientData({...newPatientData, phone: e.target.value})} placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                    <AdminInput value={newPatientData.email} onChange={e => setNewPatientData({...newPatientData, email: e.target.value})} placeholder="john@example.com" type="email" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
                    <AdminInput value={newPatientData.age.toString()} onChange={e => setNewPatientData({...newPatientData, age: parseInt(e.target.value) || 0})} type="number" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
                    <select 
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={newPatientData.gender} 
                      onChange={e => setNewPatientData({...newPatientData, gender: e.target.value})}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Blood Group</label>
                    <select 
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={newPatientData.bloodGroup} 
                      onChange={e => setNewPatientData({...newPatientData, bloodGroup: e.target.value})}
                    >
                      <option value="Unknown">Unknown</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: TESTS / PACKAGES */}
          {currentStep === 2 && (
            <div className="flex-1 animate-in fade-in duration-300 flex flex-col">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Select Tests & Packages</h2>
              
              <div className="mb-4">
                <AdminInput 
                  type="text" 
                  placeholder="Search catalog for tests or packages..." 
                  value={catalogQuery}
                  onChange={(e) => setCatalogQuery(e.target.value)}
                  icon={<AdminIcon name="search" className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[300px]">
                {/* Catalog List */}
                <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden h-[400px]">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-sm text-slate-700">Catalog</div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                    {filteredCatalog.map(item => {
                      const isSelected = selectedItems.some(i => i.id === item.id);
                      return (
                        <div 
                          key={item.id}
                          onClick={() => toggleItem(item)}
                          className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-sm text-slate-900">{item.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{item.type}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-700 text-sm">₹{item.price}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                              {isSelected && <AdminIcon name="check" className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected List */}
                <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-slate-50 h-[400px]">
                  <div className="bg-white px-4 py-3 border-b border-slate-200 font-semibold text-sm text-slate-700 flex justify-between items-center">
                    <span>Selected Items</span>
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs">{selectedItems.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {selectedItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                        <AdminIcon name="plus" className="w-8 h-8 mb-2 opacity-20" />
                        Select tests from catalog
                      </div>
                    ) : (
                      selectedItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                          <div>
                            <div className="font-semibold text-sm text-slate-900">{item.name}</div>
                            <div className="text-xs text-slate-500">{item.type}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-700 text-sm">₹{item.price}</span>
                            <button onClick={() => toggleItem(item)} className="text-slate-400 hover:text-red-500">
                              <AdminIcon name="x" className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="bg-white border-t border-slate-200 p-4 flex justify-between items-center">
                    <span className="font-semibold text-slate-600">Total</span>
                    <span className="text-lg font-bold text-blue-600">₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: APPOINTMENT */}
          {currentStep === 3 && (
            <div className="flex-1 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Appointment Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Collection Type</label>
                    <div className="flex gap-4">
                      <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${locationType === 'Home Collection' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <input type="radio" className="hidden" checked={locationType === 'Home Collection'} onChange={() => setLocationType('Home Collection')} />
                        <span className="text-2xl mb-2">🏠</span>
                        <span className="font-semibold text-sm">Home Collection</span>
                      </label>
                      <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${locationType === 'Lab Visit' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <input type="radio" className="hidden" checked={locationType === 'Lab Visit'} onChange={() => setLocationType('Lab Visit')} />
                        <span className="text-2xl mb-2">🏥</span>
                        <span className="font-semibold text-sm">Lab Visit</span>
                      </label>
                    </div>
                  </div>

                  {locationType === 'Home Collection' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Collection Address *</label>
                      <textarea 
                        className="w-full p-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px] resize-none"
                        placeholder="Enter full address for sample collection..."
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
                    <input 
                      type="date" 
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Time Slot *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['06:30-08:00', '08:00-10:00', '10:00-12:00', '16:00-18:00'].map(slot => (
                        <div 
                          key={slot}
                          onClick={() => setTimeSlot(slot)}
                          className={`p-3 rounded-lg border text-center text-sm font-medium cursor-pointer transition-colors ${
                            timeSlot === slot ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          {slot.replace('-', ' - ')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {currentStep === 4 && (
            <div className="flex-1 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Review Booking</h2>
              
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Patient Information</h3>
                  <div className="flex justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-lg">
                        {isCreatingNewPatient ? newPatientData.name : selectedPatient?.name}
                      </div>
                      <div className="text-slate-500 mt-1">
                        {isCreatingNewPatient ? newPatientData.phone : selectedPatient?.phone}
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      {isCreatingNewPatient ? 'New Patient' : `ID: ${selectedPatient?.id}`}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-b border-slate-200 bg-white">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Appointment Schedule</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-slate-500 text-sm mb-1">Date & Time</div>
                      <div className="font-semibold text-slate-900">{date || 'Not set'} <span className="mx-2 text-slate-300">|</span> {timeSlot || 'Not set'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm mb-1">Location</div>
                      <div className="font-semibold text-slate-900">{locationType}</div>
                      {locationType === 'Home Collection' && <div className="text-sm text-slate-500 mt-1 truncate">{address}</div>}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Selected Services ({selectedItems.length})</h3>
                  <div className="space-y-3 mb-6">
                    {selectedItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-800">{item.name}</span>
                        <span className="font-semibold text-slate-900">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="font-bold text-slate-900 text-lg">Total Amount</span>
                    <span className="font-bold text-blue-600 text-2xl">₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex justify-between items-center pt-8 mt-auto border-t border-slate-100">
            {currentStep > 1 ? (
              <AdminButton variant="secondary" onClick={handleBack} disabled={isSubmitting}>
                Back
              </AdminButton>
            ) : <div />}
            
            {currentStep < 4 ? (
              <AdminButton 
                variant="primary" 
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !isCreatingNewPatient && !selectedPatient) ||
                  (currentStep === 1 && isCreatingNewPatient && (!newPatientData.name || !newPatientData.phone)) ||
                  (currentStep === 2 && selectedItems.length === 0) ||
                  (currentStep === 3 && (!date || !timeSlot || (locationType === 'Home Collection' && !address)))
                }
              >
                Next Step <AdminIcon name="chevronRight" className="w-4 h-4 ml-2" />
              </AdminButton>
            ) : (
              <AdminButton 
                variant="primary" 
                onClick={handleSubmit} 
                isLoading={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white"
              >
                <AdminIcon name="check" className="w-4 h-4 mr-2" /> Confirm & Create Booking
              </AdminButton>
            )}
          </div>
        </AdminCard>
      </div>
    </AdminPageTemplate>
  );
}
