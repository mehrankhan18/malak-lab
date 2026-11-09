const PDFDocument = require('pdfkit');

/**
 * Generate Laboratory Report PDF
 * @param {Object} report LaboratoryReport model instance
 * @param {Object} booking Associated booking
 * @returns {PDFDocument} Streamable PDFDocument
 */
const generateReportPDF = (report, res) => {
  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    info: {
      Title: `Lab Report - ${report.reportId}`,
      Author: 'MALAK Lab Science Hub',
      Subject: `Clinical Report for ${report.patientInfo.fullName}`,
    }
  });

  // Stream directly to response
  doc.pipe(res);

  // --- HEADER ---
  // Top decorative band
  doc.rect(0, 0, doc.page.width, 10).fill('#0284c7');

  // Lab Brand
  doc.fillColor('#0284c7').fontSize(18).font('Helvetica-Bold').text('MALAK LAB SCIENCE HUB', 40, 25);
  doc.fillColor('#475569').fontSize(8.5).font('Helvetica').text('Opposite DHQ Hospital, Main GT Road, Timergara, Lower Dir', 40, 48);
  doc.fontSize(8).fillColor('#64748b').text('Phone: 0328 5027351', 40, 60);

  // Status Badge on Top Right
  const statusColor = report.status === 'published' || report.status === 'approved' ? '#059669' : '#d97706';
  doc.roundedRect(420, 25, 135, 24, 4).fillAndStroke(statusColor, statusColor);
  doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text(`STATUS: ${report.status.toUpperCase()}`, 425, 32, { width: 125, align: 'center' });

  // Divider
  doc.moveTo(40, 78).lineTo(555, 78).strokeColor('#cbd5e1').lineWidth(1).stroke();

  // --- PATIENT & SAMPLE DETAILS BOX ---
  doc.roundedRect(40, 86, 515, 86, 6).fillAndStroke('#f8fafc', '#e2e8f0');

  // Left column (Patient info)
  doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text('PATIENT DEMOGRAPHICS', 50, 94);
  doc.font('Helvetica').fontSize(8.5).fillColor('#334155');
  doc.text(`Patient Name: `, 50, 108, { continued: true }).font('Helvetica-Bold').text(`${report.patientInfo.fullName}`);
  doc.font('Helvetica').text(`Age / Gender: `, 50, 122, { continued: true }).font('Helvetica-Bold').text(`${report.patientInfo.age} Yrs / ${report.patientInfo.gender}`);
  doc.font('Helvetica').text(`Contact No: `, 50, 136, { continued: true }).text(`${report.patientInfo.phone}`);
  doc.font('Helvetica').text(`Referred By: `, 50, 150, { continued: true }).text(report.referringProvider || 'Not specified');

  // Right column (Sample & Report info)
  doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text('SPECIMEN & LAB IDENTIFIERS', 310, 94);
  doc.font('Helvetica').fontSize(8.5).fillColor('#334155');
  doc.text(`Report ID: `, 310, 108, { continued: true }).font('Helvetica-Bold').text(`${report.reportId}`);
  doc.font('Helvetica').text(`Booking Ref: `, 310, 122, { continued: true }).text(`${report.bookingCode}`);
  doc.font('Helvetica').text(`Sample Type: `, 310, 136, { continued: true }).font('Helvetica-Bold').text(`${report.sampleType}`);
  
  const colDate = report.collectedAt ? new Date(report.collectedAt).toLocaleString() : 'Not recorded';
  const repDate = report.reportedAt ? new Date(report.reportedAt).toLocaleString() : new Date().toLocaleString();
  doc.font('Helvetica').text(`Collected / Reported: `, 310, 150, { continued: true }).text(`${colDate} / ${repDate}`);

  // Department banner
  doc.rect(40, 182, 515, 22).fill('#0ea5e9');
  doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text(`DEPARTMENT OF ${report.department.toUpperCase()} — ${report.testName.toUpperCase()}`, 50, 188);

  // --- PARAMETERS TABLE HEADER ---
  let y = 214;
  doc.rect(40, y, 515, 20).fill('#e0f2fe');
  doc.fillColor('#0369a1').fontSize(8.5).font('Helvetica-Bold');
  doc.text('TEST PARAMETER', 50, y + 6);
  doc.text('OBSERVED VALUE', 220, y + 6);
  doc.text('UNIT', 325, y + 6);
  doc.text('REFERENCE INTERVAL', 390, y + 6);
  doc.text('FLAG', 500, y + 6);

  y += 24;

  // --- PARAMETERS ROWS ---
  doc.lineWidth(0.5).strokeColor('#f1f5f9');
  (report.results || []).forEach((item, index) => {
    // Zebra background
    if (index % 2 === 1) {
      doc.rect(40, y - 2, 515, 20).fill('#f8fafc');
    }

    const isAbnormal = item.flag && item.flag !== 'Normal';
    
    // Parameter name
    doc.fillColor('#1e293b').fontSize(8.5).font('Helvetica').text(item.parameterName, 50, y + 2, { width: 160 });

    // Value
    if (isAbnormal) {
      doc.fillColor('#dc2626').font('Helvetica-Bold').text(item.resultValue, 220, y + 2);
    } else {
      doc.fillColor('#0f172a').font('Helvetica-Bold').text(item.resultValue, 220, y + 2);
    }

    // Unit
    doc.fillColor('#475569').font('Helvetica').text(item.unit || '-', 325, y + 2);

    // Reference Range
    doc.fillColor('#475569').font('Helvetica').text(item.referenceRange || 'Not provided', 390, y + 2, { width: 100 });

    // Flag badge
    if (isAbnormal) {
      doc.fillColor('#b91c1c').font('Helvetica-Bold').text(`[ ${item.flag.toUpperCase()} ]`, 495, y + 2);
    } else {
      doc.fillColor('#059669').font('Helvetica').text('Normal', 500, y + 2);
    }

    // Row underline
    doc.moveTo(40, y + 18).lineTo(555, y + 18).strokeColor('#e2e8f0').stroke();
    y += 22;
  });

  // --- CLINICAL IMPRESSION / NOTES BOX ---
  y += 10;
  doc.roundedRect(40, y, 515, 60, 4).fillAndStroke('#f8fafc', '#cbd5e1');
  doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text('CLINICAL IMPRESSION & INTERPRETATION:', 50, y + 8);
  doc.fillColor('#334155').fontSize(8).font('Helvetica').text(report.clinicalImpression || 'No interpretation supplied.', 50, y + 22, { width: 495 });
  doc.fillColor('#64748b').fontSize(7.5).font('Helvetica-Oblique').text(report.overallRemarks || 'Please discuss these results with your healthcare provider.', 50, y + 42, { width: 495 });

  // --- SIGNATURES & VERIFICATION SECTION ---
  y += 75;
  doc.moveTo(40, y).lineTo(555, y).strokeColor('#cbd5e1').stroke();

  y += 15;
  // Left: Technologist
  doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text(report.technicianName || 'Not recorded', 50, y);
  doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text('Prepared by', 50, y + 12);

  // Center: Verification Seal
  doc.fillColor('#0284c7').fontSize(8).font('Helvetica-Bold').text('REPORT STATUS', 220, y, { align: 'center', width: 155 });
  doc.fillColor('#64748b').fontSize(7).font('Helvetica').text(report.status.toUpperCase(), 220, y + 12, { align: 'center', width: 155 });
  doc.text('For questions, contact MALAK Lab.', 220, y + 22, { align: 'center', width: 155 });

  // Right: Pathologist
  doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text(report.pathologistName || 'Not recorded', 400, y, { align: 'right', width: 150 });
  doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text(report.pathologistQualifications || 'Reviewer', 400, y + 12, { align: 'right', width: 150 });

  // Footer Disclaimer
  doc.rect(0, doc.page.height - 24, doc.page.width, 24).fill('#0f172a');
  doc.fillColor('#94a3b8').fontSize(7).font('Helvetica').text('MALAK Lab Science Hub | Confidential Medical Document | Phone: 0328 5027351', 0, doc.page.height - 16, { align: 'center', width: doc.page.width });

  doc.end();
};

module.exports = { generateReportPDF };
