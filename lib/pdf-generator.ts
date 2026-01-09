import { jsPDF } from 'jspdf';
import { Gap, ReadinessSummary } from '@/types/scoring';

interface PdfGeneratorOptions {
    readinessSummary: ReadinessSummary;
}

export const generateReadinessReport = ({ readinessSummary }: PdfGeneratorOptions) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // --- Header ---
    // Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(30, 58, 95); // #1e3a5f (Dark Blue)
    doc.text('Reflecta', margin, yPos);

    // Date (Right aligned)
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // #6b7280 (Gray)
    doc.text(`Generated: ${today}`, pageWidth - margin, yPos, { align: 'right' });

    yPos += 15;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 95);
    doc.text('CMMC Level 2 Readiness Assessment Report', margin, yPos);

    yPos += 8;

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text('Internal Readiness Summary', margin, yPos);

    yPos += 5;

    // Horizontal Line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 15;

    // --- Score Section ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 95);
    doc.text('Overall Readiness Score', margin, yPos);

    yPos += 12;

    // Score Value
    doc.setFontSize(36);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text(`${readinessSummary.readinessPercent}%`, margin, yPos);

    // Context text next to score
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99); // Gray-600
    doc.text(`Your organization currently aligns with ${readinessSummary.fullyMetCount} of ${readinessSummary.totalControls} applicable`, margin + 40, yPos - 6);
    doc.text(`CMMC Level 2 controls. This report highlights areas for improvement.`, margin + 40, yPos - 1);

    yPos += 20;

    // --- Gaps Section ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 95);
    doc.text('Identified Gaps', margin, yPos);
    yPos += 2;
    doc.setDrawColor(30, 58, 95);
    doc.line(margin, yPos, margin + 40, yPos); // Underline header
    yPos += 10;

    // Gaps List
    if (readinessSummary.gaps.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(11);
        doc.setTextColor(75, 85, 99);
        doc.text('No gaps identified based on current responses.', margin, yPos);
    } else {
        doc.setFontSize(10);

        readinessSummary.gaps.forEach((gap) => {
            // Check for page break
            if (yPos > pageHeight - 30) {
                addFooter(doc, pageWidth, pageHeight);
                doc.addPage();
                yPos = margin + 10;
            }

            // Control ID box
            doc.setFillColor(243, 244, 246); // Gray-100
            doc.rect(margin, yPos, 20, 8, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(31, 41, 55);
            doc.text(gap.controlId, margin + 2, yPos + 5.5);

            // Title
            doc.setFont('helvetica', 'bold');
            doc.text(gap.title, margin + 25, yPos + 5.5);

            // Response Status Pill (rudimentary)
            const responseText = gap.response || 'Unknown';
            let statusColor = [156, 163, 175]; // Gray
            if (responseText === 'No') statusColor = [220, 38, 38]; // Red
            if (responseText === 'Partial') statusColor = [217, 119, 6]; // Amber

            doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
            doc.setFont('helvetica', 'bold');
            doc.text(`[${responseText}]`, pageWidth - margin, yPos + 5.5, { align: 'right' });

            yPos += 12;
        });
    }

    // Add footer to final page
    addFooter(doc, pageWidth, pageHeight);

    // Save
    const filenameDate = new Date().toISOString().split('T')[0];
    doc.save(`CMMC-Level2-Readiness-Report-${filenameDate}.pdf`);
};

function addFooter(doc: jsPDF, pageWidth: number, pageHeight: number) {
    const footerY = pageHeight - 15;

    // Line
    doc.setDrawColor(229, 231, 235);
    doc.line(20, footerY, pageWidth - 20, footerY);

    // Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // Gray-400

    const disclaimer = "This report provides an internal readiness assessment and does not constitute certification, attestation, or a formal CMMC audit. Results are for internal planning purposes only.";
    const branding = "Generated by Reflecta | reflecta.tech";

    doc.text(disclaimer, pageWidth / 2, footerY + 5, { align: 'center', maxWidth: pageWidth - 40 });
    doc.text(branding, pageWidth / 2, footerY + 10, { align: 'center' });
}
