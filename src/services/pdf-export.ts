import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Quote, LineItemCategory } from '../types';

// Category display labels
const categoryLabels: Record<LineItemCategory, string> = {
  audio: 'Audio',
  video: 'Video',
  lighting: 'Lighting',
  staging: 'Staging',
  rigging: 'Rigging & Truss',
  cables: 'Cables',
  signal: 'Signal / Switching',
  decor: 'Drape & Decor',
  power: 'Power Distribution',
  comms: 'Communications',
  labor: 'Labor',
  other: 'Other',
};

// Category display order
const categoryOrder: LineItemCategory[] = [
  'audio',
  'video',
  'signal',
  'lighting',
  'rigging',
  'staging',
  'decor',
  'cables',
  'power',
  'comms',
  'labor',
  'other',
];

/**
 * Generate a professional PDF quote
 */
export function generateQuotePDF(quote: Quote): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Colors
  const primaryColor: [number, number, number] = [20, 184, 166]; // Teal-500
  const darkGray: [number, number, number] = [51, 65, 85]; // Slate-700
  const lightGray: [number, number, number] = [148, 163, 184]; // Slate-400

  // Header - Company Name
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('QMAV', margin, yPos);

  // Quote number on the right
  doc.setFontSize(12);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quote #${quote.id}`, pageWidth - margin, yPos, { align: 'right' });

  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(...lightGray);
  doc.text(`Created: ${new Date(quote.createdAt).toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });

  yPos += 15;

  // Divider line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 15;

  // Event Details Section
  doc.setFontSize(14);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'bold');
  doc.text('Event Details', margin, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const eventDetails = [
    ['Event:', quote.eventName],
    ['Venue:', quote.venue || 'TBD'],
    ['Date:', quote.eventDate ? new Date(quote.eventDate).toLocaleDateString() : 'TBD'],
    ['Client:', quote.clientName || 'N/A'],
  ];

  eventDetails.forEach(([label, value]) => {
    doc.setTextColor(...lightGray);
    doc.text(label, margin, yPos);
    doc.setTextColor(...darkGray);
    doc.text(value, margin + 25, yPos);
    yPos += 6;
  });

  yPos += 10;

  // Group line items by category
  const groupedItems = quote.lineItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof quote.lineItems>
  );

  // Equipment sections by category
  categoryOrder.forEach((category) => {
    const items = groupedItems[category];
    if (!items || items.length === 0) return;

    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }

    // Category header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(categoryLabels[category] || category, margin, yPos);
    yPos += 2;

    // Category table
    autoTable(doc, {
      startY: yPos,
      head: [['Description', 'Qty', 'Unit Price', 'Total']],
      body: items.map((item) => [
        item.description,
        item.quantity.toString(),
        `$${item.unitPrice.toLocaleString()}`,
        `$${item.total.toLocaleString()}`,
      ]),
      foot: [[
        { content: 'Category Subtotal', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: `$${items.reduce((sum, i) => sum + i.total, 0).toLocaleString()}`, styles: { fontStyle: 'bold' } },
      ]],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [30, 41, 59], // Slate-800
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkGray,
      },
      footStyles: {
        fillColor: [241, 245, 249], // Slate-100
        textColor: darkGray,
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
      },
      theme: 'grid',
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  });

  // Totals section
  if (yPos > 230) {
    doc.addPage();
    yPos = margin;
  }

  yPos += 5;

  const subtotal = quote.lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.0825;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Totals box
  const totalsX = pageWidth - margin - 70;

  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.2);
  doc.rect(totalsX - 5, yPos - 5, 75, 35);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);
  doc.text('Subtotal:', totalsX, yPos + 5);
  doc.setTextColor(...darkGray);
  doc.text(`$${subtotal.toLocaleString()}`, pageWidth - margin, yPos + 5, { align: 'right' });

  doc.setTextColor(...lightGray);
  doc.text('Tax (8.25%):', totalsX, yPos + 13);
  doc.setTextColor(...darkGray);
  doc.text(`$${tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, pageWidth - margin, yPos + 13, { align: 'right' });

  doc.setDrawColor(...primaryColor);
  doc.line(totalsX, yPos + 18, pageWidth - margin, yPos + 18);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Total:', totalsX, yPos + 27);
  doc.text(`$${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, pageWidth - margin, yPos + 27, { align: 'right' });

  yPos += 50;

  // Notes and Terms
  if (yPos > 240) {
    doc.addPage();
    yPos = margin;
  }

  // Notes
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('Notes', margin, yPos);

  yPos += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);

  const notes = [
    'Pricing based on rental period',
    'Delivery and pickup included within 25 miles',
    'Technician available at $65/hr if needed',
  ];

  notes.forEach((note) => {
    doc.text(`• ${note}`, margin + 3, yPos);
    yPos += 5;
  });

  yPos += 8;

  // Terms
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('Terms & Conditions', margin, yPos);

  yPos += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);

  const terms = [
    '50% deposit required to confirm booking',
    'Balance due on delivery',
    `Quote valid for 30 days (expires ${new Date(quote.expiresAt).toLocaleDateString()})`,
  ];

  terms.forEach((term) => {
    doc.text(`• ${term}`, margin + 3, yPos);
    yPos += 5;
  });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(...lightGray);
  doc.text('Generated by QMAV - AV Quotes in Minutes, Not Hours', pageWidth / 2, footerY, { align: 'center' });

  return doc;
}

/**
 * Download the quote as a PDF file
 */
export function downloadQuotePDF(quote: Quote): void {
  const doc = generateQuotePDF(quote);
  const filename = `Quote-${quote.id}-${quote.eventName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}

/**
 * Open the quote PDF in a new tab for preview
 */
export function previewQuotePDF(quote: Quote): void {
  const doc = generateQuotePDF(quote);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
