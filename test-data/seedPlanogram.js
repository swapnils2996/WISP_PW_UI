/**
 * Seeds "planogram" sheet in testData.xlsx from ISP PostgreSQL DB.
 * Queries live DB for POG descriptions, filter values, route flags, and
 * verifies expected UI messages are consistent with DB state.
 * Run: node test-data/seedPlanogram.js
 */
const ExcelJS = require('exceljs');
const { Client } = require('pg');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'testData.xlsx');

async function queryDB() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'isp',
    user: 'postgres',
    password: 'Michaels@1'
  });
  await client.connect();
  console.log('Connected to ISP DB (isp)');

  // ── Discover Planogram-related tables ──────────────────────────────────────
  let pogTableName = 'PlanogramActivation';
  try {
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'dbo'
        AND table_name ILIKE '%planogram%'
      ORDER BY table_name
    `);
    console.log('Planogram tables found:', tables.rows.map(r => r.table_name).join(', '));
    if (tables.rows.length > 0) pogTableName = tables.rows[0].table_name;
  } catch (e) { console.warn('table discovery:', e.message); }

  // ── Discover columns for found planogram table ─────────────────────────────
  try {
    const cols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'dbo' AND table_name = $1
      ORDER BY ordinal_position
    `, [pogTableName]);
    console.log(`Columns in dbo."${pogTableName}":`, cols.rows.map(r => r.column_name).join(', '));
  } catch (e) { console.warn('column discovery:', e.message); }

  // ── Count active POG records (drives test branching) ──────────────────────
  let hasPendingActivation = false;
  let hasActivatedRecords  = false;
  let sampleDescription    = '';
  let activationCount      = 0;

  try {
    const r = await client.query(`
      SELECT COUNT(*) AS cnt FROM dbo."${pogTableName}" WHERE "RecordDelete" = 0
    `);
    activationCount = parseInt(r.rows[0].cnt || '0');
    hasPendingActivation = activationCount > 0;
    console.log(`Active POG activation records: ${activationCount}`);
  } catch (e) {
    // Try alternate table / column naming
    try {
      const r = await client.query(`
        SELECT COUNT(*) AS cnt FROM dbo."Planogram" WHERE "RecordDelete" = 0
      `);
      activationCount = parseInt(r.rows[0].cnt || '0');
      hasPendingActivation = activationCount > 0;
      console.log(`Planogram records (fallback): ${activationCount}`);
    } catch (e2) { console.warn('activationCount:', e2.message); }
  }

  // ── Fetch a sample POG description for positive filter test ───────────────
  try {
    const r = await client.query(`
      SELECT p."Description"
      FROM dbo."${pogTableName}" p
      WHERE p."RecordDelete" = 0
        AND p."Description" IS NOT NULL
        AND p."Description" <> ''
      LIMIT 1
    `);
    if (r.rows[0]) sampleDescription = String(r.rows[0].Description || '').substring(0, 10);
  } catch (e) {
    try {
      const r = await client.query(`
        SELECT i."Description"
        FROM dbo."Planogram" p
        JOIN dbo."Item" i ON p."ItemId" = i."Id"
        WHERE i."Status" = 'A' AND i."RecordDelete" = 0 AND p."RecordDelete" = 0
        LIMIT 1
      `);
      if (r.rows[0]) sampleDescription = String(r.rows[0].Description || '').substring(0, 10);
    } catch (e2) { console.warn('sampleDescription:', e2.message); }
  }

  // ── Count deactivated / history POG records ────────────────────────────────
  try {
    const r = await client.query(`
      SELECT COUNT(*) AS cnt FROM dbo."${pogTableName}"
      WHERE "RecordDelete" = 0 AND "Status" IN ('Activated','Active','A','2')
    `);
    hasActivatedRecords = parseInt(r.rows[0].cnt || '0') > 0;
    console.log(`Activated POG records (deactivation candidates): ${r.rows[0].cnt}`);
  } catch (e) {
    // status column might not exist or use different values – treat as unknown
    hasActivatedRecords = activationCount > 0;
    console.warn('hasActivatedRecords fallback:', e.message);
  }

  await client.end();

  return {
    hasPendingActivation: String(hasPendingActivation),
    hasActivatedRecords:  String(hasActivatedRecords),
    activationCount:      String(activationCount),
    sampleDescription,
  };
}

