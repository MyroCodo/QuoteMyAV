/**
 * House of Worship Quote Generator
 *
 * Generates AI-training-quality quotes that demonstrate professional AV logic
 * for worship services, special events, and installations.
 *
 * Run with: node scripts/generators/house-of-worship.js
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
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'docs', 'mock-quotes', 'house-of-worship');

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

// House of Worship specific data
const worshipClients = [
  { company: "First Community Church", contact: "Pastor David Thompson", email: "dthompson@firstcommunity.org", size: "mega" },
  { company: "Grace Fellowship", contact: "Rev. Sarah Mitchell", email: "smitchell@gracefellowship.org", size: "large" },
  { company: "Cornerstone Bible Church", contact: "Pastor Michael Roberts", email: "mroberts@cornerstonebible.org", size: "medium" },
  { company: "Faith Community Church", contact: "Worship Pastor Jennifer Lee", email: "jlee@faithcommunity.org", size: "large" },
  { company: "New Life Assembly", contact: "Pastor James Wilson", email: "jwilson@newlifeassembly.org", size: "medium" },
  { company: "City Church Downtown", contact: "Creative Director Alex Chen", email: "achen@citychurch.org", size: "large" },
  { company: "Hope Chapel", contact: "Technical Director Mark Anderson", email: "manderson@hopechapel.org", size: "small" },
  { company: "Covenant Presbyterian Church", contact: "Worship Coordinator Lisa Brown", email: "lbrown@covenantpres.org", size: "medium" },
  { company: "Victory Christian Center", contact: "Pastor Tom Martinez", email: "tmartinez@victorychristian.org", size: "mega" },
  { company: "The Bridge Community", contact: "Campus Pastor Rachel Green", email: "rgreen@thebridgecommunity.org", size: "small" },
  { company: "Hillside Baptist Church", contact: "Minister of Music Daniel Park", email: "dpark@hillsidebaptist.org", size: "medium" },
  { company: "Crossroads Church", contact: "Production Director Kevin White", email: "kwhite@crossroadschurch.org", size: "large" },
  { company: "Emmanuel Lutheran Church", contact: "Pastor Elizabeth Johnson", email: "ejohnson@emmanuellutheran.org", size: "small" },
  { company: "Mosaic Church", contact: "Creative Pastor Brian Davis", email: "bdavis@mosaicchurch.org", size: "large" },
  { company: "St. Paul's Catholic Church", contact: "Father Robert Sullivan", email: "rsullivan@stpauls.org", size: "medium" }
];

const worshipVenues = [
  { name: "Main Sanctuary", city: "Austin", state: "TX" },
  { name: "Worship Center", city: "San Antonio", state: "TX" },
  { name: "Fellowship Hall", city: "Dallas", state: "TX" },
  { name: "Multi-Campus Network", city: "Houston", state: "TX" },
  { name: "Youth Ministry Center", city: "Fort Worth", state: "TX" },
  { name: "Austin Convention Center", city: "Austin", state: "TX" },
  { name: "Palmer Events Center", city: "Austin", state: "TX" },
  { name: "Outdoor Amphitheater", city: "Round Rock", state: "TX" },
  { name: "Conference Center Ballroom", city: "Austin", state: "TX" },
  { name: "High School Auditorium", city: "Cedar Park", state: "TX" }
];

// Event types with scaling logic
const worshipEventTypes = [
  {
    name: "Sunday Morning Worship Service",
    sizes: ["small", "medium", "large", "mega"],
    description: "Weekly worship with band, choir, preaching, and lyrics display"
  },
  {
    name: "Christmas Eve Service",
    sizes: ["medium", "large", "mega"],
    description: "Special holiday service with enhanced production, candles, and overflow seating"
  },
  {
    name: "Easter Sunday Service",
    sizes: ["large", "mega"],
    description: "Major holiday production with full band, choir, drama, special lighting"
  },
  {
    name: "Worship Conference",
    sizes: ["medium", "large", "mega"],
    description: "Multi-day conference with workshops, main sessions, breakouts"
  },
  {
    name: "Youth Ministry Event",
    sizes: ["small", "medium", "large"],
    description: "High-energy youth service with contemporary production"
  },
  {
    name: "Baptism Service",
    sizes: ["small", "medium"],
    description: "Special service focused on baptistry area with video documentation"
  },
  {
    name: "Church Plant Launch",
    sizes: ["small", "medium"],
    description: "New church launch with portable setup for temporary venue"
  },
  {
    name: "Multi-Site Broadcast",
    sizes: ["large", "mega"],
    description: "Main campus streaming to satellite campuses with low latency"
  },
  {
    name: "Outdoor Festival Service",
    sizes: ["large", "mega"],
    description: "Large outdoor gathering requiring full production truck"
  },
  {
    name: "Guest Speaker Event",
    sizes: ["medium", "large"],
    description: "Special event with notable speaker requiring enhanced production"
  },
  {
    name: "Worship Night",
    sizes: ["medium", "large"],
    description: "Extended worship service focused on music ministry"
  },
  {
    name: "Church Anniversary Celebration",
    sizes: ["medium", "large"],
    description: "Milestone celebration with historical presentations and special music"
  },
  {
    name: "VBS (Vacation Bible School) Setup",
    sizes: ["small", "medium"],
    description: "Week-long children's program with multiple activity stations"
  },
  {
    name: "Prayer & Healing Service",
    sizes: ["small", "medium"],
    description: "Intimate service with simple audio and atmospheric lighting"
  },
  {
    name: "Live Recording Session",
    sizes: ["medium", "large"],
    description: "Professional multi-track recording of worship service for album"
  }
];

// Sanctuary size configurations
const sanctuarySizes = {
  small: {
    congregation: [100, 250],
    bandChannels: 16,
    choirMics: 2,
    speakers: "Point source",
    displays: 1,
    cameras: 1,
    budget: [15000, 35000]
  },
  medium: {
    congregation: [250, 600],
    bandChannels: 24,
    choirMics: 4,
    speakers: "Small line array or point source clusters",
    displays: 2,
    cameras: 2,
    budget: [35000, 75000]
  },
  large: {
    congregation: [600, 1800],
    bandChannels: 32,
    choirMics: 6,
    speakers: "Line array system",
    displays: 3,
    cameras: 4,
    budget: [75000, 150000]
  },
  mega: {
    congregation: [1800, 8000],
    bandChannels: 48,
    choirMics: 10,
    speakers: "Touring-grade line array",
    displays: 5,
    cameras: 6,
    budget: [150000, 350000]
  }
};

// Utility functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getEquipmentByName(name) {
  for (const [category, subcategories] of Object.entries(equipmentDb)) {
    for (const items of Object.values(subcategories)) {
      if (Array.isArray(items)) {
        const found = items.find(item => item.name === name);
        if (found) {
          return { ...found, category };
        }
      }
    }
  }
  return null;
}

function addLineItem(items, name, quantity, category = null) {
  const equipment = getEquipmentByName(name);
  if (!equipment) {
    console.warn(`Warning: Equipment not found: ${name}`);
    return;
  }

  const actualCategory = category || equipment.category;
  items.push({
    id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
    category: actualCategory,
    description: equipment.name,
    quantity: quantity,
    unitPrice: equipment.dailyRate,
    total: quantity * equipment.dailyRate
  });
}

function addRandomFromSubcategory(items, category, subcategory, count, quantityRange = [1, 1]) {
  const subcatItems = equipmentDb[category]?.[subcategory];
  if (!subcatItems || !Array.isArray(subcatItems)) return;

  const shuffled = [...subcatItems].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const item = shuffled[i];
    const quantity = randomInt(quantityRange[0], quantityRange[1]);
    addLineItem(items, item.name, quantity, category);
  }
}

// Quote generation logic
function generateWorshipQuote(eventType, size, index) {
  const sizeConfig = sanctuarySizes[size];
  const client = randomChoice(worshipClients.filter(c => !c.size || c.size === size || (c.size === 'mega' && size === 'large')));
  const venue = randomChoice(worshipVenues);

  // Generate event date
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + randomInt(14, 120));

  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - randomInt(0, 14));

  const expiresDate = new Date(createdDate);
  expiresDate.setDate(expiresDate.getDate() + 30);

  const lineItems = [];

  // AUDIO PACKAGE - Based on sanctuary size
  console.log(`  Building ${size} ${eventType.name}...`);

  // Main Console
  if (size === 'small') {
    addLineItem(lineItems, "Behringer X32 Digital Mixer", 1);
  } else if (size === 'medium') {
    addLineItem(lineItems, "Yamaha QL1 Digital Audio Console", 1);
  } else if (size === 'large') {
    addLineItem(lineItems, "Yamaha QL5 Digital Audio Console", 1);
  } else {
    addLineItem(lineItems, "Yamaha CL5 Digital Audio Console", 1);
  }

  // Main Speaker System
  if (size === 'small') {
    addLineItem(lineItems, "JBL PRX815W 15\" Powered Speaker", 2);
    addLineItem(lineItems, "JBL SRX818SP 18\" Powered Subwoofer", 2);
  } else if (size === 'medium') {
    addLineItem(lineItems, "JBL VRX932LA-1 12\" Line Array Speaker", 4);
    addLineItem(lineItems, "JBL VRX918SP 18\" Powered Subwoofer", 2);
  } else if (size === 'large') {
    addLineItem(lineItems, "JBL VTX V25-II Line Array Element (per side)", 1);
    addLineItem(lineItems, "QSC KS218C Dual 18\" Cardioid Subwoofer", 2);
  } else {
    addLineItem(lineItems, "L-Acoustics KARA II Line Array (per side)", 1);
    addLineItem(lineItems, "d&b audiotechnik SL-SUB Subwoofer", 4);
  }

  // Stage Monitors (for worship team)
  const monitorCount = size === 'small' ? 4 : size === 'medium' ? 6 : size === 'large' ? 8 : 12;
  addLineItem(lineItems, "QSC K10.2 Stage Monitor", monitorCount);

  // Worship Band Microphones
  const bandChannels = sizeConfig.bandChannels;

  // Drums (kick, snare, toms, overheads, hi-hat)
  if (bandChannels >= 16) {
    addLineItem(lineItems, "Shure SM57 Instrument Microphone", 5); // Snare, toms
    addLineItem(lineItems, "Shure SM81 Condenser Microphone", 3); // Overheads, hi-hat
    addLineItem(lineItems, "AKG C414 XLS Condenser Microphone", 1); // Kick
  }

  // Keys, guitars, bass (DI boxes)
  const diCount = size === 'small' ? 4 : size === 'medium' ? 6 : size === 'large' ? 8 : 10;
  addLineItem(lineItems, "Radial J48 Active DI Box", diCount);

  // Lead vocal wireless
  const leadVocalCount = size === 'small' ? 2 : size === 'medium' ? 3 : size === 'large' ? 4 : 6;
  addLineItem(lineItems, "Shure ULXD4D Dual Wireless System (Handheld)", Math.ceil(leadVocalCount / 2));

  // Choir/BGV microphones
  if (sizeConfig.choirMics > 0) {
    addLineItem(lineItems, "Shure SM81 Condenser Microphone", sizeConfig.choirMics);
    addLineItem(lineItems, "Tripod Microphone Stand w/ Boom", sizeConfig.choirMics);
  }

  // Pastor/Speaker microphone
  addLineItem(lineItems, "Sennheiser EW 500 G4-MKE2 Lavalier System", 2);
  addLineItem(lineItems, "Shure SM58 Dynamic Vocal Microphone", 2);

  // Pulpit/Lectern mics
  if (eventType.name.includes("Service") || eventType.name.includes("Conference")) {
    addLineItem(lineItems, "Shure MX418/S 18\" Gooseneck Microphone", 2);
  }

  // In-Ear Monitor System (for worship team)
  if (size !== 'small') {
    // Professional IEM system for medium and above
    addLineItem(lineItems, "Shure ULXD4Q Quad Wireless System", size === 'medium' ? 2 : size === 'large' ? 3 : 4);
  }

  // Digital Snake
  if (bandChannels >= 24) {
    if (size === 'medium') {
      addLineItem(lineItems, "Yamaha RIO1608-D Digital Snake", 1);
    } else {
      addLineItem(lineItems, "Yamaha RIO3224-D Digital Snake", 1);
    }
  }

  // VIDEO PACKAGE

  // ProPresenter Laptop (lyrics/IMAG)
  addLineItem(lineItems, "MacBook Pro 16\" M3 (Playback Pro)", 1);

  // Displays
  const displayCount = sizeConfig.displays;
  if (size === 'small') {
    addLineItem(lineItems, "Samsung 55\" 4K LED Monitor with Stand", displayCount);
  } else if (size === 'medium') {
    addLineItem(lineItems, "Samsung 75\" 4K LED Display with Stand", displayCount);
  } else {
    // Large screens or LED wall
    if (eventType.name.includes("Easter") || eventType.name.includes("Christmas") || eventType.name.includes("Festival")) {
      addLineItem(lineItems, "Absen A3 Pro LED Panel (6-Pack) 2.97mm", Math.ceil(displayCount / 2));
      addLineItem(lineItems, "LED Panel Control Kit (0-60 Panels)", 1);
    } else {
      addLineItem(lineItems, "Stumpfl 13.5' x 24' Monoblox Screen w/Dress Kit", Math.ceil(displayCount / 2));
      addLineItem(lineItems, "Epson Pro L12000Q 12K Laser Projector", Math.ceil(displayCount / 2));
    }
  }

  // Cameras for IMAG/Recording
  const cameraCount = sizeConfig.cameras;
  if (cameraCount >= 1) {
    if (eventType.name.includes("Recording")) {
      // Broadcast quality
      addLineItem(lineItems, "Sony HXC-100 HD Broadcast Camera Kit", Math.min(cameraCount, 3));
      addLineItem(lineItems, "Canon 86x HD Broadcast Lens", Math.min(cameraCount, 3));
      addLineItem(lineItems, "Vinten Vision 250 Tripod System", Math.min(cameraCount, 3));
    } else {
      // PTZ cameras for regular services
      addLineItem(lineItems, "Sony BRC-X400 IP 4K PTZ Camera Kit", cameraCount);
      addLineItem(lineItems, "PTZ Camera Controller RM-IP10", Math.ceil(cameraCount / 4));
    }
  }

  // Video Switcher
  if (cameraCount >= 2) {
    if (size === 'small' || size === 'medium') {
      addLineItem(lineItems, "Blackmagic ATEM Mini Extreme ISO", 1);
    } else {
      addLineItem(lineItems, "Blackmagic ATEM 1 M/E 4K Switcher", 1);
    }
  }

  // Recording (archive every service)
  if (eventType.name.includes("Service") || eventType.name.includes("Recording")) {
    addLineItem(lineItems, "Blackmagic HyperDeck Studio 4K Pro", 1);
  }

  // Streaming (for online congregation)
  if (eventType.name.includes("Broadcast") || eventType.name.includes("Multi-Site") || size === 'mega') {
    addLineItem(lineItems, "Teradek Cube 755 HEVC Encoder", 1);
  } else if (eventType.name.includes("Service") && size !== 'small') {
    addLineItem(lineItems, "Teradek VidiU Go Streaming Device", 1);
  }

  // SIGNAL PROCESSING
  if (cameraCount >= 2) {
    // Distribution for confidence monitors, lobby, nursery
    addLineItem(lineItems, "Blackmagic SDI 1x8 Distribution Amp", 1);
    addLineItem(lineItems, "Blackmagic HDMI 1x4 Distribution Amp", 1);
  }

  // Confidence monitors
  if (size !== 'small') {
    addLineItem(lineItems, "Samsung 43\" 4K LED Monitor", 2); // Stage confidence
    addLineItem(lineItems, "ASUS 24\" LED Computer Monitor", 1); // Tech booth
  }

  // LIGHTING

  // House lights for sanctuary
  if (eventType.name.includes("Christmas") || eventType.name.includes("Easter") || eventType.name.includes("Festival")) {
    // Enhanced holiday lighting
    const washCount = size === 'small' ? 8 : size === 'medium' ? 12 : size === 'large' ? 16 : 24;
    addLineItem(lineItems, "Chauvet SlimPAR 64 RGBA LED (per unit)", washCount);

    if (size !== 'small') {
      addLineItem(lineItems, "Martin MAC Aura LED Wash (6-Pack)", size === 'medium' ? 1 : 2);
      addLineItem(lineItems, "Chauvet COLORado Panel Q40 (4-Pack)", size === 'medium' ? 1 : 2);
    }
  } else {
    // Standard service lighting
    const washCount = size === 'small' ? 6 : size === 'medium' ? 10 : size === 'large' ? 14 : 20;
    addLineItem(lineItems, "Chauvet SlimPAR 64 RGBA LED (per unit)", washCount);
  }

  // Stage key lights
  if (size !== 'small') {
    const ellipsoidalCount = size === 'medium' ? 4 : size === 'large' ? 6 : 8;
    addLineItem(lineItems, "ETC Source Four LED Series 2 Lustr", ellipsoidalCount);
  }

  // Lighting console
  if (size === 'small') {
    addLineItem(lineItems, "Chauvet DJ Obey 70 DMX Controller", 1);
  } else if (size === 'medium') {
    addLineItem(lineItems, "Leprecon LP612 DMX Light Board", 1);
  } else {
    addLineItem(lineItems, "ETC Ion XE 20 Console", 1);
  }

  // Haze (for light beams)
  if (eventType.name.includes("Worship Night") || eventType.name.includes("Youth") || size === 'large' || size === 'mega') {
    addLineItem(lineItems, "Look Solutions Unique 2.1 Hazer", 1);
  }

  // STAGING

  // Stage risers for band/choir
  if (eventType.name.includes("Service") || eventType.name.includes("Conference")) {
    if (size === 'small') {
      addLineItem(lineItems, "Biljax 8' x 12' Riser w/Stairs", 1);
    } else if (size === 'medium') {
      addLineItem(lineItems, "Biljax 12' x 24' Riser w/Stairs (Main Stage)", 1);
      addLineItem(lineItems, "Biljax 8' x 12' Riser w/Stairs", 1); // Choir riser
    } else {
      addLineItem(lineItems, "Biljax 12' x 24' Riser w/Stairs (Main Stage)", 2);
      addLineItem(lineItems, "Biljax 8' x 12' Riser w/Stairs", 2);
    }
  }

  // Lectern
  if (eventType.name.includes("Service") || eventType.name.includes("Conference")) {
    addLineItem(lineItems, "Acrylic Lectern with Silver Trim Kit", 1);
  }

  // Baptistry lighting/video (if baptism service)
  if (eventType.name.includes("Baptism")) {
    addLineItem(lineItems, "Chauvet Ovation E-910FC LED Ellipsoidal", 2);
    addLineItem(lineItems, "Canon XF705 4K Camcorder", 1);
  }

  // SPECIALTY ITEMS

  // Hearing assist system (ADA compliance)
  if (size !== 'small' && eventType.name.includes("Service")) {
    addLineItem(lineItems, "Comtek BST-75 IFB Transmitter", 1);
    addLineItem(lineItems, "Comtek PR-75a IFB Receiver", 10);
  }

  // Overflow/Cry room feeds
  if (size === 'large' || size === 'mega') {
    addLineItem(lineItems, "Samsung 55\" 4K LED Monitor with Stand", 2);
  }

  // Multi-campus distribution
  if (eventType.name.includes("Multi-Site")) {
    addLineItem(lineItems, "LiveU LU600 HEVC Bonding Encoder", 1);
    addLineItem(lineItems, "AJA Ki Pro Ultra 12G 4K Recorder", 2);
  }

  // Conference breakout rooms
  if (eventType.name.includes("Conference")) {
    const breakoutCount = size === 'medium' ? 2 : size === 'large' ? 4 : 6;
    addLineItem(lineItems, "QSC K12.2 12\" Powered Speaker", breakoutCount * 2);
    addLineItem(lineItems, "Behringer X32 Digital Mixer", breakoutCount);
    addLineItem(lineItems, "Samsung 65\" 4K QLED Monitor with Stand", breakoutCount);
  }

  // CABLES & INFRASTRUCTURE

  // XLR cables for microphones
  const xlrCount = Math.ceil(bandChannels * 1.5);
  addLineItem(lineItems, "XLR Cable 25'", Math.ceil(xlrCount * 0.5));
  addLineItem(lineItems, "XLR Cable 50'", Math.ceil(xlrCount * 0.3));
  addLineItem(lineItems, "XLR Cable 100'", Math.ceil(xlrCount * 0.2));

  // Speaker cables
  const speakerCableCount = size === 'small' ? 4 : size === 'medium' ? 8 : size === 'large' ? 12 : 16;
  addLineItem(lineItems, "NL4 Speaker Cable 25'", Math.ceil(speakerCableCount * 0.4));
  addLineItem(lineItems, "NL4 Speaker Cable 50'", Math.ceil(speakerCableCount * 0.6));

  // Video cables
  if (cameraCount >= 2) {
    addLineItem(lineItems, "HD/SDI Cable 50'", cameraCount);
    addLineItem(lineItems, "HD/SDI Cable 100'", Math.ceil(cameraCount / 2));
    addLineItem(lineItems, "HDMI Cable 25'", 4);
    addLineItem(lineItems, "HDMI Cable 50'", 2);
  }

  // Network (for ProPresenter, streaming)
  addLineItem(lineItems, "CAT6 Cable 100'", 4);
  addLineItem(lineItems, "Ethercon Cable 100'", 2);

  // POWER

  // Power distribution
  if (size === 'small') {
    addLineItem(lineItems, "8 Outlet Power Strip", 6);
  } else if (size === 'medium') {
    addLineItem(lineItems, "Lex Bento Box L21-30 to Edison Distro", 2);
    addLineItem(lineItems, "Power Cable 208V L21-30 50'", 2);
  } else {
    addLineItem(lineItems, "Lex Lighting Power Distro", 1);
    addLineItem(lineItems, "Lex Medium (12) L21-30 / (6) Edison Distro", 1);
    addLineItem(lineItems, "Power Cable 208V L21-30 100'", 2);
  }

  // Edison extension cables
  const edisonCount = size === 'small' ? 8 : size === 'medium' ? 12 : 16;
  addLineItem(lineItems, "120V Edison Cable 25'", Math.ceil(edisonCount * 0.5));
  addLineItem(lineItems, "120V Edison Cable 50'", Math.ceil(edisonCount * 0.5));

  // Cable protection
  if (size !== 'small') {
    addLineItem(lineItems, "Guard Dog 5-Channel Cable Protector 3'", 4);
  }

  // COMMUNICATIONS

  // Intercom for production team
  if (size === 'large' || size === 'mega') {
    addLineItem(lineItems, "Clear-Com HelixNet System w/Base Station", 1);
    addLineItem(lineItems, "Clear-Com CC-300 Dual-Ear Headset", 4);
  } else if (size === 'medium' && cameraCount >= 2) {
    addLineItem(lineItems, "HME DX210 Digital Wireless 4-Pack", 1);
  }

  // Cue lights for speakers/worship leader
  if (size !== 'small') {
    addLineItem(lineItems, "D'San Perfect Cue Mini Cue Light", 2);
  }

  // LABOR

  // Volunteer-operated considerations (training/setup time)
  if (eventType.name.includes("Service") || eventType.name.includes("Plant")) {
    // Setup and strike
    addLineItem(lineItems, "Setup Technician (per day)", 2);
    addLineItem(lineItems, "Strike Technician (per day)", 2);
  }

  // Technical director for larger events
  if (size === 'large' || size === 'mega' || eventType.name.includes("Conference") || eventType.name.includes("Recording")) {
    addLineItem(lineItems, "Technical Director (per day)", 1);
  }

  // Audio engineer
  if (size !== 'small' || eventType.name.includes("Recording")) {
    addLineItem(lineItems, "Audio Lead Technician A1 (per day)", 1);

    if (eventType.name.includes("Recording")) {
      addLineItem(lineItems, "Broadcast Audio Mixer (per day)", 1);
    }
  }

  // Video engineer/camera operators
  if (cameraCount >= 2) {
    addLineItem(lineItems, "Video Lead Technician V1 (per day)", 1);

    if (cameraCount >= 3) {
      addLineItem(lineItems, "Camera Operator (per day)", Math.min(cameraCount - 1, 3));
    }
  }

  // Lighting tech
  if (size === 'large' || size === 'mega') {
    addLineItem(lineItems, "Lighting Technician L2 (per day)", 1);
  }

  // Training session for volunteers
  if (eventType.name.includes("Plant") || eventType.name.includes("Conference")) {
    addLineItem(lineItems, "General Technician (per day)", 1);
  }

  // OTHER

  // Truck for transport
  if (eventType.name.includes("Festival") || eventType.name.includes("Plant") || eventType.name.includes("Outdoor")) {
    addLineItem(lineItems, "26' Box Truck (Local)", 1);
    addLineItem(lineItems, "Delivery Charge (Local)", 1);
  } else if (size !== 'small') {
    addLineItem(lineItems, "24' Box Truck (Local)", 1);
  }

  // Consumables
  if (size !== 'small') {
    addLineItem(lineItems, "Console/Show Tape Package", 1);
  }

  // Calculate total
  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  return {
    id: `QM-HOW-${String(index + 1).padStart(4, '0')}`,
    userId: 'demo-user',
    clientName: client.contact,
    clientCompany: client.company,
    clientEmail: client.email,
    eventName: eventType.name,
    eventType: "House of Worship",
    eventDate: eventDate.toISOString(),
    venue: `${venue.name}, ${venue.city}, ${venue.state}`,
    venueName: venue.name,
    venueCity: venue.city,
    venueState: venue.state,
    status: 'approved',
    totalAmount: totalAmount,
    lineItems: lineItems,
    notes: `${eventType.description}\n\nCongregation size: ${sizeConfig.congregation[0]}-${sizeConfig.congregation[1]}\nBand inputs: ${bandChannels} channels\nSpeaker configuration: ${sizeConfig.speakers}`,
    attendees: randomInt(sizeConfig.congregation[0], sizeConfig.congregation[1]),
    createdAt: createdDate.toISOString(),
    updatedAt: createdDate.toISOString(),
    expiresAt: expiresDate.toISOString(),
    size: size,
    sanctuarySize: size
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
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = margin + 10;
  }

  // Notes
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('Event Notes', margin, yPos);

  yPos += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);

  const noteLines = quote.notes.split('\n');
  noteLines.forEach(note => {
    if (note.trim()) {
      doc.text(`• ${note}`, margin + 3, yPos);
      yPos += 4;
    }
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
    'Equipment subject to availability at time of booking.',
    'Volunteer training available upon request.',
    'Multi-service discounts available for recurring bookings.',
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
  console.log('='.repeat(70));
  console.log('  QMAV House of Worship Quote Generator');
  console.log('  Generating 15 specialized worship event quotes...');
  console.log('='.repeat(70));
  console.log('');

  const quotes = [];
  let index = 0;

  // Generate diverse quote collection
  const quoteSpecs = [
    { eventType: worshipEventTypes[0], size: 'small' },     // Small Sunday service
    { eventType: worshipEventTypes[0], size: 'medium' },    // Medium Sunday service
    { eventType: worshipEventTypes[0], size: 'large' },     // Large Sunday service
    { eventType: worshipEventTypes[0], size: 'mega' },      // Mega Sunday service
    { eventType: worshipEventTypes[1], size: 'medium' },    // Medium Christmas Eve
    { eventType: worshipEventTypes[1], size: 'mega' },      // Mega Christmas Eve
    { eventType: worshipEventTypes[2], size: 'large' },     // Large Easter
    { eventType: worshipEventTypes[2], size: 'mega' },      // Mega Easter
    { eventType: worshipEventTypes[3], size: 'medium' },    // Medium Conference
    { eventType: worshipEventTypes[3], size: 'large' },     // Large Conference
    { eventType: worshipEventTypes[4], size: 'medium' },    // Medium Youth event
    { eventType: worshipEventTypes[7], size: 'mega' },      // Multi-site broadcast
    { eventType: worshipEventTypes[8], size: 'large' },     // Outdoor festival
    { eventType: worshipEventTypes[10], size: 'large' },    // Worship night
    { eventType: worshipEventTypes[14], size: 'large' },    // Live recording
  ];

  for (const spec of quoteSpecs) {
    const quote = generateWorshipQuote(spec.eventType, spec.size, index);
    quotes.push(quote);

    // Generate PDF
    const doc = generateQuotePDF(quote);
    const filename = `Quote-${quote.id}-${quote.eventName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const filepath = path.join(OUTPUT_DIR, filename);

    // Save PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    fs.writeFileSync(filepath, pdfBuffer);

    index++;
    const progress = Math.round(((index) / quoteSpecs.length) * 100);
    const bar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
    process.stdout.write(`\r  [${bar}] ${progress}% - ${index}/${quoteSpecs.length} quotes generated`);
  }

  console.log('\n');
  console.log('='.repeat(70));
  console.log('  Generation Complete!');
  console.log('='.repeat(70));
  console.log('');
  console.log('  Statistics:');
  console.log(`    Small sanctuary quotes:        ${quotes.filter(q => q.sanctuarySize === 'small').length}`);
  console.log(`    Medium sanctuary quotes:       ${quotes.filter(q => q.sanctuarySize === 'medium').length}`);
  console.log(`    Large sanctuary quotes:        ${quotes.filter(q => q.sanctuarySize === 'large').length}`);
  console.log(`    Mega sanctuary quotes:         ${quotes.filter(q => q.sanctuarySize === 'mega').length}`);
  console.log('');
  const totalValue = quotes.reduce((sum, q) => sum + q.totalAmount, 0);
  console.log(`    Total quote value:             $${totalValue.toLocaleString()}`);
  console.log(`    Average quote value:           $${Math.round(totalValue / quotes.length).toLocaleString()}`);
  console.log(`    Total line items generated:    ${quotes.reduce((sum, q) => sum + q.lineItems.length, 0).toLocaleString()}`);
  console.log('');
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log('');

  // Save quotes JSON for reference
  const quotesJsonPath = path.join(OUTPUT_DIR, 'house-of-worship-quotes.json');
  fs.writeFileSync(quotesJsonPath, JSON.stringify(quotes, null, 2));
  console.log(`  Quotes data saved to: ${quotesJsonPath}`);
  console.log('');
  console.log('  Done! That was intense - gonna need a praise break! 🙌');
  console.log('');
}

main().catch(console.error);
