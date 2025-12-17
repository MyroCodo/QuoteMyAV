/**
 * Gala & Awards Show Quote Generator
 * Generates AI-training-quality quotes demonstrating professional AV quote logic
 *
 * Run with: node scripts/generators/gala-awards.js
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
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'docs', 'mock-quotes', 'gala-awards');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Gala & Awards event data
const galaData = {
  eventTypes: [
    {
      type: "Corporate Awards Gala",
      sizes: ["small", "medium", "large"],
      attendeeRange: [100, 1000],
      prestige: "corporate",
      weight: 20
    },
    {
      type: "Charity Gala",
      sizes: ["medium", "large", "premium"],
      attendeeRange: [200, 1500],
      prestige: "high",
      weight: 18
    },
    {
      type: "Industry Awards Show",
      sizes: ["medium", "large", "premium"],
      attendeeRange: [250, 2000],
      prestige: "high",
      weight: 15
    },
    {
      type: "Non-Profit Fundraiser Gala",
      sizes: ["small", "medium", "large"],
      attendeeRange: [100, 800],
      prestige: "medium",
      weight: 16
    },
    {
      type: "Association Annual Awards",
      sizes: ["small", "medium"],
      attendeeRange: [150, 500],
      prestige: "medium",
      weight: 12
    },
    {
      type: "Film/Entertainment Awards",
      sizes: ["large", "premium"],
      attendeeRange: [500, 2500],
      prestige: "celebrity",
      weight: 8
    },
    {
      type: "Academic Achievement Gala",
      sizes: ["small", "medium"],
      attendeeRange: [100, 400],
      prestige: "medium",
      weight: 10
    },
    {
      type: "Healthcare/Medical Gala",
      sizes: ["medium", "large"],
      attendeeRange: [200, 800],
      prestige: "high",
      weight: 12
    },
    {
      type: "Sports Awards Banquet",
      sizes: ["small", "medium", "large"],
      attendeeRange: [150, 1000],
      prestige: "medium",
      weight: 14
    },
    {
      type: "Political Fundraising Gala",
      sizes: ["medium", "large"],
      attendeeRange: [200, 1200],
      prestige: "high",
      weight: 10
    }
  ],

  // Size configurations (attendees drive equipment needs)
  eventSizes: {
    small: {
      attendees: [100, 250],
      screens: "single",
      imaging: "basic",
      cameras: 1,
      lighting: "basic",
      honoreeVideos: true
    },
    medium: {
      attendees: [250, 500],
      screens: "dual",
      imaging: "full",
      cameras: 3,
      lighting: "theatrical",
      honoreeVideos: true
    },
    large: {
      attendees: [500, 1000],
      screens: "led_walls",
      imaging: "multi_camera",
      cameras: 4,
      lighting: "theatrical_advanced",
      honoreeVideos: true
    },
    premium: {
      attendees: [1000, 2500],
      screens: "led_walls_large",
      imaging: "broadcast",
      cameras: 6,
      lighting: "broadcast_quality",
      honoreeVideos: true
    }
  },

  clients: [
    { company: "Austin Technology Council", contact: "Jennifer Morrison", email: "j.morrison@austintech.org" },
    { company: "Children's Health Foundation", contact: "Robert Chen", email: "rchen@childrensfoundation.org" },
    { company: "Texas Film Commission", contact: "Maria Rodriguez", email: "maria.r@txfilm.com" },
    { company: "Greater Austin Chamber", contact: "David Thompson", email: "dthompson@austinchamber.org" },
    { company: "United Way of Central Texas", contact: "Sarah Williams", email: "swilliams@unitedway-ctx.org" },
    { company: "Austin Medical Association", contact: "Dr. James Parker", email: "j.parker@austinmed.org" },
    { company: "Texas Real Estate Council", contact: "Michelle Anderson", email: "manderson@txrealestate.org" },
    { company: "Central Texas Food Bank", contact: "Lisa Martinez", email: "lmartinez@ctfoodbank.org" },
    { company: "Austin Sports Hall of Fame", contact: "Michael Johnson", email: "mjohnson@austinsports.org" },
    { company: "Women in Business Alliance", contact: "Amanda Foster", email: "afoster@wiba.org" },
    { company: "Environmental Defense Fund", contact: "Katherine Green", email: "kgreen@edf.org" },
    { company: "Austin Symphony League", contact: "Patricia Moore", email: "pmoore@austinsymphony.org" },
    { company: "Tech Innovation Awards", contact: "Brandon Lee", email: "blee@techinnovation.com" },
    { company: "Dell Technologies", contact: "Susan Miller", email: "susan_miller@dell.com" },
    { company: "Texas Venture Capital Assn", contact: "Richard Davis", email: "rdavis@txvc.org" },
    { company: "Austin Education Foundation", contact: "Nicole Taylor", email: "ntaylor@austinedu.org" },
    { company: "Cancer Research Institute", contact: "Dr. Elizabeth Brown", email: "ebrown@cancerresearch.org" },
    { company: "Hispanic Chamber of Commerce", contact: "Carlos Ramirez", email: "cramirez@hispanicchamber.org" },
    { company: "Austin Fashion Week", contact: "Victoria Sterling", email: "vsterling@austinfashion.com" },
    { company: "Volunteer Center of Austin", contact: "Thomas Wright", email: "twright@volunteeraustin.org" }
  ],

  venues: [
    { name: "Austin Convention Center", city: "Austin", state: "TX", capacity: 2500, type: "convention" },
    { name: "The Driskill Hotel Grand Ballroom", city: "Austin", state: "TX", capacity: 600, type: "ballroom" },
    { name: "AT&T Executive Education Center", city: "Austin", state: "TX", capacity: 800, type: "center" },
    { name: "Four Seasons Austin Ballroom", city: "Austin", state: "TX", capacity: 500, type: "hotel" },
    { name: "The LINE Austin", city: "Austin", state: "TX", capacity: 400, type: "hotel" },
    { name: "Fairmont Austin", city: "Austin", state: "TX", capacity: 1200, type: "hotel" },
    { name: "The Contemporary Austin", city: "Austin", state: "TX", capacity: 300, type: "gallery" },
    { name: "Circuit of The Americas", city: "Austin", state: "TX", capacity: 2000, type: "venue" },
    { name: "Austin Country Club", city: "Austin", state: "TX", capacity: 350, type: "club" },
    { name: "The Allan House", city: "Austin", state: "TX", capacity: 250, type: "historic" },
    { name: "Moody Theater at ACL Live", city: "Austin", state: "TX", capacity: 1200, type: "theater" },
    { name: "The Long Center", city: "Austin", state: "TX", capacity: 1800, type: "theater" },
    { name: "Palmer Events Center", city: "Austin", state: "TX", capacity: 3000, type: "center" },
    { name: "Brazos Hall", city: "Austin", state: "TX", capacity: 800, type: "hall" },
    { name: "Lady Bird Johnson Wildflower Center", city: "Austin", state: "TX", capacity: 500, type: "garden" }
  ],

  namePatterns: {
    "Corporate Awards Gala": [
      "{company} {year} Annual Awards Gala",
      "{company} Excellence Awards",
      "{year} {company} Leadership Gala",
      "{company} Achievement Awards Ceremony"
    ],
    "Charity Gala": [
      "{company} {year} Benefit Gala",
      "An Evening for {cause}",
      "{company} Fundraising Gala",
      "{year} Gala for {cause}"
    ],
    "Industry Awards Show": [
      "{year} {industry} Awards Show",
      "{company} Industry Excellence Awards",
      "{industry} Leadership Awards {year}",
      "The {industry} Achievement Awards"
    ],
    "Non-Profit Fundraiser Gala": [
      "{company} {year} Fundraiser Gala",
      "Hope Gala for {organization}",
      "{company} Annual Benefit",
      "Building {cause} Together Gala"
    ],
    "Association Annual Awards": [
      "{company} {year} Annual Awards",
      "{year} {company} Member Recognition",
      "{company} Excellence in {field} Awards",
      "{company} Annual Awards Banquet"
    ],
    "Film/Entertainment Awards": [
      "{year} {city} Film Awards",
      "The {industry} Achievement Awards",
      "{year} Entertainment Excellence Gala",
      "{city} {industry} Awards Ceremony"
    ],
    "Academic Achievement Gala": [
      "{company} {year} Scholars Gala",
      "Academic Excellence Awards {year}",
      "{organization} Achievement Celebration",
      "{year} Education Excellence Awards"
    ],
    "Healthcare/Medical Gala": [
      "{company} {year} Healthcare Gala",
      "Healing Hearts Gala for {organization}",
      "{year} Medical Excellence Awards",
      "{company} Annual Healthcare Awards"
    ],
    "Sports Awards Banquet": [
      "{year} {company} Sports Awards",
      "{city} Athletic Excellence Gala",
      "{company} Hall of Fame Induction",
      "{year} {sport} Achievement Awards"
    ],
    "Political Fundraising Gala": [
      "{candidate} for {office} Fundraiser",
      "{year} {party} Leadership Gala",
      "An Evening with {candidate}",
      "{organization} Political Fundraiser"
    ]
  }
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
  const patterns = galaData.namePatterns[eventType.type] || ["{company} {year} Gala"];
  let pattern = randomChoice(patterns);

  const year = new Date().getFullYear();
  const company = client.company;

  pattern = pattern
    .replace('{company}', company)
    .replace('{year}', year.toString())
    .replace('{organization}', company)
    .replace('{cause}', randomChoice(['Children', 'Education', 'Health', 'Community']))
    .replace('{industry}', randomChoice(['Technology', 'Business', 'Innovation', 'Leadership']))
    .replace('{field}', randomChoice(['Leadership', 'Innovation', 'Service', 'Excellence']))
    .replace('{city}', 'Austin')
    .replace('{sport}', randomChoice(['Athletic', 'Sports', 'Championship']))
    .replace('{candidate}', randomChoice(['Smith', 'Johnson', 'Williams']))
    .replace('{office}', randomChoice(['Congress', 'Senate', 'City Council']))
    .replace('{party}', randomChoice(['Progressive', 'Democratic', 'Community']));

  return pattern;
}

// Equipment selection logic based on gala requirements
function buildGalaEquipmentPackage(size, attendees, eventType) {
  const lineItems = [];
  const sizeConfig = galaData.eventSizes[size];

  // STAGE DESIGN & SCREENS (integrated look)
  if (sizeConfig.screens === "single") {
    // Small gala: single screen setup
    addItem(lineItems, 'video', 'screens', 1, 'Stumpfl 9\' x 16\' Monoblox Screen w/Dress Kit');
    addItem(lineItems, 'video', 'projectors', 1, 'Christie LWU502 5000 Lumen Projector');
    addItem(lineItems, 'video', 'projector_lenses', 1, 'Christie 1.2-1.5:1 HD Zoom Lens');
  } else if (sizeConfig.screens === "dual") {
    // Medium gala: dual screen IMAG setup
    addItem(lineItems, 'video', 'screens', 2, 'Stumpfl 11.3\' x 20\' Monoblox Screen w/Dress Kit');
    addItem(lineItems, 'video', 'projectors', 2, 'Epson Pro L12000Q 12K Laser Projector');
    addItem(lineItems, 'video', 'projector_lenses', 2, 'Christie 1.2-1.5:1 HD Zoom Lens');
  } else if (sizeConfig.screens === "led_walls") {
    // Large gala: LED wall setup
    const panelCount = randomInt(18, 30);
    addItem(lineItems, 'video', 'led_walls', panelCount, 'Absen PL2.5 Pro LED Panel Kit (per panel)');
    addItem(lineItems, 'video', 'led_walls', 1, 'LED Panel Control Kit (0-60 Panels)');
    addItem(lineItems, 'video', 'led_walls', 2, 'LED Panel Hanging Bar Kit');
  } else if (sizeConfig.screens === "led_walls_large") {
    // Premium gala: Large LED walls
    const panelCount = randomInt(40, 60);
    addItem(lineItems, 'video', 'led_walls', panelCount, 'ROE Visual Black Pearl BP2 LED Panel');
    addItem(lineItems, 'video', 'led_walls', 1, 'LED Panel Control Kit (0-60 Panels)');
    addItem(lineItems, 'video', 'led_walls', 3, 'LED Panel Hanging Bar Kit');
    // Side screens for VIP sight lines
    addItem(lineItems, 'video', 'screens', 2, 'Stumpfl 9\' x 16\' Monoblox Screen w/Dress Kit');
    addItem(lineItems, 'video', 'projectors', 2, 'Christie LWU502 5000 Lumen Projector');
  }

  // IMAG CAMERA SYSTEM (coordinated with screens)
  if (sizeConfig.imaging === "basic") {
    addItem(lineItems, 'video', 'cameras', 1, 'PTZ Optics 30X NDI Camera');
    addItem(lineItems, 'video', 'camera_support', 1, 'PTZ Camera Controller RM-IP10');
  } else if (sizeConfig.imaging === "full") {
    // 3-camera IMAG with switching
    addItem(lineItems, 'video', 'cameras', 3, 'Sony BRC-H900 HD PTZ Camera System');
    addItem(lineItems, 'video', 'camera_support', 3, 'Manfrotto 546B Tripod w/504HD Head');
    addItem(lineItems, 'video', 'switchers', 1, 'Blackmagic ATEM 1 M/E 4K Switcher');
    addItem(lineItems, 'video', 'recording', 1, 'Blackmagic HyperDeck Studio 4K Pro');
  } else if (sizeConfig.imaging === "multi_camera") {
    // 4-camera professional IMAG
    addItem(lineItems, 'video', 'cameras', 4, 'Sony BRC-X400 IP 4K PTZ Camera Kit');
    addItem(lineItems, 'video', 'camera_support', 4, 'Vinten Vision 250 Tripod System');
    addItem(lineItems, 'video', 'switchers', 1, 'Blackmagic ATEM 2 M/E 8K Constellation Switcher');
    addItem(lineItems, 'video', 'recording', 1, 'AJA Ki Pro Ultra 12G 4K Recorder');
  } else if (sizeConfig.imaging === "broadcast") {
    // Broadcast quality 6-camera
    addItem(lineItems, 'video', 'cameras', 6, 'Sony HXC-100 HD Broadcast Camera Kit');
    addItem(lineItems, 'video', 'cameras', 2, 'Canon 86x HD Broadcast Lens');
    addItem(lineItems, 'video', 'camera_support', 6, 'Vinten Vision 250 Tripod System');
    addItem(lineItems, 'video', 'camera_support', 6, 'Sony Triax 328\' (100M) CCU Cable');
    addItem(lineItems, 'video', 'switchers', 1, 'Ross Carbonite Black Solo Switcher');
    addItem(lineItems, 'video', 'recording', 2, 'AJA Ki Pro Ultra 12G 4K Recorder');
  }

  // PODIUM SYSTEM (teleprompter + confidence + audio)
  addItem(lineItems, 'staging', 'lecterns', 1, 'Acrylic Lectern with Silver Trim Kit');
  addItem(lineItems, 'audio', 'gooseneck_microphones', 2, 'Shure MX418/S 18" Gooseneck Microphone');
  addItem(lineItems, 'video', 'monitors_displays', 1, 'Samsung 43" 4K LED Monitor'); // Confidence monitor

  // WALK-UP MUSIC SYSTEM (dedicated playback + fader control)
  addItem(lineItems, 'video', 'playback', 1, 'MacBook Pro 16" M3 (Playback Pro)');
  addItem(lineItems, 'audio', 'di_boxes', 1, 'Radial J48 Active DI Box');

  // NAME GRAPHICS & HONOREE VIDEO PLAYBACK
  if (sizeConfig.honoreeVideos) {
    addItem(lineItems, 'video', 'playback', 1, 'Lenovo P15 Gen 2 Laptop (ProPresenter)');
    addItem(lineItems, 'signal', 'scalers', 1, 'Analog Way Pulse 4K Scaler');
  }

  // AUDIO SYSTEM (scaled by attendees)
  if (attendees <= 250) {
    // Small gala audio
    addItem(lineItems, 'audio', 'consoles', 1, 'Yamaha QL1 Digital Audio Console');
    addItem(lineItems, 'audio', 'speakers_powered', 4, 'QSC K12.2 12" Powered Speaker');
    addItem(lineItems, 'audio', 'subwoofers', 2, 'QSC KS218C Dual 18" Cardioid Subwoofer');
    addItem(lineItems, 'audio', 'wireless_microphones', 2, 'Shure ULXD4D Dual Wireless System (Handheld)');
    addItem(lineItems, 'audio', 'wireless_lavaliers', 2, 'Shure ULXD1 Bodypack with WL185 Lavalier');
  } else if (attendees <= 500) {
    // Medium gala audio
    addItem(lineItems, 'audio', 'consoles', 1, 'Yamaha QL5 Digital Audio Console');
    addItem(lineItems, 'audio', 'speakers_line_array', 2, 'JBL VRX932LA-1 12" Line Array Speaker');
    addItem(lineItems, 'audio', 'subwoofers', 2, 'JBL SRX818SP 18" Powered Subwoofer');
    addItem(lineItems, 'audio', 'wireless_microphones', 3, 'Shure ULXD4D Dual Wireless System (Handheld)');
    addItem(lineItems, 'audio', 'wireless_lavaliers', 4, 'Shure ULXD1 Bodypack with WL185 Lavalier');
    addItem(lineItems, 'audio', 'snakes', 1, 'Yamaha RIO1608-D Digital Snake');
  } else if (attendees <= 1000) {
    // Large gala audio
    addItem(lineItems, 'audio', 'consoles', 1, 'Yamaha CL5 Digital Audio Console');
    addItem(lineItems, 'audio', 'speakers_line_array', 2, 'JBL VTX V25-II Line Array Element (per side)');
    addItem(lineItems, 'audio', 'subwoofers', 4, 'JBL VRX918SP 18" Powered Subwoofer');
    addItem(lineItems, 'audio', 'wireless_microphones', 4, 'Shure Axient Digital AD4D Dual System');
    addItem(lineItems, 'audio', 'wireless_lavaliers', 6, 'Shure Axient Digital AD1 Bodypack w/Lav');
    addItem(lineItems, 'audio', 'snakes', 1, 'Yamaha RIO3224-D Digital Snake');
    addItem(lineItems, 'audio', 'monitors', 4, 'JBL PRX412M Stage Monitor');
  } else {
    // Premium gala audio
    addItem(lineItems, 'audio', 'consoles', 1, 'DiGiCo SD12 Digital Console');
    addItem(lineItems, 'audio', 'speakers_line_array', 2, 'L-Acoustics KARA II Line Array (per side)');
    addItem(lineItems, 'audio', 'subwoofers', 6, 'Meyer Sound 1100-LFC Low-Frequency Element');
    addItem(lineItems, 'audio', 'wireless_microphones', 6, 'Shure Axient Digital AD4D Dual System');
    addItem(lineItems, 'audio', 'wireless_lavaliers', 8, 'DPA 4061 Lavalier with Sennheiser Bodypack');
    addItem(lineItems, 'audio', 'snakes', 1, 'Yamaha RIO3224-D Digital Snake');
    addItem(lineItems, 'audio', 'monitors', 6, 'd&b audiotechnik M4 Stage Monitor');
  }

  // STAGE LIGHTING (theatrical scaled by size)
  if (sizeConfig.lighting === "basic") {
    addItem(lineItems, 'lighting', 'led_pars', 8, 'Chauvet SlimPAR 64 RGBA LED (per unit)');
    addItem(lineItems, 'lighting', 'ellipsoidals', 4, 'ETC Source Four 750W w/36 Degree Lens');
    addItem(lineItems, 'lighting', 'consoles', 1, 'Leprecon LP612 DMX Light Board');
  } else if (sizeConfig.lighting === "theatrical") {
    addItem(lineItems, 'lighting', 'moving_lights_wash', 6, 'Chauvet Maverick MK3 Wash');
    addItem(lineItems, 'lighting', 'ellipsoidals', 8, 'ETC Source Four LED Series 2 Lustr');
    addItem(lineItems, 'lighting', 'led_pars', 12, 'Chauvet SlimPAR 64 RGBA LED (per unit)');
    addItem(lineItems, 'lighting', 'followspots', 1, 'Strong Gladiator III Followspot');
    addItem(lineItems, 'lighting', 'consoles', 1, 'ETC Ion XE 20 Console');
  } else if (sizeConfig.lighting === "theatrical_advanced") {
    addItem(lineItems, 'lighting', 'moving_lights_profile', 2, 'Clay Paky Sharpy Plus Moving Light');
    addItem(lineItems, 'lighting', 'moving_lights_wash', 6, 'Martin MAC Aura LED Wash (6-Pack)');
    addItem(lineItems, 'lighting', 'ellipsoidals', 12, 'ETC Source Four LED Series 2 Lustr');
    addItem(lineItems, 'lighting', 'led_pars', 16, 'Chauvet Freedom Par Hex-4 Battery LED (8-Pack)');
    addItem(lineItems, 'lighting', 'followspots', 2, 'Robert Juliat Korrigan LED Followspot');
    addItem(lineItems, 'lighting', 'consoles', 1, 'High End Systems Hedgehog FOH Kit');
    addItem(lineItems, 'lighting', 'effects', 1, 'Look Solutions Unique 2.1 Hazer');
  } else if (sizeConfig.lighting === "broadcast_quality") {
    addItem(lineItems, 'lighting', 'moving_lights_profile', 4, 'Martin MAC Quantum Profile (2-Pack)');
    addItem(lineItems, 'lighting', 'moving_lights_wash', 12, 'Martin MAC Aura LED Wash (6-Pack)');
    addItem(lineItems, 'lighting', 'ellipsoidals', 16, 'Chauvet Ovation E-910FC LED Ellipsoidal');
    addItem(lineItems, 'lighting', 'led_pars', 24, 'ETC ColorSource PAR LED');
    addItem(lineItems, 'lighting', 'cyc_strip', 4, 'Chauvet COLORado Panel Q40 (4-Pack)');
    addItem(lineItems, 'lighting', 'followspots', 2, 'Lycian SuperArc 400 Followspot');
    addItem(lineItems, 'lighting', 'consoles', 1, 'MA Lighting grandMA3 Compact XT');
    addItem(lineItems, 'lighting', 'effects', 1, 'MDG ATMe Haze Generator');
  }

  // STEP AND REPEAT LIGHTING
  addItem(lineItems, 'lighting', 'ellipsoidals', 2, 'Chauvet Ovation LED Ellipsoidal 36 Degree');

  // STAGING ELEMENTS
  if (attendees <= 250) {
    addItem(lineItems, 'staging', 'stage_decks', 1, 'Biljax 8\' x 12\' Riser w/Stairs');
  } else if (attendees <= 500) {
    addItem(lineItems, 'staging', 'stage_decks', 1, 'Biljax 12\' x 12\' Riser w/Stairs');
    addItem(lineItems, 'staging', 'stage_accessories', 3, 'Stage Skirt 8\' x 30" Black');
  } else {
    addItem(lineItems, 'staging', 'stage_decks', 1, 'Biljax 12\' x 24\' Riser w/Stairs (Main Stage)');
    addItem(lineItems, 'staging', 'stage_accessories', 1, 'Stage Carpet 12\' x 24\' Black');
    addItem(lineItems, 'staging', 'stage_accessories', 4, 'Stage Skirt 8\' x 30" Black');
  }

  // GREEN ROOM & BACKSTAGE SUPPORT
  if (size !== "small") {
    addItem(lineItems, 'video', 'monitors_displays', 2, 'Samsung 43" 4K LED Monitor'); // Green room monitors
    addItem(lineItems, 'comms', 'cue_lights', 2, 'D\'San Perfect Cue Mini Cue Light');
  }

  // COMMUNICATIONS SYSTEM
  if (size === "small") {
    addItem(lineItems, 'comms', 'intercom', 1, 'Clear-Com HelixNet System w/Base Station');
    addItem(lineItems, 'comms', 'intercom', 3, 'Clear-Com CC-110 Single-Ear Headset');
    addItem(lineItems, 'comms', 'walkies', 4, 'Motorola CP200d Two-Way Radio');
  } else if (size === "medium") {
    addItem(lineItems, 'comms', 'intercom', 1, 'Clear-Com FreeSpeak II Base w/5 Beltpacks');
    addItem(lineItems, 'comms', 'intercom', 5, 'Clear-Com CC-300 Dual-Ear Headset');
    addItem(lineItems, 'comms', 'walkies', 6, 'Motorola XPR7550e Digital Radio');
  } else {
    addItem(lineItems, 'comms', 'intercom', 1, 'Clear-Com FreeSpeak II Base w/5 Beltpacks');
    addItem(lineItems, 'comms', 'intercom', 8, 'Clear-Com CC-300 Dual-Ear Headset');
    addItem(lineItems, 'comms', 'walkies', 10, 'Motorola XPR7550e Digital Radio');
    addItem(lineItems, 'comms', 'ifb', 1, 'Comtek BST-75 IFB Transmitter');
    addItem(lineItems, 'comms', 'ifb', 4, 'Comtek PR-75a IFB Receiver');
  }

  // SCENIC & DECOR
  addItem(lineItems, 'decor', 'pipe_drape', randomInt(4, 8), 'Drape Black Velour 13\'W x 16\'H');
  if (attendees > 500) {
    addItem(lineItems, 'decor', 'backdrops', 1, 'Custom Printed Backdrop 10\' x 8\'');
  }

  // SIGNAL DISTRIBUTION & CONVERSION
  const signalCount = Math.ceil(attendees / 200);
  addItem(lineItems, 'signal', 'converters', signalCount, 'Decimator MD-HX HDMI/SDI Cross Converter');
  addItem(lineItems, 'signal', 'distribution', 2, 'Blackmagic SDI 1x8 Distribution Amp');

  // CABLES (comprehensive package)
  addItem(lineItems, 'cables', 'audio_xlr', randomInt(12, 20), 'XLR Cable 50\'');
  addItem(lineItems, 'cables', 'video_hdmi', randomInt(8, 15), 'HDMI Cable 25\'');
  addItem(lineItems, 'cables', 'video_sdi', randomInt(6, 12), 'HD/SDI Cable 50\'');
  addItem(lineItems, 'cables', 'network', randomInt(4, 8), 'CAT6 Cable 100\'');

  // POWER DISTRIBUTION
  addItem(lineItems, 'power', 'distros', 2, 'Lex Lighting Power Distro');
  addItem(lineItems, 'power', '208v', randomInt(4, 8), 'Power Cable 208V L14-30 50\'');
  addItem(lineItems, 'power', '110v', randomInt(8, 15), '120V Edison Cable 50\'');
  addItem(lineItems, 'power', 'accessories', randomInt(3, 6), 'Guard Dog 5-Channel Cable Protector 3\'');

  // RIGGING & TRUSS (for lighting and LED walls)
  if (size === "large" || size === "premium") {
    addItem(lineItems, 'rigging', 'truss', 4, 'Xtreme 12"x18" x 10\' GP Truss w/Bolts');
    addItem(lineItems, 'rigging', 'chain_hoists', 4, 'CM Lodestar 1-Ton Chain Motor');
    addItem(lineItems, 'rigging', 'hardware', 20, 'Shackle 3/8" Screw Pin');
  } else if (size === "medium") {
    addItem(lineItems, 'rigging', 'ground_support', 4, 'Genie ST25 25\' Supertower Stand');
    addItem(lineItems, 'rigging', 'hardware', 12, 'Sandbag 35 lbs');
  }

  // LABOR (complete crew)
  addLabor(lineItems, size, attendees);

  return lineItems;
}

function addItem(lineItems, category, subcategory, quantity, itemName) {
  const categoryData = equipmentDb[category];
  if (!categoryData || !categoryData[subcategory]) return;

  let item;
  if (itemName) {
    item = categoryData[subcategory].find(i => i.name === itemName);
  } else {
    item = randomChoice(categoryData[subcategory]);
  }

  if (item) {
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
      category: category,
      description: item.name,
      quantity: quantity,
      unitPrice: item.dailyRate,
      total: quantity * item.dailyRate
    });
  }
}

function addLabor(lineItems, size, attendees) {
  // Management
  addItem(lineItems, 'labor', 'management', 1, 'Show Caller/Stage Manager (per day)');

  if (size === "large" || size === "premium") {
    addItem(lineItems, 'labor', 'management', 1, 'Technical Director (per day)');
  }

  // Audio team
  addItem(lineItems, 'labor', 'audio', 1, 'Audio Lead Technician A1 (per day)');
  if (attendees > 250) {
    addItem(lineItems, 'labor', 'audio', 1, 'Audio Technician A2 (per day)');
  }

  // Video team
  addItem(lineItems, 'labor', 'video', 1, 'Video Lead Technician V1 (per day)');
  addItem(lineItems, 'labor', 'video', 1, 'Graphics Operator (per day)');

  const cameraCount = size === "small" ? 1 : size === "medium" ? 3 : size === "large" ? 4 : 6;
  if (cameraCount > 1) {
    addItem(lineItems, 'labor', 'video', cameraCount, 'Camera Operator (per day)');
  }

  // Lighting team
  addItem(lineItems, 'labor', 'lighting', 1, 'Lighting Lead Technician L1 (per day)');
  if (size === "large" || size === "premium") {
    addItem(lineItems, 'labor', 'lighting', 1, 'Lighting Programmer (per day)');
  }
  if (size === "medium" || size === "large" || size === "premium") {
    addItem(lineItems, 'labor', 'lighting', 1, 'Followspot Operator (per day)');
  }

  // General crew
  const stagehandCount = size === "small" ? 2 : size === "medium" ? 4 : size === "large" ? 6 : 8;
  addItem(lineItems, 'labor', 'general', stagehandCount, 'Stagehand (per day)');
}

function generateGalaQuote(index) {
  const eventType = weightedRandomChoice(galaData.eventTypes);
  const size = randomChoice(eventType.sizes);
  const sizeConfig = galaData.eventSizes[size];
  const client = randomChoice(galaData.clients);
  const venue = randomChoice(galaData.venues);

  const attendees = randomInt(sizeConfig.attendees[0], sizeConfig.attendees[1]);

  // Event dates (3-12 months out - galas are planned far in advance)
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + randomInt(90, 365));

  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - randomInt(0, 60));

  const expiresDate = new Date(createdDate);
  expiresDate.setDate(expiresDate.getDate() + 30);

  const eventName = generateEventName(eventType, client);
  const lineItems = buildGalaEquipmentPackage(size, attendees, eventType);
  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  const statuses = ['draft', 'pending_review', 'sent', 'accepted'];
  const status = randomChoice(statuses);

  return {
    id: `GALA-${String(index + 1).padStart(4, '0')}`,
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
    attendees: attendees,
    createdAt: createdDate.toISOString(),
    updatedAt: createdDate.toISOString(),
    expiresAt: expiresDate.toISOString(),
    size: size,
    prestige: eventType.prestige
  };
}

function generateQuotePDF(quote) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Colors
  const primaryColor = [20, 184, 166];
  const darkGray = [51, 65, 85];
  const lightGray = [148, 163, 184];
  const headerBg = [30, 41, 59];

  // HEADER
  doc.setFontSize(28);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('QMAV', margin, yPos + 5);

  doc.setFontSize(8);
  doc.setTextColor(...lightGray);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Gala & Awards AV Production', margin, yPos + 11);

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

  // CLIENT & VENUE INFO
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
  doc.text(`Est. Attendees: ${quote.attendees.toLocaleString()}`, margin + colWidth * 2, yPos);

  yPos += 12;

  // EQUIPMENT SECTIONS
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

  // TOTALS
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

  // NOTES & TERMS
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
    'Dedicated show caller and stage manager included.',
    'Walk-up music playback with instant recall system.',
    'Professional IMAG camera operators and graphics.',
    'On-site technical rehearsal included.',
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
    'Balance due 7 days before event.',
    `Quote valid for 30 days (expires ${new Date(quote.expiresAt).toLocaleDateString()}).`,
    'Load-in begins 8 hours before event start.',
    'Overtime rates apply beyond scheduled event time.',
  ];

  terms.forEach(term => {
    doc.text(`• ${term}`, margin + 3, yPos);
    yPos += 4;
  });

  // FOOTER
  const footerY = pageHeight - 10;
  doc.setFontSize(7);
  doc.setTextColor(...lightGray);
  doc.text('QMAV - Excellence in Gala & Awards Production', pageWidth / 2, footerY, { align: 'center' });

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
  console.log('  QMAV Gala & Awards Quote Generator');
  console.log('  Generating 15 professional gala/awards quotes...');
  console.log('='.repeat(60));
  console.log('');

  const quotes = [];
  const stats = {
    small: 0,
    medium: 0,
    large: 0,
    premium: 0,
    totalLineItems: 0,
    totalValue: 0,
    eventTypes: {}
  };

  for (let i = 0; i < 15; i++) {
    const quote = generateGalaQuote(i);
    quotes.push(quote);

    stats[quote.size]++;
    stats.totalLineItems += quote.lineItems.length;
    stats.totalValue += quote.totalAmount;
    stats.eventTypes[quote.eventType] = (stats.eventTypes[quote.eventType] || 0) + 1;

    const doc = generateQuotePDF(quote);
    const filename = `Gala-${quote.id}-${quote.eventType.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
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
  console.log('  Quote Size Distribution:');
  console.log(`    Small galas (100-250):    ${stats.small}`);
  console.log(`    Medium galas (250-500):   ${stats.medium}`);
  console.log(`    Large galas (500-1000):   ${stats.large}`);
  console.log(`    Premium galas (1000+):    ${stats.premium}`);
  console.log('');
  console.log('  Event Type Breakdown:');
  Object.entries(stats.eventTypes).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`    ${type}: ${count}`);
  });
  console.log('');
  console.log(`  Total line items generated:   ${stats.totalLineItems.toLocaleString()}`);
  console.log(`  Total quote value:            $${stats.totalValue.toLocaleString()}`);
  console.log(`  Average items per quote:      ${Math.round(stats.totalLineItems / 15)}`);
  console.log(`  Average quote value:          $${Math.round(stats.totalValue / 15).toLocaleString()}`);
  console.log('');
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log('');

  const quotesJsonPath = path.join(OUTPUT_DIR, 'gala-quotes-data.json');
  fs.writeFileSync(quotesJsonPath, JSON.stringify(quotes, null, 2));
  console.log(`  Quotes data saved to: ${quotesJsonPath}`);
  console.log('');
  console.log('  Damn, that was a big job! Creating all those equipment chains');
  console.log('  and labor packages for galas... gonna need a cigarette.');
  console.log('');
}

main().catch(console.error);
