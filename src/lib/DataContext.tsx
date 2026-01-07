'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Finding, ScanResult, ScanSummary, Severity, SEVERITY_CONFIG, LLMSettings } from '@/types';

interface DataContextType {
    currentScan: ScanResult | null;
    scans: ScanResult[];
    isLoading: boolean;
    uploadFindings: (findings: Finding[], scanName?: string) => void;
    selectScan: (scanId: string) => void;
    deleteScan: (scanId: string) => void;
    llmSettings: LLMSettings | null;
    setLLMSettings: (settings: LLMSettings) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'cloudguard-scans';
const LLM_STORAGE_KEY = 'cloudguard-llm';
const MAX_SCANS = 10;

function calculateSummary(findings: Finding[]): ScanSummary {
    const bySeverity: Record<Severity, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
    const byService: Record<string, number> = {};
    const byProject: Record<string, number> = {};

    let passed = 0;
    let failed = 0;

    findings.forEach(f => {
        bySeverity[f.finding_severity] = (bySeverity[f.finding_severity] || 0) + 1;

        const service = f.resource_type?.split('.')[0] || 'unknown';
        byService[service] = (byService[service] || 0) + 1;

        byProject[f.resource_project] = (byProject[f.resource_project] || 0) + 1;

        if (f.status === 'PASS' || f.finding_state === 'INACTIVE') {
            passed++;
        } else {
            failed++;
        }
    });

    // Calculate threat score (0-100, lower is better)
    let riskPoints = 0;
    Object.entries(bySeverity).forEach(([severity, count]) => {
        riskPoints += count * SEVERITY_CONFIG[severity as Severity].weight;
    });
    const maxPoints = findings.length * 10; // If all were critical
    const threatScore = maxPoints > 0 ? Math.round((riskPoints / maxPoints) * 100) : 0;

    return {
        total: findings.length,
        passed,
        failed,
        bySeverity,
        byService,
        byProject,
        threatScore,
    };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [scans, setScans] = useState<ScanResult[]>([]);
    const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [llmSettings, setLLMSettingsState] = useState<LLMSettings | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as ScanResult[];
                setScans(parsed);
                if (parsed.length > 0) {
                    setCurrentScan(parsed[0]);
                }
            } catch (e) {
                console.error('Failed to parse stored scans', e);
            }
        }

        const llmStored = localStorage.getItem(LLM_STORAGE_KEY);
        if (llmStored) {
            try {
                setLLMSettingsState(JSON.parse(llmStored));
            } catch (e) {
                console.error('Failed to parse LLM settings', e);
            }
        }

        setIsLoading(false);
    }, []);

    const uploadFindings = useCallback((findings: Finding[], scanName?: string) => {
        const newScan: ScanResult = {
            id: `scan-${Date.now()}`,
            name: scanName || `Scan ${new Date().toLocaleString()}`,
            timestamp: new Date().toISOString(),
            findings: findings.map((f, i) => ({ ...f, id: `finding-${i}` })),
            summary: calculateSummary(findings),
        };

        setScans(prev => {
            const updated = [newScan, ...prev].slice(0, MAX_SCANS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
        setCurrentScan(newScan);
    }, []);

    const selectScan = useCallback((scanId: string) => {
        const scan = scans.find(s => s.id === scanId);
        if (scan) setCurrentScan(scan);
    }, [scans]);

    const deleteScan = useCallback((scanId: string) => {
        setScans(prev => {
            const updated = prev.filter(s => s.id !== scanId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
        if (currentScan?.id === scanId) {
            setCurrentScan(scans.find(s => s.id !== scanId) || null);
        }
    }, [currentScan, scans]);

    const setLLMSettings = useCallback((settings: LLMSettings) => {
        setLLMSettingsState(settings);
        localStorage.setItem(LLM_STORAGE_KEY, JSON.stringify(settings));
    }, []);

    return (
        <DataContext.Provider value={{
            currentScan,
            scans,
            isLoading,
            uploadFindings,
            selectScan,
            deleteScan,
            llmSettings,
            setLLMSettings,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
}
