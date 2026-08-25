// post-run.js
// Run this script immediately AFTER `playwright test` exits.
// By that time allure-playwright has written all *-result.json files to allure-results/.
// Usage (called automatically via npm scripts):
//   node post-run.js [spec-name-override]

'use strict';

const { execSync } = require('child_process');
const fs           = require('fs');
const path         = require('path');
const archiver     = require('archiver');
const nodemailer   = require('nodemailer');

const ROOT        = __dirname;
const RESULTS_DIR = path.join(ROOT, 'allure-results');
const REPORTS_DIR = path.join(ROOT, 'allure-reports');
const ALLURE_BIN  = path.join(ROOT, 'node_modules', 'allure-commandline', 'bin', 'allure');
const MARKER_FILE = path.join(ROOT, '.pending-report.json');
const MAX_AGE_MS  = 24 * 60 * 60 * 1000;

// ── Helpers ───────────────────────────────────────────────────────────────────

function readConfig() {
  const propsPath = path.join(ROOT, 'config', 'config.properties');
  const props = {};
  for (const line of fs.readFileSync(propsPath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq > 0) props[t.substring(0, eq).trim()] = t.substring(eq + 1).trim();
  }
  return props;
}

function detectSpecName() {
  // 1. CLI argument: node post-run.js archive-records
  if (process.argv[2]) return process.argv[2];

  // 2. Marker file written by global-teardown
  if (fs.existsSync(MARKER_FILE)) {
    try {
      const marker = JSON.parse(fs.readFileSync(MARKER_FILE, 'utf-8'));
      if (marker.specName) return marker.specName;
    } catch { /* ignore */ }
  }

  // 3. npm lifecycle event
  const lifecycle = process.env.npm_lifecycle_event ?? '';
  const map = {
    'test:applicationAlerts':   'application-alerts',
    'test:archiveRecords':      'archive-records',
    'test:deploymentUtilities': 'deployment-utilities',
    'test:directReplenishment': 'direct-replenishment',
    'test:ebf':                 'electronic-business-forms',
    'test:genericSKU':          'generic-sku-list-builder',
    'test:inventoryAdjustments':'inventory-adjustments',
    'test:itemInquiry':         'item-inquiry',
    'test:labelRequest':        'label-request',
    'test:login':               'login',
    'test:orderReceiving':      'order-receiving',
    'test:planogram':           'planogram',
    'test:priceChange':         'price-change-activation',
    'test:reports':             'reports',
    'test:storeAddress':        'store-address-inquiry',
    'test:userManagement':      'user-management',
  };
  if (map[lifecycle]) return map[lifecycle];

  return 'all-tests';
}

function timestamp() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_` +
         `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

function pruneOldReports(reportsRootDir) {
  if (!fs.existsSync(reportsRootDir)) return;
  const cutoff = Date.now() - MAX_AGE_MS;
  let pruned = 0;
  for (const specEntry of fs.readdirSync(reportsRootDir)) {
    if (specEntry === 'latest') continue;          // never touch root-level latest/
    const specDir = path.join(reportsRootDir, specEntry);
    try {
      if (!fs.statSync(specDir).isDirectory()) continue;
    } catch { continue; }
    for (const entry of fs.readdirSync(specDir)) {
      const fullPath = path.join(specDir, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (entry !== 'latest' && !entry.endsWith('.zip') && stat.isDirectory() && stat.mtimeMs < cutoff) {
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`[post-run] Pruned old report: ${specEntry}/${entry}`);
          pruned++;
        }
        if (entry.endsWith('.zip') && stat.mtimeMs < cutoff) {
          fs.rmSync(fullPath, { force: true });
          console.log(`[post-run] Pruned old zip: ${specEntry}/${entry}`);
          pruned++;
        }
      } catch { /* ignore */ }
    }
  }
  if (pruned === 0) console.log('[post-run] No reports older than 24 h found.');
}

