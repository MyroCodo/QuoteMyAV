const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const N8N_URL = 'http://localhost:5678';
const N8N_USERNAME = 'pmnicolasm@gmail.com';
const N8N_PASSWORD = 'TacoJohn_69';

const WORKFLOW_PATH = path.join(__dirname, '..', 'n8n', 'workflows', 'quotes-crud.json');

async function setupN8n() {
  console.log('Starting n8n setup with Playwright...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down for visibility
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Navigate to n8n
    console.log('Navigating to n8n...');
    await page.goto(N8N_URL, { waitUntil: 'networkidle' });

    // Check if we need to log in
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    if (currentUrl.includes('/signin') || currentUrl.includes('/setup')) {
      console.log('Login page detected, signing in...');

      // Wait for form to load
      await page.waitForTimeout(2000);

      // Try multiple selectors for email input
      const emailSelectors = [
        'input[type="email"]',
        'input[name="email"]',
        'input[autocomplete="email"]',
        'input[placeholder*="Email"]',
        'input[placeholder*="email"]',
        '#email',
        '[data-test-id="email-input"]'
      ];

      let emailInput = null;
      for (const selector of emailSelectors) {
        const el = page.locator(selector).first();
        if (await el.count() > 0) {
          emailInput = el;
          console.log('Found email input with selector:', selector);
          break;
        }
      }

      if (emailInput) {
        await emailInput.fill(N8N_USERNAME);
      } else {
        // Fallback: fill any visible input
        const inputs = page.locator('input:visible');
        const count = await inputs.count();
        console.log('Found', count, 'visible inputs');
        if (count >= 1) await inputs.nth(0).fill(N8N_USERNAME);
      }

      // Find password input
      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.count() > 0) {
        await passwordInput.fill(N8N_PASSWORD);
      }

      await page.waitForTimeout(500);

      // Try multiple button selectors
      const buttonSelectors = [
        'button[type="submit"]',
        'button:has-text("Sign in")',
        'button:has-text("Sign In")',
        'button:has-text("Login")',
        'button:has-text("Log in")',
        '[data-test-id="signin-submit"]',
        '.n8n-button--primary',
        'button.primary'
      ];

      let clicked = false;
      for (const selector of buttonSelectors) {
        const btn = page.locator(selector).first();
        if (await btn.count() > 0) {
          console.log('Clicking button with selector:', selector);
          await btn.click();
          clicked = true;
          break;
        }
      }

      if (!clicked) {
        // Fallback: press Enter
        console.log('No button found, pressing Enter...');
        await page.keyboard.press('Enter');
      }

      // Wait for navigation
      await page.waitForTimeout(3000);
      await page.waitForURL('**/workflow**', { timeout: 15000 }).catch(() => {
        console.log('URL check:', page.url());
      });

      console.log('Login attempt complete. Current URL:', page.url());
    }

    // Step 2: Import the workflow
    console.log('Importing workflow...');

    // Navigate to workflows page
    await page.goto(`${N8N_URL}/home/workflows`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check if workflow already exists
    const existingWorkflow = await page.locator('text=QuoteMyAV - Quotes CRUD').count();

    if (existingWorkflow > 0) {
      console.log('Workflow already exists! Skipping import.');
    } else {
      console.log('Importing workflow...');

      // Read workflow JSON
      const workflowData = fs.readFileSync(WORKFLOW_PATH, 'utf8');

      // Method 1: Create new workflow and paste via Ctrl+V
      // First go to new workflow canvas
      await page.goto(`${N8N_URL}/workflow/new`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // n8n supports importing workflow by pasting JSON onto the canvas
      // Copy workflow JSON to clipboard via browser context
      await context.grantPermissions(['clipboard-write', 'clipboard-read']);
      await page.evaluate((json) => navigator.clipboard.writeText(json), workflowData);
      console.log('Workflow JSON copied to clipboard');

      // Click on canvas area to focus it
      const canvas = page.locator('.vue-flow, .workflow-canvas, [data-test-id="canvas"]').first();
      if (await canvas.count() > 0) {
        await canvas.click();
      } else {
        // Just click in the middle of the page
        await page.mouse.click(500, 400);
      }
      await page.waitForTimeout(500);

      // Paste (Ctrl+V)
      await page.keyboard.press('Control+v');
      console.log('Pasted workflow');
      await page.waitForTimeout(2000);

      // The workflow name is already set from the JSON, just save it
      await page.keyboard.press('Control+s');
      await page.waitForTimeout(3000);
      console.log('Workflow saved');

      // Check if import succeeded
      await page.goto(`${N8N_URL}/home/workflows`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      const imported = await page.locator('text=QuoteMyAV').count();
      if (imported > 0) {
        console.log('Workflow imported successfully!');
      } else {
        console.log('Paste import may have failed. Trying API import with session...');

        // Try API import with browser session
        const importResult = await page.evaluate(async (workflow) => {
          try {
            const data = JSON.parse(workflow);
            const res = await fetch('/rest/workflows', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(data)
            });
            return { status: res.status, ok: res.ok, data: await res.json().catch(() => null) };
          } catch (e) {
            return { error: e.message };
          }
        }, workflowData);

        console.log('API import result:', JSON.stringify(importResult));
      }
    }

    // Step 3: Check/Add AWS Credentials
    console.log('Checking AWS credentials...');
    await page.goto(`${N8N_URL}/credentials`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const awsCredExists = await page.locator('text=AWS').count();

    if (awsCredExists > 0) {
      console.log('AWS credentials already configured!');
    } else {
      console.log('AWS credentials not found. You will need to add them manually.');
      console.log('Navigate to: Settings > Credentials > Add Credential > AWS');

      // Open add credential dialog
      const addCredBtn = page.locator('button:has-text("Add Credential")').first();
      if (await addCredBtn.count() > 0) {
        await addCredBtn.click();
        await page.waitForTimeout(1000);

        // Search for AWS
        const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
        if (await searchInput.count() > 0) {
          await searchInput.fill('AWS');
          await page.waitForTimeout(500);

          // Click AWS option
          const awsOption = page.locator('text=AWS').first();
          if (await awsOption.count() > 0) {
            await awsOption.click();
            console.log('AWS credential form opened. Please fill in your Access Key ID and Secret Access Key.');
          }
        }
      }
    }

    // Step 4: Navigate back to workflow and activate
    console.log('Navigating to workflow to activate...');
    await page.goto(`${N8N_URL}/workflows`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Click on the workflow
    const workflowLink = page.locator('text=QuoteMyAV - Quotes CRUD').first();
    if (await workflowLink.count() > 0) {
      await workflowLink.click();
      await page.waitForTimeout(2000);

      // Look for activate toggle
      const activateToggle = page.locator('[data-test-id="workflow-activate-button"], .el-switch').first();
      if (await activateToggle.count() > 0) {
        const isActive = await activateToggle.getAttribute('class');
        if (!isActive?.includes('is-checked') && !isActive?.includes('active')) {
          console.log('Activating workflow...');
          await activateToggle.click();
          await page.waitForTimeout(2000);
        } else {
          console.log('Workflow already active!');
        }
      }
    }

    console.log('\n=== Setup Complete! ===');
    console.log('n8n is running at:', N8N_URL);
    console.log('Workflow imported: QuoteMyAV - Quotes CRUD');
    console.log('\nNext steps:');
    console.log('1. Add AWS credentials if not already done');
    console.log('2. Update VITE_N8N_WEBHOOK_URL in your .env file');

    // Keep browser open for manual inspection
    console.log('\nBrowser will stay open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('Error during setup:', error.message);
    console.log('Taking screenshot of current state...');
    await page.screenshot({ path: 'n8n-setup-error.png' });
  } finally {
    await browser.close();
  }
}

setupN8n().catch(console.error);
