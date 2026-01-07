'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useClient } from '@/lib/ClientContext';
import ThreatScore from '@/components/dashboard/ThreatScore';
import FindingsDonut from '@/components/dashboard/FindingsDonut';
import SeverityBars from '@/components/dashboard/SeverityBars';
import ServiceChart from '@/components/dashboard/ServiceChart';
import ScanModal from '@/components/ScanModal';
import ReportModal from '@/components/ReportModal';
import {
  Shield, AlertTriangle, CheckCircle, ArrowRight, Upload,
  Search, FileText, Calendar, TrendingUp, Building2
} from 'lucide-react';

interface Upload {
  id: number;
  name: string;
  type: string;
  timestamp: string;
  total_findings: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  passed_count: number;
  failed_count: number;
}

interface Stats {
  total_uploads: number;
  total_findings: number;
  total_critical: number;
  total_high: number;
  total_medium: number;
  total_low: number;
  total_passed: number;
  total_failed: number;
}

export default function DashboardPage() {
  const { currentClient, clients } = useClient();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchData = async () => {
    if (!currentClient) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/uploads?clientId=${currentClient.id}`);
      if (response.ok) {
        const data = await response.json();
        setUploads(data.uploads || []);

        // Calculate stats
        const totalStats: Stats = {
          total_uploads: data.uploads?.length || 0,
          total_findings: 0,
          total_critical: 0,
          total_high: 0,
          total_medium: 0,
          total_low: 0,
          total_passed: 0,
          total_failed: 0,
        };

        data.uploads?.forEach((u: Upload) => {
          totalStats.total_findings += u.total_findings || 0;
          totalStats.total_critical += u.critical_count || 0;
          totalStats.total_high += u.high_count || 0;
          totalStats.total_medium += u.medium_count || 0;
          totalStats.total_low += u.low_count || 0;
          totalStats.total_passed += u.passed_count || 0;
          totalStats.total_failed += u.failed_count || 0;
        });

        setStats(totalStats);
      }
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [currentClient]);

  // No client selected
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Building2 className="w-10 h-10 text-blue-500" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Welcome to CloudGuard SIEM</h2>
          <p className="text-[var(--text-muted)] max-w-md">
            Create your first client profile to start managing security assessments.
          </p>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          Use the "Add Client" button in the header above.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const threatScore = stats && stats.total_findings > 0
    ? Math.round((stats.total_failed / stats.total_findings) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowScanModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
        >
          <Search className="w-4 h-4" />
          Run Scan
        </button>
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Generate Report
        </button>
        <Link
          href="/scans"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload CSV
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats?.total_uploads || 0}</div>
            <div className="text-sm text-[var(--text-muted)]">Total Scans</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats?.total_findings || 0}</div>
            <div className="text-sm text-[var(--text-muted)]">Total Findings</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">
              {(stats?.total_critical || 0) + (stats?.total_high || 0)}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Critical/High</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">{stats?.total_passed || 0}</div>
            <div className="text-sm text-[var(--text-muted)]">Passed Checks</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      {stats && stats.total_findings > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ThreatScore score={threatScore} />
            <FindingsDonut passed={stats.total_passed} failed={stats.total_failed} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SeverityBars
              bySeverity={{
                CRITICAL: stats.total_critical,
                HIGH: stats.total_high,
                MEDIUM: stats.total_medium,
                LOW: stats.total_low,
                INFO: 0,
              }}
              total={stats.total_findings}
            />
            <div className="card p-6">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Scan Timeline</h3>
              <div className="h-48 flex items-center justify-center text-[var(--text-muted)]">
                <TrendingUp className="w-8 h-8 mr-2" />
                {uploads.length} scans in history
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card p-12 text-center">
          <Upload className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Scan Data Yet</h3>
          <p className="text-[var(--text-muted)] mb-4">
            Run a scan or upload findings CSV to see security metrics for {currentClient?.name}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowScanModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Run Scan
            </button>
            <Link href="/scans" className="btn-secondary flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload CSV
            </Link>
          </div>
        </div>
      )}

      {/* Recent Uploads */}
      {uploads.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--text-secondary)]">Recent Uploads</h3>
            <Link href="/scans" className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-header">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Findings</th>
                  <th className="p-3 text-left">Critical</th>
                  <th className="p-3 text-left">High</th>
                </tr>
              </thead>
              <tbody>
                {uploads.slice(0, 5).map(upload => (
                  <tr key={upload.id} className="table-row">
                    <td className="p-3 font-medium">{upload.name}</td>
                    <td className="p-3">
                      <span className={`badge ${upload.type === 'scan' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {upload.type}
                      </span>
                    </td>
                    <td className="p-3 text-[var(--text-muted)]">
                      {new Date(upload.timestamp).toLocaleDateString()}
                    </td>
                    <td className="p-3">{upload.total_findings}</td>
                    <td className="p-3 text-red-500">{upload.critical_count}</td>
                    <td className="p-3 text-orange-500">{upload.high_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <ScanModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        onComplete={fetchData}
      />
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}
