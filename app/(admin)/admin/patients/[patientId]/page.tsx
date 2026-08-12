'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminCard } from '@/components/admin/primitives/AdminCard';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminButton } from '@/components/admin/primitives/AdminButton';
import { patientService } from '@/services';
import { PatientModel } from '@/domains/patient/model';
import { BookingModel } from '@/domains/booking/model';
import { ReportTaskModel } from '@/domains/reports/model';
import { CollectionTaskModel } from '@/domains/collections/model';
import { InvoiceModel } from '@/domains/invoice/model';
import { useToast } from '@/components/admin/feedback/Toast';

export default function PatientProfilePage() {
  const { patientId } = useParams() as { patientId: string };
  const router = useRouter();
  const { toast, error } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientModel | null>(null);
  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [reports, setReports] = useState<ReportTaskModel[]>([]);
  const [collections, setCollections] = useState<CollectionTaskModel[]>([]);
  const [invoices, setInvoices] = useState<InvoiceModel[]>([]);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<PatientModel>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const loadProfile = async () => {
      setLoading(true);
      const result = await patientService.getPatientProfileData(patientId);
      if (result.isSuccess && result.value) {
        setPatient(result.value.patient);
        setEditForm(result.value.patient);
        setBookings(result.value.bookings);
        setReports(result.value.reports);
        setCollections(result.value.collections);
        setInvoices(result.value.invoices || []);
      } else {
        error('Patient not found', 'The requested patient could not be loaded.');
      }
      setLoading(false);
    };
    loadProfile();
  }, [patientId, mounted, error]);

  if (!mounted) return null;

  if (loading) {
    return (
      <AdminPageTemplate title="Loading Patient...">
        <div className="flex items-center justify-center p-20 text-slate-500">Loading profile data...</div>
      </AdminPageTemplate>
    );
  }

  if (!patient) {
    return (
      <AdminPageTemplate title="Patient Not Found">
        <div className="p-10 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Patient not found</h2>
          <p className="text-slate-500 mb-6">The patient ID {patientId} does not exist or has been removed.</p>
          <AdminButton variant="primary" onClick={() => router.push('/admin/patients')}>Back to Patients</AdminButton>
        </div>
      </AdminPageTemplate>
    );
  }

  const handleSave = async () => {
    const result = await patientService.update(patient.id, editForm);
    if (result.isSuccess && result.value) {
      setPatient(result.value);
      setIsEditing(false);
      toast({ title: 'Profile Updated', description: 'Patient details have been saved successfully.', variant: 'success' });
    } else {
      error('Update Failed', 'Could not save patient details.');
    }
  };

  const handleCancel = () => {
    setEditForm(patient);
    setIsEditing(false);
  };

  return (
    <AdminPageTemplate
      title={patient.name}
      headerActions={
        <AdminButton variant="secondary" onClick={() => router.push('/admin/patients')}>
          Back to List
        </AdminButton>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <AdminCard title="Patient Profile" className="border border-slate-200 shadow-sm">
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{patient.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${patient.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                        {patient.status}
                      </span>
                    </div>
                  </div>
                  <AdminButton variant="secondary" size="sm" onClick={() => setIsEditing(true)}>Edit</AdminButton>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact</label>
                    <div className="text-[14px] font-medium text-slate-700 mt-1">{patient.phone}</div>
                    <div className="text-[13px] text-slate-500">{patient.email}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Age/Gender</label>
                      <div className="text-[14px] font-medium text-slate-700 mt-1">{patient.age} yrs • {patient.gender}</div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</label>
                      <div className="text-[14px] font-medium text-slate-700 mt-1">{patient.bloodGroup}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-[12px] font-semibold text-slate-700 block mb-1">Name</label>
                    <input 
                      type="text" 
                      className="w-full text-[13px] border border-slate-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                      value={editForm.name || ''} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-slate-700 block mb-1">Phone</label>
                    <input 
                      type="text" 
                      className="w-full text-[13px] border border-slate-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                      value={editForm.phone || ''} 
                      onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-slate-700 block mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full text-[13px] border border-slate-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                      value={editForm.email || ''} 
                      onChange={e => setEditForm({...editForm, email: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12px] font-semibold text-slate-700 block mb-1">Age</label>
                      <input 
                        type="number" 
                        className="w-full text-[13px] border border-slate-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                        value={editForm.age || ''} 
                        onChange={e => setEditForm({...editForm, age: parseInt(e.target.value) || 0})} 
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-slate-700 block mb-1">Gender</label>
                      <select 
                        className="w-full text-[13px] border border-slate-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                        value={editForm.gender || ''}
                        onChange={e => setEditForm({...editForm, gender: e.target.value})}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12px] font-semibold text-slate-700 block mb-1">Blood Group</label>
                      <input 
                        type="text" 
                        className="w-full text-[13px] border border-slate-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                        value={editForm.bloodGroup || ''} 
                        onChange={e => setEditForm({...editForm, bloodGroup: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-slate-700 block mb-1">Status</label>
                      <select 
                        className="w-full text-[13px] border border-slate-300 rounded px-3 py-1.5 outline-none focus:border-blue-500"
                        value={editForm.status || 'Active'}
                        onChange={e => setEditForm({...editForm, status: e.target.value as 'Active' | 'Inactive'})}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <AdminButton variant="primary" size="sm" onClick={handleSave} className="flex-1 justify-center">Save</AdminButton>
                  <AdminButton variant="secondary" size="sm" onClick={handleCancel} className="flex-1 justify-center">Cancel</AdminButton>
                </div>
              </div>
            )}
          </AdminCard>
        </div>
        
        {/* Right Column: History & Data */}
        <div className="lg:col-span-2 space-y-6">
          
          <AdminCard title="Booking History" className="border border-slate-200 shadow-sm">
            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Booking ID</th>
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Date</th>
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Type / Tests</th>
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Amount</th>
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="py-3 text-[13px] font-semibold text-slate-800">{booking.id}</td>
                        <td className="py-3 text-[13px] text-slate-600">{booking.createdAt}</td>
                        <td className="py-3">
                          <div className="text-[13px] font-medium text-slate-700">{booking.collection.type}</div>
                          <div className="text-[12px] text-slate-500 truncate max-w-[200px]">
                            {booking.items.map(i => i.name).join(', ')}
                          </div>
                        </td>
                        <td className="py-3 text-[13px] font-semibold text-slate-700">₹{booking.payment.total}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            booking.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-[14px]">No booking history found for this patient.</div>
            )}
          </AdminCard>

          <AdminCard title="Invoices & Payments" className="border border-slate-200 shadow-sm">
            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Invoice ID</th>
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Date</th>
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Booking ID</th>
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Amount</th>
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(invoice => (
                      <tr key={invoice.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="py-3 text-[13px] font-semibold text-slate-800">
                          <Link href={`/admin/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                            {invoice.id}
                          </Link>
                        </td>
                        <td className="py-3 text-[13px] text-slate-600">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 text-[13px] font-medium text-slate-700">{invoice.bookingId || 'N/A'}</td>
                        <td className="py-3 text-[13px] font-semibold text-slate-700">₹{invoice.total.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            invoice.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                            invoice.paymentStatus === 'Unpaid' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {invoice.paymentStatus}
                          </span>
                          {invoice.paymentStatus === 'Paid' && invoice.paidAt && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{new Date(invoice.paidAt).toLocaleDateString()}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-[14px]">No invoices found for this patient.</div>
            )}
          </AdminCard>


          <AdminCard title="Clinical Reports" className="border border-slate-200 shadow-sm">
            {reports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Report ID</th>
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Test</th>
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Time</th>
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Status</th>
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="py-3 text-[13px] font-semibold text-slate-800">{report.id}</td>
                        <td className="py-3 text-[13px] font-medium text-slate-700">{report.testType}</td>
                        <td className="py-3 text-[13px] text-slate-600">{report.time}</td>
                        <td className="py-3 text-[13px]">{report.status}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            report.priority === 'STAT' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {report.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-[14px]">No clinical reports found for this patient.</div>
            )}
          </AdminCard>

          <AdminCard title="Home Collections" className="border border-slate-200 shadow-sm">
            {collections.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Collection ID</th>
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Time</th>
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Address</th>
                      <th className="py-2 text-[12px] font-bold text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.map(coll => (
                      <tr key={coll.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="py-3 text-[13px] font-semibold text-slate-800">{coll.id}</td>
                        <td className="py-3 text-[13px] text-slate-600">{coll.time}</td>
                        <td className="py-3 text-[13px] text-slate-600 truncate max-w-[200px]">{coll.address}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                            {coll.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-[14px]">No home collections found for this patient.</div>
            )}
          </AdminCard>

        </div>
      </div>
    </AdminPageTemplate>
  );
}
