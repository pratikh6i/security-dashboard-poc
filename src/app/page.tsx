'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Upload, ChevronDown, Download, Github, History, Plus, Trash2, X } from 'lucide-react';
import CSVUploader from '@/components/CSVUploader';
import QuickFilters from '@/components/QuickFilters';
import FindingsTable from '@/components/FindingsTable';
import ThemeToggle from '@/components/ThemeToggle';
import { Finding } from '@/types';
import { saveScan, getAllScans, getCurrentScan, setCurrentScan, deleteScan, StoredScan } from '@/lib/dataStore';

const SCANNER_URL = 'https://github.com/pratikh6i/security-dashboard-poc/blob/main/gcp_security_scanner.py';

export default function Home() {
  const [currentScanData, setCurrentScanData] = useState<StoredScan | null>(null);
  const [scans, setScans] = useState<StoredScan[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [showScanHistory, setShowScanHistory] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [mounted, setMounted] = useState(false);

  // Load stored scans on mount
  useEffect(() => {
    const storedScans = getAllScans();
    setScans(storedScans);

    const current = getCurrentScan();
    if (current) {
      setCurrentScanData(current);
    }
    setMounted(true);
  }, []);

  const handleDataLoaded = (findings: Finding[]) => {
    const newScan = saveScan(findings);
    setScans(getAllScans());
    setCurrentScanData(newScan);
    setShowUploader(false);
    setSelectedFilters({});
  };

  const handleScanSelect = (scanId: string) => {
    const scan = scans.find(s => s.id === scanId);
    if (scan) {
      setCurrentScan(scanId);
      setCurrentScanData(scan);
      setSelectedFilters({});
    }
    setShowScanHistory(false);
  };

  const handleDeleteScan = (scanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteScan(scanId);
    const updatedScans = getAllScans();
    setScans(updatedScans);

    if (currentScanData?.id === scanId) {
      setCurrentScanData(updatedScans[0] || null);
    }
  };

  const formatScanTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-600">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Security Dashboard
                </span>
              </div>

              {/* Scan selector */}
              {currentScanData && (
                <div className="relative">
                  <button
                    onClick={() => setShowScanHistory(!showScanHistory)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <History className="w-4 h-4" />
                    <span className="max-w-[200px] truncate">{currentScanData.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showScanHistory && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowScanHistory(false)}
                      />
                      <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Scan History</span>
                          <button
                            onClick={() => { setShowUploader(true); setShowScanHistory(false); }}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            New Scan
                          </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {scans.map(scan => (
                            <div
                              key={scan.id}
                              onClick={() => handleScanSelect(scan.id)}
                              className={`px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between ${scan.id === currentScanData?.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                            >
                              <div>
                                <p className={`text-sm ${scan.id === currentScanData?.id ? 'text-blue-600 font-medium' : 'text-gray-900 dark:text-white'}`}>
                                  {scan.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatScanTime(scan.timestamp)} • {scan.findingsCount} findings
                                </p>
                              </div>
                              <button
                                onClick={(e) => handleDeleteScan(scan.id, e)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={SCANNER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Scanner</span>
              </a>

              <button
                onClick={() => setShowUploader(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload</span>
              </button>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {currentScanData ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Quick Filters Sidebar */}
          <QuickFilters
            findings={currentScanData.findings}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
          />

          {/* Findings Table */}
          <FindingsTable
            findings={currentScanData.findings}
            selectedFilters={selectedFilters}
          />
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/25 mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              GCP Security Dashboard
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Upload your security scan CSV to analyze findings across your GCP infrastructure.
              Supports SCC export format and scanner output.
            </p>

            <button
              onClick={() => setShowUploader(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/25"
            >
              <Upload className="w-5 h-5" />
              Upload Scan Results
            </button>

            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Don&apos;t have scan results yet?
              </p>
              <a
                href={SCANNER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Github className="w-4 h-4" />
                Download the Python Scanner
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upload Security Scan
              </h3>
              <button
                onClick={() => setShowUploader(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <CSVUploader onDataLoaded={handleDataLoaded} />
          </div>
        </div>
      )}
    </main>
  );
}
