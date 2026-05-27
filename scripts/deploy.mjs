import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const indexAppDist = path.join(rootDir, 'packages', 'index-app', 'dist');
const symbolPickerDist = path.join(rootDir, 'packages', 'symbol-picker', 'dist');
const targetSymbolPickerDir = path.join(indexAppDist, 'symbol-picker');
const cnamePath = path.join(indexAppDist, 'CNAME');

async function deploy() {
  console.log('🚀 Starting deployment preparation...');

  try {
    // 1. Check if both dist folders exist
    await fs.access(indexAppDist);
    await fs.access(symbolPickerDist);
  } catch (err) {
    console.error('❌ Error: Dist folders not found. Did you run build?');
    process.exit(1);
  }

  // 2. Copy symbol-picker dist into index-app dist
  console.log('📂 Copying symbol-picker to index-app/dist/symbol-picker...');
  await fs.cp(symbolPickerDist, targetSymbolPickerDir, { recursive: true, force: true });

  // 3. Create CNAME and .nojekyll files
  console.log('🌐 Creating CNAME and .nojekyll files...');
  await fs.writeFile(cnamePath, 'tools.tarenx.com');
  await fs.writeFile(path.join(indexAppDist, '.nojekyll'), '');

  // 4. Deploy using gh-pages
  console.log('📤 Pushing to gh-pages branch...');
  try {
    execSync('npx gh-pages -d packages/index-app/dist', { 
      cwd: rootDir, 
      stdio: 'inherit' 
    });
    console.log('✅ Deployment successful!');
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
