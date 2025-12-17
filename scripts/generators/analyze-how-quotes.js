import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const quotesPath = path.join(__dirname, '..', '..', 'docs', 'mock-quotes', 'house-of-worship', 'house-of-worship-quotes.json');
const data = JSON.parse(fs.readFileSync(quotesPath, 'utf-8'));

console.log('HOUSE OF WORSHIP EQUIPMENT SCALING LOGIC');
console.log('='.repeat(70));
console.log('');

const sizes = ['small', 'medium', 'large', 'mega'];

sizes.forEach(size => {
  const quote = data.find(q => q.sanctuarySize === size && q.eventName === 'Sunday Morning Worship Service');
  if (!quote) return;

  console.log(size.toUpperCase() + ' SANCTUARY (' + quote.attendees + ' people)');
  console.log('-'.repeat(70));
  console.log('Total: $' + quote.totalAmount.toLocaleString() + ' | Line Items: ' + quote.lineItems.length);
  console.log('');

  console.log('AUDIO CONSOLE:');
  const audioConsole = quote.lineItems.find(i => i.description.includes('Console') || i.description.includes('Mixer'));
  if (audioConsole) console.log('  ', audioConsole.description);
  console.log('');

  console.log('MAIN SPEAKERS:');
  quote.lineItems
    .filter(i => (i.description.includes('Speaker') || i.description.includes('Array')) &&
                 !i.description.includes('Monitor') &&
                 !i.description.includes('Stand'))
    .slice(0, 2)
    .forEach(i => console.log('  ', i.quantity + 'x', i.description));
  console.log('');

  console.log('STAGE MONITORS:');
  const monitors = quote.lineItems.find(i => i.description.includes('Stage Monitor'));
  if (monitors) console.log('  ', monitors.quantity + 'x', monitors.description);
  console.log('');

  console.log('WIRELESS MICS:');
  quote.lineItems
    .filter(i => i.description.includes('Wireless') ||
                 i.description.includes('ULXD') ||
                 i.description.includes('Sennheiser EW'))
    .slice(0, 3)
    .forEach(i => console.log('  ', i.quantity + 'x', i.description));
  console.log('');

  console.log('VIDEO/DISPLAYS:');
  quote.lineItems
    .filter(i => (i.description.includes('Screen') ||
                  i.description.includes('Monitor') ||
                  i.description.includes('Display') ||
                  i.description.includes('LED')) &&
                 !i.description.includes('ASUS') &&
                 !i.description.includes('43"'))
    .slice(0, 3)
    .forEach(i => console.log('  ', i.quantity + 'x', i.description));
  console.log('');
});

console.log('\n' + '='.repeat(70));
console.log('EVENT TYPE VARIATIONS');
console.log('='.repeat(70));
console.log('');

const specialEvents = [
  'Christmas Eve Service',
  'Easter Sunday Service',
  'Multi-Site Broadcast',
  'Live Recording Session'
];

specialEvents.forEach(eventName => {
  const quote = data.find(q => q.eventName === eventName);
  if (!quote) return;

  console.log(eventName.toUpperCase());
  console.log('-'.repeat(70));
  console.log('Size: ' + quote.sanctuarySize + ' | Attendees: ' + quote.attendees);
  console.log('Total: $' + quote.totalAmount.toLocaleString() + ' | Line Items: ' + quote.lineItems.length);
  console.log('');
  console.log('SPECIAL EQUIPMENT:');

  // Show streaming/recording equipment
  const special = quote.lineItems.filter(i =>
    i.description.includes('Encoder') ||
    i.description.includes('Record') ||
    i.description.includes('Broadcast') ||
    i.description.includes('LED Panel') ||
    i.description.includes('Camera Kit')
  );

  special.forEach(i => console.log('  ', i.quantity + 'x', i.description));
  console.log('');
});
