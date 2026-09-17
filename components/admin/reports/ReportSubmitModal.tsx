'use client';

import React, { useState, useRef } from 'react';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { reportsService } from '@/services';

interface ReportSubmitModalProps {
  report: {
    id: string;
    bookingId?: string;
    testType: string;
    patientId?: string;
    patient: { name: string; id: string };
  };
  onClose: () => void;
  onSuccess: () => void;
}

type UploadStep = 'idle' | 'uploading' | 'submitting' | 'done' | 'error';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_CONTENT_TYPE = 'application/pdf';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReportSubmitModal({ report, onClose, onSuccess }: ReportSubmitModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [step, setStep] = useState<UploadStep>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getToken = () =>
    typeof window !== 'undefined'
      ? sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || ''
      : '';

  const validateFile = (file: File): string | null => {
    if (file.type !== ALLOWED_CONTENT_TYPE) return 'Only PDF files are allowed.';
    if (file.size > MAX_FILE_SIZE_BYTES) return `File size must not exceed 10 MB (selected: ${formatBytes(file.size)}).`;
    return null;
  };

  const handleFileSelected = (file: File) => {
    const err = validateFile(file);
    if (err) {
      setErrorMessage(err);
      setSelectedFile(null);
    } else {
      setErrorMessage(null);
      setSelectedFile(file);
    }
  };

  // ── Upload Flow ─────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setStep('uploading');
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      const token = getToken();

      // Step 1 — Initiate presigned upload
      const initiateRes = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: `mutation InitiateReportUpload($input: String!) {
            initiateDocumentUpload(input: $input) {
              id
              uploadUrl
            }
          }`,
          variables: {
            input: JSON.stringify({
              entityType: 'REPORT',
              entityId: report.id,
              patientId: report.patientId || report.patient.id,
              bookingId: report.bookingId || null,
              fileName: selectedFile.name,
              contentType: ALLOWED_CONTENT_TYPE,
              fileSize: selectedFile.size,
            }),
          },
        }),
      });

      const initiateJson = await initiateRes.json();
      if (initiateJson.errors?.length) {
        throw new Error(initiateJson.errors[0]?.message || 'Failed to initiate upload');
      }

      const { id: documentId, uploadUrl } = initiateJson.data.initiateDocumentUpload;

      // Step 2 — PUT directly to S3 (browser → S3, no Lambda involved)
      setUploadProgress(10);
      const s3Res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': ALLOWED_CONTENT_TYPE },
        body: selectedFile,
      });
      if (!s3Res.ok) throw new Error(`S3 upload failed (HTTP ${s3Res.status})`);
      setUploadProgress(80);

      // Step 3 — Complete upload (mark DOCUMENT as UPLOADED)
      const completeRes = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: `mutation CompleteReportUpload($id: ID!) {
            completeDocumentUpload(id: $id) {
              id
            }
          }`,
          variables: { id: documentId },
        }),
      });

      const completeJson = await completeRes.json();
      if (completeJson.errors?.length) {
        throw new Error(completeJson.errors[0]?.message || 'Failed to complete upload');
      }
      setUploadProgress(90);

      // Step 4 — Submit report (links documentId, sets status = Submitted)
      setStep('submitting');
      const submitRes = await reportsService.submitReport(report.id, documentId);
      if (!submitRes.isSuccess) {
        throw new Error(submitRes.error?.message || 'Failed to submit report');
      }

      setUploadProgress(100);
      setStep('done');
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.');
      setStep('error');
    }
  };

  const isWorking = step === 'uploading' || step === 'submitting';

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !isWorking) onClose(); }}
    >
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '24px 24px 20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Submit Report
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              Upload the laboratory-produced PDF report.
            </p>
          </div>
          {!isWorking && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8' }}
              aria-label="Close"
            >
              <AdminIcon name="x" style={{ width: '20px', height: '20px' }} />
            </button>
          )}
        </div>

        {/* Booking Context */}
        <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Booking</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>{report.bookingId || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{report.patient.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Test / Package</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{report.testType}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>

          {step === 'done' ? (
            /* Success State */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px auto',
              }}>
                <AdminIcon name="check" style={{ width: '28px', height: '28px', color: '#10b981' }} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Report Submitted
              </h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                The report has been uploaded and is now awaiting publication.
              </p>
              <button
                onClick={() => { onSuccess(); onClose(); }}
                style={{
                  padding: '10px 28px', backgroundColor: '#10b981', color: '#ffffff',
                  border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* File Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileSelected(file);
                }}
                onClick={() => !isWorking && fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragOver ? '#3b82f6' : selectedFile ? '#10b981' : '#cbd5e1'}`,
                  borderRadius: '12px',
                  padding: '32px 16px',
                  textAlign: 'center',
                  cursor: isWorking ? 'not-allowed' : 'pointer',
                  backgroundColor: isDragOver ? '#eff6ff' : selectedFile ? '#f0fdf4' : '#f8fafc',
                  transition: 'all 0.2s',
                  marginBottom: '16px',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelected(file);
                    e.target.value = '';
                  }}
                  disabled={isWorking}
                />

                {selectedFile ? (
                  <>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📄</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                      {selectedFile.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                      {formatBytes(selectedFile.size)}
                    </div>
                    {!isWorking && (
                      <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600, marginTop: '8px' }}>
                        Click to change file
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <AdminIcon name="file" style={{ width: '32px', height: '32px', color: '#94a3b8', marginBottom: '12px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                      Drop PDF here or click to browse
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                      PDF only · Maximum 10 MB
                    </div>
                  </>
                )}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#dc2626',
                  marginBottom: '16px',
                }}>
                  {errorMessage}
                </div>
              )}

              {/* Upload Progress */}
              {isWorking && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                      {step === 'submitting' ? 'Finalising submission...' : 'Uploading to secure storage...'}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#3b82f6' }}>{uploadProgress}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${uploadProgress}%`,
                      backgroundColor: '#3b82f6',
                      borderRadius: '99px',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={onClose}
                  disabled={isWorking}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: isWorking ? 'not-allowed' : 'pointer',
                    opacity: isWorking ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedFile || isWorking}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: !selectedFile || isWorking ? '#cbd5e1' : '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: !selectedFile || isWorking ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {isWorking ? 'Uploading...' : 'Upload & Submit'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
