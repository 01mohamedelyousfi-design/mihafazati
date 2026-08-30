import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');
const dist = join(root, 'dist');

if (existsSync(dist)) {
  rmSync(dist, { recursive: true, force: true });
}
mkdirSync(dist, { recursive: true });

cpSync(join(root, 'index.html'), join(dist, 'index.html'));
cpSync(join(root, '_headers'), join(dist, '_headers'));
cpSync(join(root, '_redirects'), join(dist, '_redirects'));
cpSync(join(root, 'css'), join(dist, 'css'), { recursive: true });
cpSync(join(root, 'js'), join(dist, 'js'), { recursive: true });
if (existsSync(join(root, 'بطاقة.pdf'))) {
  cpSync(join(root, 'بطاقة.pdf'), join(dist, 'بطاقة.pdf'));
}

console.log('Successfully prepared clean dist/ bundle for Cloudflare Pages!');
