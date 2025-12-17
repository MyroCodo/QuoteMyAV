/**
 * Mock Quote PDF Generator
 * Generates 50 realistic AV rental quotes with varied lengths and equipment
 *
 * Run with: node scripts/generate-mock-quotes.js
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load data files
const equipmentDb = JSON.parse(fs.readFileSync(path.join(__dirname, 'mock-data', 'equipment-database.json'), 'utf8'));
const dataPools = JSON.parse(fs.readFileSync(path.join(__dirname, 'mock-data', 'data-pools.json'), 'utf8'));

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'mock-quotes');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Category labels and order (matching the app)
const categoryLabels = {
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

const categoryOrder = ['audio', 'video', 'signal', 'lighting', 'rigging', 'staging', 'decor', 'cables', 'power', 'comms', 'labor', 'other'];

// Map equipment database categories to app categories
const dbCategoryMap = {
  audio: 'audio',
  video: 'video',
  signal: 'signal',
  lighting: 'lighting',
  staging: 'staging',
  rigging: 'rigging',
  decor: 'decor',
  cables: 'cables',
  power: 'power',
  comms: 'comms',
  labor: 'labor',
  other: 'other'
};

// Utility functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedRandomChoice(items) {
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= (item.weight || 1);
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}

function generateId() {
  return `QM-${Date.now()}-${randomInt(1000, 9999)}`;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function generateEventName(eventType, client) {
  const patterns = dataPools.eventNamePatterns[eventType.type] || ['{company} Event'];
  let pattern = randomChoice(patterns);

  const year = new Date().getFullYear();
  const randomData = dataPools.randomData;

  pattern = pattern
    .replace('{company}', client.company.split(' ')[0])
    .replace('{year}', year.toString())
    .replace('{product}', randomChoice(randomData.products))
    .replace('{tradeshow}', randomChoice(randomData.tradeshows))
    .replace('{firstName}', randomChoice(randomData.firstNames))
    .replace('{firstName2}', randomChoice(randomData.firstNames))
    .replace('{lastName}', randomChoice(randomData.lastNames))
    .replace('{lastName2}', randomChoice(randomData.lastNames))
    .replace('{artist}', randomChoice(randomData.artists))
    .replace('{festival}', randomChoice(randomData.festivals))
    .replace('{genre}', randomChoice(randomData.genres))
    .replace('{venue}', 'Austin')
    .replace('{school}', randomChoice(randomData.schools))
    .replace('{charity}', randomChoice(randomData.charities))
    .replace('{cause}', 'Children\'s Health')
    .replace('{organization}', 'Community Foundation')
    .replace('{topic}', randomChoice(randomData.topics))
    .replace('{game}', randomChoice(randomData.games))
    .replace('{designer}', 'Austin Design Co')
    .replace('{brand}', 'Fashion Forward')
    .replace('{city}', 'Austin')
    .replace('{church}', 'First Community Church')
    .replace('{candidate}', 'John Smith')
    .replace('{office}', 'City Council')
    .replace('{party}', 'Citizens')
    .replace('{film}', 'The Documentary')
    .replace('{studio}', 'Indie Films')
    .replace('{league}', 'Pro Gaming')
    .replace('{location}', 'Downtown')
    .replace('{theme}', 'Future of Tech');

  return pattern;
}

function getEquipmentFromCategory(category, subcategory, count) {
  const items = [];
  const categoryData = equipmentDb[category];

  if (!categoryData) return items;

  // Get all items from the subcategory or pick randomly from all subcategories
  let availableItems = [];

  if (subcategory && categoryData[subcategory]) {
    availableItems = [...categoryData[subcategory]];
  } else {
    // Combine all subcategories
    for (const subcat of Object.values(categoryData)) {
      if (Array.isArray(subcat)) {
        availableItems.push(...subcat);
      }
    }
  }

  // Shuffle and pick items
  availableItems = availableItems.sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(count, availableItems.length); i++) {
    const item = availableItems[i];
    const quantity = getRealisticQuantity(item.name);
    items.push({
      id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
      category: dbCategoryMap[category] || 'other',
      description: item.name,
      quantity: quantity,
      unitPrice: item.dailyRate,
      total: quantity * item.dailyRate
    });
  }

  return items;
}

function getRealisticQuantity(itemName) {
  const name = itemName.toLowerCase();

  // Single items
  if (name.includes('console') || name.includes('mixer') || name.includes('switcher') ||
      name.includes('controller') || name.includes('lectern') || name.includes('generator') ||
      name.includes('snake') || name.includes('press mult') || name.includes('system')) {
    return 1;
  }

  // Pairs
  if (name.includes('screen') || name.includes('projector') || name.includes('subwoofer') ||
      name.includes('camera') && !name.includes('(')) {
    return randomInt(1, 3);
  }

  // Small multiples
  if (name.includes('speaker') || name.includes('monitor') || name.includes('wireless') ||
      name.includes('microphone') || name.includes('light') || name.includes('lamp')) {
    return randomInt(2, 8);
  }

  // Cables and hardware
  if (name.includes('cable') || name.includes('adapter') || name.includes('shackle') ||
      name.includes('clamp') || name.includes('sandbag')) {
    return randomInt(4, 20);
  }

  // Staging
  if (name.includes('deck') || name.includes('riser') || name.includes('drape')) {
    return randomInt(1, 6);
  }

  // Default
  return randomInt(1, 4);
}

function generateLineItems(eventType, size) {
  const sizeConfig = dataPools.eventSizes[size];
  const targetItems = randomInt(sizeConfig.lineItems[0], sizeConfig.lineItems[1]);
  const lineItems = [];

  // Determine which categories to include based on event type
  const categories = eventType.typicalCategories;
  const itemsPerCategory = Math.ceil(targetItems / categories.length);

  for (const category of categories) {
    if (!equipmentDb[category]) continue;

    // Get subcategories
    const subcategories = Object.keys(equipmentDb[category]);
    const itemCount = randomInt(Math.floor(itemsPerCategory * 0.5), Math.ceil(itemsPerCategory * 1.5));

    // Pick items from random subcategories
    let addedItems = 0;
    const shuffledSubcats = subcategories.sort(() => Math.random() - 0.5);

    for (const subcat of shuffledSubcats) {
      if (addedItems >= itemCount) break;

      const subcatItems = getEquipmentFromCategory(category, subcat, randomInt(1, Math.ceil(itemCount / 2)));
      for (const item of subcatItems) {
        if (addedItems >= itemCount) break;
        lineItems.push(item);
        addedItems++;
      }
    }
  }

  // Always add some cables if we have video or audio
  if (categories.includes('audio') || categories.includes('video')) {
    const cableItems = getEquipmentFromCategory('cables', null, randomInt(3, 10));
    lineItems.push(...cableItems);
  }

  return lineItems;
}

function generateQuote(index) {
  // Pick event type based on weights
  const eventType = weightedRandomChoice(dataPools.eventTypes);

  // Pick a size for this event type
  const size = randomChoice(eventType.sizes);
  const sizeConfig = dataPools.eventSizes[size];

  // Pick client and venue
  const client = randomChoice(dataPools.clients);
  const venue = randomChoice(dataPools.venues);

  // Generate event dates (within next 6 months)
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + randomInt(14, 180));

  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - randomInt(0, 30));

  const expiresDate = new Date(createdDate);
  expiresDate.setDate(expiresDate.getDate() + 30);

  // Generate event name
  const eventName = generateEventName(eventType, client);

  // Generate line items
  const lineItems = generateLineItems(eventType, size);

  // Calculate total
  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  // Pick status
  const status = weightedRandomChoice(dataPools.quoteStatuses).status;

  return {
    id: `QM-${String(index + 1).padStart(4, '0')}`,
    userId: 'demo-user',
    clientName: client.contact,
    clientCompany: client.company,
    clientEmail: client.email,
    eventName: eventName,
    eventType: eventType.type,
    eventDate: eventDate.toISOString(),
    venue: `${venue.name}, ${venue.city}, ${venue.state}`,
    venueName: venue.name,
    venueCity: venue.city,
    venueState: venue.state,
    status: status,
    totalAmount: totalAmount,
    lineItems: lineItems,
    notes: '',
    attendees: randomInt(sizeConfig.attendees[0], sizeConfig.attendees[1]),
    createdAt: createdDate.toISOString(),
    updatedAt: createdDate.toISOString(),
    expiresAt: expiresDate.toISOString(),
    size: size
  };
}

function generateQuotePDF(quote) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Colors
  const primaryColor = [20, 184, 166]; // Teal-500
  const darkGray = [51, 65, 85]; // Slate-700
  const lightGray = [148, 163, 184]; // Slate-400
  const headerBg = [30, 41, 59]; // Slate-800

  // ============ HEADER ============
  doc.setFontSize(28);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('QMAV', margin, yPos + 5);

  // Tagline
  doc.setFontSize(8);
  doc.setTextColor(...lightGray);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional AV Quotes', margin, yPos + 11);

  // Quote info on right
  doc.setFontSize(20);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTIMATE', pageWidth - margin, yPos + 2, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos += 10;
  doc.setTextColor(...lightGray);
  doc.text(`Quote #: ${quote.id}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;
  doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;
  doc.text(`Status: ${quote.status.replace('_', ' ').toUpperCase()}`, pageWidth - margin, yPos, { align: 'right' });

  yPos += 8;

  // Divider
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 10;

  // ============ CLIENT & VENUE INFO ============
  const colWidth = (pageWidth - margin * 2) / 3;

  // Client column
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Client', margin, yPos);

  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'normal');
  yPos += 5;
  doc.text(quote.clientCompany || quote.clientName, margin, yPos);
  yPos += 4;
  doc.text(quote.clientName, margin, yPos);
  yPos += 4;
  doc.setTextColor(...lightGray);
  doc.text(quote.clientEmail, margin, yPos);

  // Venue column
  yPos -= 13;
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Venue', margin + colWidth, yPos);

  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'normal');
  yPos += 5;
  doc.text(quote.venueName, margin + colWidth, yPos);
  yPos += 4;
  doc.text(`${quote.venueCity}, ${quote.venueState}`, margin + colWidth, yPos);

  // Event column
  yPos -= 9;
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Event Details', margin + colWidth * 2, yPos);

  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'normal');
  yPos += 5;

  // Truncate event name if too long
  let eventName = quote.eventName;
  if (eventName.length > 35) {
    eventName = eventName.substring(0, 32) + '...';
  }
  doc.text(eventName, margin + colWidth * 2, yPos);
  yPos += 4;
  doc.text(`Date: ${new Date(quote.eventDate).toLocaleDateString()}`, margin + colWidth * 2, yPos);
  yPos += 4;
  doc.setTextColor(...lightGray);
  doc.text(`Est. Attendees: ${quote.attendees.toLocaleString()}`, margin + colWidth * 2, yPos);

  yPos += 12;

  // ============ EQUIPMENT SECTIONS ============
  // Group items by category
  const groupedItems = {};
  for (const item of quote.lineItems) {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  }

  // Render each category
  for (const category of categoryOrder) {
    const items = groupedItems[category];
    if (!items || items.length === 0) continue;

    // Check if we need new page
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;

      // Page header
      doc.setFontSize(8);
      doc.setTextColor(...lightGray);
      doc.text(`Quote #${quote.id} - ${quote.eventName}`, margin, yPos);
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 10;
    }

    // Category header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(categoryLabels[category] || category, margin, yPos);
    yPos += 2;

    // Category table
    const categoryTotal = items.reduce((sum, i) => sum + i.total, 0);

    autoTable(doc, {
      startY: yPos,
      head: [['Description', 'Qty', 'Unit Price', 'Total']],
      body: items.map(item => [
        item.description.length > 55 ? item.description.substring(0, 52) + '...' : item.description,
        item.quantity.toString(),
        `$${item.unitPrice.toLocaleString()}`,
        `$${item.total.toLocaleString()}`
      ]),
      foot: [[
        { content: `${categoryLabels[category]} Subtotal`, colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: `$${categoryTotal.toLocaleString()}`, styles: { fontStyle: 'bold' } }
      ]],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: headerBg,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: darkGray,
        cellPadding: 2,
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: darkGray,
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 18, halign: 'center' },
        2: { cellWidth: 28, halign: 'right' },
        3: { cellWidth: 28, halign: 'right' },
      },
      theme: 'grid',
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
    });

    // @ts-ignore - jspdf-autotable adds this property
    yPos = doc.lastAutoTable.finalY + 8;
  }

  // ============ TOTALS ============
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = margin + 10;
  }

  yPos += 5;

  const subtotal = quote.lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.0825;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Totals box
  const totalsX = pageWidth - margin - 75;
  const totalsWidth = 75;

  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.3);
  doc.roundedRect(totalsX - 5, yPos - 5, totalsWidth + 5, 42, 2, 2);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  doc.setTextColor(...lightGray);
  doc.text('Subtotal:', totalsX, yPos + 5);
  doc.setTextColor(...darkGray);
  doc.text(`$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, pageWidth - margin, yPos + 5, { align: 'right' });

  doc.setTextColor(...lightGray);
  doc.text('Tax (8.25%):', totalsX, yPos + 14);
  doc.setTextColor(...darkGray);
  doc.text(`$${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, pageWidth - margin, yPos + 14, { align: 'right' });

  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(totalsX, yPos + 20, pageWidth - margin, yPos + 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Total:', totalsX, yPos + 32);
  doc.text(`$${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, pageWidth - margin, yPos + 32, { align: 'right' });

  yPos += 55;

  // ============ NOTES & TERMS ============
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = margin + 10;
  }

  // Notes
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('Notes', margin, yPos);

  yPos += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);

  const notes = [
    'Pricing based on rental period. Weekly rates available.',
    'Delivery and pickup included within 25-mile radius.',
    'Technical support available at additional hourly rates.',
    'Equipment subject to availability at time of booking.',
  ];

  notes.forEach(note => {
    doc.text(`• ${note}`, margin + 3, yPos);
    yPos += 4;
  });

  yPos += 5;

  // Terms
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('Terms & Conditions', margin, yPos);

  yPos += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);

  const terms = [
    '50% deposit required to confirm booking.',
    'Balance due upon delivery.',
    `Quote valid for 30 days (expires ${new Date(quote.expiresAt).toLocaleDateString()}).`,
    'Customer responsible for equipment during rental period.',
    'Cancellation within 72 hours subject to full charge.',
  ];

  terms.forEach(term => {
    doc.text(`• ${term}`, margin + 3, yPos);
    yPos += 4;
  });

  // ============ FOOTER ============
  const footerY = pageHeight - 10;
  doc.setFontSize(7);
  doc.setTextColor(...lightGray);
  doc.text('Generated by QMAV - Professional AV Quotes', pageWidth / 2, footerY, { align: 'center' });

  // Page numbers on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  return doc;
}

// Main execution
async function main() {
  console.log('='.repeat(60));
  console.log('  QMAV Mock Quote PDF Generator');
  console.log('  Generating 50 realistic AV rental quotes...');
  console.log('='.repeat(60));
  console.log('');

  const quotes = [];
  const stats = {
    tiny: 0,
    small: 0,
    medium: 0,
    large: 0,
    massive: 0,
    totalLineItems: 0,
    totalValue: 0,
  };

  // Generate 50 quotes
  for (let i = 0; i < 50; i++) {
    const quote = generateQuote(i);
    quotes.push(quote);

    // Track stats
    stats[quote.size]++;
    stats.totalLineItems += quote.lineItems.length;
    stats.totalValue += quote.totalAmount;

    // Generate PDF
    const doc = generateQuotePDF(quote);
    const filename = `Quote-${quote.id}-${quote.eventType.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const filepath = path.join(OUTPUT_DIR, filename);

    // Save PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    fs.writeFileSync(filepath, pdfBuffer);

    // Progress output
    const progress = Math.round(((i + 1) / 50) * 100);
    const bar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
    process.stdout.write(`\r  [${bar}] ${progress}% - ${i + 1}/50 quotes generated`);
  }

  console.log('\n');
  console.log('='.repeat(60));
  console.log('  Generation Complete!');
  console.log('='.repeat(60));
  console.log('');
  console.log('  Statistics:');
  console.log(`    Tiny quotes (5-15 items):     ${stats.tiny}`);
  console.log(`    Small quotes (15-35 items):   ${stats.small}`);
  console.log(`    Medium quotes (35-65 items):  ${stats.medium}`);
  console.log(`    Large quotes (65-120 items):  ${stats.large}`);
  console.log(`    Massive quotes (100+ items):  ${stats.massive}`);
  console.log('');
  console.log(`    Total line items generated:   ${stats.totalLineItems.toLocaleString()}`);
  console.log(`    Total quote value:            $${stats.totalValue.toLocaleString()}`);
  console.log(`    Average items per quote:      ${Math.round(stats.totalLineItems / 50)}`);
  console.log(`    Average quote value:          $${Math.round(stats.totalValue / 50).toLocaleString()}`);
  console.log('');
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log('');

  // Save quotes JSON for reference
  const quotesJsonPath = path.join(OUTPUT_DIR, 'quotes-data.json');
  fs.writeFileSync(quotesJsonPath, JSON.stringify(quotes, null, 2));
  console.log(`  Quotes data saved to: ${quotesJsonPath}`);
  console.log('');
  console.log('  Done! Time for a smoke break. 🚬');
  console.log('');
}

main().catch(console.error);
