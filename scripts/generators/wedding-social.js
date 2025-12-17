/**
 * Wedding & Social Events Quote Generator
 * Generates AI-training-quality quotes demonstrating professional AV quote building logic
 *
 * Key Features:
 * - Equipment chain logic (items that work together)
 * - Scaling formulas based on guest count
 * - Wedding-specific phases (ceremony, cocktail hour, reception)
 * - Support equipment logic (power, cabling, labor based on venue)
 *
 * Run with: node scripts/generators/wedding-social.js
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
const equipmentDb = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mock-data', 'equipment-database.json'), 'utf8'));

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'docs', 'mock-quotes', 'wedding-social');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Category configuration (matching app structure)
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

// Wedding-specific venues
const weddingVenues = [
  { name: "Omni Barton Creek Resort", city: "Austin", state: "TX", type: "resort", outdoor: false },
  { name: "Four Seasons Hotel Austin", city: "Austin", state: "TX", type: "hotel", outdoor: false },
  { name: "Driskill Hotel", city: "Austin", state: "TX", type: "hotel", outdoor: false },
  { name: "Zilker Park Botanical Garden", city: "Austin", state: "TX", type: "outdoor", outdoor: true },
  { name: "Lady Bird Johnson Wildflower Center", city: "Austin", state: "TX", type: "outdoor", outdoor: true },
  { name: "La Cantera Resort & Spa", city: "San Antonio", state: "TX", type: "resort", outdoor: false },
  { name: "Westin Riverwalk San Antonio", city: "San Antonio", state: "TX", type: "hotel", outdoor: false },
  { name: "The Lodge at Bridal Veil Falls", city: "Austin", state: "TX", type: "outdoor", outdoor: true },
  { name: "Mercury Hall", city: "Austin", state: "TX", type: "venue", outdoor: false },
  { name: "Laguna Gloria", city: "Austin", state: "TX", type: "outdoor", outdoor: true },
  { name: "Prospect House", city: "Austin", state: "TX", type: "venue", outdoor: false },
  { name: "The Allan House", city: "Austin", state: "TX", type: "venue", outdoor: false },
  { name: "Camp Lucy", city: "Dripping Springs", state: "TX", type: "outdoor", outdoor: true },
  { name: "Kalahari Resorts", city: "Round Rock", state: "TX", type: "resort", outdoor: false },
  { name: "Hyatt Regency Lost Pines", city: "Bastrop", state: "TX", type: "resort", outdoor: false },
];

// Wedding clients (couples)
const weddingClients = [
  { couple: "Sarah & Michael", contact: "Sarah Johnson", email: "sarahjohnson@email.com", lastName: "Johnson" },
  { couple: "Emily & David", contact: "Emily Chen", email: "emilychen@email.com", lastName: "Chen" },
  { couple: "Jessica & James", contact: "Jessica Martinez", email: "jmartinez@email.com", lastName: "Martinez" },
  { couple: "Amanda & Ryan", contact: "Amanda Wilson", email: "awilson@email.com", lastName: "Wilson" },
  { couple: "Lauren & Christopher", contact: "Lauren Taylor", email: "ltaylor@email.com", lastName: "Taylor" },
  { couple: "Rachel & Matthew", contact: "Rachel Anderson", email: "randerson@email.com", lastName: "Anderson" },
  { couple: "Nicole & Brandon", contact: "Nicole Garcia", email: "ngarcia@email.com", lastName: "Garcia" },
  { couple: "Stephanie & Kevin", contact: "Stephanie Brown", email: "sbrown@email.com", lastName: "Brown" },
  { couple: "Jennifer & Daniel", contact: "Jennifer Lee", email: "jlee@email.com", lastName: "Lee" },
  { couple: "Michelle & Andrew", contact: "Michelle Davis", email: "mdavis@email.com", lastName: "Davis" },
  { couple: "Lisa & Steven", contact: "Lisa Thompson", email: "lthompson@email.com", lastName: "Thompson" },
  { couple: "Karen & Jason", contact: "Karen White", email: "kwhite@email.com", lastName: "White" },
  { couple: "Angela & Timothy", contact: "Angela Harris", email: "aharris@email.com", lastName: "Harris" },
  { couple: "Christina & Robert", contact: "Christina Clark", email: "cclark@email.com", lastName: "Clark" },
  { couple: "Rebecca & Joseph", contact: "Rebecca Lewis", email: "rlewis@email.com", lastName: "Lewis" },
];

// Social event types
const socialEventTypes = [
  { type: "Intimate Wedding", guestRange: [30, 75], weight: 3 },
  { type: "Small Wedding", guestRange: [75, 125], weight: 5 },
  { type: "Medium Wedding", guestRange: [125, 200], weight: 4 },
  { type: "Large Wedding", guestRange: [200, 300], weight: 2 },
  { type: "Anniversary Celebration", guestRange: [50, 150], weight: 2 },
  { type: "Birthday Party", guestRange: [40, 100], weight: 2 },
  { type: "Rehearsal Dinner", guestRange: [30, 60], weight: 2 },
];

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

// Get specific equipment by name
function getEquipmentByName(name) {
  for (const category in equipmentDb) {
    for (const subcategory in equipmentDb[category]) {
      const items = equipmentDb[category][subcategory];
      if (Array.isArray(items)) {
        const item = items.find(i => i.name === name);
        if (item) return { ...item, category };
      }
    }
  }
  return null;
}

// Create line item from equipment
function createLineItem(equipmentName, quantity, category = null) {
  const equipment = getEquipmentByName(equipmentName);
  if (!equipment) {
    console.warn(`Equipment not found: ${equipmentName}`);
    return null;
  }

  return {
    id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
    category: category || equipment.category,
    description: equipment.name,
    quantity: quantity,
    unitPrice: equipment.dailyRate,
    total: quantity * equipment.dailyRate
  };
}

/**
 * CEREMONY AUDIO - Minimal but clear
 * Logic: 2 wireless mics (officiant + reader), small speakers for ambient music
 */
