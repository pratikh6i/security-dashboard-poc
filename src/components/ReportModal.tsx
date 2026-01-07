'use client';

import React, { useState } from 'react';
import { useClient } from '@/lib/ClientContext';
import { FileText, Loader2, Download, Calendar, AlertCircle } from 'lucide-react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
    const { currentClient } = useClient();
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(thirtyDaysAgo);
    const [endDate, setEndDate] = useState(today);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!currentClient) return;

        setIsGenerating(true);
        setError('');

        try {
            const response = await fetch('/api/reports/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: currentClient.id,
                    startDate,
                    endDate,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Report generation failed');
            }

            // Download PDF
            const link = document.createElement('a');
            link.href = data.pdf;
            link.download = data.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Report generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-[var(--bg-primary)] rounded-xl shadow-xl w-full max-w-md p-6 m-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Generate Report</h2>
                        <p className="text-sm text-[var(--text-muted)]">
                            Create PDF report for {currentClient?.name}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                max={endDate}
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                max={today}
                                className="input w-full"
                            />
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-sm">
                        <p className="font-medium mb-1">Report includes:</p>
                        <ul className="text-[var(--text-muted)] space-y-1">
                            <li>• Executive summary with metrics</li>
                            <li>• Detailed findings breakdown</li>
                            <li>• Severity distribution</li>
                            <li>• Remediation recommendations</li>
                        </ul>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isGenerating}
                        className="btn-secondary disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="btn-primary disabled:opacity-50 flex items-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Generate PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
