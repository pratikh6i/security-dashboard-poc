import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getClientById, getUploadsByDateRange } from '@/lib/db';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Finding {
    finding_category: string;
    finding_severity: string;
    resource_name: string;
    resource_project: string;
    finding_description: string;
    remediation: string;
}

export async function POST(request: Request) {
    try {
        const auth = requireAuth(request.headers);
        const { clientId, startDate, endDate } = await request.json();

        if (!clientId || !startDate || !endDate) {
            return NextResponse.json(
                { error: 'Client ID, start date, and end date are required' },
                { status: 400 }
            );
        }

        // Verify client belongs to user
        const client = getClientById(Number(clientId), auth.userId) as { name: string } | undefined;
        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // Get uploads in date range
        const uploads = getUploadsByDateRange(Number(clientId), startDate, endDate);

        // Aggregate findings
        const allFindings: Finding[] = [];
        let totalScans = 0;
        let totalCritical = 0;
        let totalHigh = 0;
        let totalMedium = 0;
        let totalLow = 0;

        uploads.forEach((upload: Record<string, unknown>) => {
            totalScans++;
            totalCritical += (upload.critical_count as number) || 0;
            totalHigh += (upload.high_count as number) || 0;
            totalMedium += (upload.medium_count as number) || 0;
            totalLow += (upload.low_count as number) || 0;

            if (upload.findings && Array.isArray(upload.findings)) {
                allFindings.push(...(upload.findings as Finding[]));
            }
        });

        // Generate PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(66, 133, 244);
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('CloudGuard SIEM', 20, 25);

        doc.setFontSize(12);
        doc.text('Security Assessment Report', 20, 35);

        // Report Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        let y = 55;

        doc.text(`Client: ${client.name}`, 20, y);
        y += 7;
        doc.text(`Report Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, 20, y);
        y += 7;
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, y);
        y += 15;

        // Executive Summary
        doc.setFontSize(16);
        doc.setTextColor(66, 133, 244);
        doc.text('Executive Summary', 20, y);
        y += 10;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        const summaryData = [
            ['Total Scans', String(totalScans)],
            ['Total Findings', String(allFindings.length)],
            ['Critical', String(totalCritical)],
            ['High', String(totalHigh)],
            ['Medium', String(totalMedium)],
            ['Low', String(totalLow)],
        ];

        autoTable(doc, {
            startY: y,
            head: [['Metric', 'Count']],
            body: summaryData,
            theme: 'striped',
            headStyles: { fillColor: [66, 133, 244] },
            margin: { left: 20, right: 20 },
        });

        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

        // Findings by Severity
        if (allFindings.length > 0) {
            doc.setFontSize(16);
            doc.setTextColor(66, 133, 244);
            doc.text('Detailed Findings', 20, y);
            y += 10;

            const findingsData = allFindings.slice(0, 20).map(f => [
                f.finding_category || 'N/A',
                f.finding_severity || 'N/A',
                (f.resource_name || '').split('/').pop() || 'N/A',
                f.resource_project || 'N/A',
            ]);

            autoTable(doc, {
                startY: y,
                head: [['Category', 'Severity', 'Resource', 'Project']],
                body: findingsData,
                theme: 'striped',
                headStyles: { fillColor: [66, 133, 244] },
                margin: { left: 20, right: 20 },
                styles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 50 },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 50 },
                    3: { cellWidth: 40 },
                },
            });

            y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
        }

        // Recommendations
        if (y < 250) {
            doc.setFontSize(16);
            doc.setTextColor(66, 133, 244);
            doc.text('Recommendations', 20, y);
            y += 10;

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            const recommendations = [
                '1. Address all CRITICAL and HIGH severity findings immediately.',
                '2. Implement a regular scanning schedule (weekly recommended).',
                '3. Review and restrict public access to cloud resources.',
                '4. Enable encryption at rest and in transit for all data.',
                '5. Implement least-privilege access controls.',
            ];

            recommendations.forEach((rec, i) => {
                if (y < 280) {
                    doc.text(rec, 20, y);
                    y += 7;
                }
            });
        }

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
                `Page ${i} of ${pageCount} | CloudGuard SIEM | Confidential`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // Return PDF as base64
        const pdfBase64 = doc.output('datauristring');

        return NextResponse.json({
            success: true,
            pdf: pdfBase64,
            filename: `CloudGuard_Report_${client.name}_${startDate}_${endDate}.pdf`,
        });
    } catch (error) {
        console.error('Report generation error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Report generation failed' },
            { status: 500 }
        );
    }
}
