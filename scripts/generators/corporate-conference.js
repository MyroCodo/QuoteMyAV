/**
 * Corporate Conference Quote Generator
 * Generates AI-training-quality quotes demonstrating professional AV quote building logic
 *
 * Key Features:
 * - Equipment chain logic (items work together)
 * - Scaling formulas based on attendee count
 * - Support equipment logic (cables, power, rigging)
 * - Labor calculations based on complexity
 * - Corporate-specific elements (breakout rooms, Q&A, recording)
 *
 * Run with: node scripts/generators/corporate-conference.js
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
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'docs', 'mock-quotes', 'corporate-conference');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Corporate conference data
const corporateData = {
  eventTypes: [
    {
      type: "Annual Conference",
      attendeeRanges: [[50, 150], [150, 300], [300, 500], [500, 1000]],
      needsBreakouts: true,
      needsRecording: true,
      needsIMAG: [false, false, true, true],
      weight: 20
    },
    {
      type: "Product Launch",
      attendeeRanges: [[100, 200], [200, 400], [400, 800]],
      needsBreakouts: false,
      needsRecording: true,
      needsIMAG: [false, true, true],
      weight: 15
    },
    {
      type: "Sales Kickoff",
      attendeeRanges: [[150, 300], [300, 600], [600, 1200]],
      needsBreakouts: true,
      needsRecording: false,
      needsIMAG: [false, true, true],
      weight: 15
    },
    {
      type: "Board Meeting",
      attendeeRanges: [[10, 25], [25, 50]],
      needsBreakouts: false,
      needsRecording: true,
      needsIMAG: [false, false],
      weight: 10
    },
    {
      type: "Town Hall",
      attendeeRanges: [[200, 400], [400, 800], [800, 1500]],
      needsBreakouts: false,
      needsRecording: true,
      needsIMAG: [false, true, true],
      weight: 15
    },
    {
      type: "Training Seminar",
      attendeeRanges: [[30, 75], [75, 150]],
      needsBreakouts: true,
      needsRecording: false,
      needsIMAG: [false, false],
      weight: 12
    },
    {
      type: "Investor Day",
      attendeeRanges: [[50, 100], [100, 200]],
      needsBreakouts: false,
      needsRecording: true,
      needsIMAG: [false, true],
      weight: 8
    },
    {
      type: "Awards Gala",
      attendeeRanges: [[200, 400], [400, 800]],
      needsBreakouts: false,
      needsRecording: true,
      needsIMAG: [true, true],
      weight: 10
    }
  ],

  companies: [
    { name: "TechCorp Solutions", industry: "Technology", contact: "Jennifer Martinez", email: "jmartinez@techcorp.com" },
    { name: "Global Finance Group", industry: "Finance", contact: "Robert Chen", email: "rchen@globalfinance.com" },
    { name: "Meridian Healthcare", industry: "Healthcare", contact: "Sarah Johnson", email: "sjohnson@meridianhealth.com" },
    { name: "Apex Manufacturing", industry: "Manufacturing", contact: "Michael Thompson", email: "mthompson@apexmfg.com" },
    { name: "Innovate Pharma", industry: "Pharmaceutical", contact: "Emily Rodriguez", email: "erodriguez@innovatepharma.com" },
    { name: "Summit Energy", industry: "Energy", contact: "David Kim", email: "dkim@summitenergy.com" },
    { name: "Horizon Retail Group", industry: "Retail", contact: "Amanda White", email: "awhite@horizonretail.com" },
    { name: "Velocity Logistics", industry: "Logistics", contact: "Christopher Brown", email: "cbrown@velocitylog.com" },
    { name: "NextGen Software", industry: "Software", contact: "Jessica Taylor", email: "jtaylor@nextgensoft.com" },
    { name: "Titan Industries", industry: "Industrial", contact: "Matthew Davis", email: "mdavis@titanind.com" },
    { name: "Quantum Ventures", industry: "Venture Capital", contact: "Lauren Anderson", email: "landerson@quantumvc.com" },
    { name: "Blueprint Consulting", industry: "Consulting", contact: "Brandon Wilson", email: "bwilson@blueprintconsult.com" },
    { name: "Premier Insurance Co", industry: "Insurance", contact: "Stephanie Moore", email: "smoore@premierins.com" },
    { name: "Atlas Real Estate", industry: "Real Estate", contact: "Kevin Martinez", email: "kmartinez@atlasre.com" },
    { name: "Cornerstone Bank", industry: "Banking", contact: "Rachel Garcia", email: "rgarcia@cornerstonebank.com" }
  ],

  venues: [
    { name: "Austin Convention Center", city: "Austin", state: "TX", type: "convention_center", capacity: 5000 },
    { name: "JW Marriott Austin", city: "Austin", state: "TX", type: "hotel", capacity: 1200 },
    { name: "Fairmont Austin", city: "Austin", state: "TX", type: "hotel", capacity: 800 },
    { name: "AT&T Conference Center", city: "Austin", state: "TX", type: "conference_center", capacity: 600 },
    { name: "Omni Barton Creek Resort", city: "Austin", state: "TX", type: "resort", capacity: 500 },
    { name: "The LINE Austin", city: "Austin", state: "TX", type: "hotel", capacity: 300 },
    { name: "Palmer Events Center", city: "Austin", state: "TX", type: "event_center", capacity: 3000 },
    { name: "Hyatt Regency Austin", city: "Austin", state: "TX", type: "hotel", capacity: 1000 },
    { name: "Hilton Austin", city: "Austin", state: "TX", type: "hotel", capacity: 800 },
    { name: "Renaissance Austin Hotel", city: "Austin", state: "TX", type: "hotel", capacity: 600 }
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

function findItem(category, subcategory, namePattern) {
  const categoryData = equipmentDb[category];
  if (!categoryData || !categoryData[subcategory]) return null;

  const items = categoryData[subcategory];
  return items.find(item => item.name.toLowerCase().includes(namePattern.toLowerCase()));
}

function createLineItem(category, item, quantity) {
  return {
    id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
    category: category,
    description: item.name,
    quantity: quantity,
    unitPrice: item.dailyRate,
    total: quantity * item.dailyRate
  };
}

// Equipment selection logic based on attendee count and needs
function buildAudioSystem(attendees, lineItems) {
  let console, speakers, subs, monitors, wireless, mics;

  // CONSOLE SELECTION - drives stage box needs
  if (attendees < 50) {
    console = findItem('audio', 'consoles', 'Behringer X32') || findItem('audio', 'consoles', 'QSC TouchMix');
  } else if (attendees < 150) {
    console = findItem('audio', 'consoles', 'Midas M32') || findItem('audio', 'consoles', 'Yamaha QL1');
  } else if (attendees < 300) {
    console = findItem('audio', 'consoles', 'Yamaha QL5') || findItem('audio', 'consoles', 'Yamaha CL5');
  } else if (attendees < 500) {
    console = findItem('audio', 'consoles', 'Yamaha CL5') || findItem('audio', 'consoles', 'Allen & Heath dLive');
  } else {
    console = findItem('audio', 'consoles', 'DiGiCo SD12') || findItem('audio', 'consoles', 'Avid S6L');
  }
  if (console) lineItems.push(createLineItem('audio', console, 1));

  // SPEAKER SYSTEM - matched to room size
  if (attendees < 50) {
    // Portable PA
    const speaker = findItem('audio', 'speakers_powered', 'JBL PRX815W') || findItem('audio', 'speakers_powered', 'QSC K12.2');
    if (speaker) lineItems.push(createLineItem('audio', speaker, 2));
  } else if (attendees < 150) {
    // Small line array or point source
    const speaker = findItem('audio', 'speakers_powered', 'JBL PRX815W') || findItem('audio', 'speakers_powered', 'QSC KW153');
    if (speaker) lineItems.push(createLineItem('audio', speaker, 4));

    const sub = findItem('audio', 'subwoofers', 'JBL SRX818SP') || findItem('audio', 'subwoofers', 'QSC KS218C');
    if (sub) lineItems.push(createLineItem('audio', sub, 2));
  } else if (attendees < 300) {
    // Medium line array
    const lineArray = findItem('audio', 'speakers_line_array', 'JBL VRX932LA') || findItem('audio', 'speakers_line_array', 'QSC KLA12');
    if (lineArray) lineItems.push(createLineItem('audio', lineArray, 2)); // per side = 1 system

    const sub = findItem('audio', 'subwoofers', 'JBL VRX918SP') || findItem('audio', 'subwoofers', 'QSC KS218C');
    if (sub) lineItems.push(createLineItem('audio', sub, 2));
  } else if (attendees < 500) {
    // Large line array + delays
    const lineArray = findItem('audio', 'speakers_line_array', 'L-Acoustics KARA') || findItem('audio', 'speakers_line_array', 'Meyer Sound LEOPARD');
    if (lineArray) lineItems.push(createLineItem('audio', lineArray, 2));

    const sub = findItem('audio', 'subwoofers', 'Meyer Sound 1100-LFC') || findItem('audio', 'subwoofers', 'd&b audiotechnik SL-SUB');
    if (sub) lineItems.push(createLineItem('audio', sub, 4));

    // Delay speakers
    const delay = findItem('audio', 'speakers_powered', 'QSC K12.2');
    if (delay) lineItems.push(createLineItem('audio', delay, 4));
  } else {
    // Touring-grade system
    const lineArray = findItem('audio', 'speakers_line_array', 'd&b audiotechnik E12') || findItem('audio', 'speakers_line_array', 'JBL VTX V25-II');
    if (lineArray) lineItems.push(createLineItem('audio', lineArray, 2));

    const sub = findItem('audio', 'subwoofers', 'd&b audiotechnik SL-SUB');
    if (sub) lineItems.push(createLineItem('audio', sub, 6));

    // Multiple delay zones
    const delay = findItem('audio', 'speakers_powered', 'QSC K12.2');
    if (delay) lineItems.push(createLineItem('audio', delay, 8));
  }

  // WIRELESS MICROPHONES - based on attendees and Q&A needs
  let wirelessCount = attendees < 50 ? 2 : attendees < 150 ? 4 : attendees < 300 ? 8 : attendees < 500 ? 12 : 16;

  if (wirelessCount <= 4) {
    wireless = findItem('audio', 'wireless_microphones', 'Shure ULXD4D Dual') || findItem('audio', 'wireless_microphones', 'Sennheiser EW 500');
    if (wireless) lineItems.push(createLineItem('audio', wireless, Math.ceil(wirelessCount / 2)));
  } else {
    wireless = findItem('audio', 'wireless_microphones', 'Shure ULXD4Q Quad') || findItem('audio', 'wireless_microphones', 'Shure Axient Digital');
    if (wireless) lineItems.push(createLineItem('audio', wireless, Math.ceil(wirelessCount / 4)));
  }

  // LAVALIER MICS - for presenters
  const lavCount = attendees < 150 ? 2 : attendees < 300 ? 4 : 6;
  const lav = findItem('audio', 'wireless_lavaliers', 'Shure ULXD1 Bodypack') || findItem('audio', 'wireless_lavaliers', 'Sennheiser EW 500 G4-MKE2');
  if (lav) lineItems.push(createLineItem('audio', lav, lavCount));

  // GOOSENECK MICS - for Q&A and panel discussions
  if (attendees >= 100) {
    const gooseneck = findItem('audio', 'gooseneck_microphones', 'Shure MX418') || findItem('audio', 'gooseneck_microphones', 'Shure MX412');
    if (gooseneck) lineItems.push(createLineItem('audio', gooseneck, attendees < 300 ? 4 : 8));
  }

  // CONFIDENCE MONITORS - for presenters
  if (attendees >= 50) {
    const monitor = findItem('audio', 'monitors', 'QSC K10.2') || findItem('audio', 'monitors', 'JBL PRX412M');
    if (monitor) lineItems.push(createLineItem('audio', monitor, attendees < 300 ? 2 : 4));
  }

  // DI BOXES - for laptop/playback sources
  const di = findItem('audio', 'di_boxes', 'Radial J48') || findItem('audio', 'di_boxes', 'Whirlwind PCDI');
  if (di) lineItems.push(createLineItem('audio', di, attendees < 150 ? 2 : 4));

  // DIGITAL SNAKE - if large enough to need it
  if (attendees >= 150) {
    const snake = findItem('audio', 'snakes', 'Yamaha RIO1608-D') || findItem('audio', 'snakes', 'Allen & Heath DX168');
    if (snake) lineItems.push(createLineItem('audio', snake, 1));
  }

  return { wirelessCount, lavCount };
}

function buildVideoSystem(attendees, needsIMAG, needsRecording, lineItems) {
  // PROJECTION SYSTEM - based on room size
  if (attendees < 100) {
    // Single projector
    const projector = findItem('video', 'projectors', 'Christie LWU502') || findItem('video', 'projectors', 'Epson Pro L12000Q');
    const lens = findItem('video', 'projector_lenses', 'Christie 1.2-1.5:1');
    const screen = findItem('video', 'screens', 'Draper 10\' x 17\'') || findItem('video', 'screens', 'Stumpfl 9\' x 16\'');

    if (projector) lineItems.push(createLineItem('video', projector, 1));
    if (lens) lineItems.push(createLineItem('video', lens, 1));
    if (screen) lineItems.push(createLineItem('video', screen, 1));
  } else if (attendees < 300) {
    // Dual projection
    const projector = findItem('video', 'projectors', 'Epson Pro L12000Q') || findItem('video', 'projectors', 'Panasonic PT-RZ120');
    const lens = findItem('video', 'projector_lenses', 'Christie 1.2-1.5:1');
    const screen = findItem('video', 'screens', 'Stumpfl 11.3\' x 20\'') || findItem('video', 'screens', 'Da-Lite 10\' x 17\'');

    if (projector) lineItems.push(createLineItem('video', projector, 2));
    if (lens) lineItems.push(createLineItem('video', lens, 2));
    if (screen) lineItems.push(createLineItem('video', screen, 2));
  } else {
    // Large projection or LED wall
    if (randomInt(0, 1) === 0) {
      // LED Wall option
      const ledPanel = findItem('video', 'led_walls', 'Absen A3 Pro') || findItem('video', 'led_walls', 'ROE Visual Black Pearl');
      const ledController = findItem('video', 'led_walls', 'LED Panel Control Kit');

      if (ledPanel) lineItems.push(createLineItem('video', ledPanel, attendees < 500 ? 6 : 12));
      if (ledController) lineItems.push(createLineItem('video', ledController, 1));
    } else {
      // High-power projection
      const projector = findItem('video', 'projectors', 'Epson Pro L25000U') || findItem('video', 'projectors', 'Barco G62-W14');
      const lens = findItem('video', 'projector_lenses', 'Barco 1.7-2.9:1');
      const screen = findItem('video', 'screens', 'Stumpfl 13.5\' x 24\'');

      if (projector) lineItems.push(createLineItem('video', projector, 2));
      if (lens) lineItems.push(createLineItem('video', lens, 2));
      if (screen) lineItems.push(createLineItem('video', screen, 2));
    }
  }

  // CONFIDENCE MONITORS - for speakers
  if (attendees >= 100) {
    const confMonitor = findItem('video', 'monitors_displays', 'Sharp 42\" LED') || findItem('video', 'monitors_displays', 'Samsung 43\"');
    const stand = findItem('video', 'monitor_stands', 'Monitor Stand Chrome');

    if (confMonitor) lineItems.push(createLineItem('video', confMonitor, 2));
    if (stand) lineItems.push(createLineItem('video', stand, 2));
  }

  // IMAG SYSTEM - for large events
  if (needsIMAG) {
    const camera = findItem('video', 'cameras', 'Sony BRC-X400') || findItem('video', 'cameras', 'Panasonic AW-UE150');
    const tripod = findItem('video', 'camera_support', 'Vinten Vision 250') || findItem('video', 'camera_support', 'Manfrotto 546B');
    const switcher = findItem('video', 'switchers', 'Blackmagic ATEM 1 M/E') || findItem('video', 'switchers', 'Roland VR-50HD');

    const cameraCount = attendees < 500 ? 2 : 3;
    if (camera) lineItems.push(createLineItem('video', camera, cameraCount));
    if (tripod) lineItems.push(createLineItem('video', tripod, cameraCount));
    if (switcher) lineItems.push(createLineItem('video', switcher, 1));
  }

  // RECORDING - if needed
  if (needsRecording) {
    const recorder = findItem('video', 'recording', 'Blackmagic HyperDeck') || findItem('video', 'recording', 'AJA Ki Pro Ultra');
    if (recorder) lineItems.push(createLineItem('video', recorder, 1));
  }

  // PLAYBACK - for presentations
  const laptop = findItem('video', 'playback', 'Lenovo P15') || findItem('video', 'playback', 'MacBook Pro 16\"');
  if (laptop) lineItems.push(createLineItem('video', laptop, 1));
}

function buildSignalSystem(attendees, needsIMAG, lineItems) {
  // CONVERTERS - HDMI to SDI and vice versa
  const converter = findItem('signal', 'converters', 'Decimator MD-HX') || findItem('signal', 'converters', 'AJA Hi5-4K');
  if (converter) lineItems.push(createLineItem('signal', converter, attendees < 150 ? 2 : 4));

  // SCALER - for presentation switching
  const scaler = findItem('signal', 'scalers', 'Barco ImagePRO') || findItem('signal', 'scalers', 'Analog Way Pulse');
  if (scaler) lineItems.push(createLineItem('signal', scaler, 1));

  // DISTRIBUTION AMP - for multiple displays
  if (attendees >= 100) {
    const da = findItem('signal', 'distribution', 'Blackmagic SDI 1x8') || findItem('signal', 'distribution', 'Kramer VM-4HDT');
    if (da) lineItems.push(createLineItem('signal', da, attendees < 300 ? 1 : 2));
  }
}

function buildLightingSystem(attendees, lineItems) {
  // BASIC STAGE WASH
  if (attendees < 150) {
    const led = findItem('lighting', 'led_pars', 'Chauvet SlimPAR 64');
    if (led) lineItems.push(createLineItem('lighting', led, 8));
  } else if (attendees < 300) {
    const wash = findItem('lighting', 'moving_lights_wash', 'Chauvet Maverick MK3') || findItem('lighting', 'moving_lights_wash', 'Robe Robin 600');
    if (wash) lineItems.push(createLineItem('lighting', wash, 6));

    const led = findItem('lighting', 'led_pars', 'Chauvet SlimPAR 64');
    if (led) lineItems.push(createLineItem('lighting', led, 12));
  } else {
    const wash = findItem('lighting', 'moving_lights_wash', 'Martin MAC Aura') || findItem('lighting', 'moving_lights_wash', 'Robe Robin 600');
    if (wash) lineItems.push(createLineItem('lighting', wash, 12));

    const profile = findItem('lighting', 'moving_lights_profile', 'Robe BMFL Spot') || findItem('lighting', 'moving_lights_profile', 'Clay Paky Sharpy');
    if (profile) lineItems.push(createLineItem('lighting', profile, 4));
  }

  // KEY LIGHTS - ellipsoidals for speaker lighting
  if (attendees >= 100) {
    const ellipsoidal = findItem('lighting', 'ellipsoidals', 'ETC Source Four LED') || findItem('lighting', 'ellipsoidals', 'Chauvet Ovation E-910FC');
    if (ellipsoidal) lineItems.push(createLineItem('lighting', ellipsoidal, attendees < 300 ? 4 : 6));
  }

  // LIGHTING CONSOLE
  const lightingConsole = attendees < 300
    ? findItem('lighting', 'consoles', 'Leprecon LP612') || findItem('lighting', 'consoles', 'Chauvet DJ Obey 70')
    : findItem('lighting', 'consoles', 'ETC Ion XE') || findItem('lighting', 'consoles', 'High End Systems Hedgehog');
  if (lightingConsole) lineItems.push(createLineItem('lighting', lightingConsole, 1));
}

function buildStagingSystem(attendees, lineItems) {
  // STAGE DECK - based on event size
  if (attendees >= 100) {
    const stage = attendees < 300
      ? findItem('staging', 'stage_decks', 'Biljax 12\' x 12\'')
      : findItem('staging', 'stage_decks', 'Biljax 12\' x 24\'');

    if (stage) lineItems.push(createLineItem('staging', stage, 1));

    const stairs = findItem('staging', 'stage_decks', 'Biljax Ultra Stairs');
    if (stairs) lineItems.push(createLineItem('staging', stairs, 1));

    const skirt = findItem('staging', 'stage_accessories', 'Stage Skirt 8\' x 24\"');
    if (skirt) lineItems.push(createLineItem('staging', skirt, attendees < 300 ? 6 : 12));
  }

  // LECTERN - always needed for corporate
  const lectern = findItem('staging', 'lecterns', 'Acrylic Lectern') || findItem('staging', 'lecterns', 'AmpliVox SN3080');
  if (lectern) lineItems.push(createLineItem('staging', lectern, 1));

  // TABLES - for registration, materials
  const table = findItem('staging', 'furniture', '6\' Folding Table');
  if (table) lineItems.push(createLineItem('staging', table, attendees < 150 ? 2 : attendees < 300 ? 4 : 6));
}

function buildCablesAndPower(attendees, wirelessCount, lineItems) {
  // XLR CABLES - calculate based on actual gear
  const xlrCount = wirelessCount + 4 + (attendees >= 100 ? 4 : 2); // wireless + DIs + monitors
  const xlr50 = findItem('cables', 'audio_xlr', 'XLR Cable 50\'');
  const xlr25 = findItem('cables', 'audio_xlr', 'XLR Cable 25\'');

  if (xlr50) lineItems.push(createLineItem('cables', xlr50, Math.ceil(xlrCount * 0.6)));
  if (xlr25) lineItems.push(createLineItem('cables', xlr25, Math.ceil(xlrCount * 0.4)));

  // HDMI CABLES - for video sources
  const hdmi25 = findItem('cables', 'video_hdmi', 'HDMI Cable 25\'');
  const hdmi50 = findItem('cables', 'video_hdmi', 'HDMI Cable 50\'');

  if (hdmi25) lineItems.push(createLineItem('cables', hdmi25, 4));
  if (hdmi50) lineItems.push(createLineItem('cables', hdmi50, 2));

  // SDI CABLES - if IMAG
  if (attendees >= 200) {
    const sdi100 = findItem('cables', 'video_sdi', 'HD/SDI Cable 100\'');
    if (sdi100) lineItems.push(createLineItem('cables', sdi100, 4));
  }

  // POWER DISTRIBUTION - sized for actual load
  if (attendees >= 100) {
    const distro = attendees < 300
      ? findItem('power', 'distros', 'Lex Bento Box')
      : findItem('power', 'distros', 'Lex Medium (12) L21-30');

    if (distro) lineItems.push(createLineItem('power', distro, attendees < 300 ? 1 : 2));
  }

  // POWER CABLES
  const power50 = findItem('power', '208v', 'Power Cable 208V L14-30 50\'');
  if (power50) lineItems.push(createLineItem('power', power50, attendees < 150 ? 2 : 4));

  // CABLE MANAGEMENT
  const cableProtector = findItem('power', 'accessories', 'Guard Dog 5-Channel');
  if (cableProtector) lineItems.push(createLineItem('power', cableProtector, attendees < 150 ? 2 : attendees < 300 ? 4 : 6));
}

function buildCommsSystem(attendees, lineItems) {
  // CREW COMMS - 1 per tech + spares
  if (attendees >= 100) {
    const crewSize = attendees < 300 ? 4 : attendees < 500 ? 6 : 8;
    const comms = findItem('comms', 'intercom', 'Clear-Com HelixNet') || findItem('comms', 'intercom', 'HME DX210');

    if (comms) lineItems.push(createLineItem('comms', comms, 1));

    const headset = findItem('comms', 'intercom', 'Clear-Com CC-110');
    if (headset) lineItems.push(createLineItem('comms', headset, crewSize));
  }

  // WALKIE TALKIES - for all events
  const walkie = findItem('comms', 'walkies', 'Motorola CP200d');
  if (walkie) lineItems.push(createLineItem('comms', walkie, attendees < 150 ? 4 : attendees < 300 ? 6 : 8));
}

function buildLaborAndOther(attendees, needsIMAG, needsRecording, lineItems) {
  // LABOR - calculated based on complexity

  // Always need A1 (audio lead)
  const a1 = findItem('labor', 'audio', 'Audio Lead Technician A1');
  if (a1) lineItems.push(createLineItem('labor', a1, 1));

  // A2 for larger events (8+ wireless)
  if (attendees >= 150) {
    const a2 = findItem('labor', 'audio', 'Audio Technician A2');
    if (a2) lineItems.push(createLineItem('labor', a2, 1));
  }

  // V1 for any video
  const v1 = findItem('labor', 'video', 'Video Lead Technician V1');
  if (v1) lineItems.push(createLineItem('labor', v1, 1));

  // Camera ops for IMAG
  if (needsIMAG) {
    const camOp = findItem('labor', 'video', 'Camera Operator');
    const opCount = attendees < 500 ? 2 : 3;
    if (camOp) lineItems.push(createLineItem('labor', camOp, opCount));
  }

  // L1 if lighting is complex
  if (attendees >= 300) {
    const l1 = findItem('labor', 'lighting', 'Lighting Lead Technician L1');
    if (l1) lineItems.push(createLineItem('labor', l1, 1));
  }

  // Setup crew - based on equipment count and complexity
  const setupHours = Math.ceil((attendees / 100) + (needsIMAG ? 2 : 0) + (attendees >= 300 ? 2 : 0));
  const setupCrew = attendees < 150 ? 2 : attendees < 300 ? 3 : attendees < 500 ? 4 : 6;

  const setupTech = findItem('labor', 'general', 'Setup Technician');
  if (setupTech) lineItems.push(createLineItem('labor', setupTech, setupCrew));

  const strikeTech = findItem('labor', 'general', 'Strike Technician');
  if (strikeTech) lineItems.push(createLineItem('labor', strikeTech, setupCrew));

  // TRUCKING - based on equipment volume
  if (attendees < 150) {
    const truck = findItem('other', 'trucking', '24\' Box Truck');
    if (truck) lineItems.push(createLineItem('other', truck, 1));
  } else {
    const truck = findItem('other', 'trucking', '26\' Box Truck');
    if (truck) lineItems.push(createLineItem('other', truck, attendees < 300 ? 1 : 2));
  }
}

function buildBreakoutRooms(attendees, lineItems) {
  // BREAKOUT ROOM SYSTEMS - smaller versions of main system
  const roomCount = attendees < 150 ? 2 : attendees < 300 ? 3 : 4;

  for (let i = 0; i < roomCount; i++) {
    // Small speaker per room
    const speaker = findItem('audio', 'speakers_powered', 'JBL PRX812W') || findItem('audio', 'speakers_powered', 'Mackie SRM450v3');
    if (speaker) lineItems.push(createLineItem('audio', speaker, 2));

    // Wireless mic per room
    const wireless = findItem('audio', 'wireless_microphones', 'Shure BLX24/SM58');
    if (wireless) lineItems.push(createLineItem('audio', wireless, 1));

    // Small projector + screen
    const projector = findItem('video', 'projectors', 'Christie LWU502');
    const screen = findItem('video', 'screens', 'Draper 9\' x 12\'');

    if (projector) lineItems.push(createLineItem('video', projector, 1));
    if (screen) lineItems.push(createLineItem('video', screen, 1));
  }
}

// Main quote generation function
function generateCorporateQuote(index) {
  const eventType = weightedRandomChoice(corporateData.eventTypes);
  const attendeeRange = randomChoice(eventType.attendeeRanges);
  const attendees = randomInt(attendeeRange[0], attendeeRange[1]);
  const attendeeIndex = eventType.attendeeRanges.indexOf(attendeeRange);
  const needsIMAG = Array.isArray(eventType.needsIMAG) ? eventType.needsIMAG[attendeeIndex] : eventType.needsIMAG;

  const company = randomChoice(corporateData.companies);
  const venue = corporateData.venues.find(v => v.capacity >= attendees) || randomChoice(corporateData.venues);

  const lineItems = [];

  // Build systems with proper equipment chains
  const audioInfo = buildAudioSystem(attendees, lineItems);
  buildVideoSystem(attendees, needsIMAG, eventType.needsRecording, lineItems);
  buildSignalSystem(attendees, needsIMAG, lineItems);
  buildLightingSystem(attendees, lineItems);
  buildStagingSystem(attendees, lineItems);
  buildCablesAndPower(attendees, audioInfo.wirelessCount, lineItems);
  buildCommsSystem(attendees, lineItems);

  // Breakout rooms if needed
  if (eventType.needsBreakouts && attendees >= 100) {
    buildBreakoutRooms(attendees, lineItems);
  }

  buildLaborAndOther(attendees, needsIMAG, eventType.needsRecording, lineItems);

  // Generate dates
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + randomInt(30, 180));

  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - randomInt(0, 60));

  const expiresDate = new Date(createdDate);
  expiresDate.setDate(expiresDate.getDate() + 30);

  // Event name
  const year = eventDate.getFullYear();
  const eventName = `${company.name} ${eventType.type} ${year}`;

  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  const statuses = ['draft', 'pending_review', 'sent', 'accepted'];
  const status = randomChoice(statuses);

  return {
    id: `CORP-${String(index + 1).padStart(4, '0')}`,
    userId: 'demo-user',
    clientName: company.contact,
    clientCompany: company.name,
    clientEmail: company.email,
    industry: company.industry,
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
    attendees: attendees,
    hasIMAG: needsIMAG,
    hasRecording: eventType.needsRecording,
    hasBreakouts: eventType.needsBreakouts && attendees >= 100,
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

  // Colors - professional corporate palette
  const primaryColor = [20, 184, 166]; // Teal-500
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
  doc.text('Corporate Event Production', margin, yPos + 11);

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

  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 10;

  // ============ CLIENT & VENUE INFO ============
  const colWidth = (pageWidth - margin * 2) / 3;

  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Client', margin, yPos);

  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'normal');
  yPos += 5;
  doc.text(quote.clientCompany, margin, yPos);
  yPos += 4;
  doc.text(quote.clientName, margin, yPos);
  yPos += 4;
  doc.setTextColor(...lightGray);
  doc.text(quote.clientEmail, margin, yPos);

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
  doc.text(`Attendees: ${quote.attendees.toLocaleString()}`, margin + colWidth * 2, yPos);

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

  // ============ NOTES ============
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
    'All equipment includes standard accessories and cables.',
    'Technical crew will arrive 4 hours prior to event start.',
    'On-site technical support throughout event duration.',
    'Backup equipment included for mission-critical components.',
  ];

  notes.forEach(note => {
    doc.text(`• ${note}`, margin + 3, yPos);
    yPos += 4;
  });

  yPos += 5;

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
    'Balance due 7 days prior to event date.',
    `Quote valid for 30 days (expires ${new Date(quote.expiresAt).toLocaleDateString()}).`,
    'Cancellation within 14 days subject to full charge.',
    'Equipment substitutions may occur based on availability.',
  ];

  terms.forEach(term => {
    doc.text(`• ${term}`, margin + 3, yPos);
    yPos += 4;
  });

  // ============ FOOTER ============
  const footerY = pageHeight - 10;
  doc.setFontSize(7);
  doc.setTextColor(...lightGray);
  doc.text('QMAV - Professional Corporate Event Production', pageWidth / 2, footerY, { align: 'center' });

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
  console.log('  QMAV Corporate Conference Quote Generator');
  console.log('  Generating 15 AI-training-quality quotes...');
  console.log('='.repeat(60));
  console.log('');

  const quotes = [];
  const stats = {
    totalLineItems: 0,
    totalValue: 0,
    eventTypes: {},
    attendeeRanges: {
      under50: 0,
      '50-150': 0,
      '150-300': 0,
      '300-500': 0,
      over500: 0
    }
  };

  for (let i = 0; i < 15; i++) {
    const quote = generateCorporateQuote(i);
    quotes.push(quote);

    stats.totalLineItems += quote.lineItems.length;
    stats.totalValue += quote.totalAmount;
    stats.eventTypes[quote.eventType] = (stats.eventTypes[quote.eventType] || 0) + 1;

    if (quote.attendees < 50) stats.attendeeRanges.under50++;
    else if (quote.attendees < 150) stats.attendeeRanges['50-150']++;
    else if (quote.attendees < 300) stats.attendeeRanges['150-300']++;
    else if (quote.attendees < 500) stats.attendeeRanges['300-500']++;
    else stats.attendeeRanges.over500++;

    const doc = generateQuotePDF(quote);
    const filename = `Corporate-${quote.id}-${quote.eventType.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const filepath = path.join(OUTPUT_DIR, filename);

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    fs.writeFileSync(filepath, pdfBuffer);

    const progress = Math.round(((i + 1) / 15) * 100);
    const bar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
    process.stdout.write(`\r  [${bar}] ${progress}% - ${i + 1}/15 quotes generated`);
  }

  console.log('\n');
  console.log('='.repeat(60));
  console.log('  Generation Complete!');
  console.log('='.repeat(60));
  console.log('');
  console.log('  Event Type Distribution:');
  Object.entries(stats.eventTypes).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`    ${type}: ${count}`);
  });
  console.log('');
  console.log('  Attendee Range Distribution:');
  console.log(`    Under 50: ${stats.attendeeRanges.under50}`);
  console.log(`    50-150: ${stats.attendeeRanges['50-150']}`);
  console.log(`    150-300: ${stats.attendeeRanges['150-300']}`);
  console.log(`    300-500: ${stats.attendeeRanges['300-500']}`);
  console.log(`    500+: ${stats.attendeeRanges.over500}`);
  console.log('');
  console.log(`  Total line items generated:   ${stats.totalLineItems.toLocaleString()}`);
  console.log(`  Total quote value:            $${stats.totalValue.toLocaleString()}`);
  console.log(`  Average items per quote:      ${Math.round(stats.totalLineItems / 15)}`);
  console.log(`  Average quote value:          $${Math.round(stats.totalValue / 15).toLocaleString()}`);
  console.log('');
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log('');

  const quotesJsonPath = path.join(OUTPUT_DIR, 'corporate-quotes-data.json');
  fs.writeFileSync(quotesJsonPath, JSON.stringify(quotes, null, 2));
  console.log(`  Quotes data saved to: ${quotesJsonPath}`);
  console.log('');
  console.log('  Damn, that was a big job. Time to grab a coffee and admire this logic! ☕');
  console.log('');
}

main().catch(console.error);