function generateCeremonyAudio(guestCount, isOutdoor) {
  const items = [];

  // Wireless microphones - always 2 (officiant + reader)
  items.push(createLineItem("Shure BLX24/SM58 Wireless Handheld", 2, 'audio'));

  // Small speakers based on guest count and outdoor needs
  if (guestCount < 100) {
    items.push(createLineItem("JBL PRX412M 12\" Speaker with Stand", 2, 'audio'));
  } else {
    items.push(createLineItem("JBL PRX815W 15\" Powered Speaker", 2, 'audio'));
  }

  // Small mixer
  items.push(createLineItem("Behringer X32 Digital Mixer", 1, 'audio'));

  // DI for music playback
  items.push(createLineItem("Radial JDI Passive DI Box", 1, 'audio'));

  // Speaker stands
  items.push(createLineItem("Speaker Stand (Ultimate Support)", 2, 'audio'));

  return items;
}

/**
 * RECEPTION AUDIO - DJ or Band setup
 * Logic: DJ needs speakers + subs, Band needs monitors + more mics
 */
function generateReceptionAudio(guestCount, hasBand, hasToasts) {
  const items = [];

  // Main PA system scaled by guest count
  if (guestCount < 75) {
    // Intimate: 2 speakers
    items.push(createLineItem("JBL PRX815W 15\" Powered Speaker", 2, 'audio'));
    items.push(createLineItem("Speaker Stand (Ultimate Support)", 2, 'audio'));
  } else if (guestCount < 150) {
    // Small: 4 speakers + 1 sub
    items.push(createLineItem("QSC K12.2 12\" Powered Speaker", 4, 'audio'));
    items.push(createLineItem("JBL SRX818SP 18\" Powered Subwoofer", 1, 'audio'));
    items.push(createLineItem("Speaker Stand (Ultimate Support)", 4, 'audio'));
  } else if (guestCount < 250) {
    // Medium: Better speakers + 2 subs
    items.push(createLineItem("QSC KW153 15\" 3-Way Powered Speaker", 4, 'audio'));
    items.push(createLineItem("QSC KS218C Dual 18\" Cardioid Subwoofer", 2, 'audio'));
    items.push(createLineItem("Speaker Stand (Ultimate Support)", 4, 'audio'));
  } else {
    // Large: Consider line array or more powerful system
    items.push(createLineItem("JBL VRX932LA-1 12\" Line Array Speaker", 6, 'audio'));
    items.push(createLineItem("QSC KS218C Dual 18\" Cardioid Subwoofer", 2, 'audio'));
  }

  // Console
  if (hasBand || guestCount > 150) {
    items.push(createLineItem("Midas M32 Digital Console", 1, 'audio'));
  } else {
    items.push(createLineItem("Behringer X32 Digital Mixer", 1, 'audio'));
  }

  // Wireless mics for toasts/speeches
  if (hasToasts) {
    const micCount = guestCount > 150 ? 4 : 2;
    items.push(createLineItem("Shure ULXD4D Dual Wireless System (Handheld)", Math.ceil(micCount / 2), 'audio'));
  }

  // Band-specific equipment
  if (hasBand) {
    // Stage monitors for band
    const monitorCount = guestCount > 150 ? 6 : 4;
    items.push(createLineItem("QSC K10.2 Stage Monitor", monitorCount, 'audio'));

    // Wired mics for instruments
    items.push(createLineItem("Shure SM57 Instrument Microphone", 4, 'audio'));
    items.push(createLineItem("Shure SM58 Dynamic Vocal Microphone", 3, 'audio'));

    // DI boxes for instruments
    items.push(createLineItem("Radial J48 Active DI Box", 4, 'audio'));

    // Stage snake
    items.push(createLineItem("Whirlwind 16x4 150' XLR Audio Snake", 1, 'audio'));
  } else {
    // DJ setup - just need DI and playback
    items.push(createLineItem("Radial JDI Passive DI Box", 2, 'audio'));
  }

  return items;
}

