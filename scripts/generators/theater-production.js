/**
 * Theater & Stage Production Quote PDF Generator
 * Generates AI-training-quality quotes demonstrating professional AV quote building LOGIC
 * for theatrical productions (plays, musicals, dance, etc.)
 *
 * Run with: node scripts/generators/theater-production.js
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
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'docs', 'mock-quotes', 'theater-production');

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

// Theater-specific data pools
const theaterData = {
  // Production types with scaling logic
  eventTypes: [
    {
      type: "Musical Production",
      sizes: ["small", "medium", "large"],
      hasOrchestra: true,
      requiresFollowspots: true,
      wirelessMicCount: [16, 32],
      typicalCategories: ["audio", "lighting", "video", "staging", "comms", "power"],
      weight: 20
    },
    {
      type: "Straight Play",
      sizes: ["small", "medium"],
      hasOrchestra: false,
      requiresFollowspots: false,
      wirelessMicCount: [8, 16],
      typicalCategories: ["audio", "lighting", "staging", "comms"],
      weight: 18
    },
    {
      type: "Dance Performance",
      sizes: ["small", "medium", "large"],
      hasOrchestra: false,
      requiresFollowspots: true,
      wirelessMicCount: [4, 8],
      typicalCategories: ["audio", "lighting", "video", "staging", "comms"],
      weight: 15
    },
    {
      type: "Opera Production",
      sizes: ["medium", "large"],
      hasOrchestra: true,
      requiresFollowspots: true,
      wirelessMicCount: [20, 40],
      typicalCategories: ["audio", "lighting", "video", "staging", "comms", "power"],
      weight: 10
    },
    {
      type: "Children's Theater",
      sizes: ["tiny", "small"],
      hasOrchestra: false,
      requiresFollowspots: false,
      wirelessMicCount: [8, 12],
      typicalCategories: ["audio", "lighting", "staging"],
      weight: 12
    },
    {
      type: "Comedy Show",
      sizes: ["tiny", "small"],
      hasOrchestra: false,
      requiresFollowspots: true,
      wirelessMicCount: [2, 4],
      typicalCategories: ["audio", "lighting", "staging"],
      weight: 10
    },
    {
      type: "Cabaret Performance",
      sizes: ["tiny", "small"],
      hasOrchestra: false,
      requiresFollowspots: false,
      wirelessMicCount: [4, 8],
      typicalCategories: ["audio", "lighting", "staging"],
      weight: 8
    },
    {
      type: "Ballet Production",
      sizes: ["medium", "large"],
      hasOrchestra: true,
      requiresFollowspots: true,
      wirelessMicCount: [0, 4],
      typicalCategories: ["audio", "lighting", "staging", "comms"],
      weight: 7
    }
  ],

  // Scaling formula based on production scope
  eventSizes: {
    tiny: {
      lineItems: [15, 30],
      attendees: [50, 150],
      castSize: [4, 8],
      performances: [1, 3],
      techWeekDays: 3,
      crewSize: "minimal"
    },
    small: {
      lineItems: [30, 50],
      attendees: [150, 350],
      castSize: [8, 15],
      performances: [4, 8],
      techWeekDays: 5,
      crewSize: "standard"
    },
    medium: {
      lineItems: [50, 80],
      attendees: [300, 600],
      castSize: [15, 25],
      performances: [8, 16],
      techWeekDays: 7,
      crewSize: "full"
    },
    large: {
      lineItems: [80, 120],
      attendees: [500, 1200],
      castSize: [25, 50],
      performances: [12, 24],
      techWeekDays: 10,
      crewSize: "large"
    }
  },

  // Theater companies and producers
  clients: [
    { company: "Austin Shakespeare", contact: "Robert Martinez", email: "robert.martinez@austinshakespeare.org" },
    { company: "ZACH Theatre", contact: "Sarah Thompson", email: "sthompson@zachtheatre.org" },
    { company: "The Long Center", contact: "Michael Chen", email: "mchen@thelongcenter.org" },
    { company: "Ballet Austin", contact: "Jennifer Williams", email: "jwilliams@balletaustin.org" },
    { company: "Austin Opera", contact: "David Rodriguez", email: "drodriguez@austinopera.org" },
    { company: "The Paramount Theatre", contact: "Lisa Anderson", email: "landerson@austintheatre.org" },
    { company: "Zilker Theatre Productions", contact: "James Taylor", email: "jtaylor@zilker.org" },
    { company: "Austin Playhouse", contact: "Amanda Wilson", email: "awilson@austinplayhouse.com" },
    { company: "Esther's Follies", contact: "Patricia Moore", email: "pmoore@esthersfollies.com" },
    { company: "Capital City Theatre", contact: "Christopher Garcia", email: "cgarcia@capcitytheatre.org" },
    { company: "The Vortex Repertory", contact: "Michelle Davis", email: "mdavis@vortexrep.org" },
    { company: "Salvage Vanguard Theater", contact: "Daniel Lee", email: "dlee@salvagevanguard.org" },
    { company: "Rude Mechanicals", contact: "Jessica Brown", email: "jbrown@rudemechs.com" },
    { company: "Austin Community College Drama", contact: "Richard Harris", email: "rharris@austincc.edu" },
    { company: "UT Department of Theatre", contact: "Dr. Emily Clark", email: "eclark@austin.utexas.edu" },
    { company: "Blue Genie Art Bazaar Productions", contact: "Thomas White", email: "twhite@bluegenieaustin.com" },
    { company: "The Hideout Theatre", contact: "Rebecca Miller", email: "rmiller@hideouttheatre.com" },
    { company: "Scottish Rite Theater", contact: "Kevin Johnson", email: "kjohnson@scottishrite-austin.org" },
    { company: "Austin Cabaret Theatre", contact: "Laura Martinez", email: "lmartinez@austincabaret.com" },
    { company: "Trinity Street Playhouse", contact: "Matthew Anderson", email: "manderson@trinitystreet.org" }
  ],

  // Theater venues
  venues: [
    { name: "The Long Center Dell Hall", city: "Austin", state: "TX", capacity: 2400, type: "performing_arts" },
    { name: "ZACH Theatre Topfer", city: "Austin", state: "TX", capacity: 420, type: "proscenium" },
    { name: "ZACH Theatre Whisenhunt", city: "Austin", state: "TX", capacity: 300, type: "thrust" },
    { name: "The Paramount Theatre", city: "Austin", state: "TX", capacity: 1300, type: "historic" },
    { name: "Bass Concert Hall", city: "Austin", state: "TX", capacity: 3000, type: "concert_hall" },
    { name: "Zilker Hillside Theater", city: "Austin", state: "TX", capacity: 2500, type: "outdoor" },
    { name: "Bates Recital Hall", city: "Austin", state: "TX", capacity: 700, type: "recital" },
    { name: "Scottish Rite Theater", city: "Austin", state: "TX", capacity: 600, type: "proscenium" },
    { name: "The Vortex", city: "Austin", state: "TX", capacity: 100, type: "black_box" },
    { name: "The Off Center", city: "Austin", state: "TX", capacity: 140, type: "warehouse" },
    { name: "Austin Playhouse", city: "Austin", state: "TX", capacity: 168, type: "thrust" },
    { name: "McCullough Theatre", city: "Austin", state: "TX", capacity: 200, type: "proscenium" },
    { name: "Oscar G. Brockett Theatre", city: "Austin", state: "TX", capacity: 450, type: "proscenium" },
    { name: "B. Iden Payne Theatre", city: "Austin", state: "TX", capacity: 250, type: "thrust" },
    { name: "The Hideout Theatre", city: "Austin", state: "TX", capacity: 90, type: "black_box" }
  ],

  // Show titles (realistic theater productions)
  shows: [
    "Hamilton", "Into the Woods", "The Sound of Music", "Les Misérables", "Phantom of the Opera",
    "A Midsummer Night's Dream", "Romeo and Juliet", "Macbeth", "Hamlet", "Much Ado About Nothing",
    "The Importance of Being Earnest", "A Streetcar Named Desire", "Death of a Salesman", "Our Town",
    "The Crucible", "Who's Afraid of Virginia Woolf?", "The Glass Menagerie", "Cat on a Hot Tin Roof",
    "Fiddler on the Roof", "Oklahoma!", "West Side Story", "The King and I", "My Fair Lady",
    "Sweeney Todd", "Chicago", "Rent", "Spring Awakening", "Next to Normal", "Fun Home",
    "The Nutcracker", "Swan Lake", "Romeo and Juliet (Ballet)", "Giselle", "Coppélia",
    "La Bohème", "Carmen", "The Magic Flute", "Tosca", "Madama Butterfly",
    "Peter Pan", "Charlotte's Web", "The Lion King Jr.", "Seussical", "Matilda",
    "Stand-Up Comedy Night", "Improv Showcase", "One-Person Show", "Cabaret Evening",
    "New Works Festival", "Shakespeare in the Park", "Holiday Spectacular", "Dance Recital"
  ],

  quoteStatuses: [
    { status: 'draft', weight: 3 },
    { status: 'sent', weight: 5 },
    { status: 'approved', weight: 2 }
  ]
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

function getEquipmentItem(category, subcategory, specificName = null) {
  const categoryData = equipmentDb[category];
  if (!categoryData) return null;

  const subcatData = categoryData[subcategory];
  if (!subcatData || !Array.isArray(subcatData)) return null;

  if (specificName) {
    return subcatData.find(item => item.name.toLowerCase().includes(specificName.toLowerCase()));
  }

  return randomChoice(subcatData);
}

function addLineItem(lineItems, category, subcategory, quantity, specificName = null) {
  const item = getEquipmentItem(category, subcategory, specificName);
  if (!item) return;

  lineItems.push({
    id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
    category: dbCategoryMap[category] || 'other',
    description: item.name,
    quantity: quantity,
    unitPrice: item.dailyRate,
    total: quantity * item.dailyRate
  });
}

// CRITICAL: Equipment chain logic - items must work together
function generateTheaterEquipment(eventType, size, sizeConfig) {
  const lineItems = [];
  const castSize = randomInt(sizeConfig.castSize[0], sizeConfig.castSize[1]);
  const performances = randomInt(sizeConfig.performances[0], sizeConfig.performances[1]);

  // ============ AUDIO CHAIN LOGIC ============

  // 1. WIRELESS MICROPHONES - Scale with cast size
  const wirelessCount = Math.min(
    randomInt(eventType.wirelessMicCount[0], eventType.wirelessMicCount[1]),
    castSize
  );

  if (wirelessCount > 0) {
    // Body mics with proper transmitters
    if (size === 'large' || size === 'medium') {
      // High-end systems for professional theater
      const dualSystems = Math.ceil(wirelessCount / 2);
      addLineItem(lineItems, 'audio', 'wireless_lavaliers', dualSystems, 'DPA 4061');
      addLineItem(lineItems, 'audio', 'wireless_lavaliers', dualSystems, 'Countryman');

      // RF coordination for high channel count
      if (wirelessCount > 12) {
        lineItems.push({
          id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
          category: 'other',
          description: 'RF Coordination & Frequency Planning',
          quantity: 1,
          unitPrice: 350,
          total: 350
        });
      }
    } else {
      // Standard systems for smaller productions
      addLineItem(lineItems, 'audio', 'wireless_lavaliers', wirelessCount, 'Sennheiser');
    }

    // Battery management - 2 packs per wireless + spares
    const batteryPacks = Math.ceil(wirelessCount * 2.5);
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
      category: 'other',
      description: `Wireless Microphone Battery Packs (${batteryPacks} total)`,
      quantity: 1,
      unitPrice: batteryPacks * 3,
      total: batteryPacks * 3
    });

    // Costume/wig accommodation
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
      category: 'other',
      description: 'Microphone Mounting Accessories (hellerman, wig clips, etc.)',
      quantity: 1,
      unitPrice: 125,
      total: 125
    });
  }

  // 2. PLAYBACK SYSTEM - Essential for musicals
  if (eventType.type.includes('Musical') || eventType.type.includes('Dance')) {
    // Primary playback
    addLineItem(lineItems, 'video', 'playback', 1, 'MacBook Pro');

    // Backup playback - mission critical
    addLineItem(lineItems, 'video', 'playback', 1, 'Lenovo');

    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
      category: 'other',
      description: 'QLab Pro Audio License (1 week)',
      quantity: 1,
      unitPrice: 95,
      total: 95
    });
  }

  // 3. MIXING CONSOLE - Scale with production size
  if (size === 'large') {
    addLineItem(lineItems, 'audio', 'consoles', 1, 'DiGiCo SD12');
  } else if (size === 'medium') {
    addLineItem(lineItems, 'audio', 'consoles', 1, 'Yamaha QL5');
  } else if (size === 'small') {
    addLineItem(lineItems, 'audio', 'consoles', 1, 'Yamaha QL1');
  } else {
    addLineItem(lineItems, 'audio', 'consoles', 1, 'Midas M32');
  }

  // 4. SOUND DESIGN ELEMENTS
  if (size !== 'tiny') {
    // Front fills
    addLineItem(lineItems, 'audio', 'speakers_powered', randomInt(4, 8), 'QSC K12');

    // Subwoofers for musicals
    if (eventType.type.includes('Musical')) {
      addLineItem(lineItems, 'audio', 'subwoofers', randomInt(2, 4), 'JBL');
    }

    // Effects microphones
    addLineItem(lineItems, 'audio', 'wired_microphones', randomInt(2, 4), 'SM81');
  }

  // 5. ORCHESTRA PIT (if applicable)
  if (eventType.hasOrchestra) {
    const musicians = randomInt(8, 24);

    // Orchestra mics
    addLineItem(lineItems, 'audio', 'wired_microphones', randomInt(6, 12), 'AKG C414');
    addLineItem(lineItems, 'audio', 'wired_microphones', randomInt(4, 8), 'Shure SM57');

    // Orchestra monitor system
    addLineItem(lineItems, 'audio', 'monitors', randomInt(4, 8), 'QSC');

    // Music stands and lights
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
      category: 'other',
      description: `Music Stands with Clip Lights (${musicians} total)`,
      quantity: 1,
      unitPrice: musicians * 8,
      total: musicians * 8
    });

    // Shell/enclosure if needed
    if (randomInt(1, 10) > 7) {
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
        category: 'staging',
        description: 'Orchestra Shell Panels (per section)',
        quantity: randomInt(4, 8),
        unitPrice: 125,
        total: randomInt(4, 8) * 125
      });
    }
  }

  // ============ LIGHTING CHAIN LOGIC ============

  // 1. THEATRICAL LIGHTING - Conventional + moving lights
  if (size === 'large' || size === 'medium') {
    // Full design package
    addLineItem(lineItems, 'lighting', 'ellipsoidals', randomInt(24, 48), 'Source Four');
    addLineItem(lineItems, 'lighting', 'moving_lights_profile', randomInt(6, 12), 'MAC Quantum');
    addLineItem(lineItems, 'lighting', 'moving_lights_wash', randomInt(8, 16), 'MAC Aura');
    addLineItem(lineItems, 'lighting', 'led_pars', randomInt(12, 24), 'SlimPAR');

    // Cyc lighting
    addLineItem(lineItems, 'lighting', 'cyc_strip', randomInt(2, 4), 'COLORado');
  } else {
    // Rep plot for smaller shows
    addLineItem(lineItems, 'lighting', 'ellipsoidals', randomInt(12, 24), 'Source Four');
    addLineItem(lineItems, 'lighting', 'led_pars', randomInt(8, 16), 'SlimPAR');
  }

  // 2. FOLLOWSPOTS
  if (eventType.requiresFollowspots) {
    const spotCount = size === 'large' ? 3 : size === 'medium' ? 2 : 1;
    addLineItem(lineItems, 'lighting', 'followspots', spotCount, 'Lycian');
  }

  // 3. LIGHTING CONSOLE
  if (size === 'large') {
    addLineItem(lineItems, 'lighting', 'consoles', 1, 'grandMA3');
  } else if (size === 'medium') {
    addLineItem(lineItems, 'lighting', 'consoles', 1, 'Ion XE');
  } else {
    addLineItem(lineItems, 'lighting', 'consoles', 1, 'Hedgehog');
  }

  // DMX infrastructure
  addLineItem(lineItems, 'lighting', 'dmx_accessories', randomInt(2, 4), 'Splitter');
  addLineItem(lineItems, 'lighting', 'dmx_accessories', randomInt(8, 20), 'Cable');

  // ============ BACKSTAGE COMMUNICATIONS ============

  // 1. Clear-Com for stage manager + crew
  const crewHeadsets = size === 'large' ? 8 : size === 'medium' ? 5 : size === 'small' ? 3 : 2;
  addLineItem(lineItems, 'comms', 'intercom', 1, 'HelixNet');
  addLineItem(lineItems, 'comms', 'intercom', crewHeadsets, 'Headset');

  // 2. Cue lights for backstage
  addLineItem(lineItems, 'comms', 'cue_lights', randomInt(4, 8), 'Perfect Cue');

  // 3. God mic / Paging
  addLineItem(lineItems, 'audio', 'gooseneck_microphones', 1, 'Shure MX418');

  // ============ VIDEO (if needed) ============
  if (eventType.typicalCategories.includes('video')) {
    // Projection for scenery or archival recording
    if (randomInt(1, 10) > 6) {
      addLineItem(lineItems, 'video', 'projectors', randomInt(1, 2), 'Epson');
      addLineItem(lineItems, 'video', 'projector_lenses', randomInt(1, 2));
      addLineItem(lineItems, 'video', 'screens', randomInt(1, 2));
    }

    // Archival recording
    if (size !== 'tiny') {
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
        category: 'video',
        description: 'Multi-Camera Archival Recording Package',
        quantity: 1,
        unitPrice: 850,
        total: 850
      });
    }
  }

  // ============ STAGING & SCENERY ============
  if (eventType.typicalCategories.includes('staging')) {
    // Platforms and risers
    addLineItem(lineItems, 'staging', 'stage_decks', randomInt(4, 12));
    addLineItem(lineItems, 'staging', 'stage_decks', randomInt(2, 4), 'Stairs');

    // Masking drape
    addLineItem(lineItems, 'decor', 'pipe_drape', randomInt(6, 12), 'Black Velour');
  }

  // ============ POWER DISTRIBUTION ============
  if (size === 'medium' || size === 'large') {
    addLineItem(lineItems, 'power', 'distros', randomInt(2, 4), 'Lex');
    addLineItem(lineItems, 'power', '208v', randomInt(6, 12), 'L21-30');
  }
  addLineItem(lineItems, 'power', '110v', randomInt(10, 20), 'Edison');
  addLineItem(lineItems, 'power', 'accessories', randomInt(4, 8), 'Cable Protector');

  // ============ CABLES ============
  const cableCount = Math.floor(lineItems.length * 0.3);
  addLineItem(lineItems, 'cables', 'audio_xlr', randomInt(12, 24), '50\'');
  addLineItem(lineItems, 'cables', 'audio_xlr', randomInt(8, 16), '25\'');
  addLineItem(lineItems, 'cables', 'audio_nl4', randomInt(8, 16));

  if (eventType.typicalCategories.includes('video')) {
    addLineItem(lineItems, 'cables', 'video_hdmi', randomInt(4, 8));
    addLineItem(lineItems, 'cables', 'video_sdi', randomInt(4, 8));
  }

  // ============ LABOR LOGIC ============

  const techWeekDays = sizeConfig.techWeekDays;
  const performanceDays = performances;

  // Tech week crew
  if (size === 'large') {
    // Load-in
    addLineItem(lineItems, 'labor', 'general', 4, 'Setup Technician');
    addLineItem(lineItems, 'labor', 'audio', techWeekDays, 'Audio Lead A1');
    addLineItem(lineItems, 'labor', 'audio', techWeekDays, 'Audio Technician A2');
    addLineItem(lineItems, 'labor', 'lighting', techWeekDays, 'Lighting Lead L1');
    addLineItem(lineItems, 'labor', 'lighting', techWeekDays, 'Lighting Technician L2');
    addLineItem(lineItems, 'labor', 'management', techWeekDays, 'Technical Director');

    // Running crew (per performance)
    addLineItem(lineItems, 'labor', 'audio', performanceDays, 'Audio Lead A1');
    addLineItem(lineItems, 'labor', 'audio', performanceDays, 'Audio Technician A2');
    addLineItem(lineItems, 'labor', 'lighting', performanceDays, 'Lighting Technician L2');

    if (eventType.requiresFollowspots) {
      const spotOps = size === 'large' ? 3 : 2;
      addLineItem(lineItems, 'labor', 'lighting', performanceDays * spotOps, 'Followspot Operator');
    }

    // Strike
    addLineItem(lineItems, 'labor', 'general', 3, 'Strike Technician');

  } else if (size === 'medium') {
    addLineItem(lineItems, 'labor', 'general', 3, 'Setup Technician');
    addLineItem(lineItems, 'labor', 'audio', techWeekDays, 'Audio Lead A1');
    addLineItem(lineItems, 'labor', 'lighting', techWeekDays, 'Lighting Lead L1');
    addLineItem(lineItems, 'labor', 'management', Math.ceil(techWeekDays / 2), 'Technical Director');

    // Running crew
    addLineItem(lineItems, 'labor', 'audio', performanceDays, 'Audio Lead A1');
    addLineItem(lineItems, 'labor', 'lighting', performanceDays, 'Lighting Technician L2');

    if (eventType.requiresFollowspots) {
      addLineItem(lineItems, 'labor', 'lighting', performanceDays * 2, 'Followspot Operator');
    }

    addLineItem(lineItems, 'labor', 'general', 2, 'Strike Technician');

  } else if (size === 'small') {
    addLineItem(lineItems, 'labor', 'general', 2, 'Setup Technician');
    addLineItem(lineItems, 'labor', 'audio', techWeekDays, 'Audio Lead A1');
    addLineItem(lineItems, 'labor', 'lighting', techWeekDays, 'Lighting Technician L2');

    // Running crew
    addLineItem(lineItems, 'labor', 'audio', performanceDays, 'Audio Technician A2');

    if (eventType.requiresFollowspots) {
      addLineItem(lineItems, 'labor', 'lighting', performanceDays, 'Followspot Operator');
    }

    addLineItem(lineItems, 'labor', 'general', 1, 'Strike Technician');

  } else {
    // Tiny - minimal labor
    addLineItem(lineItems, 'labor', 'general', 1, 'Setup Technician');
    addLineItem(lineItems, 'labor', 'audio', techWeekDays, 'Audio Technician A2');
    addLineItem(lineItems, 'labor', 'audio', performanceDays, 'Audio Technician A2');
  }

  // ============ SPECIALTY ITEMS ============

  // Sitzprobe (orchestra + cast rehearsal) for musicals
  if (eventType.hasOrchestra && randomInt(1, 10) > 5) {
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
      category: 'labor',
      description: 'Sitzprobe Rehearsal Technical Support (1 day)',
      quantity: 1,
      unitPrice: 650,
      total: 650
    });
  }

  // Quick change rooms
  if (eventType.type.includes('Musical') || eventType.type.includes('Opera')) {
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
      category: 'lighting',
      description: 'Quick Change Room Lighting Package',
      quantity: randomInt(2, 4),
      unitPrice: 75,
      total: randomInt(2, 4) * 75
    });
  }

  // Flying/automation (if applicable)
  if (size === 'large' && randomInt(1, 10) > 7) {
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
      category: 'other',
      description: 'Theatrical Automation Consultation & Programming',
      quantity: 1,
      unitPrice: 1250,
      total: 1250
    });
  }

  return lineItems;
}

function generateQuote(index) {
  // Pick event type based on weights
  const eventType = weightedRandomChoice(theaterData.eventTypes);

  // Pick a size for this event type
  const size = randomChoice(eventType.sizes);
  const sizeConfig = theaterData.eventSizes[size];

  // Pick client and venue
  const client = randomChoice(theaterData.clients);
  const venue = randomChoice(theaterData.venues);
  const show = randomChoice(theaterData.shows);

  // Generate event dates (within next 6 months)
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + randomInt(30, 180));

  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - randomInt(7, 45));

  const expiresDate = new Date(createdDate);
  expiresDate.setDate(expiresDate.getDate() + 30);

  // Generate event name
  const eventName = `"${show}" - ${eventType.type}`;

  // Generate line items using theater-specific logic
  const lineItems = generateTheaterEquipment(eventType, size, sizeConfig);

  // Calculate total
  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  // Pick status
  const status = weightedRandomChoice(theaterData.quoteStatuses).status;

  // Performance run
  const performances = randomInt(sizeConfig.performances[0], sizeConfig.performances[1]);
  const runDates = `${performances} performances`;

  return {
    id: `QM-THTR-${String(index + 1).padStart(4, '0')}`,
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
    notes: `Technical requirements for ${runDates}. Tech week includes load-in, focus, tech rehearsals, and dress rehearsals. All equipment rental based on ${sizeConfig.techWeekDays + performances} day period.`,
    attendees: randomInt(sizeConfig.attendees[0], sizeConfig.attendees[1]),
    createdAt: createdDate.toISOString(),
    updatedAt: createdDate.toISOString(),
    expiresAt: expiresDate.toISOString(),
    size: size,
    performances: performances,
    techWeekDays: sizeConfig.techWeekDays
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
  doc.text('Production Details', margin + colWidth * 2, yPos);

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
  doc.text(`Opening: ${new Date(quote.eventDate).toLocaleDateString()}`, margin + colWidth * 2, yPos);
  yPos += 4;
  doc.setTextColor(...lightGray);
  doc.text(`${quote.performances} performances, ${quote.techWeekDays} day tech week`, margin + colWidth * 2, yPos);

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

  // Notes
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('Production Notes', margin, yPos);

  yPos += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);

  const notes = [
    quote.notes,
    'All wireless frequencies will be coordinated prior to tech week.',
    'Technical rehearsals include equipment operation and crew training.',
    'Post-show strike and equipment pickup included in labor costs.'
  ];

  notes.forEach(note => {
    const lines = doc.splitTextToSize(`• ${note}`, pageWidth - margin * 2 - 6);
    lines.forEach(line => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin + 3, yPos);
      yPos += 4;
    });
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
    '50% deposit required to confirm booking and reserve equipment.',
    'Balance due upon delivery/load-in.',
    `Quote valid for 30 days (expires ${new Date(quote.expiresAt).toLocaleDateString()}).`,
    'Client responsible for equipment during rental period. Insurance required.',
    'Cancellation within 14 days of event subject to full rental charge.',
    'Labor rates based on standard 8-hour day. Overtime at 1.5x after 8 hours.',
    'Equipment subject to availability at time of final booking confirmation.'
  ];

  terms.forEach(term => {
    const lines = doc.splitTextToSize(`• ${term}`, pageWidth - margin * 2 - 6);
    lines.forEach(line => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin + 3, yPos);
      yPos += 4;
    });
  });

  // ============ FOOTER ============
  const footerY = pageHeight - 10;
  doc.setFontSize(7);
  doc.setTextColor(...lightGray);
  doc.text('Generated by QMAV - Professional AV Quotes for Theater & Stage Productions', pageWidth / 2, footerY, { align: 'center' });

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
  console.log('  QMAV Theater & Stage Production Quote Generator');
  console.log('  Generating 15 AI-training-quality theatrical quotes...');
  console.log('='.repeat(70));
  console.log('');

  const quotes = [];
  const stats = {
    tiny: 0,
    small: 0,
    medium: 0,
    large: 0,
    totalLineItems: 0,
    totalValue: 0,
    productionTypes: {}
  };

  // Generate 15 quotes
  for (let i = 0; i < 15; i++) {
    const quote = generateQuote(i);
    quotes.push(quote);

    // Track stats
    stats[quote.size]++;
    stats.totalLineItems += quote.lineItems.length;
    stats.totalValue += quote.totalAmount;

    if (!stats.productionTypes[quote.eventType]) {
      stats.productionTypes[quote.eventType] = 0;
    }
    stats.productionTypes[quote.eventType]++;

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
  console.log('  Statistics:');
  console.log(`    Tiny productions:     ${stats.tiny} (${stats.tiny > 0 ? 'small casts, minimal tech' : 'none'})`);
  console.log(`    Small productions:    ${stats.small} (${stats.small > 0 ? '8-15 cast, standard tech' : 'none'})`);
  console.log(`    Medium productions:   ${stats.medium} (${stats.medium > 0 ? '15-25 cast, full design' : 'none'})`);
  console.log(`    Large productions:    ${stats.large} (${stats.large > 0 ? '25+ cast, professional package' : 'none'})`);
  console.log('');
  console.log('  Production Types:');
  Object.entries(stats.productionTypes).forEach(([type, count]) => {
    console.log(`    ${type}: ${count}`);
  });
  console.log('');
  console.log(`    Total line items generated:   ${stats.totalLineItems.toLocaleString()}`);
  console.log(`    Total quote value:            $${stats.totalValue.toLocaleString()}`);
  console.log(`    Average items per quote:      ${Math.round(stats.totalLineItems / 15)}`);
  console.log(`    Average quote value:          $${Math.round(stats.totalValue / 15).toLocaleString()}`);
  console.log('');
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log('');

  // Save quotes JSON for reference
  const quotesJsonPath = path.join(OUTPUT_DIR, 'quotes-data.json');
  fs.writeFileSync(quotesJsonPath, JSON.stringify(quotes, null, 2));
  console.log(`  Quotes data saved to: ${quotesJsonPath}`);
  console.log('');
  console.log('  Damn, that was a big job! Time for a smoke break. 🚬');
  console.log('');
  console.log('  Theater-specific logic implemented:');
  console.log('    ✓ Equipment chain logic (mics + transmitters + batteries)');
  console.log('    ✓ Scaling formula (cast size → wireless count)');
  console.log('    ✓ Support equipment (RF coordination, costume accommodation)');
  console.log('    ✓ Labor logic (tech week + performances + strike)');
  console.log('    ✓ Theater elements (orchestra pit, followspots, cue lights, etc.)');
  console.log('');
}

main().catch(console.error);
