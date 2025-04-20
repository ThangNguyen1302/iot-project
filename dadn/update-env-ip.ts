import os from 'os';
import fs from 'fs';
import path from 'path';

function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    const iface = interfaces[name];
    if (!iface) continue;
    for (const info of iface) {
      if (info.family === 'IPv4' && !info.internal) {
        return info.address;
      }
    }
  }
  return '127.0.0.1';
}

function updateEnvFile(ip: string) {
  const envPath = path.join(__dirname, '.env');
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
    const updated = content.replace(
      /EXPO_PUBLIC_API_URL1=.*/g,
      `EXPO_PUBLIC_API_URL1=http://${ip}:8080`
    );
    fs.writeFileSync(envPath, updated, 'utf8');
  } else {
    content = `EXPO_PUBLIC_API_URL1=http://${ip}:8080\n`;
    fs.writeFileSync(envPath, content, 'utf8');
  }
  console.log(`✅ .env updated with IP: ${ip}`);
}

const ip = getLocalIpAddress();
updateEnvFile(ip);
