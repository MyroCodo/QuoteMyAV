/**
 * Trade Show & Exhibition Quote Generator
 * Generates AI-training-quality quotes demonstrating professional AV quote building logic
 *
 * Run with: node scripts/generators/trade-show.js
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
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'docs', 'mock-quotes', 'trade-show');

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

// Trade show booth configurations with professional logic
const boothConfigs = [
  {
    name: '10x10 Standard Booth',
    size: '10x10',
    description: 'Small booth - single display, compact audio',
    video: {
      display: { item: 'Samsung 55" 4K LED Monitor with Stand', qty: 1 },
      player: { item: 'BrightSign XT1144 4K Player', qty: 1 },
      backup: { item: '4K Media Digital Signage Player', qty: 1 },
      mounting: true
    },
    audio: {
      speakers: { item: 'Mackie SRM350v3 Stage Monitor', qty: 2 },
      mixer: { item: 'QSC TouchMix-30 Pro Digital Mixer', qty: 1 },
      headphones: { item: 'Headphones (Sony MDR-7506)', qty: 2 }
    },
    lighting: {
      accent: { item: 'Chauvet SlimPAR 64 RGBA LED (per unit)', qty: 4 },
      control: { item: 'Chauvet DJ Obey 70 DMX Controller', qty: 1 }
    },
    power: {
      distro: { item: 'Lex Bento Box L21-30 to Edison Distro', qty: 1 },
      strips: { item: '8 Outlet Power Strip', qty: 3 }
    },
    cabling: true,
    labor: {
      install: 6, // hours
      onsite: 8, // hours per day
      strike: 4, // hours
      days: 3
    },
    shipping: { cases: 4, crate: false },
    drayage: 500
  },
  {
    name: '10x20 Inline Booth',
    size: '10x20',
    description: 'Medium booth - dual displays or small video wall, two audio zones',
    video: {
      displays: [
        { item: 'Samsung 65" 4K QLED Monitor with Stand', qty: 2 },
        { item: 'Samsung 43" 4K LED Monitor', qty: 1 } // Demo station
      ],
      players: { item: 'BrightSign XT1144 4K Player', qty: 3 },
      stands: { item: 'Monitor Stand Chrome Poles 7\' (65"-82")', qty: 2 }
    },
    audio: {
      speakers: { item: 'QSC K10.2 Stage Monitor', qty: 2 },
      mixer: { item: 'Behringer X32 Digital Mixer', qty: 1 },
      headphones: { item: 'Headphones (Sony MDR-7506)', qty: 4 },
      wireless: { item: 'Shure BLX24/SM58 Wireless Handheld', qty: 1 }
    },
    lighting: {
      accent: { item: 'Chauvet Freedom Par Hex-4 Battery LED (8-Pack)', qty: 1 },
      spots: { item: 'Chauvet Ovation LED Ellipsoidal 36 Degree', qty: 2 },
      control: { item: 'Chauvet DJ Obey 70 DMX Controller', qty: 1 }
    },
    staging: {
      furniture: [
        { item: '6\' Folding Table Black', qty: 2 },
        { item: 'Stool 30" Black', qty: 4 }
      ]
    },
    power: {
      distro: { item: 'Lex Medium (12) L21-30 / (6) Edison Distro', qty: 1 },
      strips: { item: '8 Outlet Power Strip', qty: 5 }
    },
    cabling: true,
    labor: {
      install: 10,
      onsite: 16, // 2 techs
      strike: 6,
      days: 3
    },
    shipping: { cases: 8, crate: true },
    drayage: 1200
  },
  {
    name: '20x20 Island Booth',
    size: '20x20',
    description: 'Large island booth - video wall, multiple zones, demo stations',
    video: {
      videoWall: { item: 'Absen PL2.5 Pro LED Panel Kit (per panel)', qty: 12 }, // 3x4 wall
      processor: { item: 'Analog Way Pulse 4K Scaler', qty: 1 },
      demoDisplays: { item: 'Samsung 55" 4K LED Monitor with Stand', qty: 3 },
      players: { item: 'Lenovo P15 Gen 2 Laptop (ProPresenter)', qty: 2 },
      backupPlayers: { item: 'BrightSign XT1144 4K Player', qty: 3 },
      controlKit: { item: 'LED Panel Control Kit (0-60 Panels)', qty: 1 }
    },
    audio: {
      mainSpeakers: { item: 'QSC K12.2 12" Powered Speaker', qty: 4 },
      mixer: { item: 'Yamaha QL1 Digital Audio Console', qty: 1 },
      headphones: { item: 'Headphones (Sony MDR-7506)', qty: 6 },
      wireless: { item: 'Shure ULXD4D Dual Wireless System (Handheld)', qty: 1 },
      diBoxes: { item: 'Radial J48 Active DI Box', qty: 4 }
    },
    lighting: {
      accent: { item: 'Chauvet Freedom Par Hex-4 Battery LED (8-Pack)', qty: 2 },
      spots: { item: 'ETC Source Four LED Series 2 Lustr', qty: 4 },
      wash: { item: 'Chauvet Maverick MK3 Wash', qty: 2 },
      control: { item: 'Leprecon LP612 DMX Light Board', qty: 1 }
    },
    staging: {
      platform: { item: 'Biljax 8\' x 12\' Riser w/Stairs', qty: 1 },
      furniture: [
        { item: '6\' Folding Table Black', qty: 4 },
        { item: 'Cocktail Table 30" Round', qty: 3 },
        { item: 'Stool 30" Black', qty: 8 }
      ],
      lectern: { item: 'Acrylic Lectern with Silver Trim Kit', qty: 1 }
    },
    rigging: {
      truss: [
        { item: 'Xtreme 12"x18" x 10\' GP Truss w/Bolts', qty: 8 },
        { item: '12"x18" 4-Way Truss Corner Block', qty: 4 }
      ],
      support: { item: 'Genie ST25 25\' Supertower Stand', qty: 4 }
    },
    decor: {
      backdrop: { item: 'Spandex Backdrop 10\' x 20\' White', qty: 1 },
      drape: { item: 'Drape Black Velour 13\'W x 16\'H', qty: 4 }
    },
    power: {
      distro: { item: 'Motion Labs 200 AMP Power Distro', qty: 1 },
      subDistro: { item: 'Lex Large L21-30 / Socapex Power Distro', qty: 1 },
      strips: { item: '8 Outlet Power Strip', qty: 10 },
      cableProtection: { item: 'Guard Dog 5-Channel Cable Protector 3\'', qty: 8 }
    },
    signal: {
      matrix: { item: 'Blackmagic Smart Videohub 12x12', qty: 1 },
      converters: { item: 'Decimator MD-HX HDMI/SDI Cross Converter', qty: 4 }
    },
    cabling: true,
    labor: {
      install: 24, // 3 techs x 8 hours
      onsite: 48, // 2 techs x 3 days x 8 hours
      strike: 16, // 2 techs x 8 hours
      days: 3
    },
    shipping: { cases: 20, crate: true },
    drayage: 3500,
    union: true
  },
  {
    name: '30x30 Island Premium',
    size: '30x30',
    description: 'Premium island - theater seating, large video wall, multiple environments',
    video: {
      mainWall: { item: 'Absen A3 Pro LED Panel (6-Pack) 2.97mm', qty: 8 }, // 48 panels total
      processor: { item: 'Barco ImagePRO-4K Scaler', qty: 1 },
      theaterDisplay: { item: 'Samsung 75" 4K LED Display with Stand', qty: 2 },
      demoStations: { item: 'Samsung 43" 4K LED Monitor', qty: 6 },
      players: { item: 'MacBook Pro 16" M3 (Playback Pro)', qty: 2 },
      backupPlayers: { item: 'Lenovo P15 Gen 2 Laptop (ProPresenter)', qty: 2 },
      controlKit: { item: 'LED Panel Control Kit (0-60 Panels)', qty: 1 }
    },
    audio: {
      mainPA: { item: 'JBL VRX932LA-1 12" Line Array Speaker', qty: 8 },
      subs: { item: 'JBL SRX818SP 18" Powered Subwoofer', qty: 2 },
      mixer: { item: 'Yamaha QL5 Digital Audio Console', qty: 1 },
      demoSpeakers: { item: 'QSC K10.2 Stage Monitor', qty: 6 },
      headphones: { item: 'Headphones (Sony MDR-7506)', qty: 12 },
      wireless: { item: 'Shure ULXD4Q Quad Wireless System', qty: 1 },
      diBoxes: { item: 'Radial J48 Active DI Box', qty: 8 }
    },
    lighting: {
      moving: { item: 'Martin MAC Aura LED Wash (6-Pack)', qty: 2 },
      accent: { item: 'Chauvet Freedom Par Hex-4 Battery LED (8-Pack)', qty: 3 },
      spots: { item: 'ETC Source Four LED Series 2 Lustr', qty: 8 },
      cyc: { item: 'Chauvet COLORado Panel Q40 (4-Pack)', qty: 2 },
      control: { item: 'ETC Ion XE 20 Console', qty: 1 }
    },
    staging: {
      mainStage: { item: 'Biljax 12\' x 12\' Riser w/Stairs', qty: 2 },
      theaterRisers: { item: 'Biljax 4\' x 8\' Stage Deck', qty: 12 },
      furniture: [
        { item: '6\' Folding Table Black', qty: 8 },
        { item: 'Cocktail Table 30" Round', qty: 6 },
        { item: 'Folding Chair Padded Black', qty: 30 },
        { item: 'Stool 30" Black', qty: 12 }
      ],
      lectern: { item: 'Wood Veneer Presidential Lectern', qty: 1 }
    },
    rigging: {
      truss: [
        { item: 'James Thomas 12"x18" x 10\' GP Truss', qty: 16 },
        { item: '12"x18" 4-Way Truss Corner Block', qty: 8 }
      ],
      motors: { item: 'CM Lodestar 1-Ton Chain Motor', qty: 8 },
      control: { item: '8-Way Motor Control Kit', qty: 1 },
      support: { item: 'Genie ST25 25\' Supertower Stand', qty: 8 }
    },
    decor: {
      backdrop: { item: 'Custom Printed Backdrop 10\' x 8\'', qty: 3 },
      drape: { item: 'Drape Black Velour 13\'W x 16\'H', qty: 12 },
      carpet: { item: 'Stage Carpet 12\' x 24\' Black', qty: 2 }
    },
    power: {
      mainDistro: { item: 'Motion Labs 200 AMP Power Distro', qty: 2 },
      subDistro: { item: 'Lex Large L21-30 / Socapex Power Distro', qty: 2 },
      strips: { item: '8 Outlet Power Strip', qty: 20 },
      cableProtection: { item: 'Guard Dog 5-Channel Cable Protector 3\'', qty: 16 }
    },
    signal: {
      matrix: { item: 'Blackmagic Smart Videohub 20x20', qty: 1 },
      converters: { item: 'Decimator MD-HX HDMI/SDI Cross Converter', qty: 8 },
      distro: { item: 'Blackmagic SDI 1x8 Distribution Amp', qty: 2 }
    },
    comms: {
      wireless: { item: 'Clear-Com FreeSpeak II Base w/5 Beltpacks', qty: 1 },
      walkies: { item: 'Motorola CP200d Two-Way Radio', qty: 6 }
    },
    cabling: true,
    labor: {
      install: 48, // 6 techs x 8 hours
      onsite: 96, // 4 techs x 3 days x 8 hours
      strike: 32, // 4 techs x 8 hours
      days: 4,
      specialties: true
    },
    shipping: { cases: 40, crate: true },
    drayage: 8500,
    union: true
  }
];

// Trade show specific clients and venues
const tradeShowClients = [
  { company: 'Microsoft Corporation', contact: 'Sarah Chen', email: 'schen@microsoft.com' },
  { company: 'Apple Inc.', contact: 'Michael Torres', email: 'mtorres@apple.com' },
  { company: 'Google LLC', contact: 'Emily Rodriguez', email: 'erodriguez@google.com' },
  { company: 'Amazon Web Services', contact: 'David Kim', email: 'dkim@aws.amazon.com' },
  { company: 'Tesla Motors', contact: 'Jennifer Walsh', email: 'jwalsh@tesla.com' },
  { company: 'Salesforce', contact: 'Amanda Brooks', email: 'abrooks@salesforce.com' },
  { company: 'Oracle Corporation', contact: 'James Patterson', email: 'jpatterson@oracle.com' },
  { company: 'IBM', contact: 'Michelle Lee', email: 'mlee@ibm.com' },
  { company: 'Cisco Systems', contact: 'Robert Johnson', email: 'rjohnson@cisco.com' },
  { company: 'Adobe Systems', contact: 'Christopher Davis', email: 'cdavis@adobe.com' },
  { company: 'Dell Technologies', contact: 'Patricia White', email: 'pwhite@dell.com' },
  { company: 'SAP America', contact: 'Melissa Thompson', email: 'mthompson@sap.com' }
];

const tradeShows = [
  { name: 'CES 2025', venue: 'Las Vegas Convention Center', city: 'Las Vegas', state: 'NV', union: true },
  { name: 'SXSW 2025', venue: 'Austin Convention Center', city: 'Austin', state: 'TX', union: false },
  { name: 'RSA Conference', venue: 'Moscone Center', city: 'San Francisco', state: 'CA', union: true },
  { name: 'Dreamforce', venue: 'Moscone Center', city: 'San Francisco', state: 'CA', union: true },
  { name: 'AWS re:Invent', venue: 'Las Vegas Convention Center', city: 'Las Vegas', state: 'NV', union: true },
  { name: 'Microsoft Ignite', venue: 'Orange County Convention Center', city: 'Orlando', state: 'FL', union: false },
  { name: 'Oracle OpenWorld', venue: 'Moscone Center', city: 'San Francisco', state: 'CA', union: true },
  { name: 'NAB Show', venue: 'Las Vegas Convention Center', city: 'Las Vegas', state: 'NV', union: true },
  { name: 'InfoComm', venue: 'Orange County Convention Center', city: 'Orlando', state: 'FL', union: false },
  { name: 'Adobe MAX', venue: 'Los Angeles Convention Center', city: 'Los Angeles', state: 'CA', union: true }
];

// Utility functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(index) {
  return `QM-TS-${String(index + 1).padStart(4, '0')}`;
}

function findEquipmentByName(itemName) {
  for (const category of Object.keys(equipmentDb)) {
    for (const subcategory of Object.keys(equipmentDb[category])) {
      const items = equipmentDb[category][subcategory];
      if (Array.isArray(items)) {
        const found = items.find(item => item.name === itemName);
        if (found) {
          return { ...found, category };
        }
      }
    }
  }
  return null;
}

function addLineItem(lineItems, category, itemName, quantity, notes = '') {
  const equipment = findEquipmentByName(itemName);
  if (!equipment) {
    console.warn(`Equipment not found: ${itemName}`);
    return;
  }

  const item = {
    id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
    category: category,
    description: notes ? `${equipment.name} (${notes})` : equipment.name,
    quantity: quantity,
    unitPrice: equipment.dailyRate,
    total: quantity * equipment.dailyRate
  };

  lineItems.push(item);
}

function generateCabling(lineItems, config) {
  // Video cables
  if (config.video) {
    const hdmiShort = Math.floor(Math.random() * 8) + 6;
    const hdmiLong = Math.floor(Math.random() * 6) + 4;
    addLineItem(lineItems, 'cables', 'HDMI Cable 10\'', hdmiShort);
    addLineItem(lineItems, 'cables', 'HDMI Cable 50\'', hdmiLong);
  }

  // Audio cables
  if (config.audio) {
    const xlrShort = Math.floor(Math.random() * 10) + 8;
    const xlrLong = Math.floor(Math.random() * 8) + 6;
    addLineItem(lineItems, 'cables', 'XLR Cable 25\'', xlrShort);
    addLineItem(lineItems, 'cables', 'XLR Cable 50\'', xlrLong);

    if (config.audio.mainSpeakers || config.audio.mainPA) {
      addLineItem(lineItems, 'cables', 'NL4 Speaker Cable 50\'', Math.floor(Math.random() * 6) + 4);
    }
  }

  // Network cables for control
  if (config.video.videoWall || config.video.mainWall) {
    addLineItem(lineItems, 'cables', 'CAT6 Cable 100\'', Math.floor(Math.random() * 6) + 4);
  }

  // Power cables
  addLineItem(lineItems, 'cables', '120V Edison Cable 25\'', Math.floor(Math.random() * 12) + 8);
  addLineItem(lineItems, 'cables', '120V Edison Cable 50\'', Math.floor(Math.random() * 8) + 6);
}

function generateLaborItems(lineItems, config) {
  // Install labor
  const installHours = config.labor.install;
  const techsNeeded = Math.ceil(installHours / 8);

  if (techsNeeded > 1) {
    addLineItem(lineItems, 'labor', 'Setup Technician (per day)', techsNeeded, 'Install Day');
  } else {
    addLineItem(lineItems, 'labor', 'General Technician (per day)', 1, 'Install Day');
  }

  // On-site tech support during show
  const showDays = config.labor.days;
  const dailyTechs = Math.ceil(config.labor.onsite / showDays / 8);

  if (dailyTechs >= 2) {
    addLineItem(lineItems, 'labor', 'Video Lead Technician V1 (per day)', showDays, 'Show Hours');
    if (dailyTechs > 2) {
      addLineItem(lineItems, 'labor', 'General Technician (per day)', (dailyTechs - 1) * showDays, 'Show Hours');
    }
  } else {
    addLineItem(lineItems, 'labor', 'General Technician (per day)', showDays, 'Show Hours');
  }

  // Strike labor
  const strikeHours = config.labor.strike;
  const strikeTechs = Math.ceil(strikeHours / 8);
  addLineItem(lineItems, 'labor', 'Strike Technician (per day)', strikeTechs, 'Breakdown');

  // Specialty labor for large booths
  if (config.labor.specialties) {
    addLineItem(lineItems, 'labor', 'LED Wall Technician (per day)', 1, 'Install & Programming');
    addLineItem(lineItems, 'labor', 'Lighting Programmer (per day)', 1, 'Install & Programming');
  }
}

function generateOtherItems(lineItems, config) {
  // Shipping and crating
  if (config.shipping.crate) {
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
      category: 'other',
      description: `Custom Shipping Crates (${config.shipping.cases} cases)`,
      quantity: 1,
      unitPrice: config.shipping.cases * 125,
      total: config.shipping.cases * 125
    });
  }

  // Drayage (material handling at convention center)
  lineItems.push({
    id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
    category: 'other',
    description: 'Drayage & Material Handling',
    quantity: 1,
    unitPrice: config.drayage,
    total: config.drayage
  });

  // Trucking
  const truckRate = config.size === '30x30' ? 450 : (config.size === '20x20' ? 350 : 150);
  lineItems.push({
    id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
    category: 'other',
    description: 'Freight/Trucking to Show Site',
    quantity: 1,
    unitPrice: truckRate,
    total: truckRate
  });

  // Union labor surcharge for union venues
  if (config.union) {
    const laborTotal = lineItems
      .filter(item => item.category === 'labor')
      .reduce((sum, item) => sum + item.total, 0);
    const unionSurcharge = Math.floor(laborTotal * 0.25);

    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
      category: 'other',
      description: 'Union Labor Coordination & Fees',
      quantity: 1,
      unitPrice: unionSurcharge,
      total: unionSurcharge
    });
  }
}

function buildQuoteFromConfig(config, client, tradeShow, index) {
  const lineItems = [];

  // VIDEO EQUIPMENT
  if (config.video.videoWall) {
    addLineItem(lineItems, 'video', config.video.videoWall.item, config.video.videoWall.qty, 'Main Video Wall');
  }
  if (config.video.mainWall) {
    addLineItem(lineItems, 'video', config.video.mainWall.item, config.video.mainWall.qty, 'Large Format LED Wall');
  }
  if (config.video.processor) {
    addLineItem(lineItems, 'signal', config.video.processor.item, config.video.processor.qty, 'Video Wall Processing');
  }
  if (config.video.controlKit) {
    addLineItem(lineItems, 'video', config.video.controlKit.item, config.video.controlKit.qty);
  }
  if (config.video.display) {
    addLineItem(lineItems, 'video', config.video.display.item, config.video.display.qty);
  }
  if (config.video.displays) {
    config.video.displays.forEach(display => {
      addLineItem(lineItems, 'video', display.item, display.qty);
    });
  }
  if (config.video.demoDisplays) {
    addLineItem(lineItems, 'video', config.video.demoDisplays.item, config.video.demoDisplays.qty, 'Demo Stations');
  }
  if (config.video.theaterDisplay) {
    addLineItem(lineItems, 'video', config.video.theaterDisplay.item, config.video.theaterDisplay.qty, 'Theater Area');
  }
  if (config.video.demoStations) {
    addLineItem(lineItems, 'video', config.video.demoStations.item, config.video.demoStations.qty, 'Product Demo Stations');
  }
  if (config.video.player) {
    addLineItem(lineItems, 'video', config.video.player.item, config.video.player.qty, 'Primary Playback');
  }
  if (config.video.players) {
    addLineItem(lineItems, 'video', config.video.players.item, config.video.players.qty, 'Content Playback');
  }
  if (config.video.backup) {
    addLineItem(lineItems, 'video', config.video.backup.item, config.video.backup.qty, 'Backup Playback');
  }
  if (config.video.backupPlayers) {
    addLineItem(lineItems, 'video', config.video.backupPlayers.item, config.video.backupPlayers.qty, 'Backup Players');
  }
  if (config.video.stands) {
    addLineItem(lineItems, 'video', config.video.stands.item, config.video.stands.qty);
  }

  // AUDIO EQUIPMENT
  if (config.audio.mainPA) {
    addLineItem(lineItems, 'audio', config.audio.mainPA.item, config.audio.mainPA.qty, 'Main PA System');
  }
  if (config.audio.subs) {
    addLineItem(lineItems, 'audio', config.audio.subs.item, config.audio.subs.qty, 'Low Frequency Support');
  }
  if (config.audio.speakers) {
    addLineItem(lineItems, 'audio', config.audio.speakers.item, config.audio.speakers.qty);
  }
  if (config.audio.mainSpeakers) {
    addLineItem(lineItems, 'audio', config.audio.mainSpeakers.item, config.audio.mainSpeakers.qty, 'Main Audio');
  }
  if (config.audio.demoSpeakers) {
    addLineItem(lineItems, 'audio', config.audio.demoSpeakers.item, config.audio.demoSpeakers.qty, 'Demo Zones');
  }
  if (config.audio.mixer) {
    addLineItem(lineItems, 'audio', config.audio.mixer.item, config.audio.mixer.qty);
  }
  if (config.audio.headphones) {
    addLineItem(lineItems, 'audio', config.audio.headphones.item, config.audio.headphones.qty, 'Private Listening');
  }
  if (config.audio.wireless) {
    addLineItem(lineItems, 'audio', config.audio.wireless.item, config.audio.wireless.qty, 'Wireless Mic');
  }
  if (config.audio.diBoxes) {
    addLineItem(lineItems, 'audio', config.audio.diBoxes.item, config.audio.diBoxes.qty);
  }

  // LIGHTING
  if (config.lighting.moving) {
    addLineItem(lineItems, 'lighting', config.lighting.moving.item, config.lighting.moving.qty, 'Intelligent Lighting');
  }
  if (config.lighting.accent) {
    addLineItem(lineItems, 'lighting', config.lighting.accent.item, config.lighting.accent.qty, 'Accent Lighting');
  }
  if (config.lighting.spots) {
    addLineItem(lineItems, 'lighting', config.lighting.spots.item, config.lighting.spots.qty, 'Product Spots');
  }
  if (config.lighting.wash) {
    addLineItem(lineItems, 'lighting', config.lighting.wash.item, config.lighting.wash.qty);
  }
  if (config.lighting.cyc) {
    addLineItem(lineItems, 'lighting', config.lighting.cyc.item, config.lighting.cyc.qty, 'Wall Wash');
  }
  if (config.lighting.control) {
    addLineItem(lineItems, 'lighting', config.lighting.control.item, config.lighting.control.qty);
  }

  // STAGING
  if (config.staging) {
    if (config.staging.platform) {
      addLineItem(lineItems, 'staging', config.staging.platform.item, config.staging.platform.qty);
    }
    if (config.staging.mainStage) {
      addLineItem(lineItems, 'staging', config.staging.mainStage.item, config.staging.mainStage.qty, 'Presentation Area');
    }
    if (config.staging.theaterRisers) {
      addLineItem(lineItems, 'staging', config.staging.theaterRisers.item, config.staging.theaterRisers.qty, 'Theater Seating');
    }
    if (config.staging.furniture) {
      config.staging.furniture.forEach(furn => {
        addLineItem(lineItems, 'staging', furn.item, furn.qty);
      });
    }
    if (config.staging.lectern) {
      addLineItem(lineItems, 'staging', config.staging.lectern.item, config.staging.lectern.qty);
    }
  }

  // RIGGING
  if (config.rigging) {
    if (config.rigging.truss) {
      config.rigging.truss.forEach(truss => {
        addLineItem(lineItems, 'rigging', truss.item, truss.qty);
      });
    }
    if (config.rigging.motors) {
      addLineItem(lineItems, 'rigging', config.rigging.motors.item, config.rigging.motors.qty);
    }
    if (config.rigging.control) {
      addLineItem(lineItems, 'rigging', config.rigging.control.item, config.rigging.control.qty);
    }
    if (config.rigging.support) {
      addLineItem(lineItems, 'rigging', config.rigging.support.item, config.rigging.support.qty);
    }
  }

  // DECOR
  if (config.decor) {
    if (config.decor.backdrop) {
      addLineItem(lineItems, 'decor', config.decor.backdrop.item, config.decor.backdrop.qty);
    }
    if (config.decor.drape) {
      addLineItem(lineItems, 'decor', config.decor.drape.item, config.decor.drape.qty, 'Booth Separation');
    }
    if (config.decor.carpet) {
      addLineItem(lineItems, 'decor', config.decor.carpet.item, config.decor.carpet.qty);
    }
  }

  // POWER
  if (config.power.mainDistro) {
    addLineItem(lineItems, 'power', config.power.mainDistro.item, config.power.mainDistro.qty, 'Primary Power');
  }
  if (config.power.distro) {
    addLineItem(lineItems, 'power', config.power.distro.item, config.power.distro.qty);
  }
  if (config.power.subDistro) {
    addLineItem(lineItems, 'power', config.power.subDistro.item, config.power.subDistro.qty);
  }
  if (config.power.strips) {
    addLineItem(lineItems, 'power', config.power.strips.item, config.power.strips.qty);
  }
  if (config.power.cableProtection) {
    addLineItem(lineItems, 'power', config.power.cableProtection.item, config.power.cableProtection.qty, 'Safety');
  }

  // SIGNAL
  if (config.signal) {
    if (config.signal.matrix) {
      addLineItem(lineItems, 'signal', config.signal.matrix.item, config.signal.matrix.qty);
    }
    if (config.signal.converters) {
      addLineItem(lineItems, 'signal', config.signal.converters.item, config.signal.converters.qty);
    }
    if (config.signal.distro) {
      addLineItem(lineItems, 'signal', config.signal.distro.item, config.signal.distro.qty);
    }
  }

  // COMMUNICATIONS
  if (config.comms) {
    if (config.comms.wireless) {
      addLineItem(lineItems, 'comms', config.comms.wireless.item, config.comms.wireless.qty);
    }
    if (config.comms.walkies) {
      addLineItem(lineItems, 'comms', config.comms.walkies.item, config.comms.walkies.qty);
    }
  }

  // CABLING
  if (config.cabling) {
    generateCabling(lineItems, config);
  }

  // LABOR
  generateLaborItems(lineItems, config);

  // OTHER (Shipping, Drayage, etc.)
  generateOtherItems(lineItems, config);

  // Calculate totals
  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  // Generate dates
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + randomInt(30, 120));

  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - randomInt(5, 25));

  const expiresDate = new Date(createdDate);
  expiresDate.setDate(expiresDate.getDate() + 30);

  return {
    id: generateId(index),
    userId: 'demo-user',
    clientName: client.contact,
    clientCompany: client.company,
    clientEmail: client.email,
    eventName: `${client.company.split(' ')[0]} - ${tradeShow.name}`,
    eventType: 'Trade Show Booth',
    eventDate: eventDate.toISOString(),
    venue: `${tradeShow.venue}, ${tradeShow.city}, ${tradeShow.state}`,
    venueName: tradeShow.venue,
    venueCity: tradeShow.city,
    venueState: tradeShow.state,
    status: 'pending_review',
    totalAmount: totalAmount,
    lineItems: lineItems,
    notes: `${config.size} booth configuration. ${config.description}. ${tradeShow.union ? 'Union venue - all labor coordinated with show contractor.' : 'Non-union venue.'}`,
    boothSize: config.size,
    boothConfig: config.name,
    createdAt: createdDate.toISOString(),
    updatedAt: createdDate.toISOString(),
    expiresAt: expiresDate.toISOString()
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
  doc.text('Professional AV Quotes - Trade Show Division', margin, yPos + 11);

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
  doc.text(`Booth: ${quote.boothSize}`, pageWidth - margin, yPos, { align: 'right' });

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
  doc.text('Trade Show', margin + colWidth, yPos);

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
  doc.text('Booth Details', margin + colWidth * 2, yPos);

  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'normal');
  yPos += 5;
  doc.text(`Size: ${quote.boothSize}`, margin + colWidth * 2, yPos);
  yPos += 4;
  doc.text(`Show Date: ${new Date(quote.eventDate).toLocaleDateString()}`, margin + colWidth * 2, yPos);
  yPos += 4;
  doc.setTextColor(...lightGray);
  doc.text(quote.boothConfig, margin + colWidth * 2, yPos);

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
  doc.text('Booth Configuration Notes', margin, yPos);

  yPos += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);

  if (quote.notes) {
    const noteLines = doc.splitTextToSize(quote.notes, pageWidth - margin * 2 - 6);
    noteLines.forEach(line => {
      doc.text(line, margin + 3, yPos);
      yPos += 4;
    });
  }

  yPos += 3;

  // Trade Show Specifics
  const tradeShowNotes = [
    'All install/strike labor coordinated with show contractor schedule.',
    'Drayage includes material handling from loading dock to booth space.',
    'Equipment shipped in protective cases for safe transport.',
    'On-site technical support throughout show hours.',
    'Backup playback devices included for redundancy.',
  ];

  tradeShowNotes.forEach(note => {
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
    '50% deposit required upon contract signing.',
    'Balance due 14 days prior to show install date.',
    `Quote valid for 30 days (expires ${new Date(quote.expiresAt).toLocaleDateString()}).`,
    'Client responsible for show contractor coordination and floor plan approval.',
    'Cancellation within 30 days of show subject to 50% cancellation fee.',
    'Equipment subject to availability - early booking recommended.',
  ];

  terms.forEach(term => {
    doc.text(`• ${term}`, margin + 3, yPos);
    yPos += 4;
  });

  // ============ FOOTER ============
  const footerY = pageHeight - 10;
  doc.setFontSize(7);
  doc.setTextColor(...lightGray);
  doc.text('Generated by QMAV - Trade Show Division', pageWidth / 2, footerY, { align: 'center' });

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
  console.log('  QMAV Trade Show & Exhibition Quote Generator');
  console.log('  Generating 15 professional trade show booth quotes...');
  console.log('='.repeat(70));
  console.log('');

  const quotes = [];
  const stats = {
    '10x10': 0,
    '10x20': 0,
    '20x20': 0,
    '30x30': 0,
    totalValue: 0,
  };

  // Generate quotes - distribute across booth sizes
  const quoteDistribution = [
    0, 0, 0, 0, // Four 10x10 booths
    1, 1, 1, 1, 1, // Five 10x20 booths
    2, 2, 2, 2, // Four 20x20 booths
    3, 3 // Two 30x30 premium booths
  ];

  for (let i = 0; i < 15; i++) {
    const configIndex = quoteDistribution[i];
    const config = boothConfigs[configIndex];
    const client = randomChoice(tradeShowClients);
    const tradeShow = randomChoice(tradeShows);

    // Build quote from configuration
    const quote = buildQuoteFromConfig(config, client, tradeShow, i);
    quotes.push(quote);

    // Track stats
    stats[quote.boothSize]++;
    stats.totalValue += quote.totalAmount;

    // Generate PDF
    const doc = generateQuotePDF(quote);
    const filename = `TradeShow-${quote.id}-${quote.boothSize.replace('x', 'by')}-${client.company.split(' ')[0]}.pdf`;
    const filepath = path.join(OUTPUT_DIR, filename);

    // Save PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    fs.writeFileSync(filepath, pdfBuffer);

    // Progress output
    const progress = Math.round(((i + 1) / 15) * 100);
    const barLength = 30;
    const filledLength = Math.floor(progress / (100 / barLength));
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    process.stdout.write(`\r  [${bar}] ${progress}% - ${i + 1}/15 quotes`);
  }

  console.log('\n');
  console.log('='.repeat(70));
  console.log('  Generation Complete!');
  console.log('='.repeat(70));
  console.log('');
  console.log('  Booth Size Distribution:');
  console.log(`    10x10 Standard Booths:        ${stats['10x10']}`);
  console.log(`    10x20 Inline Booths:          ${stats['10x20']}`);
  console.log(`    20x20 Island Booths:          ${stats['20x20']}`);
  console.log(`    30x30 Premium Islands:        ${stats['30x30']}`);
  console.log('');
  console.log(`    Total quote value:            $${stats.totalValue.toLocaleString()}`);
  console.log(`    Average quote value:          $${Math.round(stats.totalValue / 15).toLocaleString()}`);
  console.log('');
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log('');

  // Save quotes JSON for reference
  const quotesJsonPath = path.join(OUTPUT_DIR, 'trade-show-quotes-data.json');
  fs.writeFileSync(quotesJsonPath, JSON.stringify(quotes, null, 2));
  console.log(`  Quote data saved to: ${quotesJsonPath}`);
  console.log('');
  console.log('  Damn, that was a big job! Gonna need a cigarette.');
  console.log('');
}

main().catch(console.error);
