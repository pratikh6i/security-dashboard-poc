'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useClient } from '@/lib/ClientContext';
import Papa from 'papaparse';
import {
    Upload,
    FileText,
    Trash2,
    Calendar,
    Shield,
    AlertTriangle,
    CheckCircle,
    Eye,
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

interface Finding {
    id: string;
    finding_name: string;
    finding_category: string;
    finding_severity: string;
    finding_state: string;
    resource_name: string;
    resource_type: string;
    resource_project: string;
    resource_location: string;
    finding_description: string;
    remediation: string;
}

export default function ScansPage() {
    const { currentClient } = useClient();
    const [uploads, setUploads] = useState<Upload[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scanName, setScanName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchUploads = useCallback(async () => {
        if (!currentClient) return;

        try {
            const response = await fetch(`/api/uploads?clientId=${currentClient.id}`);
            if (response.ok) {
                const data = await response.json();
                setUploads(data.uploads || []);
            }
        } catch (error) {
            console.error('Failed to fetch uploads:', error);
        }
        setIsLoading(false);
    }, [currentClient]);

    useEffect(() => {
        setIsLoading(true);
        fetchUploads();
    }, [fetchUploads]);

    const processFile = useCallback(async (file: File) => {
        if (!currentClient) {
            setError('Please select a client first');
            return;
        }

        setIsUploading(true);
        setError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const findings: Finding[] = (results.data as Record<string, string>[]).map((row, i) => ({
                        id: `finding-${i}`,
                        finding_name: row.finding_name || row['Finding Name'] || '',
                        finding_category: row.finding_category || row['Category'] || row['Finding Category'] || '',
                        finding_severity: (row.finding_severity || row['Severity'] || 'INFO').toUpperCase(),
                        finding_state: (row.finding_state || row['State'] || 'ACTIVE').toUpperCase(),
                        resource_name: row.resource_name || row['Resource Name'] || '',
                        resource_type: row.resource_type || row['Resource Type'] || '',
                        resource_project: row.resource_project || row['Project'] || '',
                        resource_location: row.resource_location || row['Location'] || '',
                        finding_description: row.finding_description || row['Description'] || '',
                        remediation: row.remediation || row['Remediation'] || '',
                    }));

                    if (findings.length === 0) {
                        setError('No valid findings found in CSV');
                        setIsUploading(false);
                        return;
                    }

                    const name = scanName || file.name.replace('.csv', '') || `Upload ${new Date().toLocaleString()}`;

                    const response = await fetch('/api/uploads', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            clientId: currentClient.id,
                            name,
                            type: 'manual',
                            findings,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to save upload');
                    }

                    setScanName('');
                    await fetchUploads();
                } catch (e) {
                    setError('Failed to process CSV file');
                } finally {
                    setIsUploading(false);
                }
            },
            error: () => {
                setError('Failed to read file');
                setIsUploading(false);
            },
        });
    }, [currentClient, scanName, fetchUploads]);

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

    const handleDelete = async (uploadId: number) => {
        if (!confirm('Delete this upload?')) return;

        try {
            await fetch(`/api/uploads/${uploadId}?clientId=${currentClient?.id}`, {
                method: 'DELETE',
            });
            await fetchUploads();
        } catch (error) {
            console.error('Failed to delete upload:', error);
        }
    };

    if (!currentClient) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Shield className="w-12 h-12 text-[var(--text-muted)]" />
                <p className="text-[var(--text-muted)]">Select a client to manage uploads</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Upload Section */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Upload Scan Results</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Upload Name (optional)</label>
                    <input
                        type="text"
                        value={scanName}
                        onChange={e => setScanName(e.target.value)}
                        placeholder="e.g., Q1 2026 Security Audit"
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
                                CSV will be saved for {currentClient.name}
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
            </div>

            {/* Upload History */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Upload History</h2>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                ) : uploads.length === 0 ? (
                    <div className="text-center py-8 text-[var(--text-muted)]">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No uploads yet for {currentClient.name}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {uploads.map(upload => (
                            <div
                                key={upload.id}
                                className="flex items-center gap-4 p-4 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center">
                                    <Shield className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{upload.name}</div>
                                    <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(upload.timestamp).toLocaleString()}
                                        </span>
                                        <span className={`badge ${upload.type === 'scan' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {upload.type}
                                        </span>
                                        <span>{upload.total_findings} findings</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="flex items-center gap-1 text-red-500">
                                            <AlertTriangle className="w-4 h-4" />
                                            {upload.critical_count}
                                        </span>
                                        <span className="flex items-center gap-1 text-orange-500">
                                            {upload.high_count}
                                        </span>
                                        <span className="flex items-center gap-1 text-green-500">
                                            <CheckCircle className="w-4 h-4" />
                                            {upload.passed_count}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(upload.id)}
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
