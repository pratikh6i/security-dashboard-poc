'use client';

import React, { useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { parseCSV, validateCSVData } from '@/lib/csvParser';
import { Finding, CSVParseResult, ParseError } from '@/types';

interface CSVUploaderProps {
    onDataLoaded: (data: Finding[]) => void;
}

export default function CSVUploader({ onDataLoaded }: CSVUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [warnings, setWarnings] = useState<ParseError[]>([]);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFile = useCallback(async (file: File) => {
        // Validate file type
        if (!file.name.endsWith('.csv')) {
            setError('Please upload a CSV file');
            return;
        }

        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            setError('File size exceeds 50MB limit');
            return;
        }

        setIsLoading(true);
        setError(null);
        setWarnings([]);
        setFileName(file.name);

        try {
            const result: CSVParseResult = await parseCSV(file);
            const validationErrors = validateCSVData(result.data);

            // Check for critical errors
            const criticalErrors = [...result.errors, ...validationErrors].filter(
                e => e.type === 'error'
            );

            if (criticalErrors.length > 0) {
                setError(criticalErrors[0].message);
                setIsLoading(false);
                return;
            }

            // Collect warnings
            const allWarnings = [...result.errors, ...validationErrors].filter(
                e => e.type === 'warning'
            );
            setWarnings(allWarnings);

            // Check if we have any data
            if (result.data.length === 0) {
                setError('No valid data found in CSV file');
                setIsLoading(false);
                return;
            }

            onDataLoaded(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
        } finally {
            setIsLoading(false);
        }
    }, [onDataLoaded]);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const clearError = () => {
        setError(null);
        setWarnings([]);
        setFileName(null);
    };

    return (
        <div className="w-full max-w-xl">
            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative p-8 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer
          ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                    }
          ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
        `}
            >
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading}
                />

                <div className="flex flex-col items-center text-center">
                    {isLoading ? (
                        <>
                            <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Processing {fileName}...
                            </p>
                        </>
                    ) : error ? (
                        <>
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
                            <button
                                onClick={(e) => { e.stopPropagation(); clearError(); }}
                                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                            >
                                <X className="w-3 h-3" /> Try again
                            </button>
                        </>
                    ) : (
                        <>
                            <div className={`
                w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors
                ${isDragging
                                    ? 'bg-blue-100 dark:bg-blue-900/30'
                                    : 'bg-gray-100 dark:bg-gray-800'
                                }
              `}>
                                <Upload className={`w-6 h-6 ${isDragging ? 'text-blue-600' : 'text-gray-500'}`} />
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                Drop your CSV file here
                            </p>
                            <p className="text-xs text-gray-500">
                                or click to browse (SCC format or scanner output)
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Warnings */}
            {warnings.length > 0 && !error && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                {warnings.length} warning{warnings.length > 1 ? 's' : ''} detected
                            </p>
                            <ul className="mt-1 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                                {warnings.slice(0, 3).map((w, i) => (
                                    <li key={i}>• {w.message}</li>
                                ))}
                                {warnings.length > 3 && (
                                    <li>...and {warnings.length - 3} more</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Supported format hint */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                <FileText className="w-4 h-4" />
                <span>Supports SCC export format and scanner CSV output</span>
            </div>
        </div>
    );
}
