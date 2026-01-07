'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ServiceChartProps {
    byService: Record<string, number>;
}

const SERVICE_COLORS: Record<string, string> = {
    compute: '#4285f4',
    container: '#34a853',
    storage: '#fbbc04',
    sqladmin: '#ea4335',
    default: '#9ca3af',
};

export default function ServiceChart({ byService }: ServiceChartProps) {
    const data = Object.entries(byService).map(([service, count]) => ({
        name: service,
        findings: count,
    })).sort((a, b) => b.findings - a.findings);

    if (data.length === 0) {
        return (
            <div className="card p-6">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Findings by Service</h3>
                <div className="flex items-center justify-center h-40 text-[var(--text-muted)]">
                    No service data available
                </div>
            </div>
        );
    }

    return (
        <div className="card p-6">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Findings by Service</h3>

            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            width={80}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                            }}
                        />
                        <Bar dataKey="findings" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={SERVICE_COLORS[entry.name] || SERVICE_COLORS.default}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
