'use client';

import React, { useState } from 'react';
import { useClient } from '@/lib/ClientContext';
import { ChevronDown, Plus, Building2, Settings, Trash2 } from 'lucide-react';

export default function ClientSelector() {
    const { clients, currentClient, selectClient, createClient, deleteClient } = useClient();
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newProjectId, setNewProjectId] = useState('');
    const [newIndustry, setNewIndustry] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!newClientName.trim()) return;

        setIsCreating(true);
        await createClient({
            name: newClientName.trim(),
            gcpProjectId: newProjectId.trim() || undefined,
            industry: newIndustry.trim() || undefined,
        });
        setNewClientName('');
        setNewProjectId('');
        setNewIndustry('');
        setShowCreateModal(false);
        setIsCreating(false);
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this client and all its data?')) {
            await deleteClient(id);
        }
    };

    if (clients.length === 0 && !showCreateModal) {
        return (
            <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
            >
                <Plus className="w-4 h-4" />
                Add Client
            </button>
        );
    }

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--sidebar-hover)] transition-colors min-w-40"
                >
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span className="flex-1 text-left truncate text-sm font-medium">
                        {currentClient?.name || 'Select Client'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <div className="absolute top-full left-0 mt-1 w-64 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                            {/* Client List */}
                            {clients.map(client => (
                                <div
                                    key={client.id}
                                    onClick={() => {
                                        selectClient(client.id);
                                        setIsOpen(false);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-[var(--bg-tertiary)] ${currentClient?.id === client.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                        }`}
                                >
                                    <Building2 className="w-4 h-4 text-blue-500" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">{client.name}</div>
                                        {client.gcp_project_id && (
                                            <div className="text-xs text-[var(--text-muted)] truncate">
                                                {client.gcp_project_id}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(client.id, e)}
                                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            {/* Add New Client */}
                            <div className="border-t border-[var(--border-color)]">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(true);
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-3 text-blue-500 hover:bg-[var(--bg-tertiary)]"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="text-sm font-medium">Add New Client</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Create Client Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-[var(--bg-primary)] rounded-xl shadow-xl w-full max-w-md p-6 m-4">
                        <h2 className="text-lg font-semibold mb-4">Add New Client</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Client Name *</label>
                                <input
                                    type="text"
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    placeholder="e.g., Google, Amazon, Flipkart"
                                    className="input w-full"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">GCP Project ID</label>
                                <input
                                    type="text"
                                    value={newProjectId}
                                    onChange={(e) => setNewProjectId(e.target.value)}
                                    placeholder="e.g., my-project-123"
                                    className="input w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Industry</label>
                                <select
                                    value={newIndustry}
                                    onChange={(e) => setNewIndustry(e.target.value)}
                                    className="input w-full"
                                >
                                    <option value="">Select industry...</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!newClientName.trim() || isCreating}
                                className="btn-primary disabled:opacity-50"
                            >
                                {isCreating ? 'Creating...' : 'Create Client'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
