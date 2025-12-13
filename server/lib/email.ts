import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      }
    : undefined, // Falls back to IAM role if no explicit credentials
});

// Verified sender email (must be verified in SES)
const SENDER_EMAIL = process.env.SES_SENDER_EMAIL || 'quotes@quotemyav.com';
const SENDER_NAME = process.env.SES_SENDER_NAME || 'QuoteMyAV';

export interface QuoteEmailData {
  quoteId: string;
  clientName: string;
  clientEmail: string;
  eventName: string;
  eventDate: string;
  venue: string;
  totalAmount: number;
  lineItems: Array<{
    category: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  expiresAt: string;
  customMessage?: string;
  viewQuoteUrl: string;
}

/**
 * Generate HTML email template for quote
 */
function generateQuoteEmailHtml(data: QuoteEmailData): string {
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(data.totalAmount);

  const formattedDate = new Date(data.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const expiryDate = new Date(data.expiresAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Group line items by category
  const itemsByCategory = data.lineItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof data.lineItems>
  );

  const lineItemsHtml = Object.entries(itemsByCategory)
    .map(
      ([category, items]) => `
      <tr>
        <td colspan="4" style="padding: 12px 0 8px; font-weight: 600; text-transform: uppercase; font-size: 12px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">
          ${category}
        </td>
      </tr>
      ${items
        .map(
          (item) => `
        <tr>
          <td style="padding: 8px 0; color: #374151;">${item.description}</td>
          <td style="padding: 8px 0; text-align: center; color: #6b7280;">${item.quantity}</td>
          <td style="padding: 8px 0; text-align: right; color: #6b7280;">$${item.unitPrice.toLocaleString()}</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 500; color: #374151;">$${item.total.toLocaleString()}</td>
        </tr>
      `
        )
        .join('')}
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote for ${data.eventName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); border-radius: 12px 12px 0 0; padding: 32px;">
          <tr>
            <td style="text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">QuoteMyAV</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Professional AV Equipment Quote</p>
            </td>
          </tr>
        </table>

        <!-- Main Content -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <tr>
            <td>
              <!-- Greeting -->
              <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">
                Hi ${data.clientName},
              </p>

              ${
                data.customMessage
                  ? `
              <p style="margin: 0 0 24px; font-size: 16px; color: #374151; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #0d9488;">
                ${data.customMessage}
              </p>
              `
                  : ''
              }

              <p style="margin: 0 0 24px; font-size: 16px; color: #374151;">
                Please find your equipment quote below for <strong>${data.eventName}</strong>.
              </p>

              <!-- Event Details Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600;">Event Details</p>
                    <p style="margin: 0 0 4px; font-size: 16px; color: #111827; font-weight: 600;">${data.eventName}</p>
                    <p style="margin: 0 0 4px; font-size: 14px; color: #4b5563;">${formattedDate}</p>
                    <p style="margin: 0; font-size: 14px; color: #4b5563;">${data.venue}</p>
                  </td>
                </tr>
              </table>

              <!-- Quote Summary -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); border-radius: 8px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9);">Quote Total</p>
                          <p style="margin: 4px 0 0; font-size: 32px; font-weight: 700; color: #ffffff;">${formattedTotal}</p>
                        </td>
                        <td style="text-align: right; vertical-align: bottom;">
                          <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.8);">Quote #${data.quoteId}</p>
                          <p style="margin: 4px 0 0; font-size: 12px; color: rgba(255,255,255,0.8);">Valid until ${expiryDate}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Line Items -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <thead>
                  <tr>
                    <th style="padding: 12px 0; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Item</th>
                    <th style="padding: 12px 0; text-align: center; font-size: 12px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="padding: 12px 0; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Rate</th>
                    <th style="padding: 12px 0; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${lineItemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 16px 0 8px; text-align: right; font-weight: 600; font-size: 16px; color: #374151; border-top: 2px solid #e5e7eb;">Total:</td>
                    <td style="padding: 16px 0 8px; text-align: right; font-weight: 700; font-size: 18px; color: #0d9488; border-top: 2px solid #e5e7eb;">${formattedTotal}</td>
                  </tr>
                </tfoot>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${data.viewQuoteUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      View Full Quote
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Footer Note -->
              <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center;">
                Questions? Simply reply to this email and we'll get back to you promptly.
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 24px;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af;">
                Powered by QuoteMyAV - Professional AV Quoting Made Simple
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                This quote was sent to ${data.clientEmail}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of email
 */
function generateQuoteEmailText(data: QuoteEmailData): string {
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(data.totalAmount);

  const formattedDate = new Date(data.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lineItemsText = data.lineItems
    .map((item) => `  - ${item.description}: ${item.quantity} x $${item.unitPrice} = $${item.total}`)
    .join('\n');

  return `
QUOTEMYAV - Professional AV Equipment Quote

Hi ${data.clientName},

${data.customMessage ? data.customMessage + '\n\n' : ''}Please find your equipment quote below for ${data.eventName}.

EVENT DETAILS
${data.eventName}
${formattedDate}
${data.venue}

QUOTE #${data.quoteId}
Total: ${formattedTotal}

LINE ITEMS
${lineItemsText}

---
Total: ${formattedTotal}

View your full quote online: ${data.viewQuoteUrl}

Questions? Simply reply to this email and we'll get back to you promptly.

---
Powered by QuoteMyAV
This quote was sent to ${data.clientEmail}
  `.trim();
}

/**
 * Send quote email via AWS SES
 */
export async function sendQuoteEmail(data: QuoteEmailData): Promise<{ messageId: string }> {
  const htmlBody = generateQuoteEmailHtml(data);
  const textBody = generateQuoteEmailText(data);

  const command = new SendEmailCommand({
    Source: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    Destination: {
      ToAddresses: [data.clientEmail],
    },
    Message: {
      Subject: {
        Data: `Quote for ${data.eventName} - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.totalAmount)}`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
        Text: {
          Data: textBody,
          Charset: 'UTF-8',
        },
      },
    },
    ReplyToAddresses: [SENDER_EMAIL],
  });

  const response = await sesClient.send(command);

  if (!response.MessageId) {
    throw new Error('SES did not return a message ID');
  }

  return { messageId: response.MessageId };
}

/**
 * Check if SES is configured
 */
export function isSESConfigured(): boolean {
  return Boolean(process.env.AWS_ACCESS_KEY_ID || process.env.AWS_REGION);
}
