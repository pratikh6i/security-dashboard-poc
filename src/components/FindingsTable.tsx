'use client';

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Copy, CheckCircle, ExternalLink, Search } from 'lucide-react';
import { Finding, SEVERITY_COLORS } from '@/types';

interface FindingsTableProps {
    findings: Finding[];
    selectedFilters: Record<string, string[]>;
}

type SortDirection = 'asc' | 'desc' | null;

const COLUMNS = [
    { key: 'finding_category', label: 'Category', width: 'w-48' },
    { key: 'finding_severity', label: 'Severity', width: 'w-24' },
    { key: 'scan_time', label: 'Event time', width: 'w-36' },
    { key: 'resource_name', label: 'Resource display name', width: 'w-48' },
    { key: 'resource_project', label: 'Project', width: 'w-32' },
    { key: 'resource_location', label: 'Location', width: 'w-24' },
];

export default function FindingsTable({ findings, selectedFilters }: FindingsTableProps) {
    const [sortColumn, setSortColumn] = useState<string | null>('finding_severity');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Apply filters
    const filteredFindings = useMemo(() => {
        let result = [...findings];

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(f =>
                f.finding_category?.toLowerCase().includes(query) ||
                f.resource_name?.toLowerCase().includes(query) ||
                f.resource_project?.toLowerCase().includes(query)
            );
        }

        // Apply quick filters
        if (selectedFilters.severity?.length) {
            result = result.filter(f => selectedFilters.severity.includes(f.finding_severity));
        }
        if (selectedFilters.category?.length) {
            result = result.filter(f => selectedFilters.category.includes(f.finding_category));
        }
        if (selectedFilters.project?.length) {
            result = result.filter(f => selectedFilters.project.includes(f.resource_project));
        }
        if (selectedFilters.resourceType?.length) {
            const extractType = (rt: string) => rt.includes('/') ? rt.split('/').pop() : rt;
            result = result.filter(f => selectedFilters.resourceType.includes(extractType(f.resource_type || '') || ''));
        }
        if (selectedFilters.location?.length) {
            result = result.filter(f => selectedFilters.location.includes(f.resource_location || 'global'));
        }

        // Apply sorting
        if (sortColumn && sortDirection) {
            const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFO: 0 };
            result.sort((a, b) => {
                let aVal = a[sortColumn as keyof Finding] || '';
                let bVal = b[sortColumn as keyof Finding] || '';

                // Special handling for severity
                if (sortColumn === 'finding_severity') {
                    const aOrd = severityOrder[aVal.toUpperCase() as keyof typeof severityOrder] ?? -1;
                    const bOrd = severityOrder[bVal.toUpperCase() as keyof typeof severityOrder] ?? -1;
                    return sortDirection === 'asc' ? aOrd - bOrd : bOrd - aOrd;
                }

                const comparison = aVal.toString().localeCompare(bVal.toString());
                return sortDirection === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [findings, selectedFilters, searchQuery, sortColumn, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredFindings.length / rowsPerPage);
    const paginatedFindings = filteredFindings.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            if (sortDirection === 'asc') setSortDirection('desc');
            else if (sortDirection === 'desc') {
                setSortColumn(null);
                setSortDirection(null);
            }
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDateTime = (isoString: string | undefined) => {
        if (!isoString) return '-';
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const extractResourceName = (resourcePath: string | undefined) => {
        if (!resourcePath) return '-';
        const parts = resourcePath.split('/');
        return parts[parts.length - 1] || resourcePath;
    };

    const getSeverityBadge = (severity: string) => {
        const color = SEVERITY_COLORS[severity?.toUpperCase() as keyof typeof SEVERITY_COLORS] || '#6b7280';
        return (
            <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded text-white"
                style={{ backgroundColor: color }}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                {severity}
            </span>
        );
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-sm font-medium text-gray-900 dark:text-white">
                        Findings query results
                    </h2>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        {filteredFindings.length} of {findings.length}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-64 pl-9 pr-4 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="text-xs text-gray-500">
                        Rows per page: <span className="font-medium">{rowsPerPage}</span>
                        <span className="ml-3">{(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredFindings.length)} of {filteredFindings.length}</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full min-w-[900px]">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/80 backdrop-blur z-10">
                        <tr>
                            <th className="w-8 px-3 py-2">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600" />
                            </th>
                            {COLUMNS.map(col => (
                                <th
                                    key={col.key}
                                    onClick={() => handleSort(col.key)}
                                    className={`${col.width} px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 whitespace-nowrap`}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {sortColumn === col.key && (
                                            <span className="text-blue-500">
                                                {sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {paginatedFindings.map((finding, idx) => {
                            const rowId = `${finding.finding_category}-${idx}`;
                            const isExpanded = expandedRow === rowId;

                            return (
                                <React.Fragment key={rowId}>
                                    <tr
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                                        onClick={() => setExpandedRow(isExpanded ? null : rowId)}
                                    >
                                        <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600" />
                                        </td>
                                        <td className="px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                            {finding.finding_category}
                                        </td>
                                        <td className="px-3 py-2">
                                            {getSeverityBadge(finding.finding_severity)}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                                            {formatDateTime(finding.scan_time)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                                            <div className="flex items-center gap-1">
                                                <span className="truncate max-w-[180px]">
                                                    {extractResourceName(finding.resource_name)}
                                                </span>
                                                <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                                            {finding.resource_project}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                                            {finding.resource_location || 'global'}
                                        </td>
                                    </tr>

                                    {isExpanded && (
                                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                                            <td colSpan={7} className="px-6 py-4">
                                                <div className="grid grid-cols-2 gap-6 text-sm">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            {finding.finding_description || 'No description available'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Remediation</h4>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            {finding.remediation || 'No remediation steps available'}
                                                        </p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Resource path</h4>
                                                        <div className="flex items-center gap-2">
                                                            <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 flex-1 truncate">
                                                                {finding.resource_name}
                                                            </code>
                                                            <button
                                                                onClick={() => handleCopy(finding.resource_name, rowId)}
                                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                            >
                                                                {copiedId === rowId ? (
                                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                                ) : (
                                                                    <Copy className="w-4 h-4 text-gray-400" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {finding.compliance && (
                                                        <div className="col-span-2">
                                                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Compliance</h4>
                                                            <div className="flex flex-wrap gap-1">
                                                                {finding.compliance.split(';').map((comp, i) => (
                                                                    <span key={i} className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                                                                        {comp.trim()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>

                {filteredFindings.length === 0 && (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                        No findings match your filters
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                    >
                        ⟨⟨
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                    >
                        ⟨
                    </button>
                    <span className="text-xs text-gray-500 mx-2">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                    >
                        ⟩
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                    >
                        ⟩⟩
                    </button>
                </div>
            )}
        </div>
    );
}
