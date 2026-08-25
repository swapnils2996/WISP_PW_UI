const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Usage: node report-server.js [folder-name]
// folder-name defaults to "latest" -> serves allure-reports/latest
const folderArg = process.argv[2] || 'latest';
const REPORT_DIR = path.join(__dirname, 'allure-reports', folderArg);
const PORT = 9323;

if (!fs.existsSync(REPORT_DIR)) {
  console.error(`Report folder not found: ${REPORT_DIR}`);
  console.error('Run "npm run allure:generate" first.');
  process.exit(1);
}

const mimeTypes = {
  '.html':  'text/html',
  '.js':    'application/javascript',
  '.css':   'text/css',
  '.json':  'application/json',
  '.png':   'image/png',
  '.svg':   'image/svg+xml',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.zip':   'application/zip',
};

const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(REPORT_DIR, url.split('?')[0]);
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const ct = mimeTypes[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': ct });
    fs.createReadStream(filePath).pipe(res);
  } catch (e) { res.writeHead(500); res.end(e.message); }
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Allure report served at: ${url}  (folder: ${folderArg})`);
  console.log('Press Ctrl+C to stop.\n');
  exec(`start ${url}`);
});

server.on('error', e => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing server or change PORT.`);
  } else {
    console.error('Server error:', e.message);
  }
  process.exit(1);
});
