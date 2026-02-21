import { execSync } from 'child_process';
import { cpSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

// Files to preserve from the repo (not part of the build)
const preserve = new Set(['.git', '.githooks', 'CLAUDE.md', 'CNAME', 'robots.txt', 'sitemap.xml']);

// Source files to keep out of deploy
const sourceOnly = new Set([
  'main.js', 'deploy.js', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml',
  'node_modules', 'public', 'dist', '.gitignore',
  'crt.glb', 'uploads_files_3247901_CRT+Monitor.fbx',
  'uploads_files_3247901_CRT+Screen.obj', 'uploads_files_3247901_CRT+Screen.mtl',
]);

// Clean old build artifacts from repo root (anything not preserved or source-only)
for (const f of readdirSync('.')) {
  if (!preserve.has(f) && !sourceOnly.has(f)) {
    rmSync(f, { recursive: true, force: true });
  }
}

// Copy dist output to root
for (const f of readdirSync('dist')) {
  cpSync(join('dist', f), f, { recursive: true });
}

// Stage, commit, push
run('git add -A');
run('git commit -m "Deploy: rebuild site"');
run('git push origin main');

console.log('Deployed!');
