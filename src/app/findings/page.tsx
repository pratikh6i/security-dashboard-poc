'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/lib/DataContext';
import { Finding, Severity, SEVERITY_CONFIG } from '@/types';
import {
    Search,
    ChevronDown,
    ChevronUp,
    Filter,
    Download,
    ExternalLink,
    AlertTriangle,
    CheckCircle,
} from 'lucide-react';

type SortKey = 'finding_category' | 'finding_severity' | 'resource_name' | 'scan_time';
type SortDirection = 'asc' | 'desc';

export default function FindingsPage() {
    const { currentScan } = useData();
    const [search, setSearch] = useState('');
    const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'FAIL' | 'PASS'>('ALL');
    const [serviceFilter, setServiceFilter] = useState<string>('ALL');
    const [projectFilter, setProjectFilter] = useState<string>('ALL');
    const [sortKey, setSortKey] = useState<SortKey>('finding_severity');
    const [sortDir, setSortDir] = useState<SortDirection>('desc');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 25;

    const findings = currentScan?.findings || [];

    // Get unique values for filters
    const services = useMemo(() => {
        const set = new Set(findings.map(f => f.resource_type?.split('.')[0] || 'unknown'));
        return ['ALL', ...Array.from(set)];
    }, [findings]);

    const projects = useMemo(() => {
        const set = new Set(findings.map(f => f.resource_project).filter(Boolean));
        return ['ALL', ...Array.from(set)];
    }, [findings]);

    // Filter and sort
    const filteredFindings = useMemo(() => {
        let result = [...findings];

        // Search
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(f =>
                f.finding_category?.toLowerCase().includes(lower) ||
                f.resource_name?.toLowerCase().includes(lower) ||
                f.finding_description?.toLowerCase().includes(lower)
            );
        }

        // Severity filter
        if (severityFilter !== 'ALL') {
            result = result.filter(f => f.finding_severity === severityFilter);
        }

        // Status filter
        if (statusFilter !== 'ALL') {
            result = result.filter(f => f.status === statusFilter);
        }

        // Service filter
        if (serviceFilter !== 'ALL') {
            result = result.filter(f => f.resource_type?.startsWith(serviceFilter));
        }

        // Project filter
        if (projectFilter !== 'ALL') {
            result = result.filter(f => f.resource_project === projectFilter);
        }

        // Sort
        const severityOrder = { CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, INFO: 1 };
        result.sort((a, b) => {
            let cmp = 0;
            if (sortKey === 'finding_severity') {
                cmp = (severityOrder[a.finding_severity] || 0) - (severityOrder[b.finding_severity] || 0);
            } else {
                cmp = String(a[sortKey] || '').localeCompare(String(b[sortKey] || ''));
            }
            return sortDir === 'desc' ? -cmp : cmp;
        });

        return result;
    }, [findings, search, severityFilter, statusFilter, serviceFilter, projectFilter, sortKey, sortDir]);

    const paginatedFindings = filteredFindings.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filteredFindings.length / pageSize);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const exportCSV = () => {
        const headers = ['Category', 'Severity', 'Status', 'Resource', 'Project', 'Location', 'Description'];
        const rows = filteredFindings.map(f => [
            f.finding_category,
            f.finding_severity,
            f.status,
            f.resource_name,
            f.resource_project,
            f.resource_location,
            f.finding_description,
        ]);
        const csv = [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'findings.csv';
        a.click();
    };

    if (!currentScan) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Filter className="w-12 h-12 text-[var(--text-muted)]" />
                <p className="text-[var(--text-muted)]">Upload a scan to view findings</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fadeIn">
            {/* Filters Bar */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search findings..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input w-full pl-10"
                        />
                    </div>

                    {/* Severity Filter */}
                    <select
                        value={severityFilter}
                        onChange={e => setSeverityFilter(e.target.value as Severity | 'ALL')}
                        className="input"
                    >
                        <option value="ALL">All Severities</option>
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                        <option value="INFO">Info</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as 'ALL' | 'FAIL' | 'PASS')}
                        className="input"
                    >
                        <option value="ALL">All Status</option>
                        <option value="FAIL">Failed</option>
                        <option value="PASS">Passed</option>
                    </select>

                    {/* Service Filter */}
                    <select
                        value={serviceFilter}
                        onChange={e => setServiceFilter(e.target.value)}
                        className="input"
                    >
                        {services.map(s => (
                            <option key={s} value={s}>{s === 'ALL' ? 'All Services' : s}</option>
                        ))}
                    </select>

                    {/* Project Filter */}
                    <select
                        value={projectFilter}
                        onChange={e => setProjectFilter(e.target.value)}
                        className="input"
                    >
                        {projects.map(p => (
                            <option key={p} value={p}>{p === 'ALL' ? 'All Projects' : p}</option>
                        ))}
                    </select>

                    {/* Export */}
                    <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>

                <div className="mt-3 text-sm text-[var(--text-muted)]">
                    {filteredFindings.length} findings
                </div>
            </div>

            {/* Findings Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="table-header">
                            <tr>
                                <th className="w-10 p-3" />
                                <th
                                    className="p-3 text-left font-medium cursor-pointer hover:bg-[var(--bg-tertiary)]"
                                    onClick={() => handleSort('finding_category')}
                                >
                                    <div className="flex items-center gap-1">
                                        Finding
                                        {sortKey === 'finding_category' && (sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                    </div>
                                </th>
                                <th
                                    className="p-3 text-left font-medium cursor-pointer hover:bg-[var(--bg-tertiary)]"
                                    onClick={() => handleSort('finding_severity')}
                                >
                                    <div className="flex items-center gap-1">
                                        Severity
                                        {sortKey === 'finding_severity' && (sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                    </div>
                                </th>
                                <th className="p-3 text-left font-medium">Status</th>
                                <th className="p-3 text-left font-medium">Resource</th>
                                <th className="p-3 text-left font-medium">Project</th>
                                <th className="p-3 text-left font-medium">Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedFindings.map((finding, i) => {
                                const isExpanded = expandedId === finding.id;
                                const config = SEVERITY_CONFIG[finding.finding_severity];

                                return (
                                    <React.Fragment key={finding.id || i}>
                                        <tr
                                            className="table-row cursor-pointer"
                                            onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                                        >
                                            <td className="p-3">
                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </td>
                                            <td className="p-3 font-medium">{finding.finding_category}</td>
                                            <td className="p-3">
                                                <span
                                                    className="badge"
                                                    style={{ color: config.color, backgroundColor: config.bgColor }}
                                                >
                                                    {finding.finding_severity}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {finding.status === 'FAIL' ? (
                                                    <span className="flex items-center gap-1 status-fail">
                                                        <AlertTriangle className="w-4 h-4" /> FAIL
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 status-pass">
                                                        <CheckCircle className="w-4 h-4" /> PASS
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 max-w-48 truncate" title={finding.resource_name}>
                                                {finding.resource_name?.split('/').pop()}
                                            </td>
                                            <td className="p-3">{finding.resource_project}</td>
                                            <td className="p-3">{finding.resource_location}</td>
                                        </tr>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <tr className="bg-[var(--bg-tertiary)]">
                                                <td colSpan={7} className="p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="font-medium mb-2">Description</h4>
                                                            <p className="text-sm text-[var(--text-secondary)]">
                                                                {finding.finding_description}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium mb-2">Remediation</h4>
                                                            <p className="text-sm text-[var(--text-secondary)]">
                                                                {finding.remediation}
                                                            </p>
                                                        </div>
                                                        {finding.compliance && (
                                                            <div>
                                                                <h4 className="font-medium mb-2">Compliance</h4>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {finding.compliance.split(';').map((c, j) => (
                                                                        <span key={j} className="badge bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                                                                            {c.trim()}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h4 className="font-medium mb-2">Resource Path</h4>
                                                            <div className="flex items-center gap-2">
                                                                <code className="text-xs bg-[var(--bg-secondary)] p-2 rounded flex-1 overflow-x-auto">
                                                                    {finding.resource_name}
                                                                </code>
                                                                <a
                                                                    href={`https://console.cloud.google.com/compute/instances?project=${finding.resource_project}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-2 hover:bg-[var(--bg-secondary)] rounded"
                                                                >
                                                                    <ExternalLink className="w-4 h-4" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-[var(--border-color)]">
                        <div className="text-sm text-[var(--text-muted)]">
                            Page {page} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn-secondary disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn-secondary disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
