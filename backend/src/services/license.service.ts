
import crypto from 'crypto';
import os from 'os';
import fs from 'fs';
import path from 'path';

const LICENSE_SERVER_URL = process.env.LICENSE_SERVER_URL || 'https://prodkey-api.vercel.app';
const PRODUCT_API_KEY = process.env.PRODUCT_API_KEY || 'pk_GY3H9KB9AzbVnHPLBsLpJFp6-FxZZqjxuSfg_nQYR3g';
const SIGNING_PUBLIC_KEY = process.env.SIGNING_PUBLIC_KEY; // Optional in this context if not provided, but required for secure verify

const LICENSE_FILE_PATH = path.join(process.cwd(), 'license.cert');

export interface LicenseState {
  status: string;
  expiresAt?: string;
  validUntil: string;
  plan?: string;
  licenseKey?: string;
  [key: string]: any;
}

/**
 * Generates a stable unique device ID based on hostname and MAC address.
 */
export function getDeviceId(): string {
  const hostname = os.hostname();
  const networkInterfaces = os.networkInterfaces();
  
  let macAddress = '';
  for (const name of Object.keys(networkInterfaces)) {
    const iface = networkInterfaces[name];
    if (iface) {
      for (const info of iface) {
        if (!info.internal && info.mac && info.mac !== '00:00:00:00:00:00') {
          macAddress = info.mac;
          break;
        }
      }
    }
    if (macAddress) break;
  }
  
  const rawId = `${hostname}-${macAddress}`;
  return crypto.createHash('sha256').update(rawId).digest('hex');
}

/**
 * Parse base64url string to Buffer.
 */
function base64urlToBuffer(b64url: string): Buffer {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }
  return Buffer.from(b64, 'base64');
}

/**
 * Verify a signed certificate locally.
 */
export function verifyCertificateLocally(cert: string): LicenseState {
  const parts = cert.split('.');
  if (parts.length !== 2) {
    throw new Error('Malformed certificate: expected payload.signature');
  }
  
  const [b64Payload, b64Signature] = parts;
  
  if (SIGNING_PUBLIC_KEY) {
    try {
      let publicKey: crypto.KeyObject;
      // Heuristic to check if it's PEM or bare base64
      if (SIGNING_PUBLIC_KEY.includes('BEGIN PUBLIC KEY')) {
        publicKey = crypto.createPublicKey(SIGNING_PUBLIC_KEY);
      } else {
        // Assume hex or base64 DER
        publicKey = crypto.createPublicKey({
          key: Buffer.from(SIGNING_PUBLIC_KEY, /^[0-9a-fA-F]+$/.test(SIGNING_PUBLIC_KEY) ? 'hex' : 'base64'),
          format: 'der',
          type: 'spki'
        });
      }
      
      const payloadBuffer = Buffer.from(b64Payload);
      const signatureBuffer = base64urlToBuffer(b64Signature);
      
      const isVerified = crypto.verify(
        null,
        payloadBuffer,
        publicKey,
        signatureBuffer
      );
      
      if (!isVerified) {
        throw new Error('Invalid signature');
      }
    } catch (err: any) {
      throw new Error(`Signature verification failed: ${err.message}`);
    }
  }

  const payloadJson = base64urlToBuffer(b64Payload).toString('utf-8');
  let claims: LicenseState;
  try {
    claims = JSON.parse(payloadJson);
  } catch (err) {
    throw new Error('Malformed certificate payload');
  }

  return claims;
}

function saveCertificate(cert: string) {
  fs.writeFileSync(LICENSE_FILE_PATH, cert, 'utf8');
}

function loadCertificate(): string | null {
  if (fs.existsSync(LICENSE_FILE_PATH)) {
    return fs.readFileSync(LICENSE_FILE_PATH, 'utf8');
  }
  return null;
}

export function getLicenseState(): LicenseState | null {
  const cert = loadCertificate();
  if (!cert) return null;
  return verifyCertificateLocally(cert);
}

function getFetchHeaders() {
  return {
    'x-product-api-key': PRODUCT_API_KEY,
    'Content-Type': 'application/json'
  };
}

