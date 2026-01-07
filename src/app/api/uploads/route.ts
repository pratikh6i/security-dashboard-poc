import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createUpload, getUploadsByClient, getClientById } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const auth = requireAuth(request.headers);
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');

        if (!clientId) {
            return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
        }

        // Verify client belongs to user
        const client = getClientById(Number(clientId), auth.userId);
        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        const uploads = getUploadsByClient(Number(clientId));
        return NextResponse.json({ uploads });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch uploads' },
            { status: 401 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const auth = requireAuth(request.headers);
        const { clientId, name, type, findings } = await request.json();

        if (!clientId || !name || !findings) {
            return NextResponse.json(
                { error: 'Client ID, name, and findings are required' },
                { status: 400 }
            );
        }

        // Verify client belongs to user
        const client = getClientById(Number(clientId), auth.userId);
        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // Calculate summary
        const summary = {
            total: findings.length,
            critical: findings.filter((f: { finding_severity?: string }) => f.finding_severity === 'CRITICAL').length,
            high: findings.filter((f: { finding_severity?: string }) => f.finding_severity === 'HIGH').length,
            medium: findings.filter((f: { finding_severity?: string }) => f.finding_severity === 'MEDIUM').length,
            low: findings.filter((f: { finding_severity?: string }) => f.finding_severity === 'LOW').length,
            passed: findings.filter((f: { finding_state?: string }) => f.finding_state === 'INACTIVE').length,
            failed: findings.filter((f: { finding_state?: string }) => f.finding_state !== 'INACTIVE').length,
        };

        const result = createUpload({
            clientId: Number(clientId),
            name,
            type: type || 'manual',
            findings,
            summary,
        });

        return NextResponse.json({
            success: true,
            upload: {
                id: result.lastInsertRowid,
                clientId: Number(clientId),
                name,
                type: type || 'manual',
                timestamp: new Date().toISOString(),
                ...summary,
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to save upload' },
            { status: 500 }
        );
    }
}
