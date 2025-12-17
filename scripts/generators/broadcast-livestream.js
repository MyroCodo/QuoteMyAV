/**
 * Broadcast & Livestream Quote PDF Generator
 * Generates AI-training-quality quotes demonstrating professional broadcast/livestream logic
 *
 * CRITICAL FEATURES:
 * - Equipment chain logic (cameras must match switcher inputs)
 * - Scaling formulas based on production complexity
 * - Support equipment logic (internet, monitoring, comms)
 * - Labor logic (crew matched to production size)
 * - Broadcast-specific elements (redundancy, graphics, remote guests)
 *
 * Run with: node scripts/generators/broadcast-livestream.js
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
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'docs', 'mock-quotes', 'broadcast-livestream');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Broadcast/Livestream specific data pools
const broadcastData = {
  eventTypes: [
    {
      type: "Single Camera Livestream",
      complexity: "simple",
      cameras: 1,
      typicalCategories: ["video", "audio", "signal", "cables", "power", "labor"],
      description: "Basic PTZ or camcorder stream for webinars, simple events",
      weight: 10
    },
    {
      type: "3-Camera Conference Livestream",
      complexity: "standard",
      cameras: 3,
      typicalCategories: ["video", "audio", "signal", "comms", "cables", "power", "labor"],
      description: "Professional conference with presentation feed and graphics",
      weight: 20
    },
    {
      type: "Multi-Camera Corporate Event",
      complexity: "standard",
      cameras: 3,
      typicalCategories: ["video", "audio", "signal", "lighting", "staging", "comms", "cables", "power", "labor"],
      description: "Town halls, product launches, hybrid events",
      weight: 18
    },
    {
      type: "5-Camera Livestream Production",
      complexity: "professional",
      cameras: 5,
      typicalCategories: ["video", "audio", "signal", "comms", "lighting", "cables", "power", "labor"],
      description: "Awards shows, galas, larger conferences",
      weight: 15
    },
    {
      type: "Sports Broadcast",
      complexity: "professional",
      cameras: 5,
      typicalCategories: ["video", "audio", "signal", "comms", "cables", "power", "labor"],
      description: "High school/college sports with instant replay",
      weight: 12
    },
    {
      type: "Concert/Festival Livestream",
      complexity: "professional",
      cameras: 6,
      typicalCategories: ["video", "audio", "signal", "comms", "cables", "power", "labor"],
      description: "Live music broadcast with audience coverage",
      weight: 10
    },
    {
      type: "Network Broadcast Production",
      complexity: "broadcast",
      cameras: 8,
      typicalCategories: ["video", "audio", "signal", "comms", "rigging", "cables", "power", "labor"],
      description: "Truck-style setup with full redundancy and engineering",
      weight: 8
    },
    {
      type: "Esports Tournament Stream",
      complexity: "standard",
      cameras: 4,
      typicalCategories: ["video", "audio", "signal", "comms", "cables", "power", "labor"],
      description: "Player cams, game feeds, audience, commentary",
      weight: 10
    },
    {
      type: "House of Worship Service",
      complexity: "standard",
      cameras: 3,
      typicalCategories: ["video", "audio", "signal", "lighting", "cables", "power", "labor"],
      description: "Worship service with graphics and streaming",
      weight: 12
    },
    {
      type: "Political Debate/Town Hall",
      complexity: "professional",
      cameras: 5,
      typicalCategories: ["video", "audio", "signal", "comms", "staging", "cables", "power", "labor"],
      description: "Multi-candidate format with audience questions",
      weight: 8
    }
  ],

  // Production complexity configurations
  complexityLevels: {
    simple: {
      lineItems: [8, 15],
      attendees: [20, 150],
      streaming: "software", // OBS, Wirecast
      internet: "standard", // Single connection
      monitoring: "basic", // Program monitor only
      comms: "none", // No intercom
      graphics: "basic", // Lower thirds only
      recording: "single", // One recording path
      redundancy: false
    },
    standard: {
      lineItems: [15, 30],
      attendees: [100, 500],
      streaming: "hardware", // Dedicated encoder
      internet: "bonded", // Bonded cellular or dual
      monitoring: "multiview", // 4-up multiviewer
      comms: "wireless", // Wireless headsets
      graphics: "dedicated", // Graphics operator + CG
      recording: "dual", // Primary + backup
      redundancy: false
    },
    professional: {
      lineItems: [30, 50],
      attendees: [300, 2000],
      streaming: "redundant", // Dual encoder paths
      internet: "dedicated", // Fiber or bonded + backup
      monitoring: "full", // Multiviewer + scopes
      comms: "full", // Wired PL + IFB
      graphics: "full", // ProPresenter/vMix with operator
      recording: "iso", // ISO recording all cameras
      redundancy: true
    },
    broadcast: {
      lineItems: [50, 80],
      attendees: [1000, 10000],
      streaming: "enterprise", // Multi-platform with ABR
      internet: "fiber", // Dedicated fiber + backup
      monitoring: "engineering", // Full monitoring suite
      comms: "matrix", // Full intercom matrix
      graphics: "broadcast", // Ross/Vizrt graphics system
      recording: "full_iso", // All sources ISO + program
      redundancy: true
    }
  },

  // Clients focused on broadcast/streaming needs
  clients: [
    { company: "TechCorp", contact: "Jennifer Liu", email: "jliu@techcorp.com", type: "corporate" },
    { company: "StreamEvents LLC", contact: "Marcus Rodriguez", email: "marcus@streamevents.co", type: "production" },
    { company: "Austin City Schools", contact: "Dr. Sarah Williams", email: "swilliams@austinschools.edu", type: "education" },
    { company: "First Community Church", contact: "Pastor Mike Johnson", email: "pastor@firstcommunity.org", type: "worship" },
    { company: "Austin Sports Network", contact: "David Chen", email: "dchen@austinsports.tv", type: "sports" },
    { company: "Live Nation Events", contact: "Amanda Garcia", email: "agarcia@livenation.com", type: "entertainment" },
    { company: "University of Texas", contact: "Dr. Robert Taylor", email: "rtaylor@utexas.edu", type: "education" },
    { company: "Texas State Government", contact: "Commissioner Lisa Martinez", email: "lmartinez@texas.gov", type: "government" },
    { company: "Austin Convention Center", contact: "Tom Anderson", email: "tanderson@austincc.com", type: "venue" },
    { company: "Dell Technologies", contact: "Kevin Park", email: "kpark@dell.com", type: "corporate" },
    { company: "Austin FC", contact: "Maria Hernandez", email: "mhernandez@austinfc.com", type: "sports" },
    { company: "SXSW", contact: "Emily Thompson", email: "ethompson@sxsw.com", type: "festival" },
    { company: "Oracle Cloud", contact: "James Wilson", email: "jwilson@oracle.com", type: "corporate" },
    { company: "Crossroads Church", contact: "Rev. Patricia Adams", email: "padams@crossroads.org", type: "worship" },
    { company: "Austin Gaming League", contact: "Tyler Brooks", email: "tbrooks@austingaming.gg", type: "esports" }
  ],

  // Venues appropriate for broadcast/streaming
  venues: [
    { name: "Austin Convention Center", city: "Austin", state: "TX", capacity: 5000 },
    { name: "Palmer Events Center", city: "Austin", state: "TX", capacity: 3500 },
    { name: "ACL Live at the Moody Theater", city: "Austin", state: "TX", capacity: 2750 },
    { name: "Bass Concert Hall", city: "Austin", state: "TX", capacity: 3000 },
    { name: "Dell Diamond Stadium", city: "Round Rock", state: "TX", capacity: 11000 },
    { name: "UT Darrell K Royal Stadium", city: "Austin", state: "TX", capacity: 100000 },
    { name: "Circuit of the Americas", city: "Austin", state: "TX", capacity: 120000 },
    { name: "Estes Auditorium", city: "Austin", state: "TX", capacity: 700 },
    { name: "The Long Center", city: "Austin", state: "TX", capacity: 2400 },
    { name: "Frank Erwin Center", city: "Austin", state: "TX", capacity: 16000 },
    { name: "Q2 Stadium", city: "Austin", state: "TX", capacity: 20500 },
    { name: "Paramount Theatre", city: "Austin", state: "TX", capacity: 1300 },
    { name: "Zilker Park - Great Lawn", city: "Austin", state: "TX", capacity: 10000 },
    { name: "Hotel Ballroom", city: "Austin", state: "TX", capacity: 800 },
    { name: "Corporate Headquarters", city: "Austin", state: "TX", capacity: 500 }
  ],

  // Event name patterns
  namePatterns: {
    "Single Camera Livestream": [
      "{company} Webinar Series",
      "{company} Virtual Town Hall",
      "{company} Online Panel Discussion",
      "Live Q&A with {company}"
    ],
    "3-Camera Conference Livestream": [
      "{company} Annual Conference {year}",
      "{company} Summit {year}",
      "Virtual Conference - {company}",
      "{company} Hybrid Event"
    ],
    "Multi-Camera Corporate Event": [
      "{company} Product Launch",
      "{company} Investor Day {year}",
      "{company} Town Hall Meeting",
      "{company} Leadership Summit"
    ],
    "5-Camera Livestream Production": [
      "{company} Awards Gala",
      "{company} Annual Meeting {year}",
      "The {company} Show",
      "{company} Premiere Event"
    ],
    "Sports Broadcast": [
      "High School Championship Game",
      "College Basketball Tournament",
      "{company} vs Rival Matchup",
      "Friday Night Football Live"
    ],
    "Concert/Festival Livestream": [
      "{company} Music Festival {year}",
      "Live from {venue}",
      "{company} Concert Series",
      "Austin City Limits Recording"
    ],
    "Network Broadcast Production": [
      "State of the State Address",
      "{company} National Broadcast",
      "Championship Series Finals",
      "Presidential Debate"
    ],
    "Esports Tournament Stream": [
      "{company} Championship Finals",
      "Austin Gaming Tournament",
      "League of Legends Regional",
      "{company} Invitational"
    ],
    "House of Worship Service": [
      "{company} Sunday Service",
      "Easter Service - {company}",
      "Christmas Eve Broadcast",
      "{company} Weekly Livestream"
    ],
    "Political Debate/Town Hall": [
      "Mayoral Candidate Debate",
      "{company} Town Hall Forum",
      "City Council Debate",
      "Gubernatorial Town Hall"
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

const categoryOrder = ['video', 'audio', 'signal', 'comms', 'lighting', 'rigging', 'staging', 'decor', 'cables', 'power', 'labor', 'other'];

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
  const patterns = broadcastData.namePatterns[eventType.type] || ["{company} Event"];
  let pattern = randomChoice(patterns);

  const year = new Date().getFullYear();
  const venue = randomChoice(broadcastData.venues);

  pattern = pattern
    .replace('{company}', client.company)
    .replace('{year}', year.toString())
    .replace('{venue}', venue.name);

  return pattern;
}

/**
 * Build equipment package based on broadcast logic
 * This demonstrates the LOGIC of how broadcast systems work together
 */
