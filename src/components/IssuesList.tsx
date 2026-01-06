'use client';

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { SecurityIssue } from '@/types';
import { getSeverityColor } from '@/lib/securityAnalyzer';

interface IssuesListProps {
    issues: SecurityIssue[];
}

export default function IssuesList({ issues }: IssuesListProps) {
    const [expandedIssue, setExpandedIssue] = useState<number | null>(null);

    const getSeverityBadge = (severity: string) => {
        const colors = {
            critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        };
        return colors[severity as keyof typeof colors] || colors.low;
    };

    if (issues.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <AlertTriangle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Security Issues Found</h3>
                <p className="mt-2 text-sm text-gray-500">Your infrastructure looks secure!</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Security Findings
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    {issues.length} issue{issues.length !== 1 ? 's' : ''} detected across your infrastructure
                </p>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {issues.map((issue, index) => (
                    <div key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <button
                            onClick={() => setExpandedIssue(expandedIssue === index ? null : index)}
                            className="w-full p-4 flex items-center gap-4 text-left"
                        >
                            <div
                                className="w-1 h-12 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getSeverityColor(issue.severity) }}
                            />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full uppercase ${getSeverityBadge(issue.severity)}`}>
                                        {issue.severity}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {issue.title}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                    {issue.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {issue.count}
                                </span>
                                {expandedIssue === index ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                        </button>

                        {expandedIssue === index && (
                            <div className="px-4 pb-4 pl-12">
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Affected Resources ({issue.affectedResources.length})
                                    </h4>
                                    <div className="max-h-48 overflow-y-auto">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {issue.affectedResources.slice(0, 20).map((resource, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                                                >
                                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate">{resource}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {issue.affectedResources.length > 20 && (
                                            <p className="mt-2 text-xs text-gray-500">
                                                ...and {issue.affectedResources.length - 20} more
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
