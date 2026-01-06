'use client';

import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { Finding, SEVERITY_COLORS } from '@/types';

interface QuickFiltersProps {
    findings: Finding[];
    selectedFilters: Record<string, string[]>;
    onFilterChange: (filters: Record<string, string[]>) => void;
}

interface FilterSection {
    key: string;
    label: string;
    getter: (f: Finding) => string;
}

const FILTER_SECTIONS: FilterSection[] = [
    { key: 'severity', label: 'Severity', getter: (f) => f.finding_severity || 'UNKNOWN' },
    { key: 'category', label: 'Category', getter: (f) => f.finding_category || 'Unknown' },
    { key: 'project', label: 'Project ID', getter: (f) => f.resource_project || 'Unknown' },
    { key: 'resourceType', label: 'Resource type', getter: (f) => extractResourceType(f.resource_type || '') },
    { key: 'location', label: 'Location', getter: (f) => f.resource_location || 'global' },
];

function extractResourceType(resourceType: string): string {
    if (resourceType.includes('/')) {
        return resourceType.split('/').pop() || resourceType;
    }
    return resourceType || 'Unknown';
}

export default function QuickFilters({ findings, selectedFilters, onFilterChange }: QuickFiltersProps) {
    // Calculate counts for each filter option
    const filterCounts = useMemo(() => {
        const counts: Record<string, Record<string, number>> = {};

        FILTER_SECTIONS.forEach(section => {
            counts[section.key] = {};
            findings.forEach(finding => {
                const value = section.getter(finding);
                counts[section.key][value] = (counts[section.key][value] || 0) + 1;
            });
        });

        return counts;
    }, [findings]);

    const toggleFilter = (sectionKey: string, value: string) => {
        const current = selectedFilters[sectionKey] || [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];

        onFilterChange({
            ...selectedFilters,
            [sectionKey]: updated
        });
    };

    const clearAll = () => {
        onFilterChange({});
    };

    const hasActiveFilters = Object.values(selectedFilters).some(arr => arr.length > 0);

    const getSeverityDot = (severity: string) => {
        const color = SEVERITY_COLORS[severity.toUpperCase() as keyof typeof SEVERITY_COLORS] || '#6b7280';
        return <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />;
    };

    return (
        <div className="w-64 flex-shrink-0 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Quick filters</h3>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAll}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                <div className="space-y-5">
                    {FILTER_SECTIONS.map(section => {
                        const options = Object.entries(filterCounts[section.key] || {})
                            .sort((a, b) => b[1] - a[1]);

                        if (options.length === 0) return null;

                        return (
                            <div key={section.key}>
                                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    {section.label}
                                </h4>
                                <div className="space-y-1">
                                    {options.slice(0, 10).map(([value, count]) => {
                                        const isSelected = (selectedFilters[section.key] || []).includes(value);
                                        return (
                                            <label
                                                key={value}
                                                className="flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleFilter(section.key, value)}
                                                    className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                                />
                                                {section.key === 'severity' && getSeverityDot(value)}
                                                <span className={`text-sm flex-1 truncate ${isSelected ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {value}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                                    {count}
                                                </span>
                                            </label>
                                        );
                                    })}
                                    {options.length > 10 && (
                                        <p className="text-xs text-gray-400 px-2">+{options.length - 10} more</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