function buildBroadcastPackage(eventType, complexity) {
  const lineItems = [];
  const config = broadcastData.complexityLevels[complexity];

  // ============ VIDEO CHAIN ============
  // Cameras (number defined by event type)
  const numCameras = eventType.cameras;
  const cameraType = complexity === 'simple' ? 'PTZ Optics 30X NDI Camera' :
                     complexity === 'standard' ? 'Sony BRC-H900 HD PTZ Camera System' :
                     complexity === 'professional' ? 'Sony HXC-100 HD Broadcast Camera Kit' :
                     'Sony HXC-100 HD Broadcast Camera Kit';

  const camera = equipmentDb.video.cameras.find(c => c.name.includes(cameraType.split(' ')[0]));
  if (camera) {
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1000, 9999)}`,
      category: 'video',
      description: camera.name,
      quantity: numCameras,
      unitPrice: camera.dailyRate,
      total: numCameras * camera.dailyRate
    });

    // Camera support for professional/broadcast
    if (complexity !== 'simple') {
      const tripod = equipmentDb.video.camera_support.find(t => t.name.includes('Tripod'));
      if (tripod) {
        lineItems.push({
          id: `item-${Date.now()}-${randomInt(1001, 9999)}`,
          category: 'video',
          description: tripod.name,
          quantity: numCameras,
          unitPrice: tripod.dailyRate,
          total: numCameras * tripod.dailyRate
        });
      }
    }

    // PTZ controllers for PTZ cameras
    if (cameraType.includes('PTZ')) {
      const controller = equipmentDb.video.camera_support.find(c => c.name.includes('Controller'));
      if (controller) {
        lineItems.push({
          id: `item-${Date.now()}-${randomInt(1002, 9999)}`,
          category: 'video',
          description: controller.name,
          quantity: 1,
          unitPrice: controller.dailyRate,
          total: controller.dailyRate
        });
      }
    }
  }

  // Video Switcher (matched to camera count)
  const switcherType = numCameras <= 2 ? 'ATEM Mini' :
                       numCameras <= 4 ? 'ATEM 1 M/E' :
                       numCameras <= 8 ? 'ATEM 2 M/E' :
                       'Carbonite';

  const switcher = equipmentDb.video.switchers.find(s => s.name.includes(switcherType));
  if (switcher) {
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1003, 9999)}`,
      category: 'video',
      description: switcher.name,
      quantity: 1,
      unitPrice: switcher.dailyRate,
      total: switcher.dailyRate
    });
  }

  // Streaming Encoder
  const encoderType = config.streaming === 'software' ? null : // No hardware for software streaming
                      config.streaming === 'hardware' ? 'Teradek VidiU' :
                      config.streaming === 'redundant' ? 'Teradek Cube 755' :
                      'LiveU LU600';

  if (encoderType) {
    const encoder = equipmentDb.video.streaming.find(e => e.name.includes(encoderType.split(' ')[0]));
    if (encoder) {
      const encoderQty = config.streaming === 'redundant' ? 2 : 1;
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1004, 9999)}`,
        category: 'video',
        description: encoder.name,
        quantity: encoderQty,
        unitPrice: encoder.dailyRate,
        total: encoderQty * encoder.dailyRate
      });
    }
  }

  // Recording
  if (config.recording === 'dual' || config.recording === 'iso') {
    const recorder = equipmentDb.video.recording.find(r => r.name.includes('HyperDeck'));
    if (recorder) {
      const recorderQty = config.recording === 'iso' ? numCameras + 1 : 2;
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1005, 9999)}`,
        category: 'video',
        description: recorder.name,
        quantity: recorderQty,
        unitPrice: recorder.dailyRate,
        total: recorderQty * recorder.dailyRate
      });
    }
  }

  // Graphics/Playback Computer
  if (config.graphics !== 'basic') {
    const computer = equipmentDb.video.playback.find(p => p.name.includes('MacBook Pro'));
    if (computer) {
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1006, 9999)}`,
        category: 'video',
        description: computer.name + ' (ProPresenter/Graphics)',
        quantity: 1,
        unitPrice: computer.dailyRate,
        total: computer.dailyRate
      });
    }
  }

  // Monitoring
  if (config.monitoring === 'multiview' || config.monitoring === 'full' || config.monitoring === 'engineering') {
    // Multiviewer for camera feeds
    const monitors = complexity === 'simple' ? 1 :
                     complexity === 'standard' ? 2 :
                     complexity === 'professional' ? 3 : 4;

    const monitor = equipmentDb.video.monitors_displays.find(m => m.name.includes('43"') || m.name.includes('55"'));
    if (monitor) {
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1007, 9999)}`,
        category: 'video',
        description: monitor.name + ' (Production Monitor)',
        quantity: monitors,
        unitPrice: monitor.dailyRate,
        total: monitors * monitor.dailyRate
      });
    }

    // Confidence monitors for talent
    const confidenceMonitor = equipmentDb.video.monitors_displays.find(m => m.name.includes('Confidence'));
    if (confidenceMonitor && complexity !== 'simple') {
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1008, 9999)}`,
        category: 'video',
        description: confidenceMonitor.name,
        quantity: 2,
        unitPrice: confidenceMonitor.dailyRate,
        total: 2 * confidenceMonitor.dailyRate
      });
    }
  }

  // ============ SIGNAL PROCESSING ============
  // Converters (for camera to switcher matching)
  if (complexity !== 'simple') {
    const converter = equipmentDb.signal.converters.find(c => c.name.includes('Decimator'));
    if (converter) {
      const converterQty = Math.ceil(numCameras / 2);
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1009, 9999)}`,
        category: 'signal',
        description: converter.name,
        quantity: converterQty,
        unitPrice: converter.dailyRate,
        total: converterQty * converter.dailyRate
      });
    }

    // Distribution for monitors
    const da = equipmentDb.signal.distribution.find(d => d.name.includes('SDI 1x8'));
    if (da) {
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1010, 9999)}`,
        category: 'signal',
        description: da.name,
        quantity: 1,
        unitPrice: da.dailyRate,
        total: da.dailyRate
      });
    }
  }

  // ============ AUDIO CHAIN ============
  // Broadcast audio mixer
  const mixerType = complexity === 'simple' ? 'X32' :
                    complexity === 'standard' ? 'QL1' :
                    'QL5';

  const mixer = equipmentDb.audio.consoles.find(m => m.name.includes(mixerType));
  if (mixer) {
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1011, 9999)}`,
      category: 'audio',
      description: mixer.name + ' (Broadcast Mix)',
      quantity: 1,
      unitPrice: mixer.dailyRate,
      total: mixer.dailyRate
    });
  }

  // Wireless microphones (based on event needs)
  const numWireless = complexity === 'simple' ? 2 :
                      complexity === 'standard' ? 4 :
                      complexity === 'professional' ? 6 : 8;

  const wirelessMic = equipmentDb.audio.wireless_microphones.find(w => w.name.includes('ULXD'));
  if (wirelessMic) {
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1012, 9999)}`,
      category: 'audio',
      description: wirelessMic.name,
      quantity: numWireless,
      unitPrice: wirelessMic.dailyRate,
      total: numWireless * wirelessMic.dailyRate
    });
  }

  // Wireless lavs for panel/presenters
  if (complexity !== 'simple') {
    const wirelessLav = equipmentDb.audio.wireless_lavaliers.find(w => w.name.includes('ULXD'));
    if (wirelessLav) {
      const numLavs = complexity === 'standard' ? 3 : complexity === 'professional' ? 6 : 10;
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1013, 9999)}`,
        category: 'audio',
        description: wirelessLav.name,
        quantity: numLavs,
        unitPrice: wirelessLav.dailyRate,
        total: numLavs * wirelessLav.dailyRate
      });
    }
  }

  // DI boxes for program audio feeds
  const diBox = equipmentDb.audio.di_boxes.find(d => d.name.includes('Radial'));
  if (diBox) {
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1014, 9999)}`,
      category: 'audio',
      description: diBox.name + ' (Program Feed)',
      quantity: 4,
      unitPrice: diBox.dailyRate,
      total: 4 * diBox.dailyRate
    });
  }

  // ============ COMMUNICATIONS ============
  if (config.comms !== 'none') {
    if (config.comms === 'wireless') {
      const intercom = equipmentDb.comms.intercom.find(i => i.name.includes('HME DX210'));
      if (intercom) {
        lineItems.push({
          id: `item-${Date.now()}-${randomInt(1015, 9999)}`,
          category: 'comms',
          description: intercom.name,
          quantity: 1,
          unitPrice: intercom.dailyRate,
          total: intercom.dailyRate
        });
      }
    } else if (config.comms === 'full' || config.comms === 'matrix') {
      const intercom = equipmentDb.comms.intercom.find(i => i.name.includes('FreeSpeak'));
      if (intercom) {
        lineItems.push({
          id: `item-${Date.now()}-${randomInt(1016, 9999)}`,
          category: 'comms',
          description: intercom.name,
          quantity: 1,
          unitPrice: intercom.dailyRate,
          total: intercom.dailyRate
        });
      }

      // IFB for talent
      const ifbTx = equipmentDb.comms.ifb.find(i => i.name.includes('Transmitter'));
      const ifbRx = equipmentDb.comms.ifb.find(i => i.name.includes('Receiver'));
      if (ifbTx && ifbRx) {
        lineItems.push({
          id: `item-${Date.now()}-${randomInt(1017, 9999)}`,
          category: 'comms',
          description: ifbTx.name,
          quantity: 1,
          unitPrice: ifbTx.dailyRate,
          total: ifbTx.dailyRate
        });
        lineItems.push({
          id: `item-${Date.now()}-${randomInt(1018, 9999)}`,
          category: 'comms',
          description: ifbRx.name,
          quantity: 3,
          unitPrice: ifbRx.dailyRate,
          total: 3 * ifbRx.dailyRate
        });
      }
    }

    // Cue lights for talent
    if (complexity !== 'simple') {
      const cueLight = equipmentDb.comms.cue_lights.find(c => c.name.includes('Perfect Cue'));
      if (cueLight) {
        lineItems.push({
          id: `item-${Date.now()}-${randomInt(1019, 9999)}`,
          category: 'comms',
          description: cueLight.name,
          quantity: 2,
          unitPrice: cueLight.dailyRate,
          total: 2 * cueLight.dailyRate
        });
      }
    }
  }

  // ============ CABLES ============
  // SDI cables for cameras (matched to camera count and cable type)
  const sdiCable100 = equipmentDb.cables.video_sdi.find(c => c.name.includes('100\''));
  if (sdiCable100) {
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1020, 9999)}`,
      category: 'cables',
      description: sdiCable100.name + ' (Camera Feeds)',
      quantity: numCameras * 2,
      unitPrice: sdiCable100.dailyRate,
      total: numCameras * 2 * sdiCable100.dailyRate
    });
  }

  // HDMI cables for monitors
  const hdmiCable25 = equipmentDb.cables.video_hdmi.find(c => c.name.includes('25\''));
  if (hdmiCable25) {
    const hdmiQty = complexity === 'simple' ? 2 : complexity === 'standard' ? 4 : 6;
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1021, 9999)}`,
      category: 'cables',
      description: hdmiCable25.name,
      quantity: hdmiQty,
      unitPrice: hdmiCable25.dailyRate,
      total: hdmiQty * hdmiCable25.dailyRate
    });
  }

  // XLR audio cables
  const xlrCable50 = equipmentDb.cables.audio_xlr.find(c => c.name.includes('50\''));
  if (xlrCable50) {
    const xlrQty = numWireless + 8;
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1022, 9999)}`,
      category: 'cables',
      description: xlrCable50.name,
      quantity: xlrQty,
      unitPrice: xlrCable50.dailyRate,
      total: xlrQty * xlrCable50.dailyRate
    });
  }

  // Network cables for streaming/control
  const cat6Cable100 = equipmentDb.cables.network.find(c => c.name.includes('100\''));
  if (cat6Cable100) {
    const netQty = complexity === 'simple' ? 2 : complexity === 'standard' ? 4 : 8;
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1023, 9999)}`,
      category: 'cables',
      description: cat6Cable100.name + ' (Network/Control)',
      quantity: netQty,
      unitPrice: cat6Cable100.dailyRate,
      total: netQty * cat6Cable100.dailyRate
    });
  }

  // ============ POWER ============
  // Power distribution
  const powerDistro = equipmentDb.power.distros.find(p => p.name.includes('Bento Box'));
  if (powerDistro) {
    const distroQty = complexity === 'simple' ? 1 : complexity === 'standard' ? 2 : 3;
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1024, 9999)}`,
      category: 'power',
      description: powerDistro.name,
      quantity: distroQty,
      unitPrice: powerDistro.dailyRate,
      total: distroQty * powerDistro.dailyRate
    });
  }

  // Power cables
  const powerCable50 = equipmentDb.power['110v'].find(p => p.name.includes('50\''));
  if (powerCable50) {
    const powerQty = complexity === 'simple' ? 8 : complexity === 'standard' ? 15 : 25;
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1025, 9999)}`,
      category: 'power',
      description: powerCable50.name,
      quantity: powerQty,
      unitPrice: powerCable50.dailyRate,
      total: powerQty * powerCable50.dailyRate
    });
  }

  // Cable protection
  const cableRamp = equipmentDb.power.accessories.find(a => a.name.includes('Guard Dog'));
  if (cableRamp) {
    const rampQty = complexity === 'simple' ? 2 : complexity === 'standard' ? 4 : 8;
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1026, 9999)}`,
      category: 'power',
      description: cableRamp.name,
      quantity: rampQty,
      unitPrice: cableRamp.dailyRate,
      total: rampQty * cableRamp.dailyRate
    });
  }

  // ============ LABOR ============
  // Technical Director / Director
  if (complexity !== 'simple') {
    const td = equipmentDb.labor.management.find(l => l.name.includes('Technical Director'));
    if (td) {
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1027, 9999)}`,
        category: 'labor',
        description: td.name + ' (Live Switching)',
        quantity: 1,
        unitPrice: td.dailyRate,
        total: td.dailyRate
      });
    }
  }

  // Camera Operators
  if (complexity !== 'simple' && !cameraType.includes('PTZ')) {
    const camOp = equipmentDb.labor.video.find(l => l.name.includes('Camera Operator'));
    if (camOp) {
      const numOps = complexity === 'standard' ? Math.min(2, numCameras) :
                     complexity === 'professional' ? Math.min(4, numCameras) :
                     numCameras;
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1028, 9999)}`,
        category: 'labor',
        description: camOp.name,
        quantity: numOps,
        unitPrice: camOp.dailyRate,
        total: numOps * camOp.dailyRate
      });
    }
  }

  // Graphics Operator
  if (config.graphics === 'dedicated' || config.graphics === 'full' || config.graphics === 'broadcast') {
    const graphicsOp = equipmentDb.labor.video.find(l => l.name.includes('Graphics Operator'));
    if (graphicsOp) {
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1029, 9999)}`,
        category: 'labor',
        description: graphicsOp.name,
        quantity: 1,
        unitPrice: graphicsOp.dailyRate,
        total: graphicsOp.dailyRate
      });
    }
  }

  // Video Engineer
  if (complexity === 'professional' || complexity === 'broadcast') {
    const videoEng = equipmentDb.labor.video.find(l => l.name.includes('Video Engineer'));
    if (videoEng) {
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1030, 9999)}`,
        category: 'labor',
        description: videoEng.name + ' (CCU/Shading)',
        quantity: 1,
        unitPrice: videoEng.dailyRate,
        total: videoEng.dailyRate
      });
    }
  }

  // Broadcast Audio Mixer
  if (complexity !== 'simple') {
    const audioMixer = equipmentDb.labor.audio.find(l => l.name.includes('Broadcast Audio'));
    if (audioMixer) {
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1031, 9999)}`,
        category: 'labor',
        description: audioMixer.name,
        quantity: 1,
        unitPrice: audioMixer.dailyRate,
        total: audioMixer.dailyRate
      });
    }
  }

  // Streaming/Playback Tech
  const playbackTech = equipmentDb.labor.video.find(l => l.name.includes('Playback'));
  if (playbackTech) {
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1032, 9999)}`,
      category: 'labor',
      description: playbackTech.name + ' (Streaming/Recording)',
      quantity: 1,
      unitPrice: playbackTech.dailyRate,
      total: playbackTech.dailyRate
    });
  }

  // A2/Utility Audio
  if (complexity === 'professional' || complexity === 'broadcast') {
    const a2 = equipmentDb.labor.audio.find(l => l.name.includes('Audio Technician A2'));
    if (a2) {
      lineItems.push({
        id: `item-${Date.now()}-${randomInt(1033, 9999)}`,
        category: 'labor',
        description: a2.name + ' (Utility/Mics)',
        quantity: 1,
        unitPrice: a2.dailyRate,
        total: a2.dailyRate
      });
    }
  }

  // General Techs for setup/strike
  const generalTech = equipmentDb.labor.general.find(l => l.name.includes('General Technician'));
  if (generalTech) {
    const numTechs = complexity === 'simple' ? 1 :
                     complexity === 'standard' ? 2 :
                     complexity === 'professional' ? 3 : 4;
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1034, 9999)}`,
      category: 'labor',
      description: generalTech.name + ' (Setup/Strike)',
      quantity: numTechs,
      unitPrice: generalTech.dailyRate,
      total: numTechs * generalTech.dailyRate
    });
  }

  // ============ OTHER SUPPORT ============
  // Trucking
  const truck = equipmentDb.other.trucking.find(t => t.name.includes('24\' Box'));
  if (truck && complexity !== 'simple') {
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1035, 9999)}`,
      category: 'other',
      description: truck.name,
      quantity: 1,
      unitPrice: truck.dailyRate,
      total: truck.dailyRate
    });
  }

  // Consumables
  const consumables = equipmentDb.other.consumables.find(c => c.name.includes('Console/Show Tape'));
  if (consumables) {
    lineItems.push({
      id: `item-${Date.now()}-${randomInt(1036, 9999)}`,
      category: 'other',
      description: consumables.name,
      quantity: 1,
      unitPrice: consumables.dailyRate,
      total: consumables.dailyRate
    });
  }

  return lineItems;
}

