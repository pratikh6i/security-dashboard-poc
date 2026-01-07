'use client';

import React from 'react';
import Link from 'next/link';
import { useData } from '@/lib/DataContext';
import ThreatScore from '@/components/dashboard/ThreatScore';
import FindingsDonut from '@/components/dashboard/FindingsDonut';
import SeverityBars from '@/components/dashboard/SeverityBars';
import ServiceChart from '@/components/dashboard/ServiceChart';
import { Shield, AlertTriangle, CheckCircle, ArrowRight, Upload } from 'lucide-react';

export default function OverviewPage() {
  const { currentScan, isLoading } = useData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!currentScan) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Upload className="w-10 h-10 text-blue-500" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Scan Data Available</h2>
          <p className="text-[var(--text-muted)] max-w-md">
            Upload a security scan CSV to view your GCP security posture and findings.
          </p>
        </div>
        <Link href="/scans" className="btn-primary flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload Scan Results
        </Link>
      </div>
    );
  }

  const { summary } = currentScan;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold">{summary.total}</div>
            <div className="text-sm text-[var(--text-muted)]">Total Findings</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{summary.failed}</div>
            <div className="text-sm text-[var(--text-muted)]">Failed Checks</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">{summary.passed}</div>
            <div className="text-sm text-[var(--text-muted)]">Passed Checks</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-500">
              {summary.bySeverity.CRITICAL + summary.bySeverity.HIGH}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Critical/High</div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThreatScore score={summary.threatScore} />
        <FindingsDonut passed={summary.passed} failed={summary.failed} />
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SeverityBars bySeverity={summary.bySeverity} total={summary.total} />
        <ServiceChart byService={summary.byService} />
      </div>

      {/* Recent Critical Findings */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">Critical Findings</h3>
          <Link href="/findings?severity=CRITICAL" className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-2">
          {currentScan.findings
            .filter(f => f.finding_severity === 'CRITICAL' && f.status === 'FAIL')
            .slice(0, 5)
            .map((finding, i) => (
              <div key={finding.id || i} className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{finding.finding_category}</div>
                  <div className="text-xs text-[var(--text-muted)] truncate">
                    {finding.resource_name?.split('/').pop()}
                  </div>
                </div>
                <span className="text-xs text-red-500 font-medium">CRITICAL</span>
              </div>
            ))}

          {currentScan.findings.filter(f => f.finding_severity === 'CRITICAL').length === 0 && (
            <div className="text-center py-4 text-[var(--text-muted)]">
              No critical findings! 🎉
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
