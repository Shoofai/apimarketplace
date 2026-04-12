// @ts-nocheck — local import script, not part of the Next.js app
import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
];

const TOKEN_PATH = resolve(process.cwd(), '.blog-import-credentials.json');

export async function getAuthClient(credentialsPath: string) {
  const keyfilePath = resolve(process.cwd(), credentialsPath);

  if (!existsSync(keyfilePath)) {
    throw new Error(
      `Google OAuth credentials not found at ${keyfilePath}.\n` +
        'Download your OAuth 2.0 client credentials from Google Cloud Console:\n' +
        'https://console.cloud.google.com/apis/credentials\n' +
        'Save the JSON file and update googleCredentialsPath in your config.'
    );
  }

  // Try loading saved token
  if (existsSync(TOKEN_PATH)) {
    try {
      const token = JSON.parse(readFileSync(TOKEN_PATH, 'utf-8'));
      const auth = new google.auth.OAuth2();
      auth.setCredentials(token);

      if (token.expiry_date && token.expiry_date > Date.now()) {
        return auth;
      }

      if (token.refresh_token) {
        const keyFile = JSON.parse(readFileSync(keyfilePath, 'utf-8'));
        const { client_id, client_secret } = keyFile.installed || keyFile.web || {};
        const refreshAuth = new google.auth.OAuth2(client_id, client_secret);
        refreshAuth.setCredentials({ refresh_token: token.refresh_token });
        const { credentials } = await refreshAuth.refreshAccessToken();
        const merged = { ...token, ...credentials };
        writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2));
        refreshAuth.setCredentials(merged);
        return refreshAuth;
      }
    } catch {
      // Token invalid, re-authenticate
    }
  }

  console.log('\n🔐 Opening browser for Google authentication...\n');
  const auth = await authenticate({ scopes: SCOPES, keyfilePath });

  if (auth.credentials) {
    writeFileSync(TOKEN_PATH, JSON.stringify(auth.credentials, null, 2));
    console.log('✅ Credentials saved to', TOKEN_PATH);
  }

  return auth;
}

export async function getGoogleClients(credentialsPath: string) {
  const auth = await getAuthClient(credentialsPath);
  return {
    sheets: google.sheets({ version: 'v4', auth }),
    drive: google.drive({ version: 'v3', auth }),
  };
}