/**
 * UPLIGHTING - Scaled by room perimeter
 * Logic: 1 uplight per 8-10 feet of wall
 */
function generateUplighting(guestCount) {
  const items = [];

  // Calculate uplights based on guest count (proxy for room size)
  let uplightCount;
  if (guestCount < 75) {
    uplightCount = 12; // Small room: ~100 foot perimeter
  } else if (guestCount < 150) {
    uplightCount = 20; // Medium room: ~180 foot perimeter
  } else if (guestCount < 250) {
    uplightCount = 28; // Large room: ~250 foot perimeter
  } else {
    uplightCount = 36; // Very large room
  }

  // Battery-powered wireless uplights (easier setup)
  const packSize = 8;
  const packs = Math.ceil(uplightCount / packSize);
  items.push(createLineItem("Chauvet Freedom Par Hex-4 Battery LED (8-Pack)", packs, 'lighting'));

  // DMX controller for uplights
  items.push(createLineItem("Chauvet DJ Obey 70 DMX Controller", 1, 'lighting'));

  return items;
}

/**
 * DANCE FLOOR LIGHTING - Synced with audio
 * Logic: Moving lights + DMX control integrated with DJ/band
 */
function generateDanceFloorLighting(guestCount, hasBand) {
  const items = [];

  if (guestCount < 100) {
    // Small: Basic LED pars
    items.push(createLineItem("Chauvet SlimPAR 64 RGBA LED (per unit)", 4, 'lighting'));
  } else if (guestCount < 200) {
    // Medium: Moving washes
    items.push(createLineItem("Chauvet Maverick MK3 Wash", 4, 'lighting'));
  } else {
    // Large: Professional moving lights
    items.push(createLineItem("Martin MAC Aura LED Wash (6-Pack)", 1, 'lighting'));
    items.push(createLineItem("Robe Robin 600 LED Wash", 2, 'lighting'));
  }

  // Truss for lighting if medium/large
  if (guestCount > 100) {
    items.push(createLineItem("Xtreme 12\"x18\" x 10' GP Truss w/Bolts", 2, 'rigging'));
    items.push(createLineItem("Genie ST25 25' Supertower Stand", 2, 'rigging'));
  }

  // First dance spotlight
  if (guestCount > 75) {
    items.push(createLineItem("ETC Source Four LED Series 2 Lustr", 1, 'lighting'));
  }

  // Haze for lighting effects
  if (guestCount > 100) {
    items.push(createLineItem("Look Solutions Unique 2.1 Hazer", 1, 'lighting'));
  }

  return items;
}

