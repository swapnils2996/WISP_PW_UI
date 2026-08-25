/**
 * Seeds the following sheets into testData.xlsx:
 *   - Reports        : DB-sourced configuration values used by EBF/DU tests
 *   - EBF            : Electronic Business Forms test data
 *   - DeploymentUtilities : Deployment Utilities test data
 *
 * Run: node test-data/seedEBFAndDU.js
 */
const ExcelJS = require('exceljs');
const { Client } = require('../node_modules/pg');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'testData.xlsx');

async function getDBConfig() {
  const client = new Client({
    host: 'localhost', port: 5432,
    user: 'postgres', password: 'Michaels@1', database: 'isp',
  });
  await client.connect();
  const res = await client.query(
    `SELECT "Key","Value" FROM dbo."Configuration"
     WHERE "Key" IN (
       'MustCallMessage','AlarmUpdateToAddress','CashierOverrideToAddress',
       'InventoryManagementToAddress','InventoryManagementAutomaticReplenishmentToAddress',
       'InventoryManagementOtherIssuesToAddress','EmailFromAddress','EmailSmtpServer',
       'SpsApplicationVersion','StoreCountryCode','DisableTruckOverride','DisableInventoryOverride'
     )
     ORDER BY "Key"`
  );
  await client.end();
  return res.rows;
}

async function main() {
  const workbook = new ExcelJS.Workbook();
  try { await workbook.xlsx.readFile(DATA_FILE); } catch { /* new file */ }

  // ── Remove existing sheets if they exist ─────────────────────────────────
  ['Reports', 'EBF', 'DeploymentUtilities'].forEach(name => {
    const existing = workbook.getWorksheet(name);
    if (existing) workbook.removeWorksheet(existing.id);
  });

  // ── REPORTS sheet (DB-sourced config values) ──────────────────────────────
  const dbRows = await getDBConfig();
  const reportsSheet = workbook.addWorksheet('Reports');
  reportsSheet.addRow(['ConfigKey', 'ConfigValue', 'Source', 'Notes']);
  reportsSheet.getRow(1).font = { bold: true };

  // Fixed lock-key values come from the Angular component source (not DB)
  const staticEntries = [
    { key: 'DisableRFLoad_LockNo',  value: '70606', source: 'Component source (disable-rfload.component.html)', notes: 'Lock number displayed on Disable RF Load page' },
    { key: 'EnableRFLoad_LockNo',   value: '6803',  source: 'Component source (enable-rfload.component.html)',  notes: 'Lock number displayed on Enable RF Load page' },
    { key: 'TimeClock_LockNo',      value: '61810', source: 'Component source (time-clock.component.html)',     notes: 'Lock number displayed on Time Clock page' },
  ];
  staticEntries.forEach(e => reportsSheet.addRow([e.key, e.value, e.source, e.notes]));
  dbRows.forEach(r => reportsSheet.addRow([r.Key, r.Value, 'dbo.Configuration (PostgreSQL isp DB)', '']));

  // Auto-fit column widths
  reportsSheet.columns.forEach((col, i) => {
    col.width = [35, 90, 55, 50][i] || 30;
    col.alignment = { wrapText: true };
  });

  // ── EBF sheet ─────────────────────────────────────────────────────────────
  const ebfSheet = workbook.addWorksheet('EBF');
  const ebfHeaders = [
    'testCase','feature',
    'aurCallListSeq1','aurContactName1','aurJobTitle1','aurHomePhone1','aurPasscode1',
    'aurCallListSeq2','aurContactName2','aurJobTitle2','aurHomePhone2','aurPasscode2',
    'aurDelContactName','aurDelJobTitle','aurDelPasscode',
    'cowUPC','cowSKU','cowVendorSKU','cowRetailPrice','cowItemDesc','cowCashierInitials','cowComments',
    'imcSku','imcUPC','imcDesc','imcComments',
    'mustCallMessage','alarmUpdateToAddress','cashierOverrideToAddress','inventoryMgmtToAddress',
  ];
  ebfSheet.addRow(ebfHeaders);
  ebfSheet.getRow(1).font = { bold: true };

  // Resolve DB-sourced values
  const getVal = (key) => {
    const found = dbRows.find(r => r.Key === key);
    return found ? found.Value : '';
  };

  ebfSheet.addRow([
    'EBF_AUR_WTC01',
    'Electronic Business Forms - Alarm Update Report',
    '1', 'John Doe',   'Store Manager',   '5551234567', '1234',
    '2', 'Jane Smith', 'Assistant Mgr',   '5559876543', '5678',
    'Delete User', 'Cashier', 'REMOVE',
    '0400100100011', '123458', 'V12345', '9.99', 'CN-MATBOARD B8456', 'JD', 'Test cashier override comment',
    '123458', '0400100100011', 'CN-MATBOARD B8456', 'Overstock replenishment issue',
    getVal('MustCallMessage'),
    getVal('AlarmUpdateToAddress'),
    getVal('CashierOverrideToAddress'),
    getVal('InventoryManagementToAddress'),
  ]);
  ebfSheet.columns.forEach((col, i) => { col.width = i < 2 ? 30 : 40; col.alignment = { wrapText: true }; });

  // ── DeploymentUtilities sheet ──────────────────────────────────────────────
  const duSheet = workbook.addWorksheet('DeploymentUtilities');
  const duHeaders = ['testCase','feature','disableRFLockNo','enableRFLockNo','timeClockLockNo','longKeyInput','expectedLockKeyRequiredText'];
  duSheet.addRow(duHeaders);
  duSheet.getRow(1).font = { bold: true };
  duSheet.addRow([
    'DU_WTC01',
    'Deployment Utilities',
    '70606',
    '6803',
    '61810',
    'a'.repeat(500),
    'Lock Key Required',
  ]);
  duSheet.columns.forEach(col => { col.width = 30; });

  await workbook.xlsx.writeFile(DATA_FILE);
  console.log(`✓  Updated: ${DATA_FILE}`);
  console.log('   Sheets added: Reports, EBF, DeploymentUtilities');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
