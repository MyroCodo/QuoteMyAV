/**
 * Concert & Festival Quote Generator
 * Generates AI-training-quality quotes demonstrating professional AV equipment logic
 *
 * CRITICAL LOGIC:
 * - Equipment chains must work together (arrays + subs + amps)
 * - Scaling based on audience size and venue type
 * - Proper support equipment (power, rigging, RF coordination)
 * - Labor scaled to production complexity
 * - Concert-specific elements (backline, riders, delay towers)
 *
 * Run with: node scripts/generators/concert-festival.js
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
const equipmentDb = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mock-data', 'equipment-database.json'), 'utf8'));

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'docs', 'mock-quotes', 'concert-festival');

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

// Concert/Festival specific data
const concertVenues = [
  { name: 'ACL Live at The Moody Theater', city: 'Austin', state: 'TX', capacity: 2750, type: 'theater' },
  { name: 'Stubb\'s Waller Creek Amphitheater', city: 'Austin', state: 'TX', capacity: 2200, type: 'outdoor' },
  { name: 'The Paramount Theatre', city: 'Austin', state: 'TX', capacity: 1300, type: 'theater' },
  { name: 'Emo\'s Austin', city: 'Austin', state: 'TX', capacity: 1750, type: 'club' },
  { name: 'Bass Concert Hall', city: 'Austin', state: 'TX', capacity: 3000, type: 'theater' },
  { name: 'Circuit of the Americas', city: 'Austin', state: 'TX', capacity: 120000, type: 'outdoor' },
  { name: 'Zilker Park', city: 'Austin', state: 'TX', capacity: 75000, type: 'outdoor' },
  { name: 'Germania Insurance Amphitheater', city: 'Austin', state: 'TX', capacity: 14000, type: 'outdoor' },
  { name: 'The Mohawk', city: 'Austin', state: 'TX', capacity: 800, type: 'club' },
  { name: 'Austin City Limits Music Festival', city: 'Austin', state: 'TX', capacity: 75000, type: 'festival' },
  { name: 'Tobin Center for the Performing Arts', city: 'San Antonio', state: 'TX', capacity: 1750, type: 'theater' },
  { name: 'AT&T Center', city: 'San Antonio', state: 'TX', capacity: 18500, type: 'arena' },
  { name: 'Toyota Center', city: 'Houston', state: 'TX', capacity: 19000, type: 'arena' },
  { name: 'American Airlines Center', city: 'Dallas', state: 'TX', capacity: 20000, type: 'arena' },
  { name: 'AT&T Stadium', city: 'Arlington', state: 'TX', capacity: 80000, type: 'stadium' },
];

const artistNames = [
  'The Midnight Run', 'Sierra & The Sound', 'Electric Avenue', 'Jake Morrison Band',
  'Violet Sky', 'The Austin Project', 'Red River Revival', 'Luna Rose',
  'Steel Creek', 'The Horizon Collective', 'Wildfire', 'Echo & The Elements',
  'Neon Knights', 'Cosmic Cowboys', 'The Velvet Underground Tribute',
  'Texas Thunder', 'Meridian Music Collective', 'The 6th Street Band',
  'Blue Moon Rising', 'Canyon Creek Music Festival'
];

const eventTypes = [
  { type: 'Club Show', capacity: [200, 800], scale: 'club' },
  { type: 'Theater Concert', capacity: [800, 3000], scale: 'theater' },
  { type: 'Arena Show', capacity: [3000, 20000], scale: 'arena' },
  { type: 'Festival Main Stage', capacity: [5000, 75000], scale: 'festival' },
  { type: 'Outdoor Amphitheater', capacity: [1500, 15000], scale: 'amphitheater' },
];

// Utility functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(index) {
  return `CF-${String(index + 1).padStart(4, '0')}`;
}

// Get equipment by specific name
function getEquipmentByName(category, itemName) {
  for (const subcategory in equipmentDb[category]) {
    const items = equipmentDb[category][subcategory];
    const found = items.find(item => item.name === itemName);
    if (found) {
      return { ...found, category };
    }
  }
  return null;
}

// Add line item
function addLineItem(items, category, itemName, quantity, notes = '') {
  const equipment = getEquipmentByName(category, itemName);
  if (equipment) {
    items.push({
      id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
      category: category,
      description: notes ? `${equipment.name} ${notes}` : equipment.name,
      quantity: quantity,
      unitPrice: equipment.dailyRate,
      total: quantity * equipment.dailyRate
    });
  }
}

// CLUB SHOW (200-800 capacity) - Point source or small arrays
function generateClubShow(venue, artist, attendees) {
  const lineItems = [];

  // === AUDIO ===
  // FOH System - Small point source or compact line array
  if (attendees < 400) {
    addLineItem(lineItems, 'audio', 'QSC K12.2 12\" Powered Speaker', 2);
    addLineItem(lineItems, 'audio', 'JBL SRX818SP 18\" Powered Subwoofer', 2);
  } else {
    addLineItem(lineItems, 'audio', 'JBL VRX932LA-1 12\" Line Array Speaker', 4);
    addLineItem(lineItems, 'audio', 'JBL VRX918SP 18\" Powered Subwoofer', 2);
  }

  // FOH Console
  addLineItem(lineItems, 'audio', 'Midas M32 Digital Console', 1);
  addLineItem(lineItems, 'audio', 'Yamaha RIO1608-D Digital Snake', 1);

  // Stage Monitors
  addLineItem(lineItems, 'audio', 'QSC K10.2 Stage Monitor', 4);
  addLineItem(lineItems, 'audio', 'Behringer X32 Digital Mixer', 1, '(Monitor Mix)');

  // Wireless Microphones (typical 4-piece band)
  addLineItem(lineItems, 'audio', 'Shure ULXD4D Dual Wireless System (Handheld)', 2);
  addLineItem(lineItems, 'audio', 'Shure ULXD1 Bodypack with WL185 Lavalier', 1);

  // Wired Mics for instruments
  addLineItem(lineItems, 'audio', 'Shure SM58 Dynamic Vocal Microphone', 3);
  addLineItem(lineItems, 'audio', 'Shure SM57 Instrument Microphone', 4);
  addLineItem(lineItems, 'audio', 'AKG C414 XLS Condenser Microphone', 2);

  // DI Boxes
  addLineItem(lineItems, 'audio', 'Radial J48 Active DI Box', 4);

  // Mic Stands
  addLineItem(lineItems, 'audio', 'Tripod Microphone Stand w/ Boom', 8);
  addLineItem(lineItems, 'audio', 'Round Base Microphone Stand', 4);

  // Speaker Stands
  addLineItem(lineItems, 'audio', 'Speaker Stand (Ultimate Support)', 4);

  // === LIGHTING ===
  addLineItem(lineItems, 'lighting', 'Chauvet SlimPAR 64 RGBA LED (per unit)', 12);
  addLineItem(lineItems, 'lighting', 'Chauvet Maverick MK3 Wash', 4);
  addLineItem(lineItems, 'lighting', 'Chauvet Geyser RGB Fogger', 2);
  addLineItem(lineItems, 'lighting', 'Leprecon LP612 DMX Light Board', 1);
  addLineItem(lineItems, 'lighting', 'DMX 5-Pin Cable 50\'', 8);

  // === RIGGING ===
  addLineItem(lineItems, 'rigging', 'Xtreme 12\"x18\" x 10\' GP Truss w/Bolts', 4);
  addLineItem(lineItems, 'rigging', 'Xtreme 12\"x18\" x 5\' GP Truss', 2);
  addLineItem(lineItems, 'rigging', '10\' Steel Light Tree Pole', 2);
  addLineItem(lineItems, 'rigging', 'Shackle 3/8\" Screw Pin', 12);
  addLineItem(lineItems, 'rigging', 'Safety Chain Black 30\"', 8);

  // === STAGING ===
  if (venue.type === 'club') {
    addLineItem(lineItems, 'staging', 'Biljax 4\' x 8\' Stage Deck', 4);
    addLineItem(lineItems, 'staging', 'Biljax Stage Leg 24\" (per set)', 4);
    addLineItem(lineItems, 'staging', 'Stage Carpet 12\' x 24\' Black', 1);
  }

  // === CABLES ===
  addLineItem(lineItems, 'cables', 'XLR Cable 25\'', 16);
  addLineItem(lineItems, 'cables', 'XLR Cable 50\'', 8);
  addLineItem(lineItems, 'cables', 'NL4 Speaker Cable 25\'', 6);
  addLineItem(lineItems, 'cables', 'NL4 Speaker Cable 50\'', 4);

  // === POWER ===
  addLineItem(lineItems, 'power', 'Lex Bento Box L21-30 to Edison Distro', 2);
  addLineItem(lineItems, 'power', '120V Edison Cable 50\'', 12);
  addLineItem(lineItems, 'power', '8 Outlet Power Strip', 6);
  addLineItem(lineItems, 'power', 'Guard Dog 5-Channel Cable Protector 3\'', 4);

  // === COMMS ===
  addLineItem(lineItems, 'comms', 'Motorola CP200d Two-Way Radio', 4);
  addLineItem(lineItems, 'comms', 'Clear-Com CC-110 Single-Ear Headset', 2);

  // === LABOR ===
  addLineItem(lineItems, 'labor', 'Audio Lead Technician A1 (per day)', 1);
  addLineItem(lineItems, 'labor', 'Audio Technician A2 (per day)', 1);
  addLineItem(lineItems, 'labor', 'Lighting Technician L2 (per day)', 1);
  addLineItem(lineItems, 'labor', 'Setup Technician (per day)', 2);
  addLineItem(lineItems, 'labor', 'Strike Technician (per day)', 2);

  return lineItems;
}

// THEATER CONCERT (800-3000 capacity) - Medium arrays, monitor world
function generateTheaterConcert(venue, artist, attendees) {
  const lineItems = [];

  // === AUDIO ===
  // Main FOH - Medium line array system
  const arrayBoxes = attendees < 1500 ? 6 : 8;
  addLineItem(lineItems, 'audio', 'JBL VTX V25-II Line Array Element (per side)', arrayBoxes / 4);
  addLineItem(lineItems, 'audio', 'QSC KS218C Dual 18\" Cardioid Subwoofer', arrayBoxes / 2);

  // Amplification for arrays
  addLineItem(lineItems, 'audio', 'Crown XTi 6002 Power Amplifier', 4);

  // FOH Console
  addLineItem(lineItems, 'audio', 'Yamaha CL5 Digital Audio Console', 1);
  addLineItem(lineItems, 'audio', 'Yamaha RIO3224-D Digital Snake', 1);

  // Monitor World
  addLineItem(lineItems, 'audio', 'Yamaha QL1 Digital Audio Console', 1, '(Monitor Mix)');
  addLineItem(lineItems, 'audio', 'JBL PRX412M Stage Monitor', 8);
  addLineItem(lineItems, 'audio', 'Crown XTi 4002 Power Amplifier', 4, '(Monitors)');

  // Wireless Systems (band + backup)
  addLineItem(lineItems, 'audio', 'Shure ULXD4Q Quad Wireless System', 2);
  addLineItem(lineItems, 'audio', 'Shure ULXD1 Bodypack with WL185 Lavalier', 4);

  // Wired Microphones
  addLineItem(lineItems, 'audio', 'Shure Beta 58A Dynamic Microphone', 6);
  addLineItem(lineItems, 'audio', 'Shure SM57 Instrument Microphone', 8);
  addLineItem(lineItems, 'audio', 'Shure SM81 Condenser Microphone', 4);
  addLineItem(lineItems, 'audio', 'Neumann KMS 105 Vocal Condenser', 2);

  // DI Boxes
  addLineItem(lineItems, 'audio', 'Radial J48 Active DI Box', 8);
  addLineItem(lineItems, 'audio', 'Whirlwind PCDI Computer Audio Interface', 2);

  // Mic Stands
  addLineItem(lineItems, 'audio', 'Tripod Microphone Stand w/ Boom', 12);
  addLineItem(lineItems, 'audio', 'Round Base Microphone Stand', 6);

  // === VIDEO ===
  // IMAG for larger theaters
  if (attendees > 1500) {
    addLineItem(lineItems, 'video', 'Sony BRC-H900 HD PTZ Camera System', 2);
    addLineItem(lineItems, 'video', 'Blackmagic ATEM 1 M/E 4K Switcher', 1);
    addLineItem(lineItems, 'video', 'Stumpfl 11.3\' x 20\' Monoblox Screen w/Dress Kit', 2);
    addLineItem(lineItems, 'video', 'Panasonic PT-RZ120 12K Laser Projector', 2);
    addLineItem(lineItems, 'video', 'Barco ImagePRO-4K Scaler', 1);
  }

  // Confidence monitors
  addLineItem(lineItems, 'video', 'Samsung 43\" 4K LED Monitor', 2);
  addLineItem(lineItems, 'video', 'Monitor Stand Chrome Poles 6\' (32\"-55\")', 2);

  // === LIGHTING ===
  addLineItem(lineItems, 'lighting', 'Robe BMFL Spot Moving Light', 8);
  addLineItem(lineItems, 'lighting', 'Robe Robin 600 LED Wash', 6);
  addLineItem(lineItems, 'lighting', 'Martin MAC Aura LED Wash (6-Pack)', 2);
  addLineItem(lineItems, 'lighting', 'ETC Source Four LED Series 2 Lustr', 12);
  addLineItem(lineItems, 'lighting', 'Lycian SuperArc 400 Followspot', 2);
  addLineItem(lineItems, 'lighting', 'Look Solutions Unique 2.1 Hazer', 2);
  addLineItem(lineItems, 'lighting', 'ETC Ion XE 20 Console', 1);
  addLineItem(lineItems, 'lighting', 'DMX 5-Pin Cable 100\'', 6);
  addLineItem(lineItems, 'lighting', 'DMX 5-Pin Cable 50\'', 8);

  // === RIGGING ===
  addLineItem(lineItems, 'rigging', 'James Thomas 12\"x18\" x 10\' GP Truss', 12);
  addLineItem(lineItems, 'rigging', 'Xtreme 12\"x18\" x 5\' GP Truss', 6);
  addLineItem(lineItems, 'rigging', '12\"x18\" 4-Way Truss Corner Block', 4);
  addLineItem(lineItems, 'rigging', 'CM Lodestar 1-Ton Chain Motor', 8);
  addLineItem(lineItems, 'rigging', '8-Way Motor Control Kit', 1);
  addLineItem(lineItems, 'rigging', 'Shackle 5/8\" Screw Pin', 24);
  addLineItem(lineItems, 'rigging', 'Safety Chain Black 30\"', 16);

  // === STAGING ===
  addLineItem(lineItems, 'staging', 'Biljax 12\' x 24\' Riser w/Stairs (Main Stage)', 1);
  addLineItem(lineItems, 'staging', 'Biljax 4\' x 8\' Stage Deck', 6);
  addLineItem(lineItems, 'staging', 'Biljax Stage Leg 32\" (per set)', 6);
  addLineItem(lineItems, 'staging', 'Stage Carpet 12\' x 24\' Black', 2);
  addLineItem(lineItems, 'staging', 'Crowd Barrier Section 8\'', 12);

  // === DECOR ===
  addLineItem(lineItems, 'decor', 'Drape Black Velour 13\'W x 16\'H', 8);
  addLineItem(lineItems, 'decor', '20\' Section Pipe and Drape HW', 4);

  // === CABLES ===
  addLineItem(lineItems, 'cables', 'XLR Cable 100\'', 8);
  addLineItem(lineItems, 'cables', 'XLR Cable 50\'', 16);
  addLineItem(lineItems, 'cables', 'XLR Cable 25\'', 12);
  addLineItem(lineItems, 'cables', 'NL4 Speaker Cable 100\'', 6);
  addLineItem(lineItems, 'cables', 'NL4 Speaker Cable 50\'', 8);
  addLineItem(lineItems, 'cables', 'CAT6 Cable 100\'', 6);

  // === SIGNAL ===
  addLineItem(lineItems, 'signal', 'Blackmagic Smart Videohub 12x12', 1);
  addLineItem(lineItems, 'signal', 'AJA Hi5-4K 4K SDI to HDMI Converter', 2);

  // === POWER ===
  addLineItem(lineItems, 'power', 'Lex Large L21-30 / Socapex Power Distro', 2);
  addLineItem(lineItems, 'power', 'Lex Bento Box L21-30 to Edison Distro', 3);
  addLineItem(lineItems, 'power', 'Power Cable 208V L21-30 100\'', 4);
  addLineItem(lineItems, 'power', '120V Edison Cable 100\'', 12);
  addLineItem(lineItems, 'power', '8 Outlet Power Strip', 10);
  addLineItem(lineItems, 'power', 'Guard Dog 5-Channel Cable Protector 3\'', 8);

  // === COMMS ===
  addLineItem(lineItems, 'comms', 'Clear-Com HelixNet System w/Base Station', 1);
  addLineItem(lineItems, 'comms', 'Clear-Com CC-300 Dual-Ear Headset', 6);
  addLineItem(lineItems, 'comms', 'Motorola XPR7550e Digital Radio', 6);

  // === LABOR ===
  addLineItem(lineItems, 'labor', 'Technical Director (per day)', 1);
  addLineItem(lineItems, 'labor', 'Audio Lead Technician A1 (per day)', 1);
  addLineItem(lineItems, 'labor', 'Monitor Engineer (per day)', 1);
  addLineItem(lineItems, 'labor', 'Audio Technician A2 (per day)', 2);
  addLineItem(lineItems, 'labor', 'Lighting Lead Technician L1 (per day)', 1);
  addLineItem(lineItems, 'labor', 'Lighting Technician L2 (per day)', 1);
  addLineItem(lineItems, 'labor', 'Followspot Operator (per day)', 2);
  if (attendees > 1500) {
    addLineItem(lineItems, 'labor', 'Video Engineer (per day)', 1);
    addLineItem(lineItems, 'labor', 'Camera Operator (per day)', 2);
  }
  addLineItem(lineItems, 'labor', 'Rigger/Head Rigger (per day)', 2);
  addLineItem(lineItems, 'labor', 'Setup Technician (per day)', 4);
  addLineItem(lineItems, 'labor', 'Strike Technician (per day)', 4);

  return lineItems;
}

// ARENA SHOW (3000-20000 capacity) - Large arrays, delay towers, full production
function generateArenaShow(venue, artist, attendees) {
  const lineItems = [];

  // === AUDIO ===
  // Main PA - Large touring line array
  const arraySize = attendees < 10000 ? 'medium' : 'large';
  if (arraySize === 'medium') {
    addLineItem(lineItems, 'audio', 'L-Acoustics KARA II Line Array (per side)', 3);
    addLineItem(lineItems, 'audio', 'd&b audiotechnik SL-SUB Subwoofer', 8);
  } else {
    addLineItem(lineItems, 'audio', 'd&b audiotechnik E12 Line Array (8-box)', 2);
    addLineItem(lineItems, 'audio', 'Meyer Sound 1100-LFC Low-Frequency Element', 8);
  }

  // Delay Towers (for venues > 5000)
  if (attendees > 5000) {
    addLineItem(lineItems, 'audio', 'JBL VTX V25-II Line Array Element (per side)', 2, '(Delay Towers)');
    addLineItem(lineItems, 'audio', 'QSC KS218C Dual 18\" Cardioid Subwoofer', 4, '(Delay Fill)');
  }

  // Amplification
  addLineItem(lineItems, 'audio', 'Lab.gruppen PLM 20K44 Amplifier', 6);
  addLineItem(lineItems, 'audio', 'Powersoft X4 Amplifier Platform', 4);

  // FOH Console - Tour grade
  addLineItem(lineItems, 'audio', 'DiGiCo SD12 Digital Console', 1);
  addLineItem(lineItems, 'audio', 'Allen & Heath DX168 Digital Stage Box', 2);

  // Monitor World
  addLineItem(lineItems, 'audio', 'Yamaha CL5 Digital Audio Console', 1, '(Monitor Mix)');
  addLineItem(lineItems, 'audio', 'd&b audiotechnik M4 Stage Monitor', 12);

  // In-Ear Monitoring System
  addLineItem(lineItems, 'audio', 'Shure Axient Digital AD4D Dual System', 4, '(IEM)');
  addLineItem(lineItems, 'audio', 'Shure Axient Digital AD1 Bodypack w/Lav', 8);

  // Wireless Microphones - Tour grade
  addLineItem(lineItems, 'audio', 'Shure Axient Digital AD4D Dual System', 4);
  addLineItem(lineItems, 'audio', 'Sennheiser Digital 6000 Wireless System', 2);

  // Wired Mics - Premium selection
  addLineItem(lineItems, 'audio', 'Neumann KMS 105 Vocal Condenser', 6);
  addLineItem(lineItems, 'audio', 'Shure Beta 58A Dynamic Microphone', 8);
  addLineItem(lineItems, 'audio', 'Shure SM57 Instrument Microphone', 12);
  addLineItem(lineItems, 'audio', 'AKG C414 XLS Condenser Microphone', 6);

  // DI Boxes
  addLineItem(lineItems, 'audio', 'Countryman Type 85 Active DI', 12);
  addLineItem(lineItems, 'audio', 'Radial J48 Active DI Box', 8);

  // Stands
  addLineItem(lineItems, 'audio', 'Tripod Microphone Stand w/ Boom', 18);
  addLineItem(lineItems, 'audio', 'Round Base Microphone Stand', 10);

  // === VIDEO ===
  // IMAG System
  addLineItem(lineItems, 'video', 'Absen A3 Pro LED Panel (6-Pack) 2.97mm', 12, '(2x Main Screens)');
  addLineItem(lineItems, 'video', 'LED Panel Control Kit (0-60 Panels)', 1);
  addLineItem(lineItems, 'video', 'LED Panel Hanging Bar Kit', 8);

  // Camera Package
  addLineItem(lineItems, 'video', 'Sony HXC-100 HD Broadcast Camera Kit', 4);
  addLineItem(lineItems, 'video', 'Canon 86x HD Broadcast Lens', 2);
  addLineItem(lineItems, 'video', 'Vinten Vision 250 Tripod System', 4);

  // Video Control
  addLineItem(lineItems, 'video', 'Ross Carbonite Black Solo Switcher', 1);
  addLineItem(lineItems, 'video', 'Barco ImagePRO-4K Scaler', 2);
  addLineItem(lineItems, 'video', 'Blackmagic HyperDeck Studio 4K Pro', 2);

  // Confidence Monitors
  addLineItem(lineItems, 'video', 'Samsung 55\" 4K LED Monitor with Stand', 6);
  addLineItem(lineItems, 'video', 'Sharp 42\" LED 1080p Confidence Monitor', 4);

  // Playback
  addLineItem(lineItems, 'video', 'MacBook Pro 16\" M3 (Playback Pro)', 2);

  // === LIGHTING ===
  // Moving Lights - Full rig
  addLineItem(lineItems, 'lighting', 'Martin MAC Quantum Profile (2-Pack)', 6);
  addLineItem(lineItems, 'lighting', 'Elation Artiste Picasso Moving Light (2-Pack)', 4);
  addLineItem(lineItems, 'lighting', 'Robe BMFL Spot Moving Light', 12);
  addLineItem(lineItems, 'lighting', 'Martin MAC Aura LED Wash (6-Pack)', 4);
  addLineItem(lineItems, 'lighting', 'Chauvet Maverick MK3 Wash', 8);

  // LED Pars
  addLineItem(lineItems, 'lighting', 'Chauvet SlimPAR 64 RGBA LED (per unit)', 24);

  // Followspots
  addLineItem(lineItems, 'lighting', 'Robert Juliat Korrigan LED Followspot', 4);

  // Effects
  addLineItem(lineItems, 'lighting', 'MDG ATMe Haze Generator', 3);
  addLineItem(lineItems, 'lighting', 'Chauvet Geyser RGB Fogger', 4);

  // Control
  addLineItem(lineItems, 'lighting', 'MA Lighting grandMA3 Compact XT', 1);
  addLineItem(lineItems, 'lighting', 'Wireless DMX Transmitter/Receiver Set', 4);
  addLineItem(lineItems, 'lighting', 'DMX 5-Pin Cable 100\'', 12);

  // === RIGGING ===
  // Mother grid and motors
  addLineItem(lineItems, 'rigging', 'James Thomas 12\"x18\" x 10\' GP Truss', 32);
  addLineItem(lineItems, 'rigging', 'Xtreme 12\"x18\" x 8\' GP Truss', 16);
  addLineItem(lineItems, 'rigging', '12\"x18\" 4-Way Truss Corner Block', 12);
  addLineItem(lineItems, 'rigging', '12\"x18\" 6-Way Truss Corner Block', 4);
  addLineItem(lineItems, 'rigging', 'CM 7-Pin 1-Ton 3-Phase Chain Motor', 24);
  addLineItem(lineItems, 'rigging', '12-Way Motor Control Kit', 2);
  addLineItem(lineItems, 'rigging', 'Shackle 5/8\" Screw Pin', 60);
  addLineItem(lineItems, 'rigging', 'Safety Chain Black 30\"', 40);

  // Delay Tower Support
  if (attendees > 5000) {
    addLineItem(lineItems, 'rigging', 'Genie ST25 25\' Supertower Stand', 4);
  }

  // === STAGING ===
  addLineItem(lineItems, 'staging', 'Biljax 12\' x 24\' Riser w/Stairs (Main Stage)', 2);
  addLineItem(lineItems, 'staging', 'Biljax 4\' x 8\' Stage Deck', 16);
  addLineItem(lineItems, 'staging', 'Biljax Stage Leg 32\" (per set)', 16);
  addLineItem(lineItems, 'staging', 'Biljax Ultra Stairs 4-Step w/Rails', 4);
  addLineItem(lineItems, 'staging', 'Stage Carpet 12\' x 24\' Black', 4);
  addLineItem(lineItems, 'staging', 'Stage Skirt 8\' x 30\" Black', 24);
  addLineItem(lineItems, 'staging', 'Crowd Barrier Section 8\'', 30);

  // === DECOR ===
  addLineItem(lineItems, 'decor', 'Drape Black Velour 13\'W x 16\'H', 16);
  addLineItem(lineItems, 'decor', 'Black Commando Cloth/Duvetyne (per yard)', 40);

  // === CABLES ===
  addLineItem(lineItems, 'cables', 'XLR Cable 100\'', 24);
  addLineItem(lineItems, 'cables', 'XLR Cable 50\'', 32);
  addLineItem(lineItems, 'cables', 'XLR Cable 25\'', 20);
  addLineItem(lineItems, 'cables', 'NL4 Speaker Cable 100\'', 16);
  addLineItem(lineItems, 'cables', 'NL4 Speaker Cable 50\'', 12);
  addLineItem(lineItems, 'cables', 'HD/SDI Cable 100\'', 12);
  addLineItem(lineItems, 'cables', 'HD/SDI Cable 200\'', 6);
  addLineItem(lineItems, 'cables', 'CAT6 Cable 100\'', 12);
  addLineItem(lineItems, 'cables', 'Ethercon Cable 100\'', 8);

  // === SIGNAL ===
  addLineItem(lineItems, 'signal', 'Blackmagic Smart Videohub 20x20', 1);
  addLineItem(lineItems, 'signal', 'TV One CORIOmaster Processor', 1);
  addLineItem(lineItems, 'signal', 'AJA FiDO 4-Channel SDI to Fiber Kit', 2);
  addLineItem(lineItems, 'signal', 'Decimator MD-HX HDMI/SDI Cross Converter', 6);

  // === POWER ===
  // 3-phase distribution
  addLineItem(lineItems, 'power', 'Motion Labs 200 AMP Power Distro', 2);
  addLineItem(lineItems, 'power', 'Lex Large L21-30 / Socapex Power Distro', 4);
  addLineItem(lineItems, 'power', '100\' 2/0 Feeder Cable 5-Wire', 4);
  addLineItem(lineItems, 'power', 'Feeder Tails 2/0 AWG 5-Wire Set', 2);
  addLineItem(lineItems, 'power', 'Power Cable 208V L21-30 100\'', 12);
  addLineItem(lineItems, 'power', '120V Edison Cable 100\'', 24);
  addLineItem(lineItems, 'power', '8 Outlet Power Strip', 20);
  addLineItem(lineItems, 'power', 'Guard Dog 5-Channel Cable Protector 3\'', 16);

  // Generator for outdoor or insufficient house power
  if (venue.type === 'outdoor' || venue.type === 'festival') {
    addLineItem(lineItems, 'power', '100KW Diesel Generator', 1);
  }

  // === COMMS ===
  addLineItem(lineItems, 'comms', 'Clear-Com FreeSpeak II Base w/5 Beltpacks', 2);
  addLineItem(lineItems, 'comms', 'Clear-Com CC-300 Dual-Ear Headset', 10);
  addLineItem(lineItems, 'comms', 'Motorola XPR7550e Digital Radio', 12);
  addLineItem(lineItems, 'comms', 'Multi-Unit Radio Charger (6-Bay)', 2);

  // === LABOR ===
  addLineItem(lineItems, 'labor', 'Project Manager (per day)', 1);
  addLineItem(lineItems, 'labor', 'Technical Director (per day)', 1);
  addLineItem(lineItems, 'labor', 'Show Caller/Stage Manager (per day)', 1);

  // Audio crew
  addLineItem(lineItems, 'labor', 'Audio Lead Technician A1 (per day)', 1);
  addLineItem(lineItems, 'labor', 'Monitor Engineer (per day)', 1);
  addLineItem(lineItems, 'labor', 'Audio Technician A2 (per day)', 3);
  addLineItem(lineItems, 'labor', 'Audio Technician A3 (per day)', 2);

  // Video crew
  addLineItem(lineItems, 'labor', 'Video Lead Technician V1 (per day)', 1);
  addLineItem(lineItems, 'labor', 'Video Engineer (per day)', 1);
  addLineItem(lineItems, 'labor', 'Camera Operator (per day)', 4);
  addLineItem(lineItems, 'labor', 'LED Wall Technician (per day)', 2);

  // Lighting crew
  addLineItem(lineItems, 'labor', 'Lighting Lead Technician L1 (per day)', 1);
  addLineItem(lineItems, 'labor', 'Lighting Programmer (per day)', 1);
  addLineItem(lineItems, 'labor', 'Lighting Technician L2 (per day)', 2);
  addLineItem(lineItems, 'labor', 'Followspot Operator (per day)', 4);

  // Rigging and stage crew
  addLineItem(lineItems, 'labor', 'Rigger/Head Rigger (per day)', 4);
  addLineItem(lineItems, 'labor', 'Electrician (per day)', 2);
  addLineItem(lineItems, 'labor', 'Setup Technician (per day)', 8);
  addLineItem(lineItems, 'labor', 'Stagehand (per day)', 6);
  addLineItem(lineItems, 'labor', 'Strike Technician (per day)', 8);

  // === OTHER ===
  addLineItem(lineItems, 'other', '26\' Box Truck (Local)', 2);
  addLineItem(lineItems, 'other', 'Delivery Charge (Local)', 1);
  addLineItem(lineItems, 'other', 'Gaff Tape Black 3\" Roll', 8);
  addLineItem(lineItems, 'other', 'Console/Show Tape Package', 2);

  return lineItems;
}

// FESTIVAL MAIN STAGE (5000-75000 capacity) - Full touring system
function generateFestivalMainStage(venue, artist, attendees) {
  const lineItems = [];

  // === AUDIO ===
  // Massive PA system
  addLineItem(lineItems, 'audio', 'd&b audiotechnik E12 Line Array (8-box)', 4, '(Main Hangs L/R)');
  addLineItem(lineItems, 'audio', 'Meyer Sound 1100-LFC Low-Frequency Element', 16);

  // Delay towers - essential for festivals
  addLineItem(lineItems, 'audio', 'L-Acoustics KARA II Line Array (per side)', 4, '(Front Fill)');
  addLineItem(lineItems, 'audio', 'JBL VTX V25-II Line Array Element (per side)', 4, '(Delay Tower 1)');
  addLineItem(lineItems, 'audio', 'd&b audiotechnik SL-SUB Subwoofer', 8, '(Delay Subs)');

  if (attendees > 30000) {
    addLineItem(lineItems, 'audio', 'JBL VTX V25-II Line Array Element (per side)', 4, '(Delay Tower 2)');
  }

  // Massive amplification
  addLineItem(lineItems, 'audio', 'Powersoft X4 Amplifier Platform', 12);
  addLineItem(lineItems, 'audio', 'Lab.gruppen PLM 20K44 Amplifier', 8);

  // FOH - Tour grade
  addLineItem(lineItems, 'audio', 'Avid S6L-24 Digital Console', 1);
  addLineItem(lineItems, 'audio', 'Allen & Heath dLive S5000 Console', 1, '(Backup FOH)');
  addLineItem(lineItems, 'audio', 'Allen & Heath DX168 Digital Stage Box', 3);

  // Monitor World - Full touring setup
  addLineItem(lineItems, 'audio', 'DiGiCo SD12 Digital Console', 1, '(Monitors)');
  addLineItem(lineItems, 'audio', 'd&b audiotechnik M4 Stage Monitor', 16);
  addLineItem(lineItems, 'audio', 'Meyer Sound LEOPARD Line Array (per side)', 2, '(Sidefill)');

  // IEM - Multiple artist systems
  addLineItem(lineItems, 'audio', 'Shure Axient Digital AD4D Dual System', 8, '(IEM)');
  addLineItem(lineItems, 'audio', 'Sennheiser Digital 6000 Wireless System', 4, '(IEM)');

  // Wireless Microphones - Coordinated RF
  addLineItem(lineItems, 'audio', 'Shure Axient Digital AD4D Dual System', 6);
  addLineItem(lineItems, 'audio', 'Sennheiser Digital 6000 Wireless System', 4);
  addLineItem(lineItems, 'audio', 'Audio-Technica ATW-5000 Series Wireless', 2, '(Backup)');

  // Wired Mics - Full festival complement
  addLineItem(lineItems, 'audio', 'Neumann KMS 105 Vocal Condenser', 12);
  addLineItem(lineItems, 'audio', 'Shure Beta 58A Dynamic Microphone', 16);
  addLineItem(lineItems, 'audio', 'Shure SM57 Instrument Microphone', 20);
  addLineItem(lineItems, 'audio', 'AKG C414 XLS Condenser Microphone', 8);
  addLineItem(lineItems, 'audio', 'Shure SM81 Condenser Microphone', 8);

  // DI Boxes
  addLineItem(lineItems, 'audio', 'Countryman Type 85 Active DI', 20);
  addLineItem(lineItems, 'audio', 'Radial J48 Active DI Box', 16);
  addLineItem(lineItems, 'audio', 'Whirlwind PCDI Computer Audio Interface', 4);

  // Stands
  addLineItem(lineItems, 'audio', 'Tripod Microphone Stand w/ Boom', 30);
  addLineItem(lineItems, 'audio', 'Round Base Microphone Stand', 16);

  // === VIDEO ===
  // Massive LED screens
  addLineItem(lineItems, 'video', 'Absen A3 Pro LED Panel (6-Pack) 2.97mm', 24, '(Main Screen)');
  addLineItem(lineItems, 'video', 'ROE Visual Black Pearl BP2 LED Panel', 32, '(Side Screens)');
  addLineItem(lineItems, 'video', 'LED Panel Control Kit (0-60 Panels)', 2);
  addLineItem(lineItems, 'video', 'LED Panel Hanging Bar Kit', 16);

  // Multi-camera broadcast package
  addLineItem(lineItems, 'video', 'Sony HXC-100 HD Broadcast Camera Kit', 6);
  addLineItem(lineItems, 'video', 'Canon 86x HD Broadcast Lens', 4);
  addLineItem(lineItems, 'video', 'Fujinon 17x7.6 HD Camera Lens', 2);
  addLineItem(lineItems, 'video', 'Vinten Vision 250 Tripod System', 6);
  addLineItem(lineItems, 'video', 'PTZ Optics 30X NDI Camera', 2);

  // Video Control
  addLineItem(lineItems, 'video', 'Blackmagic ATEM 2 M/E 8K Constellation Switcher', 1);
  addLineItem(lineItems, 'video', 'Analog Way Pulse 4K Scaler', 2);
  addLineItem(lineItems, 'video', 'Blackmagic HyperDeck Studio 4K Pro', 3);

  // Recording and streaming
  addLineItem(lineItems, 'video', 'LiveU LU600 HEVC Bonding Encoder', 1);
  addLineItem(lineItems, 'video', 'Teradek Cube 755 HEVC Encoder', 2);

  // Playback
  addLineItem(lineItems, 'video', 'MacBook Pro 16\" M3 (Playback Pro)', 3);

  // Confidence monitors
  addLineItem(lineItems, 'video', 'Samsung 65\" 4K QLED Monitor with Stand', 4);
  addLineItem(lineItems, 'video', 'Samsung 55\" 4K LED Monitor with Stand', 8);

  // === LIGHTING ===
  // Massive lighting rig
  addLineItem(lineItems, 'lighting', 'Martin MAC Quantum Profile (2-Pack)', 12);
  addLineItem(lineItems, 'lighting', 'Elation Artiste Picasso Moving Light (2-Pack)', 8);
  addLineItem(lineItems, 'lighting', 'Robe BMFL Spot Moving Light', 20);
  addLineItem(lineItems, 'lighting', 'High End Systems SolaFrame 3000', 12);
  addLineItem(lineItems, 'lighting', 'Martin MAC Aura LED Wash (6-Pack)', 8);
  addLineItem(lineItems, 'lighting', 'Chauvet Maverick MK3 Wash', 16);
  addLineItem(lineItems, 'lighting', 'Chauvet SlimPAR 64 RGBA LED (per unit)', 48);

  // Followspots
  addLineItem(lineItems, 'lighting', 'Robert Juliat Korrigan LED Followspot', 6);

  // Effects
  addLineItem(lineItems, 'lighting', 'MDG ATMe Haze Generator', 6);
  addLineItem(lineItems, 'lighting', 'Chauvet Geyser RGB Fogger', 8);

  // Control
  addLineItem(lineItems, 'lighting', 'MA Lighting grandMA3 Compact XT', 2);
  addLineItem(lineItems, 'lighting', 'Wireless DMX Transmitter/Receiver Set', 8);
  addLineItem(lineItems, 'lighting', 'DMX 5-Pin Cable 100\'', 24);
  addLineItem(lineItems, 'lighting', 'DMX 5-Pin Cable 50\'', 16);

  // === RIGGING ===
  // Festival mother grid
  addLineItem(lineItems, 'rigging', 'James Thomas 12\"x18\" x 10\' GP Truss', 64);
  addLineItem(lineItems, 'rigging', 'Xtreme 12\"x18\" x 8\' GP Truss', 32);
  addLineItem(lineItems, 'rigging', 'Xtreme 12\"x18\" x 5\' GP Truss', 16);
  addLineItem(lineItems, 'rigging', '12\"x18\" 4-Way Truss Corner Block', 20);
  addLineItem(lineItems, 'rigging', '12\"x18\" 6-Way Truss Corner Block', 8);

  // Chain motors
  addLineItem(lineItems, 'rigging', 'CM 7-Pin 1-Ton 3-Phase Chain Motor', 48);
  addLineItem(lineItems, 'rigging', '12-Way Motor Control Kit', 4);

  // Hardware
  addLineItem(lineItems, 'rigging', 'Shackle 5/8\" Screw Pin', 120);
  addLineItem(lineItems, 'rigging', 'Safety Chain Black 30\"', 80);
  addLineItem(lineItems, 'rigging', 'Batten Clamp with Eye Bolt', 40);

  // Delay towers
  addLineItem(lineItems, 'rigging', 'Genie ST25 25\' Supertower Stand', 8);
  addLineItem(lineItems, 'rigging', 'Sandbag 35 lbs', 32);

  // === STAGING ===
  addLineItem(lineItems, 'staging', 'Biljax 12\' x 24\' Riser w/Stairs (Main Stage)', 4);
  addLineItem(lineItems, 'staging', 'Biljax 4\' x 8\' Stage Deck', 32);
  addLineItem(lineItems, 'staging', 'Biljax Stage Leg 32\" (per set)', 32);
  addLineItem(lineItems, 'staging', 'Biljax Ultra Stairs 4-Step w/Rails', 6);
  addLineItem(lineItems, 'staging', 'Stage Carpet 12\' x 24\' Black', 8);
  addLineItem(lineItems, 'staging', 'Stage Skirt 8\' x 30\" Black', 48);
  addLineItem(lineItems, 'staging', 'Crowd Barrier Section 8\'', 60);
  addLineItem(lineItems, 'staging', 'ADA Wheelchair Ramp Section', 2);

  // === DECOR ===
  addLineItem(lineItems, 'decor', 'Drape Black Velour 13\'W x 16\'H', 32);
  addLineItem(lineItems, 'decor', 'Black Commando Cloth/Duvetyne (per yard)', 80);

  // === CABLES ===
  addLineItem(lineItems, 'cables', 'XLR Cable 100\'', 48);
  addLineItem(lineItems, 'cables', 'XLR Cable 50\'', 64);
  addLineItem(lineItems, 'cables', 'XLR Cable 25\'', 40);
  addLineItem(lineItems, 'cables', 'NL4 Speaker Cable 100\'', 32);
  addLineItem(lineItems, 'cables', 'NL4 Speaker Cable 50\'', 24);
  addLineItem(lineItems, 'cables', 'HD/SDI Cable 200\'', 12);
  addLineItem(lineItems, 'cables', 'HD/SDI Cable 100\'', 20);
  addLineItem(lineItems, 'cables', 'CAT6 Cable 250\' on Reel', 6);
  addLineItem(lineItems, 'cables', 'Ethercon Cable 100\'', 16);

  // === SIGNAL ===
  addLineItem(lineItems, 'signal', 'Blackmagic Smart Videohub 20x20', 2);
  addLineItem(lineItems, 'signal', 'TV One CORIOmaster Processor', 2);
  addLineItem(lineItems, 'signal', 'AJA FiDO 4-Channel SDI to Fiber Kit', 4);
  addLineItem(lineItems, 'signal', 'Decimator MD-HX HDMI/SDI Cross Converter', 12);
  addLineItem(lineItems, 'signal', 'Link Electronics HDG-821 Master Sync Generator', 2);

  // === POWER ===
  // Festival power distribution
  addLineItem(lineItems, 'power', '200KW Diesel Generator', 2);
  addLineItem(lineItems, 'power', 'Motion Labs 200 AMP Power Distro', 4);
  addLineItem(lineItems, 'power', 'Lex Large L21-30 / Socapex Power Distro', 8);
  addLineItem(lineItems, 'power', '100\' 2/0 Feeder Cable 5-Wire', 8);
  addLineItem(lineItems, 'power', 'Feeder Tails 2/0 AWG 5-Wire Set', 4);
  addLineItem(lineItems, 'power', 'Power Cable 208V L21-30 100\'', 24);
  addLineItem(lineItems, 'power', '120V Edison Cable 100\'', 48);
  addLineItem(lineItems, 'power', '8 Outlet Power Strip', 40);
  addLineItem(lineItems, 'power', 'Guard Dog 5-Channel Cable Protector 3\'', 32);

  // === COMMS ===
  addLineItem(lineItems, 'comms', 'Clear-Com FreeSpeak II Base w/5 Beltpacks', 4);
  addLineItem(lineItems, 'comms', 'Clear-Com CC-300 Dual-Ear Headset', 16);
  addLineItem(lineItems, 'comms', 'Motorola XPR7550e Digital Radio', 20);
  addLineItem(lineItems, 'comms', 'Multi-Unit Radio Charger (6-Bay)', 4);

  // === LABOR ===
  addLineItem(lineItems, 'labor', 'Project Manager (per day)', 1);
  addLineItem(lineItems, 'labor', 'Technical Director (per day)', 2);
  addLineItem(lineItems, 'labor', 'Show Caller/Stage Manager (per day)', 2);

  // Audio crew - Festival scale
  addLineItem(lineItems, 'labor', 'Audio Lead Technician A1 (per day)', 2);
  addLineItem(lineItems, 'labor', 'Monitor Engineer (per day)', 2);
  addLineItem(lineItems, 'labor', 'Audio Technician A2 (per day)', 6);
  addLineItem(lineItems, 'labor', 'Audio Technician A3 (per day)', 4);

  // Video crew
  addLineItem(lineItems, 'labor', 'Video Lead Technician V1 (per day)', 2);
  addLineItem(lineItems, 'labor', 'Video Engineer (per day)', 2);
  addLineItem(lineItems, 'labor', 'Camera Operator (per day)', 6);
  addLineItem(lineItems, 'labor', 'LED Wall Technician (per day)', 4);
  addLineItem(lineItems, 'labor', 'Playback/Recording Tech (per day)', 2);

  // Lighting crew
  addLineItem(lineItems, 'labor', 'Lighting Lead Technician L1 (per day)', 2);
  addLineItem(lineItems, 'labor', 'Lighting Programmer (per day)', 2);
  addLineItem(lineItems, 'labor', 'Lighting Technician L2 (per day)', 4);
  addLineItem(lineItems, 'labor', 'Followspot Operator (per day)', 6);

  // Rigging and stage crew
  addLineItem(lineItems, 'labor', 'Rigger/Head Rigger (per day)', 8);
  addLineItem(lineItems, 'labor', 'Electrician (per day)', 4);
  addLineItem(lineItems, 'labor', 'Generator Operator (per day)', 2);
  addLineItem(lineItems, 'labor', 'Setup Technician (per day)', 16);
  addLineItem(lineItems, 'labor', 'Stagehand (per day)', 12);
  addLineItem(lineItems, 'labor', 'Strike Technician (per day)', 16);

  // === OTHER ===
  addLineItem(lineItems, 'other', '26\' Box Truck (Local)', 4);
  addLineItem(lineItems, 'other', 'Delivery Charge (Local)', 2);
  addLineItem(lineItems, 'other', 'Control Tent 10\'x10\' Pop-Up w/Sides', 3);
  addLineItem(lineItems, 'other', 'Gaff Tape Black 3\" Roll', 16);
  addLineItem(lineItems, 'other', 'Console/Show Tape Package', 4);
  addLineItem(lineItems, 'other', 'Plastic Rain Tarp (per unit)', 8);

  return lineItems;
}

// Generate a single quote
function generateQuote(index) {
  // Pick event scale
  const eventType = randomChoice(eventTypes);
  const venue = concertVenues.find(v => {
    if (eventType.scale === 'club') return v.capacity < 1000;
    if (eventType.scale === 'theater') return v.capacity >= 1000 && v.capacity < 3500;
    if (eventType.scale === 'arena') return v.capacity >= 3500 && v.capacity < 25000;
    if (eventType.scale === 'festival') return v.capacity >= 25000;
    if (eventType.scale === 'amphitheater') return v.type === 'outdoor' && v.capacity < 20000;
    return true;
  }) || randomChoice(concertVenues);

  const attendees = randomInt(eventType.capacity[0], Math.min(eventType.capacity[1], venue.capacity));
  const artist = randomChoice(artistNames);

  // Generate line items based on scale
  let lineItems;
  if (eventType.scale === 'club') {
    lineItems = generateClubShow(venue, artist, attendees);
  } else if (eventType.scale === 'theater') {
    lineItems = generateTheaterConcert(venue, artist, attendees);
  } else if (eventType.scale === 'arena') {
    lineItems = generateArenaShow(venue, artist, attendees);
  } else {
    lineItems = generateFestivalMainStage(venue, artist, attendees);
  }

  // Calculate total
  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  // Generate dates
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + randomInt(30, 180));

  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - randomInt(5, 30));

  const expiresDate = new Date(createdDate);
  expiresDate.setDate(expiresDate.getDate() + 30);

  // Client (promoter/venue/artist management)
  const clients = [
    { company: 'Live Nation Entertainment', contact: 'Marcus Williams', email: 'mwilliams@livenation.com' },
    { company: 'AEG Presents', contact: 'Sarah Martinez', email: 'smartinez@aegpresents.com' },
    { company: 'C3 Presents', contact: 'David Chen', email: 'dchen@c3presents.com' },
    { company: 'The Moody Theater', contact: 'Jennifer Lopez', email: 'jlopez@acllive.com' },
    { company: 'Stubb\'s Austin', contact: 'Robert Johnson', email: 'rjohnson@stubbs.com' },
    { company: 'Margin Walker Presents', contact: 'Emily Davis', email: 'edavis@marginwalker.com' },
    { company: 'Transmission Events', contact: 'Michael Brown', email: 'mbrown@transmissionevents.com' },
    { company: 'Heard Presents', contact: 'Amanda Garcia', email: 'agarcia@heardpresents.com' },
    { company: 'Red River Entertainment', contact: 'Christopher Lee', email: 'clee@redriver.com' },
    { company: 'Circuit of the Americas', contact: 'Patricia Wilson', email: 'pwilson@circuitoftheamericas.com' },
  ];

  const client = randomChoice(clients);

  const statuses = ['draft', 'pending_review', 'approved', 'sent', 'accepted'];
  const status = randomChoice(statuses);

  return {
    id: generateId(index),
    userId: 'concert-demo-user',
    clientName: client.contact,
    clientCompany: client.company,
    clientEmail: client.email,
    eventName: `${artist} - ${eventType.type}`,
    eventType: 'Concert/Festival',
    eventDate: eventDate.toISOString(),
    venue: `${venue.name}, ${venue.city}, ${venue.state}`,
    venueName: venue.name,
    venueCity: venue.city,
    venueState: venue.state,
    status: status,
    totalAmount: totalAmount,
    lineItems: lineItems,
    notes: `Production for ${artist} - ${eventType.type}\nVenue capacity: ${venue.capacity.toLocaleString()}\nExpected attendance: ${attendees.toLocaleString()}`,
    attendees: attendees,
    createdAt: createdDate.toISOString(),
    updatedAt: createdDate.toISOString(),
    expiresAt: expiresDate.toISOString(),
    scale: eventType.scale,
    artist: artist
  };
}

// PDF Generation (using same format as main generator)
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
    quote.notes.split('\n')[0],
    'Pricing includes full technical crew and setup/strike labor.',
    'RF coordination included for all wireless systems.',
    'Equipment subject to artist rider requirements and venue restrictions.',
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

// Main execution
async function main() {
  console.log('='.repeat(70));
  console.log('  CONCERT & FESTIVAL QUOTE GENERATOR');
  console.log('  Generating 15 professional concert/festival quotes...');
  console.log('='.repeat(70));
  console.log('');

  const quotes = [];
  const stats = {
    club: 0,
    theater: 0,
    arena: 0,
    festival: 0,
    amphitheater: 0,
    totalLineItems: 0,
    totalValue: 0,
  };

  // Generate 15 quotes
  for (let i = 0; i < 15; i++) {
    const quote = generateQuote(i);
    quotes.push(quote);

    // Track stats
    stats[quote.scale]++;
    stats.totalLineItems += quote.lineItems.length;
    stats.totalValue += quote.totalAmount;

    // Generate PDF
    const doc = generateQuotePDF(quote);
    const filename = `Quote-${quote.id}-${quote.artist.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
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
  console.log('  Statistics:');
  console.log(`    Club shows (200-800):            ${stats.club}`);
  console.log(`    Theater concerts (800-3000):     ${stats.theater}`);
  console.log(`    Arena shows (3000-20000):        ${stats.arena}`);
  console.log(`    Festival main stage (5000+):     ${stats.festival}`);
  console.log(`    Amphitheater shows (1500-15k):   ${stats.amphitheater}`);
  console.log('');
  console.log(`    Total line items generated:      ${stats.totalLineItems.toLocaleString()}`);
  console.log(`    Total quote value:               $${stats.totalValue.toLocaleString()}`);
  console.log(`    Average items per quote:         ${Math.round(stats.totalLineItems / 15)}`);
  console.log(`    Average quote value:             $${Math.round(stats.totalValue / 15).toLocaleString()}`);
  console.log('');
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log('');

  // Save quotes JSON for reference
  const quotesJsonPath = path.join(OUTPUT_DIR, 'concert-festival-quotes.json');
  fs.writeFileSync(quotesJsonPath, JSON.stringify(quotes, null, 2));
  console.log(`  Quotes data saved to: ${quotesJsonPath}`);
  console.log('');
  console.log('  Damn, that was a massive production! Time for a smoke break.');
  console.log('');
}

main().catch(console.error);
