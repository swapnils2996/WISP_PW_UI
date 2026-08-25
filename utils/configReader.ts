import fs from 'fs';
import path from 'path';

export interface AppConfig {
  username: string;
  password: string;
  baseUrl: string;
}

let _cache: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (_cache) return _cache;

  const propsPath = path.join(__dirname, '..', 'config', 'config.properties');
  const content = fs.readFileSync(propsPath, 'utf-8');
  const props: Record<string, string> = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      props[trimmed.substring(0, eq).trim()] = trimmed.substring(eq + 1).trim();
    }
  }

  _cache = {
    username: props['username'] ?? '',
    password: props['password'] ?? '',
    baseUrl: props['baseUrl'] ?? 'http://isp.stores.michaels.com',
  };
  return _cache;
}
