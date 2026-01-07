'use client';

import React from 'react';
import { User, Mail, Building, Calendar, Key, Shield, Check } from 'lucide-react';

export default function ProfilePage() {
    // Mock user data (in production, get from auth)
    const user = {
        name: 'Pratik Shetti',
        email: 'pratik@gmail.com',
        organization: 'Searce',
        role: 'admin',
        joinedAt: '2026-01-07T13:56:00Z',
        orgId: '06b4fe23-31de-4bd0-b722-21e702a4a2dd',
    };

    const permissions = [
        'Manage Users',
        'Manage Account',
        'Manage Providers',
        'Manage Scans',
        'Manage Integrations',
        'Unlimited Visibility',
    ];

    return (
        <div className="max-w-4xl space-y-6 animate-fadeIn">
            {/* Profile Header */}
            <div className="card p-6">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold">{user.name}</h1>
                        <div className="flex items-center gap-2 text-[var(--text-muted)]">
                            <Mail className="w-4 h-4" />
                            {user.email}
                            <span className="mx-1">|</span>
                            <Building className="w-4 h-4" />
                            {user.organization}
                        </div>
                    </div>
                    <div className="text-right text-sm">
                        <div className="flex items-center gap-2 text-[var(--text-muted)]">
                            <Calendar className="w-4 h-4" />
                            Joined {new Date(user.joinedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                    <div className="text-sm text-[var(--text-muted)]">Organization ID</div>
                    <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm bg-[var(--bg-tertiary)] px-2 py-1 rounded">{user.orgId}</code>
                        <button
                            onClick={() => navigator.clipboard.writeText(user.orgId)}
                            className="p-1 hover:bg-[var(--bg-tertiary)] rounded"
                            title="Copy"
                        >
                            📋
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Roles */}
                <div className="card p-6">
                    <h2 className="font-semibold mb-4">Active Roles</h2>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium">
                            {user.role}
                        </span>
                        <span className="text-sm text-[var(--text-muted)]">Unlimited</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {permissions.map((perm, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-green-500" />
                                {perm}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Organizations */}
                <div className="card p-6">
                    <h2 className="font-semibold mb-4">Organizations</h2>
                    <div className="p-3 rounded-lg border border-[var(--border-color)] flex items-center gap-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600">
                            owner
                        </span>
                        <div className="flex-1">
                            <div className="font-medium">pratik default tenant</div>
                            <div className="text-xs text-[var(--text-muted)]">
                                Joined on: {new Date(user.joinedAt).toLocaleDateString()}
                            </div>
                        </div>
                        <button className="text-sm text-blue-500 hover:underline">Edit</button>
                    </div>
                </div>
            </div>

            {/* API Keys */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-semibold">API Keys</h2>
                        <p className="text-sm text-[var(--text-muted)]">Manage API keys for programmatic access</p>
                    </div>
                    <button className="btn-primary flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Create API Key
                    </button>
                </div>

                <div className="text-center py-8 text-[var(--text-muted)] border border-dashed border-[var(--border-color)] rounded-lg">
                    <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No API keys created yet</p>
                </div>
            </div>

            {/* Security */}
            <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-5 h-5" />
                    <h2 className="font-semibold">SAML SSO Integration</h2>
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                    Configure SAML Single Sign-On for secure authentication
                </p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                    <div>
                        <div className="font-medium">Status: Disabled</div>
                    </div>
                    <button className="btn-primary">Enable</button>
                </div>
            </div>
        </div>
    );
}
