'use client';

import React from 'react';
import { Severity, SEVERITY_CONFIG } from '@/types';

interface SeverityBarsProps {
    bySeverity: Record<Severity, number>;
    total: number;
}

export default function SeverityBars({ bySeverity, total }: SeverityBarsProps) {
    const severities: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

    return (
        <div className="card p-6">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Risk Severity</h3>

            <div className="space-y-3">
                {severities.map(severity => {
                    const count = bySeverity[severity] || 0;
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    const config = SEVERITY_CONFIG[severity];

                    return (
                        <div key={severity} className="flex items-center gap-3">
                            <div className="w-16 text-sm font-medium" style={{ color: config.color }}>
                                {severity}
                            </div>
                            <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: config.color,
                                    }}
                                />
                            </div>
                            <div className="w-16 text-sm text-right text-[var(--text-muted)]">
                                {percentage.toFixed(0)}% • {count}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
