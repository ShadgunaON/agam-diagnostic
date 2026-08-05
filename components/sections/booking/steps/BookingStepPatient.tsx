"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

export interface BookingStepPatientProps {
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
  setShowAddFamilyModal: (show: boolean) => void;
}

export function BookingStepPatient({
  selectedPatientId,
  setSelectedPatientId,
  setShowAddFamilyModal
}: BookingStepPatientProps) {
  const { user } = useAuth();

  return (
    <Card className="relative">
      <Card.Header className="flex flex-row items-center justify-between border-b border-border/60 pb-4 mb-2">
        <Card.Title className="m-0 tracking-tight">Patient Profile</Card.Title>
        <button
          type="button"
          className="text-xs font-bold text-primary hover:underline border-none bg-transparent cursor-pointer"
          onClick={() => setShowAddFamilyModal(true)}
        >
          + Add Family Member
        </button>
      </Card.Header>

      <Card.Content>
        <div className="space-y-2">
          {user?.savedPatients && user.savedPatients.length > 0 ? (
            user.savedPatients.map((patient) => (
              <label 
                key={patient.id}
                className={`booking-option-row ${selectedPatientId === patient.id ? 'is-selected' : ''}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="patient_select"
                      checked={selectedPatientId === patient.id}
                      onChange={() => setSelectedPatientId(patient.id)}
                      className="w-4 h-4 shrink-0 accent-primary cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-foreground leading-none mb-0">{patient.name}</p>
                        <span className="text-xs font-semibold bg-bg-alt px-1.5 py-0.5 rounded text-muted-foreground uppercase tracking-wide">{patient.relation}</span>
                      </div>
                      <span className="text-xs text-muted-foreground leading-none">{patient.gender} • {patient.age} yrs</span>
                    </div>
                  </div>
                  {selectedPatientId === patient.id && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-primary shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </div>
              </label>
            ))
          ) : (
            <label 
              className={`booking-option-row ${selectedPatientId === 'myself' ? 'is-selected' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="patient_select"
                    checked={selectedPatientId === 'myself'}
                    onChange={() => setSelectedPatientId('myself')}
                    className="w-4 h-4 shrink-0 accent-primary cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-foreground leading-none mb-0">{user?.fullName || 'John Doe'}</p>
                      <span className="text-xs font-semibold bg-bg-alt px-1.5 py-0.5 rounded text-muted-foreground uppercase tracking-wide">Myself</span>
                    </div>
                  </div>
                </div>
                {selectedPatientId === 'myself' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-primary shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </div>
            </label>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}
