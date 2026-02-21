import { execSync } from 'child_process';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

run('git add -A');
run('git commit -m "Update site"');
run('git push origin main');

console.log('Pushed! Cloudflare will build and deploy.');
