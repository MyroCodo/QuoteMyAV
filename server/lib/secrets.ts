import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

// Initialize Secrets Manager client
const secretsClient = new SecretsManagerClient({
  region: process.env.AWS_REGION_NAME || process.env.AWS_REGION || 'us-east-1',
});

// Cache for secrets to avoid repeated API calls
const secretsCache: Map<string, { value: string; expiresAt: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get a secret from AWS Secrets Manager
 * Caches the result for 5 minutes to reduce API calls
 */
export async function getSecret(secretArn: string): Promise<string> {
  // Check cache first
  const cached = secretsCache.get(secretArn);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  // Fetch from Secrets Manager
  const command = new GetSecretValueCommand({ SecretId: secretArn });
  const response = await secretsClient.send(command);

  if (!response.SecretString) {
    throw new Error(`Secret ${secretArn} has no string value`);
  }

  // Cache the result
  secretsCache.set(secretArn, {
    value: response.SecretString,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return response.SecretString;
}

/**
 * Get parsed JSON secret
 */
export async function getSecretJson<T = Record<string, unknown>>(
  secretArn: string
): Promise<T> {
  const secretString = await getSecret(secretArn);
  return JSON.parse(secretString) as T;
}

/**
 * Get database credentials from Secrets Manager
 */
export async function getDatabaseCredentials(): Promise<{
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}> {
  const secretArn = process.env.DATABASE_SECRET_ARN;
  if (!secretArn) {
    throw new Error('DATABASE_SECRET_ARN environment variable not set');
  }

  const secret = await getSecretJson<{
    host?: string;
    port?: number;
    dbname?: string;
    username: string;
    password: string;
  }>(secretArn);

  return {
    host: secret.host || process.env.DATABASE_HOST || 'localhost',
    port: secret.port || parseInt(process.env.DATABASE_PORT || '5432'),
    database: secret.dbname || process.env.DATABASE_NAME || 'quotemyav',
    username: secret.username,
    password: secret.password,
  };
}

/**
 * Get Anthropic API key from Secrets Manager
 */
export async function getAnthropicApiKey(): Promise<string> {
  const secretArn = process.env.ANTHROPIC_SECRET_ARN;
  if (!secretArn) {
    // Fall back to environment variable for local development
    const envKey = process.env.ANTHROPIC_API_KEY;
    if (envKey) return envKey;
    throw new Error('ANTHROPIC_SECRET_ARN environment variable not set');
  }

  const secret = await getSecretJson<{ apiKey: string }>(secretArn);
  return secret.apiKey;
}

/**
 * Get Stripe API keys from Secrets Manager
 */
export async function getStripeCredentials(): Promise<{
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
}> {
  const secretArn = process.env.STRIPE_SECRET_ARN;
  if (!secretArn) {
    // Fall back to environment variables for local development
    return {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    };
  }

  return await getSecretJson<{
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  }>(secretArn);
}

/**
 * Clear the secrets cache (useful for testing or forced refresh)
 */
export function clearSecretsCache(): void {
  secretsCache.clear();
}
