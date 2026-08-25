// global-teardown.ts
// NOTE: globalTeardown runs BEFORE reporters finish writing result files.
// All report generation, zipping, and emailing is handled by post-run.js,
// which is invoked AFTER `playwright test` exits (via npm scripts).

import fs from 'fs';
import path from 'path';
// Ensure __dirname is available (CommonJS — package.json "type":"commonjs")
const _dir: string = __dirname;

export default async function globalTeardown() {
  // Detect which spec was run so post-run.js can name the report folder correctly.
  const specArg   = process.argv.find(a => /\.spec\.(ts|js)$/.test(a));
  const lifecycle = process.env.npm_lifecycle_event ?? '';

  const lifecycleMap: Record<string, string> = {
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

  let specName = lifecycleMap[lifecycle] ?? '';
  if (!specName && specArg) {
    const base = path.basename(specArg).replace(/\.spec\.(ts|js)$/, '');
    specName = base.replace(/([A-Z])/g, m => '-' + m.toLowerCase()).replace(/^-/, '');
  }
  if (!specName) specName = 'all-tests';

  // Write a marker file so post-run.js picks up the spec name after playwright exits
  const markerPath = path.join(_dir, '.pending-report.json');
  try {
    fs.writeFileSync(markerPath, JSON.stringify({ specName, startedAt: new Date().toISOString() }));
  } catch (e) {
    // Non-fatal: post-run.js will fall back to lifecycle/argv detection
  }
}
