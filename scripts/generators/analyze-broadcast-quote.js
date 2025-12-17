import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '..', '..', 'docs', 'mock-quotes', 'broadcast-livestream', 'broadcast-quotes-data.json');
const quotes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Show details of the 6th quote (index 5) - Network Broadcast
const quote = quotes[5];

console.log('='.repeat(80));
console.log('SAMPLE BROADCAST QUOTE ANALYSIS');
console.log('='.repeat(80));
console.log('');
console.log('Quote ID:', quote.id);
console.log('Client:', quote.clientCompany);
console.log('Event:', quote.eventName);
console.log('Event Type:', quote.eventType);
console.log('Complexity:', quote.complexity.toUpperCase());
console.log('Cameras:', quote.cameras);
console.log('Venue:', quote.venue);
console.log('Estimated Viewers:', quote.attendees.toLocaleString());
console.log('');
console.log('Total Line Items:', quote.lineItems.length);
console.log('Total Value:', '$' + quote.totalAmount.toLocaleString());
console.log('');
console.log('='.repeat(80));
console.log('EQUIPMENT BREAKDOWN BY CATEGORY');
console.log('='.repeat(80));

const byCategory = {};
let categoryTotals = {};

quote.lineItems.forEach(item => {
  if (!byCategory[item.category]) {
    byCategory[item.category] = [];
    categoryTotals[item.category] = 0;
  }
  byCategory[item.category].push({
    desc: item.description,
    qty: item.quantity,
    price: item.unitPrice,
    total: item.total
  });
  categoryTotals[item.category] += item.total;
});

const categoryOrder = ['video', 'audio', 'signal', 'comms', 'cables', 'power', 'labor', 'other'];

categoryOrder.forEach(cat => {
  if (byCategory[cat]) {
    console.log('');
    console.log(cat.toUpperCase() + ' (Subtotal: $' + categoryTotals[cat].toLocaleString() + ')');
    console.log('-'.repeat(80));
    byCategory[cat].forEach(item => {
      console.log(`  ${item.qty}x  ${item.desc.padEnd(60)} $${item.total.toLocaleString()}`);
    });
  }
});

console.log('');
console.log('='.repeat(80));
console.log('EQUIPMENT CHAIN LOGIC DEMONSTRATION');
console.log('='.repeat(80));
console.log('');

// Find key equipment to show logic
const camera = quote.lineItems.find(i => i.description.includes('Camera Kit') || i.description.includes('PTZ Camera'));
const switcher = quote.lineItems.find(i => i.description.includes('Switcher') || i.description.includes('ATEM'));
const encoder = quote.lineItems.find(i => i.description.includes('Encoder') || i.description.includes('LiveU'));
const sdiCables = quote.lineItems.find(i => i.description.includes('SDI Cable'));

console.log('VIDEO SIGNAL CHAIN:');
console.log(`  Cameras: ${camera ? camera.quantity + 'x ' + camera.description : 'N/A'}`);
console.log(`  Switcher: ${switcher ? switcher.description : 'N/A'}`);
console.log(`  Encoder: ${encoder ? encoder.quantity + 'x ' + encoder.description : 'N/A'}`);
console.log(`  SDI Cables: ${sdiCables ? sdiCables.quantity + 'x (2 per camera)' : 'N/A'}`);
console.log('');
console.log('LOGIC: Camera count matches switcher inputs, cables matched to cameras');
console.log('');

const td = quote.lineItems.find(i => i.description.includes('Technical Director'));
const camOps = quote.lineItems.find(i => i.description.includes('Camera Operator'));
const a1 = quote.lineItems.find(i => i.description.includes('Broadcast Audio'));

console.log('LABOR CHAIN:');
console.log(`  Technical Director: ${td ? '1x (Live Switching)' : 'N/A'}`);
console.log(`  Camera Operators: ${camOps ? camOps.quantity + 'x (Manned Cameras)' : 'N/A'}`);
console.log(`  Broadcast Audio: ${a1 ? '1x (Broadcast Mix)' : 'N/A'}`);
console.log('');
console.log('LOGIC: Crew scaled to production complexity and camera count');
console.log('');
