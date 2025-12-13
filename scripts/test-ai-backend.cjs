/**
 * Test script for QuoteMyAV AI Backend
 * Tests the n8n webhook with sample quote data including quantities
 */

const http = require('http');

// Use production webhook (not -test) when workflow is activated
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/quotes-ai';

// Sample quote with line items including quantity
const testQuote = {
  message: `Create a new quote for the following event:

Client: Acme Productions
Event: Annual Gala 2025
Date: March 15, 2025
Venue: Grand Ballroom, Chicago

Equipment needed:
- 4x QSC K12.2 Speakers @ $150/day each
- 2x Shure SM58 Microphones @ $25/day each
- 1x Allen & Heath SQ-5 Mixer @ $300/day
- 8x LED Par Cans @ $40/day each
- 2x Moving Head Lights @ $125/day each

Labor:
- 2 technicians for setup (4 hours @ $50/hr each)
- 1 technician for show (8 hours @ $50/hr)

Please calculate the total and create a properly formatted quote.`
};

// Alternative: JSON data embedded in message
const testQuoteStructured = {
  message: `Create a quote from this JSON data:

${JSON.stringify({
    clientName: 'TechCorp Industries',
    eventName: 'Product Launch 2025',
    eventDate: '2025-04-20',
    venue: 'Convention Center, Dallas',
    lineItems: [
      { category: 'video', description: '12ft LED Wall (per panel)', quantity: 24, unitPrice: 200, total: 4800 },
      { category: 'video', description: 'PTZ Camera 4K', quantity: 3, unitPrice: 350, total: 1050 },
      { category: 'audio', description: 'Line Array Speaker', quantity: 8, unitPrice: 275, total: 2200 },
      { category: 'audio', description: 'Wireless Lavalier Mic', quantity: 4, unitPrice: 75, total: 300 },
      { category: 'staging', description: '4x8 Stage Deck', quantity: 12, unitPrice: 85, total: 1020 },
      { category: 'labor', description: 'Lead Technician (10 hrs)', quantity: 2, unitPrice: 600, total: 1200 },
      { category: 'labor', description: 'Stage Hand (8 hrs)', quantity: 4, unitPrice: 320, total: 1280 }
    ],
    totalAmount: 11850
  }, null, 2)}

Save this quote to the database.`
};

async function testWebhook(payload, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${description}`);
  console.log('='.repeat(60));
  console.log('Payload:', JSON.stringify(payload, null, 2).substring(0, 500) + '...');

  return new Promise((resolve) => {
    const url = new URL(N8N_WEBHOOK_URL);
    const data = JSON.stringify(payload);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`\nStatus: ${res.statusCode}`);
        try {
          const json = JSON.parse(body);
          console.log('Response:', JSON.stringify(json, null, 2));
        } catch {
          console.log('Response:', body.substring(0, 1000));
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('Error:', err.message);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('QuoteMyAV AI Backend Test');
  console.log('Webhook URL:', N8N_WEBHOOK_URL);
  console.log('\nMake sure n8n is running and the workflow is active!\n');

  // Test 1: Natural language request
  await testWebhook(testQuote, 'Natural Language Quote Request');

  // Test 2: Structured data
  await testWebhook(testQuoteStructured, 'Structured Quote Data with Quantities');

  console.log('\n' + '='.repeat(60));
  console.log('Tests complete!');
}

main().catch(console.error);
