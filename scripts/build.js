const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // 1. Build client
  console.log('Building client...');
  execSync('npm run build --workspace=client', { stdio: 'inherit' });

  // 2. Copy client/dist to root dist
  const src = path.resolve(__dirname, '../client/dist');
  const dest = path.resolve(__dirname, '../dist');

  console.log(`Copying ${src} to ${dest}...`);
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  
  fs.cpSync(src, dest, { recursive: true });
  console.log('Build script finished successfully!');
} catch (error) {
  console.error('Build script failed:', error);
  process.exit(1);
}
