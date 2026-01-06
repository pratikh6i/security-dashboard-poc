'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Filter, Download, X } from 'lucide-react';
import { ResourceData } from '@/types';

interface DataTableProps {
    data: ResourceData[];
}

type SortDirection = 'asc' | 'desc' | null;

export default function DataTable({ data }: DataTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 25;

    // Get visible columns (exclude verbose columns)
    const visibleColumns = useMemo(() => {
        if (data.length === 0) return [];
        const allColumns = Object.keys(data[0]);
        const excludeColumns = ['SSH Keys', 'API Access Scopes', 'Labels', 'Network Interfaces'];
        return allColumns.filter(col => !excludeColumns.includes(col));
    }, [data]);

    // Filter options
    const filterOptions = useMemo(() => {
        const options: Record<string, Set<string>> = {};
        const filterableColumns = ['Status', 'Project ID', 'Zone', 'Resource Type'];

        filterableColumns.forEach(col => {
            options[col] = new Set();
            data.forEach(row => {
                if (row[col]) options[col].add(row[col]);
            });
        });

        return options;
    }, [data]);

    // Filtered and sorted data
    const processedData = useMemo(() => {
        let result = [...data];

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(row =>
                Object.values(row).some(val =>
                    val && val.toString().toLowerCase().includes(query)
                )
            );
        }

        // Apply filters
        Object.entries(selectedFilters).forEach(([column, value]) => {
            if (value) {
                result = result.filter(row => row[column] === value);
            }
        });

        // Apply sorting
        if (sortColumn && sortDirection) {
            result.sort((a, b) => {
                const aVal = a[sortColumn] || '';
                const bVal = b[sortColumn] || '';
                const comparison = aVal.toString().localeCompare(bVal.toString());
                return sortDirection === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [data, searchQuery, selectedFilters, sortColumn, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / rowsPerPage);
    const paginatedData = processedData.slice(
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
            setSortDirection('asc');
        }
    };

    const handleExportCSV = () => {
        const csvContent = [
            visibleColumns.join(','),
            ...processedData.map(row =>
                visibleColumns.map(col => {
                    const val = row[col] || '';
                    // Escape quotes and wrap in quotes
                    return `"${val.toString().replace(/"/g, '""')}"`;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gcp_security_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RUNNING': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'STOPPED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'TERMINATED': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
            default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Resource Inventory
                        </h3>
                        <p className="text-sm text-gray-500">
                            {processedData.length} of {data.length} resources
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search resources..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-lg border transition-colors ${showFilters || Object.values(selectedFilters).some(v => v)
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                                    : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                        </button>

                        {/* Export Button */}
                        <button
                            onClick={handleExportCSV}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="mt-4 flex flex-wrap gap-3">
                        {Object.entries(filterOptions).map(([column, values]) => (
                            <select
                                key={column}
                                value={selectedFilters[column] || ''}
                                onChange={(e) => {
                                    setSelectedFilters(prev => ({ ...prev, [column]: e.target.value }));
                                    setCurrentPage(1);
                                }}
                                className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">All {column}</option>
                                {Array.from(values).sort().map(val => (
                                    <option key={val} value={val}>{val}</option>
                                ))}
                            </select>
                        ))}

                        {Object.values(selectedFilters).some(v => v) && (
                            <button
                                onClick={() => setSelectedFilters({})}
                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <X className="w-4 h-4" />
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                            {visibleColumns.map(column => (
                                <th
                                    key={column}
                                    onClick={() => handleSort(column)}
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors whitespace-nowrap"
                                >
                                    <div className="flex items-center gap-1">
                                        {column}
                                        {sortColumn === column && (
                                            sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {paginatedData.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                            >
                                {visibleColumns.map(column => (
                                    <td key={column} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap max-w-xs truncate">
                                        {column === 'Status' ? (
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(row[column])}`}>
                                                {row[column]}
                                            </span>
                                        ) : column === 'Deletion Protection' || column === 'OS Agent Installed' ? (
                                            <span className={row[column] === 'Yes' ? 'text-green-600' : 'text-red-600'}>
                                                {row[column]}
                                            </span>
                                        ) : (
                                            row[column] || '-'
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
