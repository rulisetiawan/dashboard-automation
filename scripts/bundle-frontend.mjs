import fs from 'node:fs';
import path from 'node:path';

const isWatch = process.argv.includes('--watch');

const sourceFiles = [
  'src/state.js',
  'src/utils/formatters.js',
  'src/pages/fleet.js',
  'src/pages/overview.js',
  'src/pages/asset-status.js',
  'src/pages/command-center.js',
  'src/pages/utilities.js',
  'src/pages/chemical.js',
  'src/pages/solar.js',
  'src/pages/wwtp.js',
  'src/pages/alarms.js',
  'src/pages/trends.js',
  'src/pages/health.js',
  'src/components/modal-machine.js',
  'src/pages/roles.js',
  'src/pages/users.js',
  'src/main.js',
];

export function bundle() {
  const startTime = Date.now();
  let code = '';
  for (const file of sourceFiles) {
    if (!fs.existsSync(file)) {
      console.error(`Missing source module: ${file}`);
      process.exit(1);
    }
    let content = fs.readFileSync(file, 'utf8');
    // Strip side-effect imports if present at the top of files
    content = content.replace(/^\s*import\s+['"][^'"]+['"];?\s*$/gm, '');
    code += `\n// --- Begin Module: ${file} ---\n` + content + `\n// --- End Module: ${file} ---\n`;
  }
  fs.writeFileSync('app.js', code.trimStart());
  console.log(`Bundled ${sourceFiles.length} modules to app.js (${code.split('\n').length} lines) in ${Date.now() - startTime}ms`);
}

bundle();

if (isWatch) {
  console.log('Watching for changes in src/ directory...');
  let debounceTimer = null;
  fs.watch('src', { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith('.js')) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`Detected change in src/${filename}, rebuilding app.js...`);
      bundle();
    }, 100);
  });
}