/**
 * COCKTAIL HOUR - Background music zone
 * Logic: Separate from ceremony/reception, minimal
 */
function generateCocktailHourAudio() {
  const items = [];

  // Small background speakers
  items.push(createLineItem("Mackie SRM450v3 Powered Speaker", 2, 'audio'));
  items.push(createLineItem("Speaker Stand (Ultimate Support)", 2, 'audio'));
  items.push(createLineItem("Radial JDI Passive DI Box", 1, 'audio'));

  return items;
}

/**
 * VIDEO - Projector for slideshows/presentations
 */
function generateVideo(guestCount, hasSlideshow) {
  const items = [];

  if (!hasSlideshow) return items;

  // Projector and screen scaled by guest count
  if (guestCount < 100) {
    items.push(createLineItem("Christie LWU502 5000 Lumen Projector", 1, 'video'));
    items.push(createLineItem("Draper 9' x 12' Tripod Projection Screen", 1, 'video'));
  } else if (guestCount < 200) {
    items.push(createLineItem("Christie LWU701i 3LCD Projector", 1, 'video'));
    items.push(createLineItem("Da-Lite 10' x 17' Fast-Fold Screen", 1, 'video'));
    items.push(createLineItem("Christie 1.2-1.5:1 HD Zoom Lens", 1, 'video'));
  } else {
    items.push(createLineItem("Epson Pro L12000Q 12K Laser Projector", 1, 'video'));
    items.push(createLineItem("Stumpfl 11.3' x 20' Monoblox Screen w/Dress Kit", 1, 'video'));
    items.push(createLineItem("Epson ELPLM15 Middle Throw Zoom Lens", 1, 'video'));
  }

  // Playback laptop
  items.push(createLineItem("Lenovo P15 Gen 2 Laptop (ProPresenter)", 1, 'video'));

  return items;
}

/**
 * SUPPORT EQUIPMENT - Cables, power, etc.
 * Logic: Based on venue type and equipment count
 */
function generateSupportEquipment(guestCount, isOutdoor, hasBand, separateCeremony) {
  const items = [];

  // Audio cables
  const xlrCount = hasBand ? 20 : 10;
  items.push(createLineItem("XLR Cable 25'", Math.floor(xlrCount * 0.4), 'cables'));
  items.push(createLineItem("XLR Cable 50'", Math.floor(xlrCount * 0.4), 'cables'));
  items.push(createLineItem("XLR Cable 100'", Math.floor(xlrCount * 0.2), 'cables'));

  // Speaker cables
  const speakerCableCount = guestCount > 150 ? 8 : 4;
  items.push(createLineItem("NL4 Speaker Cable 25'", Math.floor(speakerCableCount * 0.5), 'cables'));
  items.push(createLineItem("NL4 Speaker Cable 50'", Math.floor(speakerCableCount * 0.5), 'cables'));

  // Power cables
  const powerCableCount = guestCount > 150 ? 12 : 8;
  items.push(createLineItem("120V Edison Cable 25'", Math.floor(powerCableCount * 0.4), 'cables'));
  items.push(createLineItem("120V Edison Cable 50'", Math.floor(powerCableCount * 0.4), 'cables'));
  items.push(createLineItem("120V Edison Cable 100'", Math.floor(powerCableCount * 0.2), 'cables'));

  // Power strips
  items.push(createLineItem("8 Outlet Power Strip", 4, 'power'));

  // Cable protection
  if (guestCount > 100) {
    items.push(createLineItem("Guard Dog 5-Channel Cable Protector 3'", 4, 'power'));
  }

  // Generator for outdoor events
  if (isOutdoor && guestCount > 100) {
    items.push(createLineItem("25KW Diesel Generator", 1, 'power'));
  }

  // DMX cables for lighting
  if (guestCount > 75) {
    items.push(createLineItem("DMX 5-Pin Cable 50'", 4, 'lighting'));
    items.push(createLineItem("DMX 5-Pin Cable 25'", 4, 'lighting'));
  }

  return items;
}