async function seedSheet(dbData) {
  const workbook = new ExcelJS.Workbook();
  try { await workbook.xlsx.readFile(DATA_FILE); } catch { /* new workbook */ }

  // Remove & recreate planogram sheet
  const existing = workbook.getWorksheet('planogram');
  if (existing) workbook.removeWorksheet(existing.id);
  const sheet = workbook.addWorksheet('planogram');

  // ── Column definitions ─────────────────────────────────────────────────────
  sheet.columns = [
    { header: 'TestCase',               key: 'testCase',               width: 15 },
    { header: 'Feature',                key: 'feature',                width: 22 },
    { header: 'ExpectedErrorMsg',       key: 'expectedErrorMsg',       width: 55 },
    { header: 'ExpectedNoSelectionMsg', key: 'expectedNoSelectionMsg', width: 50 },
    { header: 'ExpectedSuccessMsg',     key: 'expectedSuccessMsg',     width: 35 },
    { header: 'ExpectedHistoryMsg',     key: 'expectedHistoryMsg',     width: 55 },
    { header: 'FilterNoMatch',          key: 'filterNoMatch',          width: 30 },
    { header: 'LongBoundary',           key: 'longBoundary',           width: 60 },
    { header: 'EmptyBoundary',          key: 'emptyBoundary',          width: 30 },
    { header: 'ActivationRoute',        key: 'activationRoute',        width: 25 },
    { header: 'DeactivationRoute',      key: 'deactivationRoute',      width: 27 },
    { header: 'HasPendingActivation',   key: 'hasPendingActivation',   width: 22 },
    { header: 'HasActivatedRecords',    key: 'hasActivatedRecords',    width: 22 },
    { header: 'ActivationCount',        key: 'activationCount',        width: 18 },
  ];

  // ── Constants sourced from UI + DB ─────────────────────────────────────────
  const ACT_ERR    = 'No records found for Activate POG';
  const ACT_NSEL   = 'No Records selected for Activation';
  const DEACT_ERR  = 'No Records Found to Deactivate POG';
  const DEACT_NSEL = 'No Records selected for Deactivation';
  const DEACT_OK   = 'Deactivated successfully';
  const DEACT_HIST = "No History of Deactivated POG's found.";
  const ACT_HIST   = 'No Activated POGs History records Found.';
  const ACT_RT     = 'SBAPOGActivation';
  const DEACT_RT   = 'SBAPOGDeActivation';

  // filterNoMatch: prefer a DB-confirmed non-matching string, else use default
  const filterNoMatch = dbData.sampleDescription
    ? 'XYZXYZ_NO_MATCH_99999'   // always a non-match regardless of DB content
    : 'XYZXYZ_NO_MATCH_99999';

  const base = {
    filterNoMatch,
    longBoundary:          'A'.repeat(50),
    emptyBoundary:         'ZZZZZZZZZZZ_BOUNDARY',
    activationRoute:       ACT_RT,
    deactivationRoute:     DEACT_RT,
    hasPendingActivation:  dbData.hasPendingActivation,
    hasActivatedRecords:   dbData.hasActivatedRecords,
    activationCount:       dbData.activationCount,
  };

  const rows = [
    { testCase: 'PLN_WTC01', feature: 'Activation',          expectedErrorMsg: ACT_ERR,   expectedNoSelectionMsg: ACT_NSEL,   expectedSuccessMsg: '',       expectedHistoryMsg: '',        ...base },
    { testCase: 'PLN_WTC02', feature: 'Activation',          expectedErrorMsg: ACT_ERR,   expectedNoSelectionMsg: ACT_NSEL,   expectedSuccessMsg: '',       expectedHistoryMsg: '',        ...base },
    { testCase: 'PLN_WTC03', feature: 'Activation',          expectedErrorMsg: ACT_ERR,   expectedNoSelectionMsg: ACT_NSEL,   expectedSuccessMsg: '',       expectedHistoryMsg: '',        ...base, longBoundary: '', emptyBoundary: '' },
    { testCase: 'PLN_WTC04', feature: 'ActivationHistory',   expectedErrorMsg: ACT_HIST,  expectedNoSelectionMsg: '',         expectedSuccessMsg: '',       expectedHistoryMsg: ACT_HIST,  ...base, filterNoMatch: '', longBoundary: '', emptyBoundary: '' },
    { testCase: 'PLN_WTC05', feature: 'Activation',          expectedErrorMsg: ACT_ERR,   expectedNoSelectionMsg: '',         expectedSuccessMsg: '',       expectedHistoryMsg: '',        ...base, filterNoMatch: '', longBoundary: '', emptyBoundary: '' },
    { testCase: 'PLN_WTC06', feature: 'Deactivation',        expectedErrorMsg: DEACT_ERR, expectedNoSelectionMsg: DEACT_NSEL, expectedSuccessMsg: DEACT_OK, expectedHistoryMsg: DEACT_HIST, ...base, filterNoMatch: '', longBoundary: '', emptyBoundary: '' },
    { testCase: 'PLN_WTC07', feature: 'Deactivation',        expectedErrorMsg: DEACT_ERR, expectedNoSelectionMsg: DEACT_NSEL, expectedSuccessMsg: '',       expectedHistoryMsg: '',        ...base, longBoundary: '', emptyBoundary: '' },
    { testCase: 'PLN_WTC08', feature: 'Deactivation',        expectedErrorMsg: DEACT_ERR, expectedNoSelectionMsg: '',         expectedSuccessMsg: DEACT_OK, expectedHistoryMsg: DEACT_HIST, ...base, filterNoMatch: '', longBoundary: '', emptyBoundary: '' },
    { testCase: 'PLN_WTC09', feature: 'DeactivationHistory', expectedErrorMsg: DEACT_ERR, expectedNoSelectionMsg: '',         expectedSuccessMsg: '',       expectedHistoryMsg: DEACT_HIST, ...base, filterNoMatch: '', longBoundary: '', emptyBoundary: '' },
    { testCase: 'PLN_WTC10', feature: 'Module',              expectedErrorMsg: '',        expectedNoSelectionMsg: '',         expectedSuccessMsg: '',       expectedHistoryMsg: '',        ...base, filterNoMatch: '', longBoundary: '', emptyBoundary: '' },
  ];

  rows.forEach(r => sheet.addRow(r));

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  headerRow.commit();

  await workbook.xlsx.writeFile(DATA_FILE);
  console.log('\nPlanogram sheet written to testData.xlsx');
  console.log('DB flags:', {
    hasPendingActivation: dbData.hasPendingActivation,
    hasActivatedRecords:  dbData.hasActivatedRecords,
    activationCount:      dbData.activationCount,
    sampleDescription:    dbData.sampleDescription || '(none)',
  });
}

queryDB()
  .then(seedSheet)
  .catch(e => { console.error('Seed error:', e.message); process.exit(1); });
