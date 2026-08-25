// cleanup-reports.js
// Standalone script: deletes allure report folders and zips older than 24 hours.
// Run manually:  node cleanup-reports.js
// Scheduled via: schtasks (registered by npm run cleanup:schedule)

'use strict';

const fs   = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, 'allure-reports');
const MAX_AGE_MS  = 24 * 60 * 60 * 1000;

function pruneAllOldReports() {
  if (!fs.existsSync(REPORTS_DIR)) {
    console.log('[cleanup] allure-reports/ not found — nothing to prune.');
    return;
  }

  const cutoff = Date.now() - MAX_AGE_MS;
  let pruned = 0;

  for (const specEntry of fs.readdirSync(REPORTS_DIR)) {
    if (specEntry === 'latest') continue;          // never touch root-level latest/
    const specDir = path.join(REPORTS_DIR, specEntry);
    try {
      if (!fs.statSync(specDir).isDirectory()) continue;
    } catch { continue; }

    for (const entry of fs.readdirSync(specDir)) {
      const fullPath = path.join(specDir, entry);
      try {
        const stat = fs.statSync(fullPath);
        const isOldDir = entry !== 'latest' && !entry.endsWith('.zip') &&
                         stat.isDirectory() && stat.mtimeMs < cutoff;
        const isOldZip = entry.endsWith('.zip') && stat.mtimeMs < cutoff;

        if (isOldDir) {
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`[cleanup] Deleted old report folder : ${specEntry}/${entry}`);
          pruned++;
        } else if (isOldZip) {
          fs.rmSync(fullPath, { force: true });
          console.log(`[cleanup] Deleted old report zip    : ${specEntry}/${entry}`);
          pruned++;
        }
      } catch (err) {
        console.warn(`[cleanup] Could not remove ${fullPath}: ${err.message}`);
      }
    }
  }

  if (pruned === 0) {
    console.log('[cleanup] No reports older than 24 h found — nothing deleted.');
  } else {
    console.log(`[cleanup] Done. ${pruned} item(s) deleted.`);
  }
}

pruneAllOldReports();