/**
 * LABOR - Setup, operation, teardown
 * Logic: Based on complexity and duration
 */
function generateLabor(guestCount, hasBand, eventDuration, setupComplexity) {
  const items = [];

  // Setup crew - 2-4 hours depending on complexity
  const setupHours = setupComplexity === 'complex' ? 4 : 2;
  const setupCrew = guestCount > 150 ? 2 : 1;
  items.push(createLineItem("Setup Technician (per day)", setupCrew, 'labor'));

  // Audio/DJ operator for duration of event
  items.push(createLineItem("Audio Lead Technician A1 (per day)", 1, 'labor'));

  // Additional audio tech if band
  if (hasBand) {
    items.push(createLineItem("Audio Technician A2 (per day)", 1, 'labor'));
  }

  // Lighting tech if intelligent fixtures
  if (guestCount > 100) {
    items.push(createLineItem("Lighting Technician L2 (per day)", 1, 'labor'));
  }

  // Teardown - often next day for weddings
  const teardownCrew = guestCount > 150 ? 2 : 1;
  items.push(createLineItem("Strike Technician (per day)", teardownCrew, 'labor'));

  return items;
}

/**
 * DECOR - Pipe & drape, string lights
 */
function generateDecor(guestCount, isOutdoor, wantsStringLights) {
  const items = [];

  // Backdrop for head table or ceremony
  if (guestCount > 75) {
    items.push(createLineItem("Spandex Backdrop 10' x 20' White", 1, 'decor'));
  }

  // Pipe and drape for room division
  if (guestCount > 150) {
    items.push(createLineItem("20' Section Pipe and Drape HW", 2, 'decor'));
    items.push(createLineItem("Drape Black Velour 10'W x 16'H", 4, 'decor'));
  }

  // String lights for outdoor or ambiance
  if (wantsStringLights) {
    const stringLightSections = guestCount > 150 ? 6 : 4;
    items.push(createLineItem("Festoon String Lighting 48' Section", stringLightSections, 'decor'));
  }

  return items;
}

/**
 * STAGING - Dance floor, head table risers
 */
function generateStaging(guestCount, hasBand) {
  const items = [];

  // Head table riser for larger weddings
  if (guestCount > 100) {
    items.push(createLineItem("Biljax 4' x 16' Riser w/Stairs (Press)", 1, 'staging'));
    items.push(createLineItem("Stage Skirt 8' x 24\" Black", 2, 'staging'));
  }

  // Band riser if applicable
  if (hasBand) {
    if (guestCount > 150) {
      items.push(createLineItem("Biljax 12' x 12' Riser w/Stairs", 1, 'staging'));
    } else {
      items.push(createLineItem("Biljax 8' x 12' Riser w/Stairs", 1, 'staging'));
    }
    items.push(createLineItem("Stage Skirt 8' x 30\" Black", 3, 'staging'));
    items.push(createLineItem("Stage Carpet 12' x 24' Black", 1, 'staging'));
  }

  return items;
}

/**
 * Generate a complete wedding/social event quote
 */
