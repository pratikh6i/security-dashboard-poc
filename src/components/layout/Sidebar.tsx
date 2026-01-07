'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Shield,
    Search,
    Server,
    FileCheck,
    Sparkles,
    History,
    Settings,
    User,
    ChevronDown,
    Upload,
} from 'lucide-react';
import { useData } from '@/lib/DataContext';

const NAV_ITEMS = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/findings', label: 'Findings', icon: Shield },
    { href: '/resources', label: 'Resources', icon: Server },
    { href: '/lighthouse', label: 'Sentinel AI', icon: Sparkles },
];

const CONFIG_ITEMS = [
    { href: '/scans', label: 'Scan History', icon: History },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { currentScan, scans } = useData();
    const [configOpen, setConfigOpen] = React.useState(true);

    return (
        <aside className="w-60 h-full flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--border-color)]">
            {/* Logo */}
            <div className="h-14 flex items-center px-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">CloudGuard</span>
                </div>
            </div>

            {/* Launch Scan Button */}
            <div className="p-3">
                <Link
                    href="/scans"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    Upload Scan
                </Link>
            </div>

            {/* Current Scan Info */}
            {currentScan && (
                <div className="mx-3 mb-2 p-2 rounded-lg bg-[var(--bg-tertiary)] text-xs">
                    <div className="text-[var(--text-muted)]">Current Scan</div>
                    <div className="font-medium truncate">{currentScan.name}</div>
                    <div className="text-[var(--text-muted)]">
                        {currentScan.summary.total} findings
                    </div>
                </div>
            )}

            {/* Main Navigation */}
            <nav className="flex-1 px-3 py-2 overflow-y-auto">
                <ul className="space-y-1">
                    {NAV_ITEMS.map(item => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Configuration Section */}
                <div className="mt-6">
                    <button
                        onClick={() => setConfigOpen(!configOpen)}
                        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider hover:text-[var(--text-secondary)]"
                    >
                        Configuration
                        <ChevronDown className={`w-4 h-4 transition-transform ${configOpen ? '' : '-rotate-90'}`} />
                    </button>
                    {configOpen && (
                        <ul className="space-y-1 mt-1">
                            {CONFIG_ITEMS.map(item => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </nav>

            {/* Version */}
            <div className="p-4 border-t border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-muted)]">v1.0.0</div>
            </div>
        </aside>
    );
}