function zipFolder(sourceDir, destZip) {
  return new Promise((resolve, reject) => {
    const output  = fs.createWriteStream(destZip);
    const archive = archiver('zip', { zlib: { level: 6 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

async function sendEmail(cfg, specLabel, zipPath, ts) {
  const recipients = (cfg['email.recipients'] ?? '').trim();
  if (!recipients) { console.log('[post-run] No email recipients configured — skipping email.'); return; }

  const transporter = nodemailer.createTransport({
    host:              cfg['email.smtp.host'] ?? 'smtp.office365.com',
    port:              parseInt(cfg['email.smtp.port'] ?? '587', 10),
    secure:            cfg['email.smtp.secure'] === 'true',
    connectionTimeout: 10000,
    greetingTimeout:   5000,
    socketTimeout:     10000,
    auth: { user: cfg['email.smtp.user'] ?? '', pass: cfg['email.smtp.pass'] ?? '' },
    tls: { rejectUnauthorized: false },
  });

  const zipName    = path.basename(zipPath);
  const runDisplay = ts.replace('_', ' ').replace(/-(\d{2})-(\d{2})-(\d{2})$/, ' $1:$2:$3');
  const subject    = `Allure Report \u2013 ${specLabel} \u2013 ${runDisplay}`;
  const body =
    `Hi,\n\nPlease find the Allure test report attached.\n\n` +
    `  Suite  : ${specLabel}\n  Run at : ${runDisplay}\n\n` +
    `To view: unzip the attachment and run:\n  npx serve <unzipped-folder>\n` +
    `Then open http://localhost:3000 in your browser.\n\n` +
    `Note: This report is retained for 24 hours.\n\nRegards,\nWISP Automation`;

  await transporter.sendMail({
    from:        cfg['email.from'] ?? cfg['email.smtp.user'],
    to:          recipients,
    subject,
    text:        body,
    attachments: [{ filename: zipName, path: zipPath }],
  });
  console.log(`[post-run] Email sent to: ${recipients}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  const cfg      = readConfig();
  const specName = detectSpecName();
  const ts       = timestamp();
  const specDir  = path.join(REPORTS_DIR, specName);
  const runDir   = path.join(specDir, ts);
  const latestDir= path.join(specDir, 'latest');
  const zipPath  = path.join(specDir, `${ts}.zip`);

  fs.mkdirSync(specDir, { recursive: true });

  // Verify result files exist
  const resultFiles = fs.existsSync(RESULTS_DIR)
    ? fs.readdirSync(RESULTS_DIR).filter(f => f.endsWith('-result.json'))
    : [];
  console.log(`[post-run] Spec: ${specName} | Result files: ${resultFiles.length}`);

  if (resultFiles.length === 0) {
    console.warn('[post-run] No result files found in allure-results/ — report will be empty.');
  }

  // 1. Generate allure report
  try {
    execSync(`node "${ALLURE_BIN}" generate "${RESULTS_DIR}" -o "${runDir}" --clean`, { stdio: 'inherit' });
    console.log(`[post-run] Report generated → ${runDir}`);
  } catch (e) {
    console.error('[post-run] Failed to generate report:', e.message);
    process.exit(1);
  }

  // 2. Update latest folder
  if (fs.existsSync(latestDir)) fs.rmSync(latestDir, { recursive: true, force: true });
  fs.cpSync(runDir, latestDir, { recursive: true });
  console.log(`[post-run] Latest report updated → ${latestDir}`);

  // 3. Prune old reports (>24h) across ALL spec folders
  pruneOldReports(REPORTS_DIR);

  // 4. Zip the report
  try {
    await zipFolder(runDir, zipPath);
    console.log(`[post-run] Report zipped → ${zipPath}`);
  } catch (e) {
    console.error('[post-run] Zip failed:', e.message);
  }

  // 5. Email
  const specLabel = specName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  try {
    await sendEmail(cfg, specLabel, zipPath, ts);
  } catch (e) {
    console.log('[post-run] Email skipped:', e.message);
    console.log('[post-run] Report available at:', runDir);
    console.log('[post-run] Zip available at   :', zipPath);
  }

  // Clean up marker file
  try { fs.unlinkSync(MARKER_FILE); } catch { /* ignore */ }
})();