function generateWeddingQuote(index) {
  const eventType = weightedRandomChoice(socialEventTypes);
  const [minGuests, maxGuests] = eventType.guestRange;
  const guestCount = randomInt(minGuests, maxGuests);

  const client = randomChoice(weddingClients);
  const venue = randomChoice(weddingVenues);

  // Event date (within next 3-12 months - weddings planned in advance)
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + randomInt(90, 365));

  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - randomInt(0, 60));

  const expiresDate = new Date(createdDate);
  expiresDate.setDate(expiresDate.getDate() + 30);

  // Wedding configuration options
  const hasBand = Math.random() > 0.7; // 30% have live band
  const hasToasts = Math.random() > 0.2; // 80% have toasts
  const hasSlideshow = Math.random() > 0.5; // 50% have slideshow
  const hasCocktailHour = Math.random() > 0.3; // 70% have cocktail hour
  const separateCeremony = Math.random() > 0.5; // 50% have ceremony at same venue
  const wantsStringLights = Math.random() > 0.6; // 40% want string lights

  const isOutdoor = venue.outdoor;
  const setupComplexity = (hasBand || guestCount > 200) ? 'complex' : 'simple';

  // Generate equipment by phase
  let lineItems = [];

  // Ceremony audio (if at same venue)
  if (separateCeremony) {
    lineItems.push(...generateCeremonyAudio(guestCount, isOutdoor));
  }

  // Cocktail hour (if applicable)
  if (hasCocktailHour && separateCeremony) {
    lineItems.push(...generateCocktailHourAudio());
  }

  // Reception audio
  lineItems.push(...generateReceptionAudio(guestCount, hasBand, hasToasts));

  // Lighting
  lineItems.push(...generateUplighting(guestCount));
  lineItems.push(...generateDanceFloorLighting(guestCount, hasBand));

  // Video
  lineItems.push(...generateVideo(guestCount, hasSlideshow));

  // Staging
  lineItems.push(...generateStaging(guestCount, hasBand));

  // Decor
  lineItems.push(...generateDecor(guestCount, isOutdoor, wantsStringLights));

  // Support equipment (cables, power)
  lineItems.push(...generateSupportEquipment(guestCount, isOutdoor, hasBand, separateCeremony));

  // Labor
  const eventDuration = 6; // Typical wedding: 6 hours
  lineItems.push(...generateLabor(guestCount, hasBand, eventDuration, setupComplexity));

  // Filter out null items
  lineItems = lineItems.filter(item => item !== null);

  // Calculate total
  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  // Event name
  const eventName = eventType.type.includes('Wedding')
    ? `${client.lastName} Wedding Reception`
    : `${client.couple} ${eventType.type}`;

  return {
    id: `QM-WED-${String(index + 1).padStart(4, '0')}`,
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
    status: 'draft',
    totalAmount: totalAmount,
    lineItems: lineItems,
    notes: buildEventNotes(hasBand, hasToasts, separateCeremony, hasCocktailHour, isOutdoor),
    attendees: guestCount,
    createdAt: createdDate.toISOString(),
    updatedAt: createdDate.toISOString(),
    expiresAt: expiresDate.toISOString(),
    metadata: {
      hasBand,
      hasToasts,
      hasSlideshow,
      hasCocktailHour,
      separateCeremony,
      wantsStringLights,
      isOutdoor
    }
  };
}

/**
 * Build event-specific notes
 */
function buildEventNotes(hasBand, hasToasts, separateCeremony, hasCocktailHour, isOutdoor) {
  const notes = [];

  if (separateCeremony) {
    notes.push("Ceremony audio included for same venue");
  }

  if (hasCocktailHour) {
    notes.push("Cocktail hour background music system");
  }

  if (hasBand) {
    notes.push("Live band setup with monitors and instrument mics");
  } else {
    notes.push("DJ setup for reception entertainment");
  }

  if (hasToasts) {
    notes.push("Wireless microphones for toasts and speeches");
  }

  if (isOutdoor) {
    notes.push("Outdoor setup - weather contingency planning required");
  }

  notes.push("First dance spotlight lighting included");
  notes.push("Setup day prior, teardown following day");

  return notes.join('. ') + '.';
}

