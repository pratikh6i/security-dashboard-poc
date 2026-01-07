'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface FindingsDonutProps {
    passed: number;
    failed: number;
}

export default function FindingsDonut({ passed, failed }: FindingsDonutProps) {
    const total = passed + failed;
    const data = [
        { name: 'Failed', value: failed, color: '#ef4444' },
        { name: 'Passed', value: passed, color: '#22c55e' },
    ];

    if (total === 0) {
        return (
            <div className="card p-6">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Check Findings</h3>
                <div className="flex flex-col items-center justify-center h-40">
                    <div className="text-[var(--text-muted)]">No findings to display</div>
                </div>
            </div>
        );
    }

    return (
        <div className="card p-6">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Check Findings</h3>

            <div className="flex items-center gap-6">
                <div className="relative w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center count */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">{total}</span>
                        <span className="text-xs text-[var(--text-muted)]">Total Findings</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm">Failed: {failed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Passed: {passed}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
