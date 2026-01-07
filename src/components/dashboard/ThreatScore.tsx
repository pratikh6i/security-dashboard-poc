'use client';

import React from 'react';

interface ThreatScoreProps {
    score: number;
    size?: number;
}

export default function ThreatScore({ score, size = 160 }: ThreatScoreProps) {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    // Color based on score
    const getColor = () => {
        if (score <= 20) return '#22c55e'; // Green
        if (score <= 40) return '#84cc16'; // Lime
        if (score <= 60) return '#eab308'; // Yellow
        if (score <= 80) return '#f97316'; // Orange
        return '#ef4444'; // Red
    };

    return (
        <div className="card p-6">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Threat Score</h3>

            <div className="flex flex-col items-center">
                <div className="relative" style={{ width: size, height: size }}>
                    {/* Background circle */}
                    <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="var(--border-color)"
                            strokeWidth="10"
                        />
                        {/* Progress arc */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={getColor()}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold" style={{ color: getColor() }}>
                            {score}%
                        </span>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <div className="text-sm text-[var(--text-muted)]">
                        {score <= 20 && 'Excellent security posture'}
                        {score > 20 && score <= 40 && 'Good security posture'}
                        {score > 40 && score <= 60 && 'Moderate risk detected'}
                        {score > 60 && score <= 80 && 'High risk - action needed'}
                        {score > 80 && 'Critical risk - immediate action'}
                    </div>
                </div>
            </div>
        </div>
    );
}