/**
 * Generate PDF (using same format as main generator)
 */
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

  // Event-specific notes
  if (quote.notes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('Event Notes', margin, yPos);

    yPos += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkGray);

    const noteLines = doc.splitTextToSize(quote.notes, pageWidth - margin * 2);
    doc.text(noteLines, margin, yPos);
    yPos += noteLines.length * 4 + 5;
  }

  // Notes
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('General Notes', margin, yPos);

  yPos += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);

  const notes = [
    'Pricing based on rental period. Weekly rates available.',
    'Delivery and setup included within 25-mile radius.',
    'Technical support and operation included for event duration.',
    'Equipment subject to availability at time of booking.',
  ];

  notes.forEach(note => {
    doc.text(`${note}`, margin + 3, yPos);
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
    doc.text(`${term}`, margin + 3, yPos);
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

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(70));
  console.log('  QMAV Wedding & Social Events Quote Generator');
  console.log('  Generating 15 professional wedding/social event quotes...');
  console.log('='.repeat(70));
  console.log('');

  const quotes = [];
  const stats = {
    totalLineItems: 0,
    totalValue: 0,
    eventTypes: {},
    guestCounts: [],
  };

  // Generate 15 quotes
  for (let i = 0; i < 15; i++) {
    const quote = generateWeddingQuote(i);
    quotes.push(quote);

    // Track stats
    stats.totalLineItems += quote.lineItems.length;
    stats.totalValue += quote.totalAmount;
    stats.guestCounts.push(quote.attendees);
    stats.eventTypes[quote.eventType] = (stats.eventTypes[quote.eventType] || 0) + 1;

    // Generate PDF
    const doc = generateQuotePDF(quote);
    const filename = `Quote-${quote.id}-${quote.eventType.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const filepath = path.join(OUTPUT_DIR, filename);

    // Save PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    fs.writeFileSync(filepath, pdfBuffer);

    // Progress output
    const progress = Math.round(((i + 1) / 15) * 100);
    const bar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
    process.stdout.write(`\r  [${bar}] ${progress}% - ${i + 1}/15 quotes generated`);
  }

  console.log('\n');
  console.log('='.repeat(70));
  console.log('  Generation Complete!');
  console.log('='.repeat(70));
  console.log('');
  console.log('  Event Type Breakdown:');
  for (const [type, count] of Object.entries(stats.eventTypes)) {
    console.log(`    ${type}: ${count}`);
  }
  console.log('');
  console.log('  Guest Count Statistics:');
  const avgGuests = Math.round(stats.guestCounts.reduce((a, b) => a + b, 0) / stats.guestCounts.length);
  const minGuests = Math.min(...stats.guestCounts);
  const maxGuests = Math.max(...stats.guestCounts);
  console.log(`    Average guests: ${avgGuests}`);
  console.log(`    Range: ${minGuests} - ${maxGuests} guests`);
  console.log('');
  console.log(`    Total line items generated: ${stats.totalLineItems.toLocaleString()}`);
  console.log(`    Total quote value: $${stats.totalValue.toLocaleString()}`);
  console.log(`    Average items per quote: ${Math.round(stats.totalLineItems / 15)}`);
  console.log(`    Average quote value: $${Math.round(stats.totalValue / 15).toLocaleString()}`);
  console.log('');
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log('');

  // Save quotes JSON for reference
  const quotesJsonPath = path.join(OUTPUT_DIR, 'wedding-quotes-data.json');
  fs.writeFileSync(quotesJsonPath, JSON.stringify(quotes, null, 2));
  console.log(`  Quotes data saved to: ${quotesJsonPath}`);
  console.log('');
  console.log('  Equipment chain logic demonstrated:');
  console.log('    ✓ Ceremony audio (wireless mics + small speakers)');
  console.log('    ✓ Reception scaling (speakers + subs based on guest count)');
  console.log('    ✓ DJ vs Band setups (different monitor/mic requirements)');
  console.log('    ✓ Uplighting (calculated by room perimeter proxy)');
  console.log('    ✓ Dance floor lighting (synced with audio control)');
  console.log('    ✓ Support equipment (cables, power, protection)');
  console.log('    ✓ Labor (setup, operation, teardown)');
  console.log('');
}

main().catch(console.error);
