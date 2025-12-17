/**
 * Product Launch & Activations Quote Generator
 * Generates 15 AI-training-quality quotes demonstrating professional AV quote building logic
 * for product launches, reveals, and brand activations
 *
 * Run with: node scripts/generators/product-launch.js
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
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'docs', 'mock-quotes', 'product-launch');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Product Launch-specific data
const launchData = {
  eventTypes: [
    {
      type: "Product Launch - Tech",
      scales: ["small", "medium", "large", "mega"],
      typicalCategories: ["video", "audio", "lighting", "staging", "signal", "cables", "power", "labor"],
      weight: 25
    },
    {
      type: "Product Reveal - Consumer Electronics",
      scales: ["medium", "large"],
      typicalCategories: ["video", "lighting", "audio", "signal", "staging", "cables", "power", "labor"],
      weight: 20
    },
    {
      type: "Automotive Unveiling",
      scales: ["large", "mega"],
      typicalCategories: ["lighting", "video", "audio", "staging", "rigging", "signal", "cables", "power", "labor"],
      weight: 15
    },
    {
      type: "Software Launch Event",
      scales: ["small", "medium", "large"],
      typicalCategories: ["video", "audio", "signal", "lighting", "staging", "cables", "power", "labor"],
      weight: 18
    },
    {
      type: "Fashion Collection Reveal",
      scales: ["medium", "large"],
      typicalCategories: ["lighting", "audio", "video", "staging", "rigging", "cables", "power", "labor"],
      weight: 12
    },
    {
      type: "Brand Activation",
      scales: ["small", "medium", "large"],
      typicalCategories: ["video", "audio", "lighting", "staging", "signal", "cables", "power", "labor"],
      weight: 15
    },
    {
      type: "Gaming Console Launch",
      scales: ["large", "mega"],
      typicalCategories: ["video", "audio", "lighting", "signal", "staging", "rigging", "cables", "power", "comms", "labor"],
      weight: 10
    },
    {
      type: "Mobile Device Keynote",
      scales: ["medium", "large", "mega"],
      typicalCategories: ["video", "audio", "lighting", "signal", "staging", "cables", "power", "comms", "labor"],
      weight: 20
    },
    {
      type: "Luxury Brand Activation",
      scales: ["medium", "large"],
      typicalCategories: ["lighting", "video", "audio", "staging", "decor", "cables", "power", "labor"],
      weight: 10
    },
    {
      type: "Beverage/Food Product Launch",
      scales: ["small", "medium"],
      typicalCategories: ["audio", "video", "lighting", "staging", "cables", "power", "labor"],
      weight: 8
    }
  ],

  // Scaling formula based on event scale
  eventScales: {
    small: {
      attendees: [50, 150],
      lineItems: [20, 40],
      laborDays: [2, 4],
      cameras: [0, 2],
      screens: [1, 2],
      ledPanels: [0, 12],
      speakers: [2, 6],
      movingLights: [0, 4],
      rehearsalHours: [2, 4]
    },
    medium: {
      attendees: [100, 300],
      lineItems: [35, 65],
      laborDays: [3, 6],
      cameras: [2, 4],
      screens: [2, 4],
      ledPanels: [12, 36],
      speakers: [6, 12],
      movingLights: [4, 12],
      rehearsalHours: [4, 8]
    },
    large: {
      attendees: [300, 1000],
      lineItems: [60, 100],
      laborDays: [5, 10],
      cameras: [3, 6],
      screens: [3, 6],
      ledPanels: [36, 80],
      speakers: [8, 16],
      movingLights: [12, 24],
      rehearsalHours: [8, 16]
    },
    mega: {
      attendees: [1000, 5000],
      lineItems: [90, 140],
      laborDays: [8, 15],
      cameras: [6, 10],
      screens: [4, 8],
      ledPanels: [80, 150],
      speakers: [16, 32],
      movingLights: [24, 48],
      rehearsalHours: [16, 32]
    }
  },

  // Brand tiers affecting equipment choices
  brandTiers: [
    { tier: "premium", brands: ["Apple", "Tesla", "Rolex", "Louis Vuitton", "Porsche"], equipmentMultiplier: 1.4, weight: 15 },
    { tier: "enterprise", brands: ["Microsoft", "Oracle", "Adobe", "SAP", "Salesforce"], equipmentMultiplier: 1.2, weight: 25 },
    { tier: "consumer", brands: ["Samsung", "Sony", "Nintendo", "Adidas", "Coca-Cola"], equipmentMultiplier: 1.0, weight: 35 },
    { tier: "startup", brands: ["TechStart", "InnovateCo", "NextGen Labs", "Fusion Tech", "Elevate"], equipmentMultiplier: 0.8, weight: 25 }
  ],

  // Product categories
  productCategories: [
    "Smartphone", "Laptop", "Gaming Console", "Smart Watch", "Headphones",
    "Electric Vehicle", "Luxury Watch", "Fashion Line", "Beverage", "Food Product",
    "Software Platform", "AI Assistant", "VR Headset", "Drone", "Smart Home Device",
    "Fitness Tracker", "Camera", "Speaker System", "Tablet", "Gaming Peripheral"
  ],

  // Launch venues
  venues: [
    { name: "Austin Convention Center", city: "Austin", state: "TX", capacity: 2500, tier: "large" },
    { name: "The Contemporary Austin", city: "Austin", state: "TX", capacity: 300, tier: "medium" },
    { name: "Circuit of The Americas - Tower", city: "Austin", state: "TX", capacity: 800, tier: "large" },
    { name: "Moody Theater", city: "Austin", state: "TX", capacity: 2750, tier: "large" },
    { name: "Google Fiber Space", city: "Austin", state: "TX", capacity: 200, tier: "small" },
    { name: "The LINE Austin", city: "Austin", state: "TX", capacity: 150, tier: "small" },
    { name: "Fair Market", city: "Austin", state: "TX", capacity: 3000, tier: "large" },
    { name: "3TEN ACL Live", city: "Austin", state: "TX", capacity: 400, tier: "medium" },
    { name: "Brazos Hall", city: "Austin", state: "TX", capacity: 800, tier: "medium" },
    { name: "The Gatsby", city: "Austin", state: "TX", capacity: 350, tier: "medium" },
    { name: "Palmer Events Center", city: "Austin", state: "TX", capacity: 5000, tier: "mega" },
    { name: "Tesla Gigafactory Texas", city: "Austin", state: "TX", capacity: 15000, tier: "mega" },
    { name: "Domain NORTHSIDE", city: "Austin", state: "TX", capacity: 500, tier: "medium" },
    { name: "South Congress Hotel Ballroom", city: "Austin", state: "TX", capacity: 250, tier: "medium" },
    { name: "W Austin - Studio", city: "Austin", state: "TX", capacity: 180, tier: "small" }
  ],

  // Client companies (brands launching products)
  clients: [
    { company: "TechVision Inc", contact: "Sarah Chen", email: "sarah.chen@techvision.com", tier: "enterprise" },
    { company: "Elevate Labs", contact: "Marcus Rodriguez", email: "marcus@elevatelabs.io", tier: "startup" },
    { company: "Apex Automotive", contact: "Jennifer Walsh", email: "j.walsh@apexauto.com", tier: "premium" },
    { company: "Sonic Innovations", contact: "David Kim", email: "dkim@sonicinnovations.com", tier: "consumer" },
    { company: "Luxe Fashion Group", contact: "Isabella Moretti", email: "i.moretti@luxefashion.com", tier: "premium" },
    { company: "GameForge Studios", contact: "Tyler Jackson", email: "tyler.j@gameforge.dev", tier: "consumer" },
    { company: "NexGen Electronics", contact: "Priya Patel", email: "priya@nexgenelec.com", tier: "enterprise" },
    { company: "VitalBrew Coffee Co", contact: "Jordan Matthews", email: "jordan@vitalbrew.com", tier: "startup" },
    { company: "Infinity Wearables", contact: "Alex Thompson", email: "athompson@infinitywear.com", tier: "consumer" },
    { company: "Quantum Systems", contact: "Dr. Emily Foster", email: "e.foster@quantumsys.com", tier: "enterprise" },
    { company: "Prestige Motors", contact: "Charles Beaumont", email: "c.beaumont@prestigemotors.com", tier: "premium" },
    { company: "ByteFlow AI", contact: "Kevin Nguyen", email: "kevin@byteflow.ai", tier: "startup" },
    { company: "Aurora Home Tech", contact: "Rachel Green", email: "rgreen@aurorahome.tech", tier: "consumer" },
    { company: "Zenith Timepieces", contact: "Victoria Sterling", email: "v.sterling@zenithtimes.com", tier: "premium" },
    { company: "FusionTech Labs", contact: "Michael Barnes", email: "m.barnes@fusiontech.io", tier: "startup" }
  ],

  // Launch-specific name patterns
  namePatterns: {
    "Product Launch - Tech": [
      "{product} Launch Event",
      "Introducing {product}",
      "{company} {product} Reveal",
      "The Future is Here: {product}"
    ],
    "Product Reveal - Consumer Electronics": [
      "{product} Worldwide Reveal",
      "{company} Unveils {product}",
      "Next Generation {product}",
      "{product} Press Launch"
    ],
    "Automotive Unveiling": [
      "{product} World Premiere",
      "{company} {product} Unveiling",
      "The All-New {product}",
      "{product} Global Reveal"
    ],
    "Software Launch Event": [
      "{product} Launch Keynote",
      "Introducing {product} Platform",
      "{company} Developer Conference",
      "{product} Release Event"
    ],
    "Fashion Collection Reveal": [
      "{company} {season} Collection",
      "{product} Runway Reveal",
      "{company} Fashion Experience",
      "{season} {year} Collection Launch"
    ],
    "Brand Activation": [
      "{company} Brand Experience",
      "{product} Immersive Activation",
      "{company} Pop-Up Launch",
      "Experience {product}"
    ],
    "Gaming Console Launch": [
      "{product} Launch Event",
      "Next Gen Gaming: {product}",
      "{company} Gaming Showcase",
      "{product} Reveal & Gameplay"
    ],
    "Mobile Device Keynote": [
      "{company} Keynote {year}",
      "{product} Launch Keynote",
      "Innovation Delivered: {product}",
      "{company} Special Event"
    ],
    "Luxury Brand Activation": [
      "{company} Exclusive Preview",
      "{product} VIP Launch",
      "Luxury Redefined: {product}",
      "{company} Prestige Event"
    ],
    "Beverage/Food Product Launch": [
      "Taste the Future: {product}",
      "{company} {product} Launch",
      "Introducing {product}",
      "{product} Tasting Event"
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

function generateEventName(eventType, client, product) {
  const patterns = launchData.namePatterns[eventType.type] || ["{company} {product} Launch"];
  let pattern = randomChoice(patterns);

  const year = new Date().getFullYear();
  const seasons = ["Spring", "Summer", "Fall", "Winter"];

  pattern = pattern
    .replace('{company}', client.company.split(' ')[0])
    .replace('{product}', product)
    .replace('{year}', year.toString())
    .replace('{season}', randomChoice(seasons));

  return pattern;
}

// Product launch-specific equipment selection with logic
function buildProductLaunchPackage(eventType, scale, brandTier) {
  const scaleConfig = launchData.eventScales[scale];
  const items = [];

  // HERO PRODUCT DISPLAY (dramatic reveal)
  if (scale !== "small") {
    // Custom product display lighting
    const displayLights = randomInt(4, 8);
    items.push(...getEquipmentFromCategory('lighting', 'ellipsoidals', displayLights, 'Product display spotlights'));

    // Dramatic reveal lighting
    items.push(...getEquipmentFromCategory('lighting', 'moving_lights_profile', Math.min(4, displayLights / 2), 'Hero reveal lighting'));
  }

  // KEYNOTE PRESENTATION SYSTEM
  if (eventType.type.includes('Keynote') || eventType.type.includes('Launch') || scale === 'mega') {
    // Main presentation screens
    const screenCount = randomInt(scaleConfig.screens[0], scaleConfig.screens[1]);
    items.push(...getEquipmentFromCategory('video', 'led_walls', randomInt(24, scaleConfig.ledPanels[1]), 'Main LED wall'));
    items.push(...getEquipmentFromCategory('video', 'projectors', Math.max(1, screenCount - 1), 'Presentation projectors'));
    items.push(...getEquipmentFromCategory('video', 'screens', screenCount, 'Projection screens'));

    // Confidence monitors for presenters
    items.push(...getEquipmentFromCategory('video', 'monitors_displays', randomInt(2, 4), 'Presenter confidence monitors'));

    // Teleprompter (implied through playback system)
    items.push(...getEquipmentFromCategory('video', 'playback', 2, 'Playback and prompter system'));
  } else {
    // Smaller setups still need displays
    const screenCount = randomInt(scaleConfig.screens[0], scaleConfig.screens[1]);
    if (scaleConfig.ledPanels[1] > 0) {
      items.push(...getEquipmentFromCategory('video', 'led_walls', randomInt(scaleConfig.ledPanels[0], scaleConfig.ledPanels[1]), 'LED display'));
    } else {
      items.push(...getEquipmentFromCategory('video', 'projectors', screenCount, 'Main projectors'));
      items.push(...getEquipmentFromCategory('video', 'screens', screenCount, 'Main screens'));
    }
    items.push(...getEquipmentFromCategory('video', 'playback', 1, 'Content playback'));
  }

  // DEMO STATIONS (for interactive product demos)
  if (eventType.type.includes('Tech') || eventType.type.includes('Gaming') || eventType.type.includes('Electronics')) {
    const demoStations = scale === 'mega' ? randomInt(6, 12) : scale === 'large' ? randomInt(4, 8) : randomInt(2, 4);
    items.push(...getEquipmentFromCategory('video', 'monitors_displays', demoStations * 2, 'Demo station displays'));
    items.push(...getEquipmentFromCategory('audio', 'speakers_powered', demoStations, 'Demo station audio'));
  }

  // MEDIA AREA (press coverage)
  if (scale === 'large' || scale === 'mega') {
    items.push(...getEquipmentFromCategory('audio', 'press_mult', 1, 'Press mult box'));
    items.push(...getEquipmentFromCategory('staging', 'stage_decks', randomInt(2, 4), 'Media riser'));
    items.push(...getEquipmentFromCategory('video', 'cameras', randomInt(2, 4), 'B-roll cameras'));
  }

  // BROADCAST/STREAMING (for larger launches)
  if (scale === 'mega' || (scale === 'large' && Math.random() > 0.4)) {
    items.push(...getEquipmentFromCategory('video', 'cameras', randomInt(scaleConfig.cameras[0], scaleConfig.cameras[1]), 'Broadcast cameras'));
    items.push(...getEquipmentFromCategory('video', 'switchers', 1, 'Video switcher'));
    items.push(...getEquipmentFromCategory('video', 'streaming', 1, 'Streaming encoder'));
    items.push(...getEquipmentFromCategory('video', 'recording', 1, 'Recording system'));
  }

  // AUDIO SYSTEM (scaled)
  const speakerCount = randomInt(scaleConfig.speakers[0], scaleConfig.speakers[1]);
  if (brandTier === 'premium' || scale === 'mega') {
    items.push(...getEquipmentFromCategory('audio', 'speakers_line_array', 1, 'Main PA system'));
  } else {
    items.push(...getEquipmentFromCategory('audio', 'speakers_powered', speakerCount, 'Main speakers'));
  }
  items.push(...getEquipmentFromCategory('audio', 'subwoofers', Math.ceil(speakerCount / 3), 'Subwoofers'));

  // Presenter microphones
  const presenterCount = scale === 'mega' ? randomInt(3, 6) : scale === 'large' ? randomInt(2, 4) : randomInt(1, 2);
  items.push(...getEquipmentFromCategory('audio', 'wireless_lavaliers', presenterCount, 'Presenter wireless lavs'));
  items.push(...getEquipmentFromCategory('audio', 'wireless_microphones', Math.max(1, presenterCount - 1), 'Handheld mics'));

  // Audio console
  if (scale === 'large' || scale === 'mega') {
    items.push(...getEquipmentFromCategory('audio', 'consoles', 1, 'Audio console'));
    items.push(...getEquipmentFromCategory('audio', 'snakes', 1, 'Digital stage box'));
  } else {
    items.push(...getEquipmentFromCategory('audio', 'consoles', 1, 'Audio mixer'));
  }

  // LIGHTING DESIGN (theatrical for reveals)
  const movingLightCount = randomInt(scaleConfig.movingLights[0], scaleConfig.movingLights[1]);
  if (movingLightCount > 0) {
    items.push(...getEquipmentFromCategory('lighting', 'moving_lights_profile', Math.ceil(movingLightCount / 2), 'Moving profile lights'));
    items.push(...getEquipmentFromCategory('lighting', 'moving_lights_wash', Math.floor(movingLightCount / 2), 'Moving wash lights'));
  }

  // Stage wash
  items.push(...getEquipmentFromCategory('lighting', 'led_pars', randomInt(8, 20), 'Stage wash lighting'));

  // Lighting console
  if (movingLightCount > 0) {
    items.push(...getEquipmentFromCategory('lighting', 'consoles', 1, 'Lighting console'));
  }

  // Haze for lighting effects
  if (scale !== 'small') {
    items.push(...getEquipmentFromCategory('lighting', 'effects', 1, 'Haze machine'));
  }

  // STAGING
  if (scale !== 'small') {
    const stageSize = scale === 'mega' ? randomInt(4, 8) : scale === 'large' ? randomInt(3, 6) : randomInt(2, 4);
    items.push(...getEquipmentFromCategory('staging', 'stage_decks', stageSize, 'Stage decks'));
    items.push(...getEquipmentFromCategory('staging', 'stage_accessories', Math.ceil(stageSize / 2), 'Stage skirting'));
  }

  // Lectern for presenter
  if (eventType.type.includes('Keynote') || Math.random() > 0.5) {
    items.push(...getEquipmentFromCategory('staging', 'lecterns', 1, 'Presenter lectern'));
  }

  // SIGNAL/SWITCHING
  items.push(...getEquipmentFromCategory('signal', 'converters', randomInt(4, 10), 'Signal converters'));
  items.push(...getEquipmentFromCategory('signal', 'distribution', randomInt(2, 6), 'Signal distribution'));
  if (scale === 'large' || scale === 'mega') {
    items.push(...getEquipmentFromCategory('signal', 'scalers', 1, 'Video processor'));
    items.push(...getEquipmentFromCategory('signal', 'matrix_routers', 1, 'Matrix router'));
  }

  // RIGGING (for larger events)
  if (scale === 'large' || scale === 'mega') {
    const trussCount = randomInt(6, 16);
    items.push(...getEquipmentFromCategory('rigging', 'truss', trussCount, 'Truss sections'));
    items.push(...getEquipmentFromCategory('rigging', 'chain_hoists', Math.ceil(trussCount / 4), 'Chain motors'));
    items.push(...getEquipmentFromCategory('rigging', 'hardware', randomInt(20, 40), 'Rigging hardware'));
  }

  // DECOR (for brand atmosphere)
  if (eventType.type.includes('Fashion') || eventType.type.includes('Luxury') || brandTier === 'premium') {
    items.push(...getEquipmentFromCategory('decor', 'pipe_drape', randomInt(6, 16), 'Drape panels'));
    items.push(...getEquipmentFromCategory('decor', 'backdrops', randomInt(1, 3), 'Custom backdrops'));
  }

  // COMMUNICATIONS (for crew)
  if (scale !== 'small') {
    items.push(...getEquipmentFromCategory('comms', 'intercom', 1, 'Crew intercom system'));
    items.push(...getEquipmentFromCategory('comms', 'walkies', randomInt(6, 12), 'Two-way radios'));
  }

  // Cue lights for talent
  if (scale === 'medium' || scale === 'large' || scale === 'mega') {
    items.push(...getEquipmentFromCategory('comms', 'cue_lights', randomInt(2, 4), 'Cue light system'));
  }

  // POWER DISTRIBUTION
  const powerDistros = scale === 'mega' ? randomInt(4, 8) : scale === 'large' ? randomInt(3, 5) : randomInt(2, 3);
  items.push(...getEquipmentFromCategory('power', 'distros', powerDistros, 'Power distribution'));
  items.push(...getEquipmentFromCategory('power', '208v', randomInt(10, 30), 'Power cables'));

  // CABLES (generous amounts)
  items.push(...getEquipmentFromCategory('cables', 'audio_xlr', randomInt(20, 50), 'XLR cables'));
  items.push(...getEquipmentFromCategory('cables', 'video_hdmi', randomInt(15, 35), 'HDMI cables'));
  items.push(...getEquipmentFromCategory('cables', 'video_sdi', randomInt(10, 25), 'SDI cables'));
  items.push(...getEquipmentFromCategory('cables', 'network', randomInt(10, 20), 'Network cables'));

  // LABOR (rehearsal-intensive for exec presentations)
  const laborDays = randomInt(scaleConfig.laborDays[0], scaleConfig.laborDays[1]);

  // Project management
  items.push(...getEquipmentFromCategory('labor', 'management', laborDays, 'Project management'));

  // Technical director
  if (scale !== 'small') {
    items.push(...getEquipmentFromCategory('labor', 'management', laborDays - 1, 'Technical director'));
  }

  // Department leads
  items.push(...getEquipmentFromCategory('labor', 'audio', laborDays, 'A1 audio lead'));
  items.push(...getEquipmentFromCategory('labor', 'video', laborDays, 'V1 video lead'));
  items.push(...getEquipmentFromCategory('labor', 'lighting', laborDays, 'L1 lighting lead'));

  // Crew technicians
  const crewCount = scale === 'mega' ? randomInt(8, 15) : scale === 'large' ? randomInt(5, 10) : randomInt(3, 6);
  items.push(...getEquipmentFromCategory('labor', 'general', laborDays * crewCount, 'Crew technicians'));

  // Camera operators (if broadcast)
  if (scaleConfig.cameras[1] > 2) {
    items.push(...getEquipmentFromCategory('labor', 'video', randomInt(2, 4), 'Camera operators'));
  }

  // Rehearsal labor (cue-to-cue)
  const rehearsalDays = Math.ceil(scaleConfig.rehearsalHours[1] / 8);
  items.push(...getEquipmentFromCategory('labor', 'general', rehearsalDays * Math.ceil(crewCount / 2), 'Rehearsal crew'));

  return items;
}

function getEquipmentFromCategory(category, subcategory, count, purpose = '') {
  const items = [];
  const categoryData = equipmentDb[category];

  if (!categoryData || count === 0) return items;

  let availableItems = [];

  // Get items from specific subcategory
  if (subcategory && categoryData[subcategory]) {
    availableItems = [...categoryData[subcategory]];
  } else {
    // Combine all subcategories
    for (const subcat of Object.values(categoryData)) {
      if (Array.isArray(subcat)) {
        availableItems.push(...subcat);
      }
    }
  }

  if (availableItems.length === 0) return items;

  // Shuffle and pick items
  availableItems = availableItems.sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(count, availableItems.length); i++) {
    const item = availableItems[i];
    const quantity = getLaunchQuantity(item.name, count, category);
    items.push({
      id: `item-${Date.now()}-${randomInt(1000, 9999)}-${i}`,
      category: category,
      description: item.name,
      quantity: quantity,
      unitPrice: item.dailyRate,
      total: quantity * item.dailyRate
    });
  }

  return items;
}

function getLaunchQuantity(itemName, targetCount, category) {
  const name = itemName.toLowerCase();

  // Single items
  if (name.includes('console') || name.includes('switcher') || name.includes('processor') ||
      name.includes('generator') || name.includes('mult') || name.includes('system') ||
      name.includes('router') || name.includes('base') || name.includes('controller')) {
    return 1;
  }

  // Labor is per day
  if (category === 'labor') {
    return 1;
  }

  // LED panels (come in multiples)
  if (name.includes('led panel') || name.includes('led wall')) {
    return targetCount || randomInt(6, 24);
  }

  // Cameras
  if (name.includes('camera')) {
    return 1;
  }

  // Lighting fixtures
  if (name.includes('moving light') || name.includes('profile') || name.includes('wash')) {
    return Math.max(1, Math.ceil(targetCount / 2));
  }

  // Cables and small hardware
  if (name.includes('cable') || name.includes('adapter') || name.includes('shackle') ||
      name.includes('clamp') || name.includes('sandbag')) {
    return randomInt(4, 12);
  }

  // Default
  return 1;
}

function generateLaunchQuote(index) {
  const eventType = weightedRandomChoice(launchData.eventTypes);
  const scale = randomChoice(eventType.scales);
  const scaleConfig = launchData.eventScales[scale];
  const client = randomChoice(launchData.clients);
  const brandTierData = launchData.brandTiers.find(bt => bt.tier === client.tier);
  const product = randomChoice(launchData.productCategories);

  // Select appropriate venue based on scale
  const suitableVenues = launchData.venues.filter(v => {
    if (scale === 'mega') return v.tier === 'mega' || v.tier === 'large';
    if (scale === 'large') return v.tier === 'large' || v.tier === 'medium';
    if (scale === 'medium') return v.tier === 'medium' || v.tier === 'small';
    return v.tier === 'small' || v.tier === 'medium';
  });
  const venue = randomChoice(suitableVenues);

  // Generate event dates (product launches are planned months ahead)
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + randomInt(60, 180));

  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - randomInt(0, 60));

  const expiresDate = new Date(createdDate);
  expiresDate.setDate(expiresDate.getDate() + 30);

  const eventName = generateEventName(eventType, client, product);

  // Build equipment package with logic
  const lineItems = buildProductLaunchPackage(eventType, scale, client.tier);

  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  // Launch quotes are typically pending or sent
  const statuses = ['pending_review', 'sent', 'accepted'];
  const status = randomChoice(statuses);

  return {
    id: `PL-${String(index + 1).padStart(4, '0')}`,
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
    venueCapacity: venue.capacity,
    status: status,
    totalAmount: totalAmount,
    lineItems: lineItems,
    notes: `${product} reveal with ${scale} production scale. Brand tier: ${client.tier}.`,
    attendees: randomInt(scaleConfig.attendees[0], scaleConfig.attendees[1]),
    createdAt: createdDate.toISOString(),
    updatedAt: createdDate.toISOString(),
    expiresAt: expiresDate.toISOString(),
    scale: scale,
    product: product,
    brandTier: client.tier
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
  const accentColor = [99, 102, 241]; // Indigo-500 (tech/launch)
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
  doc.text('Product Launch & Activation Specialists', margin, yPos + 11);

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

  // ============ LAUNCH-SPECIFIC NOTES ============
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
    'Includes full rehearsal time with executive presenters.',
    'Dedicated project manager for event coordination.',
    'Backup equipment and redundant systems included.',
    'On-site technical support throughout event.',
    'NDA and security protocols available upon request.',
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
    'Balance due 7 days before event.',
    `Quote valid for 30 days (expires ${new Date(quote.expiresAt).toLocaleDateString()}).`,
    'Equipment subject to availability at time of booking.',
    'Additional rehearsal time available at standard rates.',
  ];

  terms.forEach(term => {
    doc.text(`• ${term}`, margin + 3, yPos);
    yPos += 4;
  });

  // ============ FOOTER ============
  const footerY = pageHeight - 10;
  doc.setFontSize(7);
  doc.setTextColor(...lightGray);
  doc.text('QMAV - Launch Your Vision With Confidence', pageWidth / 2, footerY, { align: 'center' });

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
  console.log('  QMAV Product Launch Quote Generator');
  console.log('  Generating 15 AI-training-quality quotes...');
  console.log('='.repeat(60));
  console.log('');

  const quotes = [];
  const stats = {
    small: 0,
    medium: 0,
    large: 0,
    mega: 0,
    totalLineItems: 0,
    totalValue: 0,
    eventTypes: {},
    brandTiers: {}
  };

  // Generate 15 product launch quotes
  for (let i = 0; i < 15; i++) {
    const quote = generateLaunchQuote(i);
    quotes.push(quote);

    // Track stats
    stats[quote.scale]++;
    stats.totalLineItems += quote.lineItems.length;
    stats.totalValue += quote.totalAmount;
    stats.eventTypes[quote.eventType] = (stats.eventTypes[quote.eventType] || 0) + 1;
    stats.brandTiers[quote.brandTier] = (stats.brandTiers[quote.brandTier] || 0) + 1;

    // Generate PDF
    const doc = generateQuotePDF(quote);
    const filename = `ProductLaunch-${quote.id}-${quote.eventType.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
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
  console.log('  Quote Scale Distribution:');
  console.log(`    Small (50-150 attendees):    ${stats.small}`);
  console.log(`    Medium (100-300 attendees):  ${stats.medium}`);
  console.log(`    Large (300-1000 attendees):  ${stats.large}`);
  console.log(`    Mega (1000+ attendees):      ${stats.mega}`);
  console.log('');
  console.log('  Event Type Breakdown:');
  Object.entries(stats.eventTypes).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`    ${type}: ${count}`);
  });
  console.log('');
  console.log('  Brand Tier Distribution:');
  Object.entries(stats.brandTiers).forEach(([tier, count]) => {
    console.log(`    ${tier}: ${count}`);
  });
  console.log('');
  console.log(`  Total line items generated:   ${stats.totalLineItems.toLocaleString()}`);
  console.log(`  Total quote value:            $${stats.totalValue.toLocaleString()}`);
  console.log(`  Average items per quote:      ${Math.round(stats.totalLineItems / 15)}`);
  console.log(`  Average quote value:          $${Math.round(stats.totalValue / 15).toLocaleString()}`);
  console.log('');
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log('');

  // Save quotes JSON
  const quotesJsonPath = path.join(OUTPUT_DIR, 'product-launch-quotes-data.json');
  fs.writeFileSync(quotesJsonPath, JSON.stringify(quotes, null, 2));
  console.log(`  Quotes data saved to: ${quotesJsonPath}`);
  console.log('');
  console.log('  Damn, that was a big job! These product launch quotes are');
  console.log('  production-ready with proper equipment chains and logic.');
  console.log('  Gonna need a cigarette after that one.');
  console.log('');
}

main().catch(console.error);
