import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const rootPrefix = root.endsWith(sep) ? root : root + sep;
const port = Number(process.env.BLISS_PORT) || 4173;
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.wasm', 'application/wasm'],
  ['.wad', 'application/octet-stream'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'],
  ['.mp3', 'audio/mpeg'],
  ['.wav', 'audio/wav'],
  ['.mp4', 'video/mp4'],
]);

const server = createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  const relativePath = pathname.replace(/^[/\\]+/, '') || 'index.html';
  const filePath = resolve(root, relativePath);
  if(filePath !== root && !filePath.startsWith(rootPrefix)){
    response.writeHead(403).end('Forbidden');
    return;
  }
  if(!existsSync(filePath) || !statSync(filePath).isFile()){
    response.writeHead(404).end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': mimeTypes.get(extname(filePath).toLowerCase()) || 'application/octet-stream',
    'Content-Length': statSync(filePath).size,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  if(request.method === 'HEAD'){
    response.end();
    return;
  }
  createReadStream(filePath).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`BLISS local preview: http://127.0.0.1:${port}/`);
  console.log('Press Ctrl+C to stop the server.');
});

server.on('error', error => {
  console.error(`Could not start the local server: ${error.message}`);
  process.exitCode = 1;
});