async function handleFetchError(response: Response) {
  if (!response.ok) {
    const status = response.status;
    let msg = response.statusText;
    try {
      const data = await response.json();
      msg = data.message || msg;
    } catch {
      // Ignore JSON parse error
    }
    if (status === 400) throw new Error(`Bad Request: ${msg}`);
    if (status === 401) throw new Error(`Invalid Key: ${msg}`);
    if (status === 403) throw new Error(`Forbidden: ${msg}`);
    if (status === 409) throw new Error(`Conflict: ${msg}`);
    throw new Error(`API Error (${status}): ${msg}`);
  }
}

/**
 * Activate a license key.
 */
export async function activate(licenseKey: string): Promise<string> {
  const deviceId = getDeviceId();
  try {
    const response = await fetch(`${LICENSE_SERVER_URL}/public/activate`, {
      method: 'POST',
      headers: getFetchHeaders(),
      body: JSON.stringify({ licenseKey, deviceId })
    });
    
    await handleFetchError(response);
    const data = await response.json();
    const cert = data.certificate;
    if (!cert) throw new Error('No certificate returned from activation');
    
    verifyCertificateLocally(cert);
    saveCertificate(cert);
    
    return cert;
  } catch (err) {
    throw err;
  }
}

/**
 * Validate the stored certificate online.
 */
export async function validate(): Promise<string> {
  const state = getLicenseState();
  if (!state || !state.licenseKey) {
    throw new Error('No active license found to validate.');
  }

  const deviceId = getDeviceId();
  try {
    const response = await fetch(`${LICENSE_SERVER_URL}/public/validate`, {
      method: 'POST',
      headers: getFetchHeaders(),
      body: JSON.stringify({ licenseKey: state.licenseKey, deviceId })
    });
    
    await handleFetchError(response);
    const data = await response.json();
    const cert = data.certificate;
    if (!cert) throw new Error('No certificate returned from validation');
    
    verifyCertificateLocally(cert);
    saveCertificate(cert);
    
    return cert;
  } catch (err) {
    throw err;
  }
}

/**
 * Deactivate the stored certificate to free up the slot.
 */
export async function deactivate(): Promise<void> {
  const state = getLicenseState();
  if (!state || !state.licenseKey) {
    return; // Nothing to deactivate
  }

  const deviceId = getDeviceId();
  try {
    const response = await fetch(`${LICENSE_SERVER_URL}/public/deactivate`, {
      method: 'POST',
      headers: getFetchHeaders(),
      body: JSON.stringify({ licenseKey: state.licenseKey, deviceId })
    });
    
    await handleFetchError(response);
    
    // Remove the certificate locally
    if (fs.existsSync(LICENSE_FILE_PATH)) {
      fs.unlinkSync(LICENSE_FILE_PATH);
    }
  } catch (err) {
    throw err;
  }
}

/**
 * Application Startup Logic (Offline-First)
 * 1. Load the stored certificate and verify it locally. If the signature is invalid or status === 'revoked', block the app.
 * 2. If now < validUntil (grace period), allow the app to run (offline is OK).
 * 3. If now >= validUntil, attempt an online validate(). If it succeeds, update the certificate and allow. If it fails due to network, prompt the user.
 * 4. If expiresAt has passed, block the app.
 */
export async function checkLicenseOnStartup(): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const state = getLicenseState();
    if (!state) {
      return { allowed: false, reason: 'No license certificate found. Please activate the product.' };
    }

    if (state.status === 'revoked') {
      return { allowed: false, reason: 'License has been revoked.' };
    }

    const now = new Date();

    if (state.expiresAt) {
      const expiresAt = new Date(state.expiresAt);
      if (now > expiresAt) {
        return { allowed: false, reason: 'License has expired.' };
      }
    }

    const expiryDate = new Date(state.expiresAt || state.validUntil);
    
    if (now > expiryDate) {
      return { allowed: false, reason: 'Your license has expired. Please contact the product owner for renewal.' };
    }

    return { allowed: true };
  } catch (err: any) {
    return { allowed: false, reason: err.message };
  }
}
