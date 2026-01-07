import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { requireAuth } from '@/lib/auth';
import { getClientById, createUpload } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const auth = requireAuth(request.headers);
        const { clientId, projectId } = await request.json();

        if (!clientId || !projectId) {
            return NextResponse.json(
                { error: 'Client ID and Project ID are required' },
                { status: 400 }
            );
        }

        // Verify client belongs to user
        const client = getClientById(Number(clientId), auth.userId);
        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // Execute Python scanner
        const scannerPath = path.join(process.cwd(), 'gcp_security_scanner.py');

        return new Promise<Response>((resolve) => {
            const findings: Array<{ finding_severity?: string; finding_state?: string }> = [];
            let errorOutput = '';

            const scanner = spawn('python3', [
                scannerPath,
                '--project-ids', projectId,
                '--output-format', 'json'
            ], {
                cwd: process.cwd(),
                env: { ...process.env },
            });

            let stdoutData = '';

            scanner.stdout.on('data', (data: Buffer) => {
                stdoutData += data.toString();
            });

            scanner.stderr.on('data', (data: Buffer) => {
                errorOutput += data.toString();
            });

            scanner.on('close', async (code) => {
                if (code !== 0) {
                    resolve(NextResponse.json(
                        { error: `Scanner failed with code ${code}`, details: errorOutput },
                        { status: 500 }
                    ));
                    return;
                }

                try {
                    // Try to parse JSON output
                    const jsonMatch = stdoutData.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        const parsedFindings = JSON.parse(jsonMatch[0]);
                        findings.push(...parsedFindings);
                    }
                } catch (parseError) {
                    // If JSON parsing fails, create a basic result
                    console.error('Failed to parse scanner output:', parseError);
                }

                // Calculate summary
                const summary = {
                    total: findings.length,
                    critical: findings.filter(f => f.finding_severity === 'CRITICAL').length,
                    high: findings.filter(f => f.finding_severity === 'HIGH').length,
                    medium: findings.filter(f => f.finding_severity === 'MEDIUM').length,
                    low: findings.filter(f => f.finding_severity === 'LOW').length,
                    passed: findings.filter(f => f.finding_state === 'INACTIVE').length,
                    failed: findings.filter(f => f.finding_state !== 'INACTIVE').length,
                };

                // Save as upload
                const uploadResult = createUpload({
                    clientId: Number(clientId),
                    name: `Scan - ${projectId} - ${new Date().toLocaleDateString()}`,
                    type: 'scan',
                    findings,
                    summary,
                });

                resolve(NextResponse.json({
                    success: true,
                    uploadId: uploadResult.lastInsertRowid,
                    summary,
                    findingsCount: findings.length,
                }));
            });

            // Handle timeout
            setTimeout(() => {
                scanner.kill();
                resolve(NextResponse.json(
                    { error: 'Scanner timeout - process took too long' },
                    { status: 504 }
                ));
            }, 300000); // 5 minute timeout
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Scanner failed' },
            { status: 500 }
        );
    }
}
