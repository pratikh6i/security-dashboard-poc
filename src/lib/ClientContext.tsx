'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface Client {
    id: number;
    user_id: number;
    name: string;
    gcp_project_id: string | null;
    industry: string | null;
    notes: string | null;
    created_at: string;
}

interface ClientContextType {
    clients: Client[];
    currentClient: Client | null;
    isLoading: boolean;
    fetchClients: () => Promise<void>;
    createClient: (data: { name: string; gcpProjectId?: string; industry?: string; notes?: string }) => Promise<{ success: boolean; error?: string }>;
    updateClient: (id: number, data: { name?: string; gcpProjectId?: string; industry?: string; notes?: string }) => Promise<{ success: boolean; error?: string }>;
    deleteClient: (id: number) => Promise<{ success: boolean; error?: string }>;
    selectClient: (id: number) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const CLIENT_STORAGE_KEY = 'cloudguard-current-client';

export function ClientProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [currentClient, setCurrentClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchClients = useCallback(async () => {
        if (!user) {
            setClients([]);
            setCurrentClient(null);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/clients');
            if (response.ok) {
                const data = await response.json();
                setClients(data.clients || []);

                // Restore or set current client
                const storedId = localStorage.getItem(CLIENT_STORAGE_KEY);
                const storedClient = data.clients?.find((c: Client) => c.id === Number(storedId));

                if (storedClient) {
                    setCurrentClient(storedClient);
                } else if (data.clients?.length > 0) {
                    setCurrentClient(data.clients[0]);
                    localStorage.setItem(CLIENT_STORAGE_KEY, String(data.clients[0].id));
                }
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const createClient = useCallback(async (data: { name: string; gcpProjectId?: string; industry?: string; notes?: string }) => {
        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.error || 'Failed to create client' };
            }

            await fetchClients();

            // Select the new client
            if (result.client) {
                setCurrentClient(result.client);
                localStorage.setItem(CLIENT_STORAGE_KEY, String(result.client.id));
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }, [fetchClients]);

    const updateClient = useCallback(async (id: number, data: { name?: string; gcpProjectId?: string; industry?: string; notes?: string }) => {
        try {
            const response = await fetch(`/api/clients/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const result = await response.json();
                return { success: false, error: result.error || 'Failed to update client' };
            }

            await fetchClients();
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }, [fetchClients]);

    const deleteClient = useCallback(async (id: number) => {
        try {
            const response = await fetch(`/api/clients/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const result = await response.json();
                return { success: false, error: result.error || 'Failed to delete client' };
            }

            await fetchClients();
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }, [fetchClients]);

    const selectClient = useCallback((id: number) => {
        const client = clients.find(c => c.id === id);
        if (client) {
            setCurrentClient(client);
            localStorage.setItem(CLIENT_STORAGE_KEY, String(id));
        }
    }, [clients]);

    return (
        <ClientContext.Provider value={{
            clients,
            currentClient,
            isLoading,
            fetchClients,
            createClient,
            updateClient,
            deleteClient,
            selectClient,
        }}>
            {children}
        </ClientContext.Provider>
    );
}

export function useClient() {
    const context = useContext(ClientContext);
    if (!context) throw new Error('useClient must be used within ClientProvider');
    return context;
}
