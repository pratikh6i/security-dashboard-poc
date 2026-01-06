'use client';

import React, { useState, useMemo } from 'react';
import { Shield, Upload, RefreshCw } from 'lucide-react';
import CSVUploader from '@/components/CSVUploader';
import KPICards from '@/components/KPICards';
import SecurityCharts from '@/components/SecurityCharts';
import IssuesList from '@/components/IssuesList';
import DataTable from '@/components/DataTable';
import { ResourceData } from '@/types';
import { analyzeSecurityData } from '@/lib/securityAnalyzer';

export default function Home() {
  const [data, setData] = useState<ResourceData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const metrics = useMemo(() => {
    if (data.length === 0) return null;
    return analyzeSecurityData(data);
  }, [data]);

  const handleDataLoaded = (newData: ResourceData[]) => {
    setData(newData);
    setIsLoaded(true);
  };

  const handleReset = () => {
    setData([]);
    setIsLoaded(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  GCP Security Dashboard
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Cloud Security Posture Overview
                </p>
              </div>
            </div>

            {isLoaded && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Load New File
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isLoaded ? (
          /* Upload View */
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-500/30 mb-6">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Upload Your Security Scan
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md">
                Import your GCP Compute Kundli CSV file to analyze your cloud security posture
              </p>
            </div>

            <CSVUploader onDataLoaded={handleDataLoaded} />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
              {[
                { title: 'Security Analysis', desc: 'Identify misconfigurations and risks' },
                { title: 'Visual Insights', desc: 'Charts and metrics at a glance' },
                { title: 'Export Reports', desc: 'Download filtered data as CSV' }
              ].map((feature, i) => (
                <div key={i} className="text-center p-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 mx-auto mb-3 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : metrics && (
          /* Dashboard View */
          <div className="space-y-6">
            {/* KPI Cards */}
            <KPICards metrics={metrics} />

            {/* Charts */}
            <SecurityCharts metrics={metrics} />

            {/* Issues List */}
            <IssuesList issues={metrics.issues} />

            {/* Data Table */}
            <DataTable data={data} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            GCP Security Dashboard • Built for organizations who need visibility without SCC
          </p>
        </div>
      </footer>
    </main>
  );
}
