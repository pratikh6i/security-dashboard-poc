'use client';

import { Finding } from '@/types';

const SCANS_STORAGE_KEY = 'gcp-security-dashboard-scans';
const CURRENT_SCAN_KEY = 'gcp-security-dashboard-current';

export interface StoredScan {
    id: string;
    name: string;
    timestamp: string;
    findingsCount: number;
    findings: Finding[];
}

export function saveScan(findings: Finding[], name?: string): StoredScan {
    const scans = getAllScans();
    const timestamp = new Date().toISOString();
    const scanName = name || `Scan ${new Date().toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })}`;

    const newScan: StoredScan = {
        id: `scan-${Date.now()}`,
        name: scanName,
        timestamp,
        findingsCount: findings.length,
        findings
    };

    scans.unshift(newScan);

    // Keep last 10 scans only
    const trimmedScans = scans.slice(0, 10);

    try {
        localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(trimmedScans));
        localStorage.setItem(CURRENT_SCAN_KEY, newScan.id);
    } catch (error) {
        console.error('Failed to save scan:', error);
    }

    return newScan;
}

export function getAllScans(): StoredScan[] {
    try {
        const stored = localStorage.getItem(SCANS_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as StoredScan[];
        }
    } catch (error) {
        console.error('Failed to load scans:', error);
    }
    return [];
}

export function getCurrentScan(): StoredScan | null {
    const scans = getAllScans();
    if (scans.length === 0) return null;

    const currentId = localStorage.getItem(CURRENT_SCAN_KEY);
    return scans.find(s => s.id === currentId) || scans[0];
}

export function getScanById(id: string): StoredScan | null {
    const scans = getAllScans();
    return scans.find(s => s.id === id) || null;
}

export function setCurrentScan(id: string): void {
    localStorage.setItem(CURRENT_SCAN_KEY, id);
}

export function deleteScan(id: string): void {
    const scans = getAllScans().filter(s => s.id !== id);
    localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(scans));

    const currentId = localStorage.getItem(CURRENT_SCAN_KEY);
    if (currentId === id && scans.length > 0) {
        localStorage.setItem(CURRENT_SCAN_KEY, scans[0].id);
    }
}

export function clearAllScans(): void {
    localStorage.removeItem(SCANS_STORAGE_KEY);
    localStorage.removeItem(CURRENT_SCAN_KEY);
}

export function hasStoredScans(): boolean {
    return getAllScans().length > 0;
}
