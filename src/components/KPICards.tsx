'use client';

import React from 'react';
import { Server, PlayCircle, StopCircle, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { SecurityMetrics } from '@/types';

interface KPICardsProps {
    metrics: SecurityMetrics;
}

export default function KPICards({ metrics }: KPICardsProps) {
    const criticalIssues = metrics.issues.filter(i => i.severity === 'critical').length;
    const highIssues = metrics.issues.filter(i => i.severity === 'high').length;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-amber-500';
        return 'text-red-500';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'from-green-500/10 to-green-500/5';
        if (score >= 60) return 'from-amber-500/10 to-amber-500/5';
        return 'from-red-500/10 to-red-500/5';
    };

    const cards = [
        {
            title: 'Total Resources',
            value: metrics.totalResources,
            icon: Server,
            color: 'text-blue-500',
            bg: 'from-blue-500/10 to-blue-500/5',
            subtitle: `${Object.keys(metrics.byProject).length} projects`
        },
        {
            title: 'Running',
            value: metrics.runningInstances,
            icon: PlayCircle,
            color: 'text-green-500',
            bg: 'from-green-500/10 to-green-500/5',
            subtitle: `${((metrics.runningInstances / metrics.totalResources) * 100).toFixed(0)}% of total`
        },
        {
            title: 'Stopped',
            value: metrics.stoppedInstances,
            icon: StopCircle,
            color: 'text-red-500',
            bg: 'from-red-500/10 to-red-500/5',
            subtitle: `${((metrics.stoppedInstances / metrics.totalResources) * 100).toFixed(0)}% of total`
        },
        {
            title: 'Security Score',
            value: metrics.securityScore,
            icon: Shield,
            color: getScoreColor(metrics.securityScore),
            bg: getScoreBg(metrics.securityScore),
            subtitle: metrics.securityScore >= 80 ? 'Good posture' : metrics.securityScore >= 60 ? 'Needs attention' : 'Critical issues',
            isScore: true
        },
        {
            title: 'Critical Issues',
            value: criticalIssues,
            icon: AlertTriangle,
            color: criticalIssues > 0 ? 'text-red-500' : 'text-green-500',
            bg: criticalIssues > 0 ? 'from-red-500/10 to-red-500/5' : 'from-green-500/10 to-green-500/5',
            subtitle: criticalIssues > 0 ? 'Requires immediate action' : 'No critical issues'
        },
        {
            title: 'High Risk Issues',
            value: highIssues,
            icon: highIssues > 0 ? AlertTriangle : CheckCircle,
            color: highIssues > 0 ? 'text-amber-500' : 'text-green-500',
            bg: highIssues > 0 ? 'from-amber-500/10 to-amber-500/5' : 'from-green-500/10 to-green-500/5',
            subtitle: highIssues > 0 ? 'Should be addressed soon' : 'No high risk issues'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`
            relative overflow-hidden rounded-2xl p-5
            bg-gradient-to-br ${card.bg}
            border border-gray-200 dark:border-gray-800
            transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
          `}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {card.title}
                            </p>
                            <p className={`mt-2 text-3xl font-bold ${card.color}`}>
                                {card.value}{card.isScore && <span className="text-lg">%</span>}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {card.subtitle}
                            </p>
                        </div>
                        <div className={`p-2 rounded-xl bg-white/50 dark:bg-black/20`}>
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
