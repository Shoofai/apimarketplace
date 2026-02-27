import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

const CONFIG_DIR = join(homedir(), '.kinetic');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export interface KineticConfig {
  access_token?: string;
  refresh_token?: string;
  platform_url?: string;
  user_email?: string;
}

export function readConfig(): KineticConfig {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    return {};
  }
}

export function writeConfig(config: KineticConfig): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

export function clearConfig(): void {
  writeConfig({});
}

export function getRequiredToken(): string {
  const { access_token } = readConfig();
  if (!access_token) {
    console.error('Not authenticated. Run: kinetic auth');
    process.exit(1);
  }
  return access_token;
}

export function getPlatformUrl(): string {
  return readConfig().platform_url ?? 'https://api.kineticapi.com';
}