function generateBroadcastQuote(index) {
  const eventType = weightedRandomChoice(broadcastData.eventTypes);
  const complexity = eventType.complexity;
  const config = broadcastData.complexityLevels[complexity];
  const client = randomChoice(broadcastData.clients);
  const venue = randomChoice(broadcastData.venues);

  // Generate event dates
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + randomInt(14, 120));

  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - randomInt(0, 45));

  const expiresDate = new Date(createdDate);
  expiresDate.setDate(expiresDate.getDate() + 30);

  const eventName = generateEventName(eventType, client);
  const lineItems = buildBroadcastPackage(eventType, complexity);
  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  const statuses = ['draft', 'pending_review', 'sent', 'accepted'];
  const status = randomChoice(statuses);

  return {
    id: `BC-${String(index + 1).padStart(4, '0')}`,
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
    notes: `Production: ${eventType.cameras} cameras, ${config.streaming} streaming, ${config.recording} recording`,
    attendees: randomInt(config.attendees[0], config.attendees[1]),
    createdAt: createdDate.toISOString(),
    updatedAt: createdDate.toISOString(),
    expiresAt: expiresDate.toISOString(),
    complexity: complexity,
    cameras: eventType.cameras
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
  doc.text('Broadcast & Livestream Production', margin, yPos + 11);

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
  doc.text(quote.clientCompany, margin, yPos);
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
  doc.text(`Viewers: ${quote.attendees.toLocaleString()}`, margin + colWidth * 2, yPos);

  yPos += 12;

  // Production notes
  if (quote.notes) {
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'italic');
    doc.text(quote.notes, margin, yPos);
    yPos += 8;
  }

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

  // ============ BROADCAST NOTES ============
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = margin + 10;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('Production Notes', margin, yPos);

  yPos += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);

  const notes = [
    'Includes full production crew and technical support.',
    'Internet connectivity verification required 48 hours prior.',
    'Client must provide streaming platform credentials.',
    'Backup recording included for all camera feeds.',
    'Same-day highlights package available upon request.',
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
    'Final payment due 7 days before event date.',
    `Quote valid for 30 days (expires ${new Date(quote.expiresAt).toLocaleDateString()}).`,
    'Pre-production meeting included (virtual or on-site).',
    'Equipment subject to availability at time of booking.',
  ];

  terms.forEach(term => {
    doc.text(`• ${term}`, margin + 3, yPos);
    yPos += 4;
  });

  // ============ FOOTER ============
  const footerY = pageHeight - 10;
  doc.setFontSize(7);
  doc.setTextColor(...lightGray);
  doc.text('QMAV - Professional Broadcast & Livestream Production', pageWidth / 2, footerY, { align: 'center' });

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
  console.log('  QMAV Broadcast & Livestream Quote Generator');
  console.log('  Generating 15 AI-training-quality quotes...');
  console.log('='.repeat(60));
  console.log('');

  const quotes = [];
  const stats = {
    simple: 0,
    standard: 0,
    professional: 0,
    broadcast: 0,
    totalLineItems: 0,
    totalValue: 0,
    eventTypes: {},
    totalCameras: 0
  };

  // Generate 15 broadcast quotes
  for (let i = 0; i < 15; i++) {
    const quote = generateBroadcastQuote(i);
    quotes.push(quote);

    // Track stats
    stats[quote.complexity]++;
    stats.totalLineItems += quote.lineItems.length;
    stats.totalValue += quote.totalAmount;
    stats.totalCameras += quote.cameras;
    stats.eventTypes[quote.eventType] = (stats.eventTypes[quote.eventType] || 0) + 1;

    // Generate PDF
    const doc = generateQuotePDF(quote);
    const filename = `Broadcast-${quote.id}-${quote.eventType.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
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
  console.log('  Production Complexity Distribution:');
  console.log(`    Simple (1-2 cam, software):     ${stats.simple}`);
  console.log(`    Standard (3-4 cam, hardware):   ${stats.standard}`);
  console.log(`    Professional (5-6 cam, ISO):    ${stats.professional}`);
  console.log(`    Broadcast (8+ cam, truck):      ${stats.broadcast}`);
  console.log('');
  console.log('  Event Type Breakdown:');
  Object.entries(stats.eventTypes).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`    ${type}: ${count}`);
  });
  console.log('');
  console.log(`  Total cameras deployed:       ${stats.totalCameras}`);
  console.log(`  Total line items generated:   ${stats.totalLineItems.toLocaleString()}`);
  console.log(`  Total quote value:            $${stats.totalValue.toLocaleString()}`);
  console.log(`  Average items per quote:      ${Math.round(stats.totalLineItems / 15)}`);
  console.log(`  Average quote value:          $${Math.round(stats.totalValue / 15).toLocaleString()}`);
  console.log('');
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log('');

  // Save quotes JSON
  const quotesJsonPath = path.join(OUTPUT_DIR, 'broadcast-quotes-data.json');
  fs.writeFileSync(quotesJsonPath, JSON.stringify(quotes, null, 2));
  console.log(`  Quotes data saved to: ${quotesJsonPath}`);
  console.log('');
  console.log('  Done! That was a broadcast-level production effort. Time for a smoke break. 🎬🚬');
  console.log('');
}

main().catch(console.error);
