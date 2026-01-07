'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { useData } from '@/lib/DataContext';

const PAGE_TITLES: Record<string, string> = {
    '/': 'Overview',
    '/findings': 'Findings',
    '/resources': 'Resources',
    '/lighthouse': 'Sentinel AI',
    '/scans': 'Scan History',
    '/settings': 'Settings',
    '/profile': 'Profile',
};

export default function Header() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const { currentScan, scans, selectScan } = useData();
    const [showScans, setShowScans] = React.useState(false);
    const [showUser, setShowUser] = React.useState(false);

    const pageTitle = PAGE_TITLES[pathname] || 'Dashboard';

    return (
        <header className="h-14 flex items-center justify-between px-6 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
            {/* Left: Page Title & Scan Selector */}
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold">{pageTitle}</h1>

                {/* Scan Selector (only on relevant pages) */}
                {currentScan && ['/', '/findings', '/resources'].includes(pathname) && (
                    <div className="relative">
                        <button
                            onClick={() => setShowScans(!showScans)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                            <span className="max-w-48 truncate">{currentScan.name}</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {showScans && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowScans(false)} />
                                <div className="absolute top-full left-0 mt-1 w-64 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                                    {scans.map(scan => (
                                        <button
                                            key={scan.id}
                                            onClick={() => {
                                                selectScan(scan.id);
                                                setShowScans(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-tertiary)] ${scan.id === currentScan.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''
                                                }`}
                                        >
                                            <div className="font-medium truncate">{scan.name}</div>
                                            <div className="text-xs text-[var(--text-muted)]">
                                                {scan.summary.total} findings • {new Date(scan.timestamp).toLocaleDateString()}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors relative">
                    <Bell className="w-5 h-5" />
                </button>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUser(!showUser)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                            P
                        </div>
                    </button>

                    {showUser && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowUser(false)} />
                            <div className="absolute top-full right-0 mt-1 w-56 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-lg z-50">
                                <div className="p-4 border-b border-[var(--border-color)]">
                                    <div className="font-medium">Pratik Shetti</div>
                                    <div className="text-sm text-[var(--text-muted)]">pratik@gmail.com</div>
                                </div>
                                <div className="p-2">
                                    <a
                                        href="/profile"
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg-tertiary)]"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile
                                    </a>
                                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg-tertiary)] w-full text-left text-red-500">
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
