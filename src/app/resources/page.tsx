'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/DataContext';
import { Finding, Severity, SEVERITY_CONFIG } from '@/types';
import { Server, Search, Filter, ExternalLink, AlertTriangle } from 'lucide-react';

export default function ResourcesPage() {
    const { currentScan } = useData();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');

    const findings = currentScan?.findings || [];

    // Group by resource
    const resources = useMemo(() => {
        const map = new Map<string, { resource: string; type: string; project: string; location: string; findings: Finding[] }>();

        findings.forEach(f => {
            const key = f.resource_name;
            if (!map.has(key)) {
                map.set(key, {
                    resource: f.resource_name,
                    type: f.resource_type,
                    project: f.resource_project,
                    location: f.resource_location,
                    findings: [],
                });
            }
            map.get(key)!.findings.push(f);
        });

        return Array.from(map.values());
    }, [findings]);

    // Get resource types
    const resourceTypes = useMemo(() => {
        const types = new Set(resources.map(r => r.type));
        return ['ALL', ...Array.from(types)];
    }, [resources]);

    // Filter
    const filteredResources = useMemo(() => {
        return resources.filter(r => {
            if (search && !r.resource.toLowerCase().includes(search.toLowerCase())) {
                return false;
            }
            if (typeFilter !== 'ALL' && r.type !== typeFilter) {
                return false;
            }
            return true;
        });
    }, [resources, search, typeFilter]);

    if (!currentScan) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Server className="w-12 h-12 text-[var(--text-muted)]" />
                <p className="text-[var(--text-muted)]">Upload a scan to view resources</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fadeIn">
            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input w-full pl-10"
                        />
                    </div>

                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        className="input"
                    >
                        {resourceTypes.map(t => (
                            <option key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</option>
                        ))}
                    </select>
                </div>

                <div className="mt-3 text-sm text-[var(--text-muted)]">
                    {filteredResources.length} resources
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map((resource, i) => {
                    const failedCount = resource.findings.filter(f => f.status === 'FAIL').length;
                    const criticalCount = resource.findings.filter(f => f.finding_severity === 'CRITICAL').length;
                    const highCount = resource.findings.filter(f => f.finding_severity === 'HIGH').length;

                    return (
                        <div key={i} className="card p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                                    <Server className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate" title={resource.resource}>
                                        {resource.resource.split('/').pop()}
                                    </div>
                                    <div className="text-xs text-[var(--text-muted)] truncate">
                                        {resource.type}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-xs">
                                <span className="px-2 py-1 rounded bg-[var(--bg-tertiary)]">
                                    {resource.project}
                                </span>
                                <span className="px-2 py-1 rounded bg-[var(--bg-tertiary)]">
                                    {resource.location}
                                </span>
                            </div>

                            <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {failedCount > 0 ? (
                                            <span className="flex items-center gap-1 text-sm text-red-500">
                                                <AlertTriangle className="w-4 h-4" />
                                                {failedCount} issues
                                            </span>
                                        ) : (
                                            <span className="text-sm text-green-500">✓ No issues</span>
                                        )}
                                    </div>

                                    <div className="flex gap-1">
                                        {criticalCount > 0 && (
                                            <span className="badge text-xs" style={{
                                                color: SEVERITY_CONFIG.CRITICAL.color,
                                                backgroundColor: SEVERITY_CONFIG.CRITICAL.bgColor
                                            }}>
                                                {criticalCount} Critical
                                            </span>
                                        )}
                                        {highCount > 0 && (
                                            <span className="badge text-xs" style={{
                                                color: SEVERITY_CONFIG.HIGH.color,
                                                backgroundColor: SEVERITY_CONFIG.HIGH.bgColor
                                            }}>
                                                {highCount} High
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredResources.length === 0 && (
                <div className="text-center py-12 text-[var(--text-muted)]">
                    <Filter className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No resources match your filters</p>
                </div>
            )}
        </div>
    );
}
