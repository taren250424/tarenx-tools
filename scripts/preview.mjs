import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const hubDist = path.join(rootDir, 'packages', 'hub', 'dist');
const symbolPickerDist = path.join(rootDir, 'packages', 'symbolpicker', 'dist');
const svgPlaygroundDist = path.join(rootDir, 'packages', 'svgplayground', 'dist');

await fs.cp(symbolPickerDist, path.join(hubDist, 'symbolpicker'), {
  recursive: true,
  force: true,
});

await fs.cp(svgPlaygroundDist, path.join(hubDist, 'svgplayground'), {
  recursive: true,
  force: true,
});

execSync('pnpm --filter hub preview', { cwd: rootDir, stdio: 'inherit' });
