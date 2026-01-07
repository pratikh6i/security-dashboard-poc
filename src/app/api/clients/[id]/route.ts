import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getClientById, updateClient, deleteClient } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = requireAuth(request.headers);
        const { id } = await params;
        const client = getClientById(Number(id), auth.userId);

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json({ client });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch client' },
            { status: 401 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = requireAuth(request.headers);
        const { id } = await params;
        const data = await request.json();

        const client = getClientById(Number(id), auth.userId);
        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        updateClient(Number(id), auth.userId, data);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update client' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = requireAuth(request.headers);
        const { id } = await params;

        const client = getClientById(Number(id), auth.userId);
        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        deleteClient(Number(id), auth.userId);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete client' },
            { status: 500 }
        );
    }
}
