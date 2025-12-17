const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', '..', 'docs', 'mock-quotes', 'gala-awards', 'gala-quotes-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Analyze first quote
const quote = data[0];
console.log('='.repeat(70));
console.log('GALA QUOTE EQUIPMENT CHAIN ANALYSIS');
console.log('='.repeat(70));
console.log('');
console.log('Event:', quote.eventName);
console.log('Type:', quote.eventType);
console.log('Size:', quote.size);
console.log('Attendees:', quote.attendees);
console.log('Total Value:', '$' + quote.totalAmount.toLocaleString());
console.log('Total Line Items:', quote.lineItems.length);
console.log('');
console.log('EQUIPMENT CHAIN LOGIC VERIFICATION:');
console.log('');

// Group by category
const byCategory = {};
quote.lineItems.forEach(item => {
  if (!byCategory[item.category]) byCategory[item.category] = [];
  byCategory[item.category].push(item);
});

// Check video chain
console.log('1. VIDEO CHAIN (Screens + IMAG + Playback):');
const screens = byCategory.video?.filter(i => i.description.includes('Screen') || i.description.includes('LED Panel'));
const projectors = byCategory.video?.filter(i => i.description.includes('Projector'));
const cameras = byCategory.video?.filter(i => i.description.includes('Camera'));
const switcher = byCategory.video?.filter(i => i.description.includes('Switcher'));
const playback = byCategory.video?.filter(i => i.description.includes('Laptop') || i.description.includes('MacBook'));
console.log('  Screens:', screens?.length || 0);
screens?.forEach(s => console.log('    -', s.description, 'x' + s.quantity));
console.log('  Projectors:', projectors?.length || 0);
projectors?.forEach(p => console.log('    -', p.description, 'x' + p.quantity));
console.log('  Cameras:', cameras?.reduce((sum, c) => sum + c.quantity, 0) || 0);
cameras?.forEach(c => console.log('    -', c.description, 'x' + c.quantity));
console.log('  Switcher:', switcher?.[0]?.description || 'none');
console.log('  Playback:', playback?.length || 0);
playback?.forEach(p => console.log('    -', p.description));
console.log('');

// Check podium setup
console.log('2. PODIUM SYSTEM (Teleprompter + Confidence + Audio):');
const lectern = quote.lineItems.find(i => i.description.includes('Lectern'));
const gooseneck = byCategory.audio?.filter(i => i.description.includes('Gooseneck'));
const confidence = byCategory.video?.filter(i => i.description.includes('Monitor') && !i.description.includes('Stage'));
console.log('  Lectern:', lectern?.description || 'none');
console.log('  Gooseneck Mics:', gooseneck?.reduce((sum, g) => sum + g.quantity, 0) || 0);
console.log('  Confidence Monitor:', confidence?.length || 0);
console.log('');

// Check audio chain
console.log('3. AUDIO SYSTEM (Console + Speakers + Wireless):');
const audioConsole = byCategory.audio?.filter(i => i.description.includes('Console'));
const speakers = byCategory.audio?.filter(i => i.description.includes('Speaker') || i.description.includes('Array'));
const subs = byCategory.audio?.filter(i => i.description.includes('Subwoofer'));
const wireless = byCategory.audio?.filter(i => i.description.includes('Wireless') || i.description.includes('Bodypack'));
console.log('  Console:', audioConsole?.[0]?.description || 'none');
console.log('  Main Speakers:', speakers?.length || 0);
speakers?.forEach(s => console.log('    -', s.description, 'x' + s.quantity));
console.log('  Subwoofers:', subs?.reduce((sum, s) => sum + s.quantity, 0) || 0);
console.log('  Wireless Systems:', wireless?.length || 0);
wireless?.forEach(w => console.log('    -', w.description, 'x' + w.quantity));
console.log('');

// Check lighting
console.log('4. LIGHTING (Theatrical + Followspot):');
const lightConsole = byCategory.lighting?.filter(i => i.description.includes('Console'));
const movers = byCategory.lighting?.filter(i => i.description.includes('Moving') || i.description.includes('Wash'));
const followspot = byCategory.lighting?.filter(i => i.description.includes('Followspot'));
console.log('  Console:', lightConsole?.[0]?.description || 'none');
console.log('  Moving Lights:', movers?.reduce((sum, m) => sum + m.quantity, 0) || 0);
console.log('  Followspots:', followspot?.reduce((sum, f) => sum + f.quantity, 0) || 0);
console.log('');

// Check comms
console.log('5. COMMUNICATIONS (Show Caller + Crew):');
const comms = byCategory.comms || [];
const intercom = comms.find(c => c.description.includes('FreeSpeak') || c.description.includes('HelixNet'));
const headsets = comms.filter(c => c.description.includes('Headset'));
const walkies = comms.find(c => c.description.includes('Radio'));
console.log('  Intercom System:', intercom?.description || 'none');
console.log('  Headsets:', headsets?.reduce((sum, h) => sum + h.quantity, 0) || 0);
console.log('  Walkies:', walkies?.quantity || 0);
console.log('');

// Check labor
console.log('6. LABOR (Complete Crew):');
const labor = byCategory.labor || [];
const totalLaborCost = labor.reduce((sum, l) => sum + l.total, 0);
labor.forEach(l => {
  console.log('  -', l.description, 'x' + l.quantity, '($' + l.total.toLocaleString() + ')');
});
console.log('  Total Labor Cost: $' + totalLaborCost.toLocaleString());
console.log('');

// Summary
console.log('='.repeat(70));
console.log('SUMMARY - PROFESSIONAL GALA QUOTE LOGIC:');
console.log('='.repeat(70));
console.log('Equipment Value: $' + (quote.totalAmount - totalLaborCost).toLocaleString());
console.log('Labor Value: $' + totalLaborCost.toLocaleString());
console.log('Total Quote: $' + quote.totalAmount.toLocaleString());
console.log('Labor %:', Math.round((totalLaborCost / quote.totalAmount) * 100) + '%');
console.log('');
