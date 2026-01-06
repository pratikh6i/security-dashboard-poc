'use client';

import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    Tooltip, Legend
} from 'recharts';
import { SecurityMetrics, ChartData } from '@/types';
import { getStatusChartData, getProjectChartData, getZoneChartData, CHART_COLORS } from '@/lib/securityAnalyzer';

interface SecurityChartsProps {
    metrics: SecurityMetrics;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: ChartData }> }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {payload[0].payload.name}
                </p>
                <p className="text-sm text-gray-500">
                    Count: <span className="font-bold text-gray-900 dark:text-white">{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function SecurityCharts({ metrics }: SecurityChartsProps) {
    const statusData = getStatusChartData(metrics.byStatus);
    const projectData = getProjectChartData(metrics.byProject);
    const zoneData = getZoneChartData(metrics.byZone);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Distribution Pie Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Status Distribution
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 justify-center">
                    {statusData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Projects Bar Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Resources by Project
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={projectData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                width={100}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {projectData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Zones Bar Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Resources by Zone
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={zoneData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                width={100}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {zoneData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
