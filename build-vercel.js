#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Ensure node_modules/.bin has correct permissions
  const binPath = path.join(__dirname, 'node_modules', '.bin', 'vite');
  
  if (fs.existsSync(binPath)) {
    console.log('✅ Vite binary found, setting permissions...');
    try {
      fs.chmodSync(binPath, '755');
    } catch (e) {
      console.log('⚠️ Could not set permissions, continuing...');
    }
  }

  // Try multiple build approaches
  const buildCommands = [
    'npx vite build',
    './node_modules/.bin/vite build',
    'node ./node_modules/vite/bin/vite.js build'
  ];

  let buildSuccess = false;
  
  for (const cmd of buildCommands) {
    try {
      console.log(`🔨 Trying: ${cmd}`);
      execSync(cmd, { stdio: 'inherit', cwd: __dirname });
      buildSuccess = true;
      console.log('✅ Build successful!');
      break;
    } catch (error) {
      console.log(`❌ Failed: ${cmd}`);
      continue;
    }
  }

  if (!buildSuccess) {
    throw new Error('All build attempts failed');
  }

} catch (error) {
  console.error('💥 Build failed:', error.message);
  process.exit(1);
}