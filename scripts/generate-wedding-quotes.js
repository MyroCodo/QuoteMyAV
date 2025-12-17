/**
 * Wedding Quote PDF Generator
 * Generates 50 smaller wedding-focused AV rental quotes
 *
 * Run with: node scripts/generate-wedding-quotes.js
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load equipment database
const equipmentDb = JSON.parse(fs.readFileSync(path.join(__dirname, 'mock-data', 'equipment-database.json'), 'utf8'));

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'mock-quotes', 'weddings');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Wedding-specific data pools
const weddingData = {
  eventTypes: [
    {
      type: "Wedding Reception",
      sizes: ["tiny", "small"],
      typicalCategories: ["audio", "lighting", "decor"],
      weight: 25
    },
    {
      type: "Wedding Ceremony",
      sizes: ["tiny", "small"],
      typicalCategories: ["audio", "lighting"],
      weight: 20
    },
    {
      type: "Rehearsal Dinner",
      sizes: ["tiny", "small"],
      typicalCategories: ["audio", "lighting"],
      weight: 15
    },
    {
      type: "Engagement Party",
      sizes: ["tiny", "small"],
      typicalCategories: ["audio", "lighting", "decor"],
      weight: 12
    },
    {
      type: "Bridal Shower",
      sizes: ["tiny"],
      typicalCategories: ["audio", "lighting"],
      weight: 10
    },
    {
      type: "Bachelor/Bachelorette Party",
      sizes: ["tiny", "small"],
      typicalCategories: ["audio", "lighting"],
      weight: 8
    },
    {
      type: "Outdoor Garden Wedding",
      sizes: ["small", "medium"],
      typicalCategories: ["audio", "lighting", "power", "staging"],
      weight: 15
    },
    {
      type: "Intimate Elopement",
      sizes: ["tiny"],
      typicalCategories: ["audio"],
      weight: 8
    },
    {
      type: "Destination Wedding",
      sizes: ["tiny", "small"],
      typicalCategories: ["audio", "lighting", "power"],
      weight: 10
    },
    {
      type: "Vow Renewal",
      sizes: ["tiny", "small"],
      typicalCategories: ["audio", "lighting"],
      weight: 8
    }
  ],

  eventSizes: {
    tiny: { lineItems: [3, 10], attendees: [15, 50] },
    small: { lineItems: [8, 20], attendees: [40, 100] },
    medium: { lineItems: [15, 30], attendees: [80, 200] }
  },

  // Wedding-specific clients (couples)
  clients: [
    { couple: "Sarah & Michael Thompson", contact: "Sarah Thompson", email: "sarah.thompson@gmail.com" },
    { couple: "Emily & James Rodriguez", contact: "Emily Chen", email: "emily.james2024@yahoo.com" },
    { couple: "Jessica & David Kim", contact: "Jessica Martinez", email: "jess.david.wedding@gmail.com" },
    { couple: "Ashley & Christopher Lee", contact: "Ashley Johnson", email: "ashleyj.wedding@outlook.com" },
    { couple: "Amanda & Matthew Wilson", contact: "Amanda Brown", email: "amanda.matt.2024@gmail.com" },
    { couple: "Brittany & Joshua Garcia", contact: "Brittany Davis", email: "britt.josh.forever@gmail.com" },
    { couple: "Lauren & Andrew Martinez", contact: "Lauren White", email: "laurenandrew@yahoo.com" },
    { couple: "Megan & Daniel Anderson", contact: "Megan Taylor", email: "megandaniel.wedding@gmail.com" },
    { couple: "Rachel & Ryan Thomas", contact: "Rachel Moore", email: "rachel.ryan.tx@outlook.com" },
    { couple: "Nicole & Brandon Jackson", contact: "Nicole Harris", email: "nicoleandlbrandon@gmail.com" },
    { couple: "Stephanie & Kevin Clark", contact: "Stephanie Lewis", email: "steph.kevin.love@yahoo.com" },
    { couple: "Heather & Justin Walker", contact: "Heather Robinson", email: "heatherj.wedding@gmail.com" },
    { couple: "Courtney & Tyler Hall", contact: "Courtney Young", email: "courtneytylerwed@outlook.com" },
    { couple: "Samantha & Eric Allen", contact: "Samantha King", email: "sam.eric.2024@gmail.com" },
    { couple: "Christina & Steven Wright", contact: "Christina Scott", email: "christina.steven.tx@yahoo.com" },
    { couple: "Melissa & Patrick Green", contact: "Melissa Adams", email: "melissapatrick.wed@gmail.com" },
    { couple: "Jennifer & Marcus Baker", contact: "Jennifer Nelson", email: "jen.marcus.forever@outlook.com" },
    { couple: "Kimberly & Derek Hill", contact: "Kimberly Campbell", email: "kimderekwedding@gmail.com" },
    { couple: "Amy & Brian Mitchell", contact: "Amy Roberts", email: "amy.brian.love@yahoo.com" },
    { couple: "Tiffany & Jonathan Carter", contact: "Tiffany Phillips", email: "tiffjonathan@gmail.com" },
    { couple: "Diana & Mark Evans", contact: "Diana Turner", email: "diana.mark.wed@outlook.com" },
    { couple: "Michelle & Sean Parker", contact: "Michelle Edwards", email: "michelle.sean.2024@gmail.com" },
    { couple: "Vanessa & Adam Collins", contact: "Vanessa Stewart", email: "vanessa.adam.tx@yahoo.com" },
    { couple: "Crystal & Nathan Morris", contact: "Crystal Sanchez", email: "crystalnathan.wed@gmail.com" },
    { couple: "Amber & Lucas Rogers", contact: "Amber Reed", email: "amber.lucas.forever@outlook.com" },
    { couple: "Lindsey & Cody Cooper", contact: "Lindsey Richardson", email: "lindseycody2024@gmail.com" },
    { couple: "Chelsea & Blake Cox", contact: "Chelsea Howard", email: "chelsea.blake.love@yahoo.com" },
    { couple: "Kayla & Trevor Ward", contact: "Kayla Torres", email: "kaylatrevorwed@gmail.com" },
    { couple: "Danielle & Jake Peterson", contact: "Danielle Gray", email: "danielle.jake.tx@outlook.com" },
    { couple: "Brooke & Cory James", contact: "Brooke Ramirez", email: "brookecory.wed@gmail.com" }
  ],

  // Wedding venues (Texas focused)
  venues: [
    { name: "The Oaks at Stone House", city: "Austin", state: "TX", type: "estate" },
    { name: "Willow Creek Ranch", city: "Dripping Springs", state: "TX", type: "ranch" },
    { name: "Magnolia Estate", city: "Round Rock", state: "TX", type: "estate" },
    { name: "The Terrace Club", city: "Austin", state: "TX", type: "club" },
    { name: "Pecan Springs Ranch", city: "Austin", state: "TX", type: "ranch" },
    { name: "Vista West Ranch", city: "Dripping Springs", state: "TX", type: "ranch" },
    { name: "Chapel Dulcinea", city: "Austin", state: "TX", type: "chapel" },
    { name: "Ma Maison", city: "Dripping Springs", state: "TX", type: "estate" },
    { name: "Memory Lane Event Center", city: "Dripping Springs", state: "TX", type: "center" },
    { name: "The Milestone", city: "Georgetown", state: "TX", type: "venue" },
    { name: "Kindred Oaks", city: "Georgetown", state: "TX", type: "estate" },
    { name: "Greenhouse at Driftwood", city: "Driftwood", state: "TX", type: "greenhouse" },
    { name: "Camp Lucy", city: "Dripping Springs", state: "TX", type: "camp" },
    { name: "The Grand Lady", city: "Austin", state: "TX", type: "ballroom" },
    { name: "The Ivory Oak", city: "Wimberley", state: "TX", type: "barn" },
    { name: "Addison Grove", city: "Dripping Springs", state: "TX", type: "grove" },
    { name: "The Greenhouse at Hill Country", city: "San Antonio", state: "TX", type: "greenhouse" },
    { name: "Stonehouse Villa", city: "Driftwood", state: "TX", type: "villa" },
    { name: "Hidden Falls", city: "Spring Branch", state: "TX", type: "waterfall" },
    { name: "The Springs Event Venue", city: "Georgetown", state: "TX", type: "venue" },
    { name: "Hyatt Regency Lost Pines", city: "Lost Pines", state: "TX", type: "resort" },
    { name: "Four Seasons Austin", city: "Austin", state: "TX", type: "hotel" },
    { name: "Allan House", city: "Austin", state: "TX", type: "historic" },
    { name: "Barr Mansion", city: "Austin", state: "TX", type: "mansion" },
    { name: "Mercury Hall", city: "Austin", state: "TX", type: "hall" },
    { name: "One World Theatre", city: "Austin", state: "TX", type: "theatre" },
    { name: "Laguna Gloria", city: "Austin", state: "TX", type: "garden" },
    { name: "The Creek Haus", city: "Dripping Springs", state: "TX", type: "haus" },
    { name: "Union on Eighth", city: "Georgetown", state: "TX", type: "venue" },
    { name: "South Congress Hotel", city: "Austin", state: "TX", type: "hotel" }
  ],

  // Wedding-specific event name patterns
  namePatterns: {
    "Wedding Reception": [
      "{couple} Reception",
      "{couple} Wedding Celebration",
      "{couple} Wedding Party",
      "The {lastName} Wedding Reception"
    ],
    "Wedding Ceremony": [
      "{couple} Ceremony",
      "{couple} Wedding Ceremony",
      "The {lastName} Wedding",
      "{couple} Nuptials"
    ],
    "Rehearsal Dinner": [
      "{couple} Rehearsal Dinner",
      "The {lastName} Rehearsal",
      "{firstName} & {firstName2} Rehearsal Dinner"
    ],
    "Engagement Party": [
      "{couple} Engagement Party",
      "We're Engaged! {firstName} & {firstName2}",
      "{lastName} Engagement Celebration"
    ],
    "Bridal Shower": [
      "{firstName}'s Bridal Shower",
      "Bridal Shower for {firstName}",
      "Showering {firstName} with Love"
    ],
    "Bachelor/Bachelorette Party": [
      "{firstName}'s Last Fling",
      "{firstName}'s Big Night Out",
      "Final Fling for {firstName}"
    ],
    "Outdoor Garden Wedding": [
      "{couple} Garden Wedding",
      "{couple} Outdoor Ceremony",
      "The {lastName} Garden Celebration"
    ],
    "Intimate Elopement": [
      "{couple} Intimate Ceremony",
      "{firstName} & {firstName2} Elopement",
      "Just the Two of Us - {couple}"
    ],
    "Destination Wedding": [
      "{couple} Destination Wedding",
      "Texas Hill Country Wedding - {couple}",
      "The {lastName} Destination Celebration"
    ],
    "Vow Renewal": [
      "{couple} Vow Renewal",
      "Renewing Our Vows - {couple}",
      "The {lastName} Anniversary Celebration"
    ]
  },

  // Wedding-specific first names for pattern replacement
  firstNames: [
    "Sarah", "Emily", "Jessica", "Ashley", "Amanda", "Brittany", "Lauren", "Megan",
    "Rachel", "Nicole", "Stephanie", "Heather", "Courtney", "Samantha", "Christina",
    "Michael", "James", "David", "Christopher", "Matthew", "Joshua", "Andrew", "Daniel",
    "Ryan", "Brandon", "Kevin", "Justin", "Tyler", "Eric", "Steven"
  ]
};

// Category labels and order
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

function generateEventName(eventType, client) {
  const patterns = weddingData.namePatterns[eventType.type] || ["{couple} Event"];
  let pattern = randomChoice(patterns);

  const lastName = client.couple.split(' ').pop();
  const names = client.couple.split(' & ');
  const firstName = names[0].split(' ')[0];
  const firstName2 = names[1] ? names[1].split(' ')[0] : randomChoice(weddingData.firstNames);

  pattern = pattern
    .replace('{couple}', client.couple)
    .replace('{lastName}', lastName)
    .replace('{firstName}', firstName)
    .replace('{firstName2}', firstName2);

  return pattern;
}

// Wedding-specific equipment selection (simpler items)
function getWeddingEquipment(category, count) {
  const items = [];
  const categoryData = equipmentDb[category];

  if (!categoryData) return items;

  // Wedding-appropriate subcategories
  const weddingSubcategories = {
    audio: ['wireless_mics', 'portable_speakers', 'playback'],
    lighting: ['uplighting', 'string_lights', 'spotlights', 'effects'],
    decor: ['drape', 'backdrops'],
    staging: ['risers', 'dance_floors'],
    power: ['distribution', 'cables'],
    video: ['screens', 'projectors']
  };

  const preferredSubcats = weddingSubcategories[category] || Object.keys(categoryData);
  let availableItems = [];

  for (const subcat of preferredSubcats) {
    if (categoryData[subcat] && Array.isArray(categoryData[subcat])) {
      availableItems.push(...categoryData[subcat]);
    }
  }

  // If no items found, try all subcategories
  if (availableItems.length === 0) {
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
    const quantity = getWeddingQuantity(item.name);
    items.push({
      id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
      category: category,
      description: item.name,
      quantity: quantity,
      unitPrice: item.dailyRate,
      total: quantity * item.dailyRate
    });
  }

  return items;
}

function getWeddingQuantity(itemName) {
  const name = itemName.toLowerCase();

  // Single items for weddings
  if (name.includes('console') || name.includes('mixer') || name.includes('controller') ||
      name.includes('system') || name.includes('package')) {
    return 1;
  }

  // Wireless mics - usually 1-2 for weddings
  if (name.includes('wireless') || name.includes('microphone') || name.includes('mic')) {
    return randomInt(1, 2);
  }

  // Uplights - common for weddings
  if (name.includes('uplight') || name.includes('par') || name.includes('wash')) {
    return randomInt(6, 16);
  }

  // String lights
  if (name.includes('string') || name.includes('bistro') || name.includes('fairy')) {
    return randomInt(4, 12);
  }

  // Speakers - pairs
  if (name.includes('speaker')) {
    return randomInt(2, 4);
  }

  // Drape panels
  if (name.includes('drape') || name.includes('panel') || name.includes('backdrop')) {
    return randomInt(2, 8);
  }

  // Dance floor sections
  if (name.includes('floor') || name.includes('deck')) {
    return randomInt(4, 16);
  }

  // Default small quantity
  return randomInt(1, 3);
}

function generateLineItems(eventType, size) {
  const sizeConfig = weddingData.eventSizes[size];
  const targetItems = randomInt(sizeConfig.lineItems[0], sizeConfig.lineItems[1]);
  const lineItems = [];

  const categories = eventType.typicalCategories;
  const itemsPerCategory = Math.ceil(targetItems / categories.length);

  for (const category of categories) {
    const itemCount = randomInt(Math.max(1, Math.floor(itemsPerCategory * 0.5)), Math.ceil(itemsPerCategory * 1.2));
    const items = getWeddingEquipment(category, itemCount);
    lineItems.push(...items);
  }

  return lineItems;
}

function generateWeddingQuote(index) {
  const eventType = weightedRandomChoice(weddingData.eventTypes);
  const size = randomChoice(eventType.sizes);
  const sizeConfig = weddingData.eventSizes[size];
  const client = randomChoice(weddingData.clients);
  const venue = randomChoice(weddingData.venues);

  // Generate event dates (within next 12 months - wedding season)
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + randomInt(30, 365));

  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - randomInt(0, 45));

  const expiresDate = new Date(createdDate);
  expiresDate.setDate(expiresDate.getDate() + 30);

  const eventName = generateEventName(eventType, client);
  const lineItems = generateLineItems(eventType, size);
  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  // Wedding quotes are usually pending or sent
  const statuses = ['draft', 'pending_review', 'sent', 'accepted'];
  const status = randomChoice(statuses);

  return {
    id: `WED-${String(index + 1).padStart(4, '0')}`,
    userId: 'demo-user',
    clientName: client.contact,
    clientCompany: client.couple,
    clientEmail: client.email,
    eventName: eventName,
    eventType: eventType.type,
    eventDate: eventDate.toISOString(),
    venue: `${venue.name}, ${venue.city}, ${venue.state}`,
    venueName: venue.name,
    venueCity: venue.city,
    venueState: venue.state,
    venueType: venue.type,
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

  // Colors - softer palette for weddings
  const primaryColor = [20, 184, 166]; // Teal-500
  const accentColor = [244, 114, 182]; // Pink-400 (wedding accent)
  const darkGray = [51, 65, 85];
  const lightGray = [148, 163, 184];
  const headerBg = [30, 41, 59];

  // ============ HEADER ============
  doc.setFontSize(28);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('QMAV', margin, yPos + 5);

  doc.setFontSize(8);
  doc.setTextColor(...lightGray);
  doc.setFont('helvetica', 'normal');
  doc.text('Wedding & Event AV Specialists', margin, yPos + 11);

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

  // Couple column
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Couple', margin, yPos);

  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'normal');
  yPos += 5;
  doc.text(quote.clientCompany, margin, yPos); // Couple name
  yPos += 4;
  doc.text(`Contact: ${quote.clientName}`, margin, yPos);
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

  let eventName = quote.eventName;
  if (eventName.length > 35) {
    eventName = eventName.substring(0, 32) + '...';
  }
  doc.text(eventName, margin + colWidth * 2, yPos);
  yPos += 4;
  doc.text(`Date: ${new Date(quote.eventDate).toLocaleDateString()}`, margin + colWidth * 2, yPos);
  yPos += 4;
  doc.setTextColor(...lightGray);
  doc.text(`Est. Guests: ${quote.attendees}`, margin + colWidth * 2, yPos);

  yPos += 12;

  // ============ EQUIPMENT SECTIONS ============
  const groupedItems = {};
  for (const item of quote.lineItems) {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  }

  for (const category of categoryOrder) {
    const items = groupedItems[category];
    if (!items || items.length === 0) continue;

    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;

      doc.setFontSize(8);
      doc.setTextColor(...lightGray);
      doc.text(`Quote #${quote.id} - ${quote.eventName}`, margin, yPos);
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 10;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(categoryLabels[category] || category, margin, yPos);
    yPos += 2;

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

  // ============ WEDDING-SPECIFIC NOTES ============
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = margin + 10;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('Notes', margin, yPos);

  yPos += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);

  const notes = [
    'Equipment setup begins 4 hours before ceremony.',
    'On-site technician available throughout your event.',
    'Backup equipment included at no extra charge.',
    'Complimentary site visit included.',
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
    '50% deposit required to reserve your date.',
    'Balance due 14 days before event.',
    `Quote valid for 30 days (expires ${new Date(quote.expiresAt).toLocaleDateString()}).`,
    'Free reschedule with 30+ days notice.',
    'Full refund if cancelled 60+ days out.',
  ];

  terms.forEach(term => {
    doc.text(`• ${term}`, margin + 3, yPos);
    yPos += 4;
  });

  // ============ FOOTER ============
  const footerY = pageHeight - 10;
  doc.setFontSize(7);
  doc.setTextColor(...lightGray);
  doc.text('QMAV - Making Your Special Day Sound & Look Perfect', pageWidth / 2, footerY, { align: 'center' });

  // Page numbers
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
  console.log('  QMAV Wedding Quote PDF Generator');
  console.log('  Generating 50 smaller wedding-focused quotes...');
  console.log('='.repeat(60));
  console.log('');

  const quotes = [];
  const stats = {
    tiny: 0,
    small: 0,
    medium: 0,
    totalLineItems: 0,
    totalValue: 0,
    eventTypes: {}
  };

  // Generate 50 wedding quotes
  for (let i = 0; i < 50; i++) {
    const quote = generateWeddingQuote(i);
    quotes.push(quote);

    // Track stats
    stats[quote.size]++;
    stats.totalLineItems += quote.lineItems.length;
    stats.totalValue += quote.totalAmount;
    stats.eventTypes[quote.eventType] = (stats.eventTypes[quote.eventType] || 0) + 1;

    // Generate PDF
    const doc = generateQuotePDF(quote);
    const filename = `Wedding-${quote.id}-${quote.eventType.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
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
  console.log('  Quote Size Distribution:');
  console.log(`    Tiny quotes (3-10 items):    ${stats.tiny}`);
  console.log(`    Small quotes (8-20 items):   ${stats.small}`);
  console.log(`    Medium quotes (15-30 items): ${stats.medium}`);
  console.log('');
  console.log('  Event Type Breakdown:');
  Object.entries(stats.eventTypes).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`    ${type}: ${count}`);
  });
  console.log('');
  console.log(`  Total line items generated:   ${stats.totalLineItems.toLocaleString()}`);
  console.log(`  Total quote value:            $${stats.totalValue.toLocaleString()}`);
  console.log(`  Average items per quote:      ${Math.round(stats.totalLineItems / 50)}`);
  console.log(`  Average quote value:          $${Math.round(stats.totalValue / 50).toLocaleString()}`);
  console.log('');
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log('');

  // Save quotes JSON
  const quotesJsonPath = path.join(OUTPUT_DIR, 'wedding-quotes-data.json');
  fs.writeFileSync(quotesJsonPath, JSON.stringify(quotes, null, 2));
  console.log(`  Quotes data saved to: ${quotesJsonPath}`);
  console.log('');
  console.log('  All done! These wedding quotes are gonna make someone cry happy tears. 💒');
  console.log('');
}

main().catch(console.error);
