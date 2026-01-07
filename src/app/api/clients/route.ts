import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createClient, getClientsByUser } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const auth = requireAuth(request.headers);
        const clients = getClientsByUser(auth.userId);
        return NextResponse.json({ clients });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch clients' },
            { status: 401 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const auth = requireAuth(request.headers);
        const { name, gcpProjectId, industry, notes } = await request.json();

        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Client name is required' },
                { status: 400 }
            );
        }

        const result = createClient(auth.userId, name.trim(), gcpProjectId, industry, notes);

        return NextResponse.json({
            success: true,
            client: {
                id: result.lastInsertRowid,
                user_id: auth.userId,
                name: name.trim(),
                gcp_project_id: gcpProjectId || null,
                industry: industry || null,
                notes: notes || null,
                created_at: new Date().toISOString(),
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create client' },
            { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
        );
    }
}
