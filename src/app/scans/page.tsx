'use client';

import React, { useState, useCallback } from 'react';
import { useData } from '@/lib/DataContext';
import { Finding } from '@/types';
import Papa from 'papaparse';
import {
    Upload,
    FileText,
    Trash2,
    Download,
    Calendar,
    Shield,
    AlertTriangle,
    CheckCircle,
    Terminal,
    Copy,
} from 'lucide-react';

export default function ScansPage() {
    const { scans, uploadFindings, deleteScan, selectScan, currentScan } = useData();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scanName, setScanName] = useState('');

    const processFile = useCallback((file: File) => {
        setIsUploading(true);
        setError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const findings: Finding[] = (results.data as Record<string, string>[]).map((row, i) => ({
                        id: `finding-${i}`,
                        finding_name: row.finding_name || row['Finding Name'] || '',
                        finding_category: row.finding_category || row['Category'] || row['Finding Category'] || '',
                        finding_severity: (row.finding_severity || row['Severity'] || 'INFO').toUpperCase() as Finding['finding_severity'],
                        finding_state: (row.finding_state || row['State'] || 'ACTIVE').toUpperCase() as Finding['finding_state'],
                        finding_class: row.finding_class || row['Finding Class'] || 'MISCONFIGURATION',
                        status: row.finding_state === 'INACTIVE' ? 'PASS' : 'FAIL' as Finding['status'],
                        resource_name: row.resource_name || row['Resource Name'] || '',
                        resource_type: row.resource_type || row['Resource Type'] || '',
                        resource_project: row.resource_project || row['Project'] || '',
                        resource_location: row.resource_location || row['Location'] || '',
                        finding_description: row.finding_description || row['Description'] || '',
                        remediation: row.remediation || row['Remediation'] || '',
                        compliance: row.compliance || row['Compliance'] || '',
                        scan_time: row.scan_time || row['Scan Time'] || new Date().toISOString(),
                    }));

                    if (findings.length === 0) {
                        setError('No valid findings found in CSV');
                        setIsUploading(false);
                        return;
                    }

                    const name = scanName || file.name.replace('.csv', '') || `Scan ${new Date().toLocaleString()}`;
                    uploadFindings(findings, name);
                    setScanName('');
                    setIsUploading(false);
                } catch (e) {
                    setError('Failed to parse CSV file');
                    setIsUploading(false);
                }
            },
            error: () => {
                setError('Failed to read file');
                setIsUploading(false);
            },
        });
    }, [uploadFindings, scanName]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            processFile(file);
        } else {
            setError('Please upload a CSV file');
        }
    }, [processFile]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
        e.target.value = '';
    }, [processFile]);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Upload Section */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Upload Scan Results</h2>

                {/* Run Scanner Script - Always Visible */}
                <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <Terminal className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Run Scanner to Generate CSV</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                Run this command in your terminal to scan your GCP project:
                            </p>
                            <div className="relative">
                                <code className="block text-sm bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded-lg font-mono overflow-x-auto">
                                    python gcp_security_scanner.py --project YOUR_PROJECT_ID --output findings.csv
                                </code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText('python gcp_security_scanner.py --project YOUR_PROJECT_ID --output findings.csv');
                                        alert('Command copied to clipboard!');
                                    }}
                                    className="absolute top-2 right-2 p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
                                    title="Copy command"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 mt-3">
                                <a
                                    href="https://github.com/pratikh6i/security-dashboard-poc/blob/main/gcp_security_scanner.py"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Scanner Script
                                </a>
                                <span className="text-sm text-blue-600 dark:text-blue-400">|</span>
                                <a
                                    href="https://github.com/pratikh6i/security-dashboard-poc#readme"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    View Documentation
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Scan Name (optional)</label>
                    <input
                        type="text"
                        value={scanName}
                        onChange={e => setScanName(e.target.value)}
                        placeholder="e.g., Production Environment Scan"
                        className="input w-full max-w-md"
                    />
                </div>

                <div
                    className={`border-2 border-dashed rounded-xl p-8 transition-colors ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-[var(--border-color)] hover:border-blue-400'
                        }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-[var(--text-muted)]'}`} />
                        </div>
                        <div className="text-center">
                            <p className="font-medium">
                                {isUploading ? 'Processing...' : 'Drag and drop your CSV file here'}
                            </p>
                            <p className="text-sm text-[var(--text-muted)] mt-1">
                                or click to browse
                            </p>
                        </div>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileInput}
                            className="hidden"
                            id="csv-upload"
                            disabled={isUploading}
                        />
                        <label
                            htmlFor="csv-upload"
                            className={`btn-primary cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Select CSV File
                        </label>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="mt-4 text-sm text-[var(--text-muted)]">
                    <p className="font-medium mb-1">Expected CSV columns:</p>
                    <code className="text-xs bg-[var(--bg-tertiary)] p-2 rounded block">
                        finding_category, finding_severity, resource_name, resource_type, resource_project, resource_location, finding_description, remediation
                    </code>
                </div>
            </div>

            {/* Scan History */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Scan History</h2>

                {scans.length === 0 ? (
                    <div className="text-center py-8 text-[var(--text-muted)]">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No scans uploaded yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {scans.map(scan => (
                            <div
                                key={scan.id}
                                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${currentScan?.id === scan.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]'
                                    }`}
                                onClick={() => selectScan(scan.id)}
                            >
                                <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center">
                                    <Shield className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{scan.name}</div>
                                    <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(scan.timestamp).toLocaleString()}
                                        </span>
                                        <span>{scan.summary.total} findings</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="flex items-center gap-1 text-red-500">
                                            <AlertTriangle className="w-4 h-4" />
                                            {scan.summary.failed}
                                        </span>
                                        <span className="flex items-center gap-1 text-green-500">
                                            <CheckCircle className="w-4 h-4" />
                                            {scan.summary.passed}
                                        </span>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Delete this scan?')) {
                                                deleteScan(scan.id);
                                            }
                                        }}
                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
