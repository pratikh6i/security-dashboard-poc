'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { parseCSV, validateCSVData, CSVParseResult } from '@/lib/csvParser';
import { ResourceData, ParseError } from '@/types';

interface CSVUploaderProps {
    onDataLoaded: (data: ResourceData[]) => void;
}

export default function CSVUploader({ onDataLoaded }: CSVUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [parseErrors, setParseErrors] = useState<ParseError[]>([]);

    const handleFile = useCallback(async (file: File) => {
        setError(null);
        setSuccess(null);
        setParseErrors([]);

        // Validate file type
        if (!file.name.endsWith('.csv')) {
            setError('Please upload a CSV file. The selected file is not a valid CSV format.');
            return;
        }

        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            setError('File size exceeds 50MB limit. Please upload a smaller file.');
            return;
        }

        setIsLoading(true);

        try {
            const result: CSVParseResult = await parseCSV(file);

            // Check for parse errors
            if (result.errors.length > 0) {
                setParseErrors(result.errors);
            }

            // Validate required columns
            const validationErrors = validateCSVData(result.data);
            if (validationErrors.length > 0) {
                setParseErrors(prev => [...prev, ...validationErrors]);
                if (validationErrors.some(e => e.type === 'MissingColumn' || e.type === 'EmptyData')) {
                    setError('CSV validation failed. Please check the errors below.');
                    setIsLoading(false);
                    return;
                }
            }

            // Success
            setSuccess(`Successfully loaded ${result.meta.rowCount} resources from ${file.name}`);
            onDataLoaded(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse CSV file. Please check the file format.');
        } finally {
            setIsLoading(false);
        }
    }, [onDataLoaded]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
            >
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading}
                />

                <div className="flex flex-col items-center gap-4">
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                    ) : (
                        <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-gray-500'}`} />
                        </div>
                    )}

                    <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                            {isLoading ? 'Processing...' : 'Drop your CSV file here'}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            or click to browse files
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <FileText className="w-4 h-4" />
                        <span>Supports CSV files up to 50MB</span>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Parse Errors */}
            {parseErrors.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                                {parseErrors.length} warning(s) while parsing:
                            </p>
                            <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                                {parseErrors.slice(0, 5).map((err, i) => (
                                    <li key={i}>
                                        {err.row !== undefined && `Row ${err.row}: `}
                                        {err.message}
                                    </li>
                                ))}
                                {parseErrors.length > 5 && (
                                    <li>...and {parseErrors.length - 5} more</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
