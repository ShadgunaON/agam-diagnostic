"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/common';
import { reportsService } from '@/services';
import { ReportTaskModel } from '@/domains/reports/model';
import { Button } from '@/components/ui';

export default function ReportsPage() {
  const { isAuthenticated, user } = useAuth();
  
  const [reports, setReports] = useState<ReportTaskModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const fetchReports = async () => {
      try {
        const result = await reportsService.getAllTasks();
        if (result.isSuccess) {
          const familyIds = user.savedPatients.map(p => p.id);
          const validIds = [user.id, ...familyIds];
          
          const userReports = result.value.filter(r => 
            validIds.includes(r.patientId || '') || 
            validIds.includes(r.patient.id)
          );
          
          setReports(userReports);
        }
      } catch (error) {
        console.error("Failed to load reports", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReports();
  }, [isAuthenticated, user]);

  return (
    <AuthGuard>
      <div className="container" style={{ paddingTop: 'var(--sp-10)', paddingBottom: 'var(--sp-10)' }}>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-1">My Reports</h1>
          <p className="text-sm text-muted-foreground">
            {isAuthenticated
              ? `View and download certified lab results for you and your family.`
              : 'Log in to view your reports.'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-primary font-semibold">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-10 md:p-16 text-center shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-bg-alt rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-muted-foreground/50">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No Reports Available</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
              Your test reports will appear here once they are published by our diagnostic team.
            </p>
            <div className="flex justify-center">
              <Button href="/tests" variant="primary" size="sm">Book a Test</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold bg-bg-alt text-muted-foreground px-2 py-1 rounded-md tracking-wider uppercase">{report.id}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md tracking-wider uppercase ${report.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {report.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{report.testType}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Patient: <strong className="text-foreground">{report.patient.name}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Generated: {report.time}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[140px]">
                  {report.status === 'Published' ? (
                    <button className="w-full text-center py-2 px-4 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition-colors">
                      Download PDF
                    </button>
                  ) : (
                    <button disabled className="w-full text-center py-2 px-4 bg-bg-alt text-muted-foreground text-sm font-bold rounded-full cursor-not-allowed">
                      Pending
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
