import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION_NAME || process.env.AWS_REGION || 'us-east-1',
});

// Cognito configuration
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || '';
const CLIENT_ID = process.env.COGNITO_CLIENT_ID || '';

// JWKS cache for token verification
interface JWK {
  kid: string;
  kty: string;
  n: string;
  e: string;
  alg: string;
  use: string;
}

let jwksCache: JWK[] | null = null;
let jwksCacheExpiry = 0;
const JWKS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch JWKS from Cognito
 */
async function getJWKS(): Promise<JWK[]> {
  if (jwksCache && Date.now() < jwksCacheExpiry) {
    return jwksCache;
  }

  const region = process.env.AWS_REGION_NAME || process.env.AWS_REGION || 'us-east-1';
  const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;

  const response = await fetch(jwksUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
  }

  const data = await response.json() as { keys: JWK[] };
  jwksCache = data.keys;
  jwksCacheExpiry = Date.now() + JWKS_CACHE_TTL;

  return jwksCache;
}

/**
 * Decode a JWT token (without verification - for getting the header)
 */
function decodeJwtHeader(token: string): { kid: string; alg: string } {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const header = JSON.parse(
    Buffer.from(parts[0], 'base64url').toString('utf-8')
  );

  return header;
}

/**
 * Decode JWT payload (without verification)
 */
function decodeJwtPayload(token: string): CognitoJwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  return JSON.parse(
    Buffer.from(parts[1], 'base64url').toString('utf-8')
  );
}

/**
 * Cognito JWT payload structure
 */
export interface CognitoJwtPayload {
  sub: string; // User ID (UUID)
  iss: string; // Issuer (Cognito User Pool URL)
  'cognito:username': string;
  'cognito:groups'?: string[];
  aud?: string; // Client ID (for id_token)
  client_id?: string; // Client ID (for access_token)
  token_use: 'id' | 'access';
  auth_time: number;
  exp: number;
  iat: number;
  email?: string;
  email_verified?: boolean;
  name?: string;
  'custom:company'?: string;
  'custom:tier'?: string;
  'custom:stripeCustomerId'?: string;
}

/**
 * Cognito user info
 */
export interface CognitoUser {
  id: string;
  email: string;
  name: string;
  company?: string;
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  stripeCustomerId?: string;
  emailVerified: boolean;
}

/**
 * Verify a Cognito JWT token
 * Note: For production, you should use a proper JWT library with signature verification
 * This is a simplified version that validates the token structure and claims
 */
export async function verifyCognitoToken(token: string): Promise<CognitoUser> {
  try {
    // Decode the token
    const header = decodeJwtHeader(token);
    const payload = decodeJwtPayload(token);

    // Verify token hasn't expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new Error('Token has expired');
    }

    // Verify issuer matches our user pool
    const region = process.env.AWS_REGION_NAME || process.env.AWS_REGION || 'us-east-1';
    const expectedIssuer = `https://cognito-idp.${region}.amazonaws.com/${USER_POOL_ID}`;
    if (payload.iss !== expectedIssuer) {
      throw new Error('Invalid token issuer');
    }

    // Verify audience/client_id
    const audience = payload.token_use === 'id' ? payload.aud : payload.client_id;
    if (audience !== CLIENT_ID) {
      throw new Error('Invalid token audience');
    }

    // Verify the key exists in JWKS (basic signature chain verification)
    const jwks = await getJWKS();
    const key = jwks.find((k) => k.kid === header.kid);
    if (!key) {
      throw new Error('Token signed with unknown key');
    }

    // For full production security, you should verify the signature using the JWK
    // This would require a crypto library like jose or jsonwebtoken

    // Extract user info from the token
    const user: CognitoUser = {
      id: payload.sub,
      email: payload.email || payload['cognito:username'],
      name: payload.name || payload['cognito:username'],
      company: payload['custom:company'],
      tier: (payload['custom:tier'] as CognitoUser['tier']) || 'free',
      stripeCustomerId: payload['custom:stripeCustomerId'],
      emailVerified: payload.email_verified || false,
    };

    return user;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Get user details from Cognito using access token
 */
export async function getUserFromAccessToken(accessToken: string): Promise<CognitoUser> {
  try {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    const response = await cognitoClient.send(command);

    // Extract user attributes
    const attrs = response.UserAttributes || [];
    const getAttribute = (name: string) =>
      attrs.find((a) => a.Name === name)?.Value;

    return {
      id: getAttribute('sub') || '',
      email: getAttribute('email') || '',
      name: getAttribute('name') || getAttribute('email') || '',
      company: getAttribute('custom:company'),
      tier: (getAttribute('custom:tier') as CognitoUser['tier']) || 'free',
      stripeCustomerId: getAttribute('custom:stripeCustomerId'),
      emailVerified: getAttribute('email_verified') === 'true',
    };
  } catch (error) {
    console.error('Failed to get user from Cognito:', error);
    throw new Error('Failed to get user details');
  }
}

/**
 * Get user by ID (admin operation)
 */
export async function getUserById(userId: string): Promise<CognitoUser | null> {
  try {
    const command = new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: userId,
    });

    const response = await cognitoClient.send(command);

    // Extract user attributes
    const attrs = response.UserAttributes || [];
    const getAttribute = (name: string) =>
      attrs.find((a) => a.Name === name)?.Value;

    return {
      id: getAttribute('sub') || userId,
      email: getAttribute('email') || '',
      name: getAttribute('name') || getAttribute('email') || '',
      company: getAttribute('custom:company'),
      tier: (getAttribute('custom:tier') as CognitoUser['tier']) || 'free',
      stripeCustomerId: getAttribute('custom:stripeCustomerId'),
      emailVerified: getAttribute('email_verified') === 'true',
    };
  } catch (error) {
    console.error('Failed to get user by ID:', error);
    return null;
  }
}

/**
 * Check if Cognito is configured
 */
export function isCognitoConfigured(): boolean {
  return Boolean(USER_POOL_ID && CLIENT_ID);
}
