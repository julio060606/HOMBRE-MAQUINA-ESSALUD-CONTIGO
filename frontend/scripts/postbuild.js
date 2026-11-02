import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html no encontrado en dist');
  process.exit(1);
}

const routes = [
  '404.html',
  'modo-senior.html',
  'login.html',
  'register.html',
  'dashboard.html',
  'appointments.html',
  'medications.html',
  'vitals.html',
  'reports.html',
  'settings.html',
  'patient-simulator.html',
  'landing.html'
];

for (const route of routes) {
  const target = path.join(distDir, route);
  fs.copyFileSync(indexPath, target);
}

console.log(`✅ Rutas estáticas generadas en dist (${routes.length} archivos para SPA fallback)`);
