import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const indexAppDist = path.join(rootDir, 'packages', 'index-app', 'dist');
const symbolPickerDist = path.join(rootDir, 'packages', 'symbol-picker', 'dist');

await fs.cp(symbolPickerDist, path.join(indexAppDist, 'symbol-picker'), {
  recursive: true,
  force: true,
});

execSync('pnpm --filter index-app preview', { cwd: rootDir, stdio: 'inherit' });