'use client';

import React, { useState } from 'react';
import { useClient } from '@/lib/ClientContext';
import { Search, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface ScanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export default function ScanModal({ isOpen, onClose, onComplete }: ScanModalProps) {
    const { currentClient } = useClient();
    const [projectId, setProjectId] = useState(currentClient?.gcp_project_id || '');
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{ success: boolean; findingsCount?: number } | null>(null);

    const handleScan = async () => {
        if (!projectId.trim() || !currentClient) return;

        setIsScanning(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('/api/scan/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: currentClient.id,
                    projectId: projectId.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Scan failed');
            }

            setResult({ success: true, findingsCount: data.findingsCount });
            setTimeout(() => {
                onComplete();
                onClose();
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Scan failed');
        } finally {
            setIsScanning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-[var(--bg-primary)] rounded-xl shadow-xl w-full max-w-md p-6 m-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <Search className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Run Security Scan</h2>
                        <p className="text-sm text-[var(--text-muted)]">
                            Scan GCP resources for {currentClient?.name}
                        </p>
                    </div>
                </div>

                {!result && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">GCP Project ID *</label>
                            <input
                                type="text"
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                placeholder="e.g., my-gcp-project-123"
                                className="input w-full"
                                disabled={isScanning}
                            />
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                                Ensure you have GCP credentials configured (gcloud auth login)
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {isScanning && (
                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                                <p className="text-sm font-medium">Scanning GCP resources...</p>
                                <p className="text-xs text-[var(--text-muted)]">This may take a few minutes</p>
                            </div>
                        )}
                    </div>
                )}

                {result && (
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <p className="font-medium text-green-700 dark:text-green-400">Scan Complete!</p>
                        <p className="text-sm text-[var(--text-muted)]">
                            Found {result.findingsCount} security findings
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isScanning}
                        className="btn-secondary disabled:opacity-50"
                    >
                        {result ? 'Close' : 'Cancel'}
                    </button>
                    {!result && (
                        <button
                            onClick={handleScan}
                            disabled={!projectId.trim() || isScanning}
                            className="btn-primary disabled:opacity-50 flex items-center gap-2"
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Scanning...
                                </>
                            ) : (
                                'Start Scan'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
