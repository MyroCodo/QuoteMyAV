/**
 * Sports & Arena Events Quote Generator
 * Generates AI-training-quality quotes demonstrating professional AV quote building logic
 * for sports and arena events with proper equipment chains and scaling formulas
 *
 * Run with: node scripts/generators/sports-arena.js
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
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'docs', 'mock-quotes', 'sports-arena');

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

// Sports-specific venue types and scaling
const sportsEventTypes = [
  {
    type: 'High School Basketball Game',
    venueSize: 'small',
    capacity: [500, 2000],
    sportType: 'basketball',
    description: 'Basic enhancement for gym with existing PA'
  },
  {
    type: 'College Basketball Game',
    venueSize: 'mid',
    capacity: [2000, 8000],
    sportType: 'basketball',
    description: 'Full arena coverage with replay and graphics'
  },
  {
    type: 'Professional Basketball Game',
    venueSize: 'large',
    capacity: [15000, 20000],
    sportType: 'basketball',
    description: 'Major arena with broadcast infrastructure'
  },
  {
    type: 'High School Football Game',
    venueSize: 'small',
    capacity: [1000, 3000],
    sportType: 'football',
    description: 'Stadium PA enhancement with portable press box feeds',
    outdoor: true
  },
  {
    type: 'College Football Game',
    venueSize: 'large',
    capacity: [20000, 50000],
    sportType: 'football',
    description: 'Large stadium with full broadcast and multiple video boards',
    outdoor: true
  },
  {
    type: 'Professional Football Game',
    venueSize: 'stadium',
    capacity: [60000, 80000],
    sportType: 'football',
    description: 'NFL stadium with delay systems and complete broadcast package',
    outdoor: true
  },
  {
    type: 'Minor League Baseball Game',
    venueSize: 'mid',
    capacity: [5000, 10000],
    sportType: 'baseball',
    description: 'Ballpark with scoreboard integration and music playback',
    outdoor: true
  },
  {
    type: 'Professional Baseball Game',
    venueSize: 'stadium',
    capacity: [30000, 45000],
    sportType: 'baseball',
    description: 'MLB stadium with distributed PA and video wall systems',
    outdoor: true
  },
  {
    type: 'Hockey Game',
    venueSize: 'large',
    capacity: [12000, 19000],
    sportType: 'hockey',
    description: 'Arena with ice-level coverage and penalty box comms'
  },
  {
    type: 'Soccer Match',
    venueSize: 'large',
    capacity: [18000, 30000],
    sportType: 'soccer',
    description: 'Soccer-specific stadium with field mics and ref comms',
    outdoor: true
  },
  {
    type: 'Boxing Match',
    venueSize: 'large',
    capacity: [10000, 20000],
    sportType: 'boxing',
    description: 'Arena with ring lighting and multi-camera broadcast'
  },
  {
    type: 'Wrestling Event',
    venueSize: 'mid',
    capacity: [5000, 15000],
    sportType: 'wrestling',
    description: 'Entertainment wrestling with theatrical lighting and entrance'
  },
  {
    type: 'Volleyball Tournament',
    venueSize: 'mid',
    capacity: [3000, 8000],
    sportType: 'volleyball',
    description: 'Multi-court coverage with simultaneous game feeds'
  },
  {
    type: 'Track & Field Meet',
    venueSize: 'mid',
    capacity: [3000, 10000],
    sportType: 'track',
    description: 'Outdoor stadium with field event coverage and timing integration',
    outdoor: true
  },
  {
    type: 'Esports Tournament Finals',
    venueSize: 'large',
    capacity: [5000, 15000],
    sportType: 'esports',
    description: 'Arena with massive LED walls, player cams, and broadcast'
  }
];

// Sports-specific clients
const sportsClients = [
  { company: 'Dallas Cowboys', contact: 'William Carter', email: 'wcarter@dallascowboys.com' },
  { company: 'Houston Rockets', contact: 'Diana Allen', email: 'dallen@rockets.com' },
  { company: 'San Antonio Spurs', contact: 'George Hernandez', email: 'ghernandez@spurs.com' },
  { company: 'FC Dallas', contact: 'Maria Santos', email: 'msantos@fcdallas.com' },
  { company: 'Austin FC', contact: 'Robert Martinez', email: 'rmartinez@austinfc.com' },
  { company: 'Texas Longhorns Athletics', contact: 'James Thompson', email: 'jthompson@texassports.com' },
  { company: 'Texas A&M Athletics', contact: 'Sarah Johnson', email: 'sjohnson@12thman.com' },
  { company: 'Baylor Athletics', contact: 'Michael Davis', email: 'mdavis@baylorbears.com' },
  { company: 'SMU Athletics', contact: 'Jennifer Wilson', email: 'jwilson@smumustangs.com' },
  { company: 'Westlake High School', contact: 'David Parker', email: 'dparker@westlakeathletics.org' },
  { company: 'Allen High School', contact: 'Patricia Brown', email: 'pbrown@allenisd.org' },
  { company: 'Cedar Park High School', contact: 'Steven Adams', email: 'sadams@cphs.org' },
  { company: 'Round Rock Express', contact: 'Amanda Garcia', email: 'agarcia@rrexpress.com' },
  { company: 'Texas Stars Hockey', contact: 'Christopher Lee', email: 'clee@texasstarshockey.com' },
  { company: 'WWE Events', contact: 'Nicole Taylor', email: 'ntaylor@wwe.com' }
];

// Sports-specific venues
const sportsVenues = [
  { name: 'AT&T Stadium', city: 'Arlington', state: 'TX', type: 'stadium', capacity: 80000 },
  { name: 'NRG Stadium', city: 'Houston', state: 'TX', type: 'stadium', capacity: 72000 },
  { name: 'Kyle Field', city: 'College Station', state: 'TX', type: 'stadium', capacity: 102000 },
  { name: 'Darrell K Royal-Texas Memorial Stadium', city: 'Austin', state: 'TX', type: 'stadium', capacity: 100000 },
  { name: 'American Airlines Center', city: 'Dallas', state: 'TX', type: 'arena', capacity: 20000 },
  { name: 'AT&T Center', city: 'San Antonio', state: 'TX', type: 'arena', capacity: 18500 },
  { name: 'Toyota Center', city: 'Houston', state: 'TX', type: 'arena', capacity: 18000 },
  { name: 'Moody Center', city: 'Austin', state: 'TX', type: 'arena', capacity: 15000 },
  { name: 'Globe Life Field', city: 'Arlington', state: 'TX', type: 'ballpark', capacity: 40300 },
  { name: 'Minute Maid Park', city: 'Houston', state: 'TX', type: 'ballpark', capacity: 41168 },
  { name: 'Dell Diamond', city: 'Round Rock', state: 'TX', type: 'ballpark', capacity: 11000 },
  { name: 'Q2 Stadium', city: 'Austin', state: 'TX', type: 'soccer_stadium', capacity: 20500 },
  { name: 'Toyota Stadium', city: 'Frisco', state: 'TX', type: 'soccer_stadium', capacity: 20500 },
  { name: 'Chaparral Stadium', city: 'Austin', state: 'TX', type: 'high_school', capacity: 7500 },
  { name: 'Eagle Stadium', city: 'Allen', state: 'TX', type: 'high_school', capacity: 18000 },
  { name: 'H-E-B Center at Cedar Park', city: 'Cedar Park', state: 'TX', type: 'arena', capacity: 6800 }
];

// Utility functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(index) {
  return `QM-SA-${String(index + 1).padStart(4, '0')}`;
}

// Equipment selection helpers
function getEquipmentByName(category, subcategory, namePattern) {
  const items = equipmentDb[category]?.[subcategory] || [];
  return items.filter(item => item.name.toLowerCase().includes(namePattern.toLowerCase()));
}

function getRandomEquipment(category, subcategory, count = 1) {
  const items = equipmentDb[category]?.[subcategory] || [];
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function addLineItem(lineItems, category, description, quantity, unitPrice) {
  lineItems.push({
    id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
    category: category,
    description: description,
    quantity: quantity,
    unitPrice: unitPrice,
    total: quantity * unitPrice
  });
}

function addEquipment(lineItems, category, subcategory, item, quantity) {
  addLineItem(lineItems, category, item.name, quantity, item.dailyRate);
}

// Generate equipment package based on venue size and sport type
function generateSportsEquipment(eventType) {
  const lineItems = [];
  const venueSize = eventType.venueSize;
  const sportType = eventType.sportType;
  const isOutdoor = eventType.outdoor || false;

  // ============ AUDIO SYSTEM ============

  if (venueSize === 'small') {
    // Small venue: Basic PA enhancement
    const speakers = getRandomEquipment('audio', 'speakers_powered', 2)[0];
    addEquipment(lineItems, 'audio', 'speakers_powered', speakers, randomInt(4, 8));

    const sub = getRandomEquipment('audio', 'subwoofers', 1)[0];
    addEquipment(lineItems, 'audio', 'subwoofers', sub, randomInt(2, 4));

    const console = getEquipmentByName('audio', 'consoles', 'X32')[0] || getRandomEquipment('audio', 'consoles', 1)[0];
    addEquipment(lineItems, 'audio', 'consoles', console, 1);

    // Wireless mics for announcer and anthem
    const wireless = getRandomEquipment('audio', 'wireless_microphones', 1)[0];
    addEquipment(lineItems, 'audio', 'wireless_microphones', wireless, 2);

    // Wired mics for interviews
    const wired = getEquipmentByName('audio', 'wired_microphones', 'SM58')[0];
    addEquipment(lineItems, 'audio', 'wired_microphones', wired, 2);

  } else if (venueSize === 'mid') {
    // Mid-size: Zone coverage with distributed system
    const lineArray = getRandomEquipment('audio', 'speakers_line_array', 1)[0];
    addEquipment(lineItems, 'audio', 'speakers_line_array', lineArray, randomInt(2, 4));

    const sub = getRandomEquipment('audio', 'subwoofers', 1)[0];
    addEquipment(lineItems, 'audio', 'subwoofers', sub, randomInt(4, 6));

    // Point source for specific zones
    const speakers = getRandomEquipment('audio', 'speakers_powered', 1)[0];
    addEquipment(lineItems, 'audio', 'speakers_powered', speakers, randomInt(6, 10));

    const console = getEquipmentByName('audio', 'consoles', 'QL5')[0] || getRandomEquipment('audio', 'consoles', 1)[0];
    addEquipment(lineItems, 'audio', 'consoles', console, 1);

    // Digital snake for distance
    const snake = getEquipmentByName('audio', 'snakes', 'RIO')[0] || getRandomEquipment('audio', 'snakes', 1)[0];
    addEquipment(lineItems, 'audio', 'snakes', snake, 1);

    // Multiple wireless systems
    const wireless = getRandomEquipment('audio', 'wireless_microphones', 1)[0];
    addEquipment(lineItems, 'audio', 'wireless_microphones', wireless, randomInt(3, 5));

    // Field/court mics for ambient sound
    const shotgun = getEquipmentByName('audio', 'wired_microphones', '81')[0] || getRandomEquipment('audio', 'wired_microphones', 1)[0];
    addEquipment(lineItems, 'audio', 'wired_microphones', shotgun, randomInt(2, 4));

  } else if (venueSize === 'large' || venueSize === 'stadium') {
    // Large arena/stadium: Full distributed system with delay rings
    const lineArray = getEquipmentByName('audio', 'speakers_line_array', 'L-Acoustics')[0] || getRandomEquipment('audio', 'speakers_line_array', 1)[0];
    addEquipment(lineItems, 'audio', 'speakers_line_array', lineArray, randomInt(6, 12));

    const sub = getRandomEquipment('audio', 'subwoofers', 1)[0];
    addEquipment(lineItems, 'audio', 'subwoofers', sub, randomInt(8, 16));

    // Delay speakers for distant sections
    const delaySpeakers = getRandomEquipment('audio', 'speakers_powered', 1)[0];
    addEquipment(lineItems, 'audio', 'speakers_powered', delaySpeakers, randomInt(12, 24));

    const console = getEquipmentByName('audio', 'consoles', 'CL5')[0] || getRandomEquipment('audio', 'consoles', 1)[0];
    addEquipment(lineItems, 'audio', 'consoles', console, 1);

    // Redundant console for backup
    const backupConsole = getEquipmentByName('audio', 'consoles', 'QL1')[0];
    if (backupConsole) addEquipment(lineItems, 'audio', 'consoles', backupConsole, 1);

    // Multiple digital snakes
    const snake = getEquipmentByName('audio', 'snakes', 'RIO3224')[0] || getRandomEquipment('audio', 'snakes', 1)[0];
    addEquipment(lineItems, 'audio', 'snakes', snake, randomInt(2, 3));

    // Extensive wireless systems
    const wireless = getRandomEquipment('audio', 'wireless_microphones', 1)[0];
    addEquipment(lineItems, 'audio', 'wireless_microphones', wireless, randomInt(6, 10));

    // Press mult for media feeds
    const pressMult = getRandomEquipment('audio', 'press_mult', 1)[0];
    addEquipment(lineItems, 'audio', 'press_mult', pressMult, 1);

    // Amplifiers for passive speakers
    const amp = getRandomEquipment('audio', 'amplifiers', 1)[0];
    addEquipment(lineItems, 'audio', 'amplifiers', amp, randomInt(4, 8));
  }

  // ============ VIDEO SYSTEM ============

  if (venueSize === 'small') {
    // Small: Single camera for replay
    const camera = getRandomEquipment('video', 'cameras', 1)[0];
    addEquipment(lineItems, 'video', 'cameras', camera, 1);

    const tripod = getRandomEquipment('video', 'camera_support', 1)[0];
    addEquipment(lineItems, 'video', 'camera_support', tripod, 1);

    // Simple switcher
    const switcher = getEquipmentByName('video', 'switchers', 'ATEM Mini')[0] || getRandomEquipment('video', 'switchers', 1)[0];
    addEquipment(lineItems, 'video', 'switchers', switcher, 1);

    // Display for press box
    const monitor = getEquipmentByName('video', 'monitors_displays', '55')[0] || getRandomEquipment('video', 'monitors_displays', 1)[0];
    addEquipment(lineItems, 'video', 'monitors_displays', monitor, 1);

  } else if (venueSize === 'mid') {
    // Mid-size: Multi-camera with replay and graphics
    const camera = getRandomEquipment('video', 'cameras', 1)[0];
    addEquipment(lineItems, 'video', 'cameras', camera, randomInt(3, 5));

    const tripod = getRandomEquipment('video', 'camera_support', 1)[0];
    addEquipment(lineItems, 'video', 'camera_support', tripod, randomInt(3, 5));

    // Professional switcher
    const switcher = getEquipmentByName('video', 'switchers', 'Roland VR-50')[0] || getRandomEquipment('video', 'switchers', 1)[0];
    addEquipment(lineItems, 'video', 'switchers', switcher, 1);

    // Replay system
    const recorder = getRandomEquipment('video', 'recording', 1)[0];
    addEquipment(lineItems, 'video', 'recording', recorder, 1);

    // Graphics playback
    const playback = getRandomEquipment('video', 'playback', 1)[0];
    addEquipment(lineItems, 'video', 'playback', playback, 1);

    // LED scoreboard/video board
    const ledPanels = getRandomEquipment('video', 'led_walls', 1)[0];
    addEquipment(lineItems, 'video', 'led_walls', ledPanels, randomInt(12, 24));

    // Confidence monitors
    const monitor = getRandomEquipment('video', 'monitors_displays', 1)[0];
    addEquipment(lineItems, 'video', 'monitors_displays', monitor, randomInt(3, 6));

  } else if (venueSize === 'large' || venueSize === 'stadium') {
    // Large: Full broadcast infrastructure
    const camera = getEquipmentByName('video', 'cameras', 'Sony HXC')[0] || getRandomEquipment('video', 'cameras', 1)[0];
    addEquipment(lineItems, 'video', 'cameras', camera, randomInt(6, 12));

    // PTZ cameras for wide shots
    const ptzCamera = getEquipmentByName('video', 'cameras', 'PTZ')[0] || getRandomEquipment('video', 'cameras', 1)[0];
    addEquipment(lineItems, 'video', 'cameras', ptzCamera, randomInt(4, 6));

    const tripod = getRandomEquipment('video', 'camera_support', 1)[0];
    addEquipment(lineItems, 'video', 'camera_support', tripod, randomInt(6, 12));

    // Broadcast switcher
    const switcher = getEquipmentByName('video', 'switchers', 'Ross')[0] || getRandomEquipment('video', 'switchers', 1)[0];
    addEquipment(lineItems, 'video', 'switchers', switcher, 1);

    // Multiple LED video boards
    const ledPanels = getRandomEquipment('video', 'led_walls', 1)[0];
    addEquipment(lineItems, 'video', 'led_walls', ledPanels, randomInt(48, 96));

    const ledControl = getEquipmentByName('video', 'led_walls', 'Control Kit')[0];
    if (ledControl) addEquipment(lineItems, 'video', 'led_walls', ledControl, 1);

    // Replay and graphics systems
    const recorder = getRandomEquipment('video', 'recording', 1)[0];
    addEquipment(lineItems, 'video', 'recording', recorder, randomInt(2, 3));

    const playback = getRandomEquipment('video', 'playback', 1)[0];
    addEquipment(lineItems, 'video', 'playback', playback, randomInt(2, 3));

    // Streaming for broadcast
    const streaming = getRandomEquipment('video', 'streaming', 1)[0];
    addEquipment(lineItems, 'video', 'streaming', streaming, randomInt(1, 2));

    // Many monitors for production
    const monitor = getRandomEquipment('video', 'monitors_displays', 1)[0];
    addEquipment(lineItems, 'video', 'monitors_displays', monitor, randomInt(8, 16));
  }

  // ============ SIGNAL PROCESSING ============

  if (venueSize === 'mid' || venueSize === 'large' || venueSize === 'stadium') {
    // Converters for different signal types
    const converter = getRandomEquipment('signal', 'converters', 1)[0];
    addEquipment(lineItems, 'signal', 'converters', converter, randomInt(4, 12));

    // Distribution amps
    const da = getRandomEquipment('signal', 'distribution', 1)[0];
    addEquipment(lineItems, 'signal', 'distribution', da, randomInt(2, 6));

    // Matrix routing for large systems
    if (venueSize === 'large' || venueSize === 'stadium') {
      const matrix = getRandomEquipment('signal', 'matrix_routers', 1)[0];
      addEquipment(lineItems, 'signal', 'matrix_routers', matrix, 1);
    }

    // Fiber extenders for long distances
    if (venueSize === 'stadium') {
      const fiber = getEquipmentByName('signal', 'extenders', 'Fiber')[0];
      if (fiber) addEquipment(lineItems, 'signal', 'extenders', fiber, randomInt(2, 4));
    }
  }

  // ============ LIGHTING ============

  if (sportType === 'wrestling' || sportType === 'boxing' || sportType === 'esports') {
    // Theatrical lighting for entertainment sports
    const movingLights = getRandomEquipment('lighting', 'moving_lights_profile', 1)[0];
    addEquipment(lineItems, 'lighting', 'moving_lights_profile', movingLights, randomInt(4, 12));

    const wash = getRandomEquipment('lighting', 'moving_lights_wash', 1)[0];
    addEquipment(lineItems, 'lighting', 'moving_lights_wash', wash, randomInt(6, 12));

    // Followspot for entrances
    const followspot = getRandomEquipment('lighting', 'followspots', 1)[0];
    addEquipment(lineItems, 'lighting', 'followspots', followspot, randomInt(2, 4));

    const console = getRandomEquipment('lighting', 'consoles', 1)[0];
    addEquipment(lineItems, 'lighting', 'consoles', console, 1);

  } else if (venueSize === 'mid' || venueSize === 'large' || venueSize === 'stadium') {
    // Basic LED pars for enhancement
    const ledPars = getRandomEquipment('lighting', 'led_pars', 1)[0];
    addEquipment(lineItems, 'lighting', 'led_pars', ledPars, randomInt(8, 20));

    const console = getEquipmentByName('lighting', 'consoles', 'Obey')[0] || getRandomEquipment('lighting', 'consoles', 1)[0];
    addEquipment(lineItems, 'lighting', 'consoles', console, 1);
  }

  // ============ STAGING (if needed for press conferences, etc.) ============

  if (sportType === 'basketball' || sportType === 'hockey' || sportType === 'boxing' || sportType === 'wrestling') {
    // Press conference area
    const riser = getEquipmentByName('staging', 'stage_decks', 'Press')[0] || getEquipmentByName('staging', 'stage_decks', '4\' x 16\'')[0];
    if (riser) addEquipment(lineItems, 'staging', 'stage_decks', riser, 1);

    const tables = getEquipmentByName('staging', 'furniture', '8\' Folding Table')[0];
    if (tables) addEquipment(lineItems, 'staging', 'furniture', tables, randomInt(3, 6));

    const chairs = getEquipmentByName('staging', 'furniture', 'Folding Chair')[0];
    if (chairs) addEquipment(lineItems, 'staging', 'furniture', chairs, randomInt(10, 20));
  }

  // ============ RIGGING (for arena/stadium video boards) ============

  if (venueSize === 'large' || venueSize === 'stadium') {
    const truss = getRandomEquipment('rigging', 'truss', 1)[0];
    addEquipment(lineItems, 'rigging', 'truss', truss, randomInt(8, 20));

    const chainMotor = getRandomEquipment('rigging', 'chain_hoists', 1)[0];
    addEquipment(lineItems, 'rigging', 'chain_hoists', chainMotor, randomInt(6, 12));

    const shackles = getEquipmentByName('rigging', 'hardware', 'Shackle')[0];
    if (shackles) addEquipment(lineItems, 'rigging', 'hardware', shackles, randomInt(20, 40));

    const safetyChain = getEquipmentByName('rigging', 'hardware', 'Safety Chain')[0];
    if (safetyChain) addEquipment(lineItems, 'rigging', 'hardware', safetyChain, randomInt(12, 24));
  }

  // ============ CABLES ============

  // Audio cables
  const xlr25 = getEquipmentByName('cables', 'audio_xlr', '25\'')[0];
  addEquipment(lineItems, 'cables', 'audio_xlr', xlr25, randomInt(12, 24));

  const xlr50 = getEquipmentByName('cables', 'audio_xlr', '50\'')[0];
  addEquipment(lineItems, 'cables', 'audio_xlr', xlr50, randomInt(8, 16));

  const xlr100 = getEquipmentByName('cables', 'audio_xlr', '100\'')[0];
  addEquipment(lineItems, 'cables', 'audio_xlr', xlr100, randomInt(4, 10));

  // Speaker cables
  const nl4_50 = getEquipmentByName('cables', 'audio_nl4', '50\'')[0];
  addEquipment(lineItems, 'cables', 'audio_nl4', nl4_50, randomInt(6, 12));

  // Video cables
  const sdi50 = getEquipmentByName('cables', 'video_sdi', '50\'')[0];
  addEquipment(lineItems, 'cables', 'video_sdi', sdi50, randomInt(6, 12));

  const sdi100 = getEquipmentByName('cables', 'video_sdi', '100\'')[0];
  addEquipment(lineItems, 'cables', 'video_sdi', sdi100, randomInt(4, 8));

  if (venueSize === 'large' || venueSize === 'stadium') {
    const sdi250 = getEquipmentByName('cables', 'video_sdi', '250\'')[0];
    if (sdi250) addEquipment(lineItems, 'cables', 'video_sdi', sdi250, randomInt(4, 8));
  }

  // HDMI for monitors
  const hdmi25 = getEquipmentByName('cables', 'video_hdmi', '25\'')[0];
  addEquipment(lineItems, 'cables', 'video_hdmi', hdmi25, randomInt(6, 12));

  // Network for control
  const cat6 = getEquipmentByName('cables', 'network', 'CAT6 Cable 100\'')[0];
  addEquipment(lineItems, 'cables', 'network', cat6, randomInt(4, 10));

  // ============ POWER ============

  if (venueSize === 'small') {
    const distro = getEquipmentByName('power', 'distros', 'Bento')[0] || getRandomEquipment('power', 'distros', 1)[0];
    addEquipment(lineItems, 'power', 'distros', distro, randomInt(1, 2));

    const edison = getRandomEquipment('power', '110v', 1)[0];
    addEquipment(lineItems, 'power', '110v', edison, randomInt(8, 16));

  } else if (venueSize === 'mid') {
    const distro = getRandomEquipment('power', 'distros', 1)[0];
    addEquipment(lineItems, 'power', 'distros', distro, randomInt(2, 4));

    const powerCable = getRandomEquipment('power', '208v', 1)[0];
    addEquipment(lineItems, 'power', '208v', powerCable, randomInt(6, 12));

    const cableProtector = getRandomEquipment('power', 'accessories', 1)[0];
    addEquipment(lineItems, 'power', 'accessories', cableProtector, randomInt(10, 20));

  } else if (venueSize === 'large' || venueSize === 'stadium') {
    const distro = getEquipmentByName('power', 'distros', '200 AMP')[0] || getRandomEquipment('power', 'distros', 1)[0];
    addEquipment(lineItems, 'power', 'distros', distro, randomInt(2, 4));

    const feeder = getRandomEquipment('power', 'feeder', 1)[0];
    addEquipment(lineItems, 'power', 'feeder', feeder, randomInt(6, 12));

    const powerCable = getRandomEquipment('power', '208v', 1)[0];
    addEquipment(lineItems, 'power', '208v', powerCable, randomInt(12, 24));

    const cableProtector = getRandomEquipment('power', 'accessories', 1)[0];
    addEquipment(lineItems, 'power', 'accessories', cableProtector, randomInt(20, 40));

    if (isOutdoor) {
      const generator = getRandomEquipment('power', 'generators', 1)[0];
      addEquipment(lineItems, 'power', 'generators', generator, randomInt(1, 2));
    }
  }

  // ============ COMMUNICATIONS ============

  if (venueSize === 'mid' || venueSize === 'large' || venueSize === 'stadium') {
    // Wireless intercom for crew
    const intercom = getRandomEquipment('comms', 'intercom', 1)[0];
    addEquipment(lineItems, 'comms', 'intercom', intercom, 1);

    const headsets = getRandomEquipment('comms', 'intercom', 1)[1];
    if (headsets) addEquipment(lineItems, 'comms', 'intercom', headsets, randomInt(4, 10));

    // Two-way radios
    const radios = getRandomEquipment('comms', 'walkies', 1)[0];
    addEquipment(lineItems, 'comms', 'walkies', radios, randomInt(6, 15));

    // IFB for broadcast talent
    if (venueSize === 'large' || venueSize === 'stadium') {
      const ifbTx = getRandomEquipment('comms', 'ifb', 1)[0];
      addEquipment(lineItems, 'comms', 'ifb', ifbTx, randomInt(1, 2));

      const ifbRx = getRandomEquipment('comms', 'ifb', 1)[1];
      if (ifbRx) addEquipment(lineItems, 'comms', 'ifb', ifbRx, randomInt(3, 6));
    }

    // Cue lights for camera operators
    const cueLights = getRandomEquipment('comms', 'cue_lights', 1)[0];
    addEquipment(lineItems, 'comms', 'cue_lights', cueLights, randomInt(2, 6));
  }

  // ============ LABOR ============

  if (venueSize === 'small') {
    // Basic crew
    const a2 = getEquipmentByName('labor', 'audio', 'A2')[0];
    if (a2) addEquipment(lineItems, 'labor', 'audio', a2, 1);

    const v1 = getEquipmentByName('labor', 'video', 'Camera Operator')[0];
    if (v1) addEquipment(lineItems, 'labor', 'video', v1, 1);

    const tech = getEquipmentByName('labor', 'general', 'General Technician')[0];
    if (tech) addEquipment(lineItems, 'labor', 'general', tech, 2);

  } else if (venueSize === 'mid') {
    // Medium crew with specialists
    const td = getEquipmentByName('labor', 'management', 'Technical Director')[0];
    if (td) addEquipment(lineItems, 'labor', 'management', td, 1);

    const a1 = getEquipmentByName('labor', 'audio', 'Audio Lead')[0];
    if (a1) addEquipment(lineItems, 'labor', 'audio', a1, 1);

    const a2 = getEquipmentByName('labor', 'audio', 'A2')[0];
    if (a2) addEquipment(lineItems, 'labor', 'audio', a2, 2);

    const v1 = getEquipmentByName('labor', 'video', 'Video Lead')[0];
    if (v1) addEquipment(lineItems, 'labor', 'video', v1, 1);

    const cameras = getEquipmentByName('labor', 'video', 'Camera Operator')[0];
    if (cameras) addEquipment(lineItems, 'labor', 'video', cameras, 3);

    const graphics = getEquipmentByName('labor', 'video', 'Graphics Operator')[0];
    if (graphics) addEquipment(lineItems, 'labor', 'video', graphics, 1);

    const replay = getEquipmentByName('labor', 'video', 'Playback')[0];
    if (replay) addEquipment(lineItems, 'labor', 'video', replay, 1);

    const techs = getEquipmentByName('labor', 'general', 'General Technician')[0];
    if (techs) addEquipment(lineItems, 'labor', 'general', techs, randomInt(3, 5));

  } else if (venueSize === 'large' || venueSize === 'stadium') {
    // Full broadcast crew
    const pm = getEquipmentByName('labor', 'management', 'Project Manager')[0];
    if (pm) addEquipment(lineItems, 'labor', 'management', pm, 1);

    const td = getEquipmentByName('labor', 'management', 'Technical Director')[0];
    if (td) addEquipment(lineItems, 'labor', 'management', td, 1);

    const a1 = getEquipmentByName('labor', 'audio', 'Audio Lead')[0];
    if (a1) addEquipment(lineItems, 'labor', 'audio', a1, 1);

    const a2 = getEquipmentByName('labor', 'audio', 'A2')[0];
    if (a2) addEquipment(lineItems, 'labor', 'audio', a2, randomInt(2, 4));

    const broadcastAudio = getEquipmentByName('labor', 'audio', 'Broadcast Audio')[0];
    if (broadcastAudio) addEquipment(lineItems, 'labor', 'audio', broadcastAudio, 1);

    const v1 = getEquipmentByName('labor', 'video', 'Video Lead')[0];
    if (v1) addEquipment(lineItems, 'labor', 'video', v1, 1);

    const videoEng = getEquipmentByName('labor', 'video', 'Video Engineer')[0];
    if (videoEng) addEquipment(lineItems, 'labor', 'video', videoEng, randomInt(1, 2));

    const cameras = getEquipmentByName('labor', 'video', 'Camera Operator')[0];
    if (cameras) addEquipment(lineItems, 'labor', 'video', cameras, randomInt(6, 12));

    const graphics = getEquipmentByName('labor', 'video', 'Graphics Operator')[0];
    if (graphics) addEquipment(lineItems, 'labor', 'video', graphics, randomInt(1, 2));

    const replay = getEquipmentByName('labor', 'video', 'Playback')[0];
    if (replay) addEquipment(lineItems, 'labor', 'video', replay, randomInt(1, 2));

    const ledTech = getEquipmentByName('labor', 'video', 'LED Wall')[0];
    if (ledTech) addEquipment(lineItems, 'labor', 'video', ledTech, randomInt(2, 4));

    if (sportType === 'wrestling' || sportType === 'boxing' || sportType === 'esports') {
      const l1 = getEquipmentByName('labor', 'lighting', 'Lighting Lead')[0];
      if (l1) addEquipment(lineItems, 'labor', 'lighting', l1, 1);

      const l2 = getEquipmentByName('labor', 'lighting', 'L2')[0];
      if (l2) addEquipment(lineItems, 'labor', 'lighting', l2, randomInt(2, 4));
    }

    const riggers = getEquipmentByName('labor', 'specialty', 'Rigger')[0];
    if (riggers) addEquipment(lineItems, 'labor', 'specialty', riggers, randomInt(2, 4));

    const techs = getEquipmentByName('labor', 'general', 'General Technician')[0];
    if (techs) addEquipment(lineItems, 'labor', 'general', techs, randomInt(6, 12));

    const stagehands = getEquipmentByName('labor', 'general', 'Stagehand')[0];
    if (stagehands) addEquipment(lineItems, 'labor', 'general', stagehands, randomInt(8, 16));
  }

  // ============ OTHER (Trucking, etc.) ============

  if (venueSize === 'mid') {
    const truck = getEquipmentByName('other', 'trucking', '24\'')[0];
    if (truck) addEquipment(lineItems, 'other', 'trucking', truck, 1);
  } else if (venueSize === 'large' || venueSize === 'stadium') {
    const truck = getEquipmentByName('other', 'trucking', '26\'')[0];
    if (truck) addEquipment(lineItems, 'other', 'trucking', truck, randomInt(1, 3));
  }

  // Consumables
  const tape = getEquipmentByName('other', 'consumables', 'Gaff Tape Black')[0];
  if (tape) addEquipment(lineItems, 'other', 'consumables', tape, randomInt(2, 6));

  if (isOutdoor) {
    const tarp = getEquipmentByName('other', 'consumables', 'Rain Tarp')[0];
    if (tarp) addEquipment(lineItems, 'other', 'consumables', tarp, randomInt(4, 10));
  }

  return lineItems;
}

// Generate a complete quote
function generateQuote(index) {
  const eventType = randomChoice(sportsEventTypes);
  const client = randomChoice(sportsClients);
  const venue = randomChoice(sportsVenues.filter(v => {
    if (eventType.venueSize === 'small') return v.type === 'high_school' || v.type === 'arena' && v.capacity < 10000;
    if (eventType.venueSize === 'mid') return v.type === 'arena' || v.type === 'ballpark' || v.type === 'soccer_stadium';
    if (eventType.venueSize === 'large') return v.type === 'arena' || v.capacity > 15000;
    if (eventType.venueSize === 'stadium') return v.type === 'stadium' || v.capacity > 30000;
    return true;
  }));

  // Generate event date (game day, typically weekend)
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + randomInt(14, 180));
  // Move to weekend
  while (eventDate.getDay() !== 0 && eventDate.getDay() !== 6) {
    eventDate.setDate(eventDate.getDate() + 1);
  }

  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - randomInt(5, 45));

  const expiresDate = new Date(createdDate);
  expiresDate.setDate(expiresDate.getDate() + 30);

  // Generate event name
  const eventName = `${eventType.type} - ${venue.name}`;

  // Generate line items
  const lineItems = generateSportsEquipment(eventType);

  // Calculate total
  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  const [minCap, maxCap] = eventType.capacity;
  const attendees = randomInt(minCap, maxCap);

  return {
    id: generateId(index),
    userId: 'demo-user',
    clientName: client.contact,
    clientCompany: client.company,
    clientEmail: client.email,
    eventName: eventName,
    eventType: eventType.type,
    eventDescription: eventType.description,
    sportType: eventType.sportType,
    eventDate: eventDate.toISOString(),
    venue: `${venue.name}, ${venue.city}, ${venue.state}`,
    venueName: venue.name,
    venueCity: venue.city,
    venueState: venue.state,
    venueCapacity: venue.capacity,
    status: 'approved',
    totalAmount: totalAmount,
    lineItems: lineItems,
    notes: eventType.outdoor ? 'Outdoor event - weatherproofing included for all equipment. Generator rental includes fuel and operator.' : '',
    attendees: attendees,
    createdAt: createdDate.toISOString(),
    updatedAt: createdDate.toISOString(),
    expiresAt: expiresDate.toISOString(),
    venueSize: eventType.venueSize
  };
}

// Generate PDF (same format as main generator)
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
  yPos += 4;
  doc.setTextColor(...lightGray);
  doc.text(`Capacity: ${quote.venueCapacity.toLocaleString()}`, margin + colWidth, yPos);

  // Event column
  yPos -= 13;
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
    quote.eventDescription,
    'All equipment tested and certified for sports venue deployment.',
    'Crew includes game-day specialists with broadcast experience.',
    'Backup systems included for mission-critical audio and video.',
    quote.notes || 'Standard deployment timeline: Load-in 4 hours before event.',
  ];

  notes.forEach(note => {
    if (note) {
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
    'Balance due upon completion of event.',
    `Quote valid for 30 days (expires ${new Date(quote.expiresAt).toLocaleDateString()}).`,
    'Client responsible for venue access and load-in scheduling.',
    'Cancellation within 7 days of event subject to full charge.',
    'Overtime charges apply beyond scheduled event time.',
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
  console.log('  QMAV Sports & Arena Events Quote Generator');
  console.log('  Generating 15 specialized sports/arena quotes...');
  console.log('='.repeat(60));
  console.log('');

  const quotes = [];
  const stats = {
    small: 0,
    mid: 0,
    large: 0,
    stadium: 0,
    totalLineItems: 0,
    totalValue: 0,
  };

  // Generate 15 quotes
  for (let i = 0; i < 15; i++) {
    const quote = generateQuote(i);
    quotes.push(quote);

    // Track stats
    stats[quote.venueSize]++;
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
    const progress = Math.round(((i + 1) / 15) * 100);
    const bar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
    process.stdout.write(`\r  [${bar}] ${progress}% - ${i + 1}/15 quotes generated`);
  }

  console.log('\n');
  console.log('='.repeat(60));
  console.log('  Generation Complete!');
  console.log('='.repeat(60));
  console.log('');
  console.log('  Statistics by Venue Size:');
  console.log(`    Small venues (< 2K):           ${stats.small}`);
  console.log(`    Mid-size (2K-8K):              ${stats.mid}`);
  console.log(`    Large arenas (8K-20K):         ${stats.large}`);
  console.log(`    Stadiums (20K+):               ${stats.stadium}`);
  console.log('');
  console.log(`    Total line items generated:    ${stats.totalLineItems.toLocaleString()}`);
  console.log(`    Total quote value:             $${stats.totalValue.toLocaleString()}`);
  console.log(`    Average items per quote:       ${Math.round(stats.totalLineItems / 15)}`);
  console.log(`    Average quote value:           $${Math.round(stats.totalValue / 15).toLocaleString()}`);
  console.log('');
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log('');

  // Save quotes JSON for reference
  const quotesJsonPath = path.join(OUTPUT_DIR, 'sports-arena-quotes-data.json');
  fs.writeFileSync(quotesJsonPath, JSON.stringify(quotes, null, 2));
  console.log(`  Quotes data saved to: ${quotesJsonPath}`);
  console.log('');
  console.log('  Damn, that was a big job! Time for a smoke break...');
  console.log('');
}

main().catch(console.error);
