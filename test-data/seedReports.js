/**
 * Seed script for Reports test data.
 * DB (isp) has no report-specific tables, so values are derived from the CSV spec
 * and sensible defaults for the fields exposed in the live UI.
 *
 * Run: node test-data/seedReports.js
 */

const { Client } = require('pg');
const ExcelJS = require('exceljs');
const path = require('path');

const EXCEL_FILE = path.join(__dirname, 'testData.xlsx');
const dbConfig = { host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' };

async function queryDBContext() {
  const client = new Client(dbConfig);
  await client.connect();
  console.log('Connected to ISP DB');

  // Attempt to find PO data for valid PO numbers
  let validPOFromNo = '1';
  let validPOToNo = '999999';
  try {
    const poRes = await client.query(`
      SELECT MIN(po_no) as min_po, MAX(po_no) as max_po FROM po_header LIMIT 1
    `).catch(() => null);
    if (poRes && poRes.rows.length > 0 && poRes.rows[0].min_po) {
      validPOFromNo = String(poRes.rows[0].min_po);
      validPOToNo = String(poRes.rows[0].max_po);
    }
  } catch (_) {}

  await client.end();
  console.log('DB connection closed');
  return { validPOFromNo, validPOToNo };
}

async function seedExcel(dbData) {
  const today = new Date();
  const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  const past30 = new Date(today); past30.setDate(today.getDate() - 30);

  const data = {
    // Department Class Report (RP_WTC01, RP_WTC02)
    validDeptFrom: '1',
    validDeptTo: '100',
    invalidDeptHigh: '2147483648',

    // Open Purchase Orders Report (RP_WTC07)
    validPOBeginDate: fmt(past30),
    validPOEndDate: fmt(today),

    // Purchase Order Activity Report (RP_WTC08)
    validPOFromNo: dbData.validPOFromNo,
    validPOToNo: dbData.validPOToNo,

    // Planogram Profile Report (RP_WTC09)
    validDCAreaFrom: '1',
    validDCAreaTo: '100',

    // Validation messages (exact text from CSV spec)
    expectedDeptRangeBeginMsg: 'Beginning range must be a number with a value less than 2147483647.',
    expectedDeptRangeEndMsg: 'Ending range must be a number with a value less than 2147483647.',
    expectedDeptFromToMsg: 'Department Range "From" value should be less that "To" value.',
    expectedPODateRequiredMsg: 'Both begin and end dates are required',
    expectedPODateOrderMsg: 'Beginning date must not be greater than Ending date',
    expectedPOBeginNumMsg: 'Beginning value must be a number.',
    expectedPOEndNumMsg: 'Ending value must be a number.',
    expectedPONumOrderMsg: 'Ending value must be larger than beginning value.',
    expectedDCAreaOrderMsg: 'From DC Area can not be greater than To DC Area',
    expectedReprintNoViewSelMsg: 'Please select an report to view.',
    expectedReprintNoPrintSelMsg: 'Please select an report to print.',
    expectedReprintFilenameMsg: 'Unable to create report filename from selected report',
    expectedReprintBannerMsg: 'Reports Loaded',
  };

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(EXCEL_FILE);
    console.log('Loaded existing testData.xlsx');
  } catch (_) {
    console.log('Creating new testData.xlsx');
  }

  const existing = workbook.getWorksheet('Reports');
  if (existing) { workbook.removeWorksheet(existing.id); console.log('Removed old Reports sheet'); }

  const sheet = workbook.addWorksheet('Reports');
  sheet.columns = [
    { header: 'TestCase',                   key: 'testCase',                   width: 15 },
    { header: 'Feature',                    key: 'feature',                    width: 25 },
    { header: 'ValidDeptFrom',              key: 'validDeptFrom',              width: 15 },
    { header: 'ValidDeptTo',               key: 'validDeptTo',               width: 15 },
    { header: 'InvalidDeptHigh',           key: 'invalidDeptHigh',           width: 18 },
    { header: 'ValidPOBeginDate',          key: 'validPOBeginDate',          width: 18 },
    { header: 'ValidPOEndDate',            key: 'validPOEndDate',            width: 18 },
    { header: 'ValidPOFromNo',             key: 'validPOFromNo',             width: 15 },
    { header: 'ValidPOToNo',              key: 'validPOToNo',              width: 15 },
    { header: 'ValidDCAreaFrom',           key: 'validDCAreaFrom',           width: 15 },
    { header: 'ValidDCAreaTo',            key: 'validDCAreaTo',            width: 15 },
    { header: 'ExpectedDeptRangeBeginMsg', key: 'expectedDeptRangeBeginMsg', width: 60 },
    { header: 'ExpectedDeptRangeEndMsg',   key: 'expectedDeptRangeEndMsg',   width: 60 },
    { header: 'ExpectedDeptFromToMsg',     key: 'expectedDeptFromToMsg',     width: 60 },
    { header: 'ExpectedPODateRequiredMsg', key: 'expectedPODateRequiredMsg', width: 45 },
    { header: 'ExpectedPODateOrderMsg',    key: 'expectedPODateOrderMsg',    width: 55 },
    { header: 'ExpectedPOBeginNumMsg',     key: 'expectedPOBeginNumMsg',     width: 40 },
    { header: 'ExpectedPOEndNumMsg',       key: 'expectedPOEndNumMsg',       width: 40 },
    { header: 'ExpectedPONumOrderMsg',     key: 'expectedPONumOrderMsg',     width: 50 },
    { header: 'ExpectedDCAreaOrderMsg',    key: 'expectedDCAreaOrderMsg',    width: 50 },
    { header: 'ExpectedReprintNoViewSelMsg',  key: 'expectedReprintNoViewSelMsg',  width: 40 },
    { header: 'ExpectedReprintNoPrintSelMsg', key: 'expectedReprintNoPrintSelMsg', width: 40 },
    { header: 'ExpectedReprintFilenameMsg',   key: 'expectedReprintFilenameMsg',   width: 55 },
    { header: 'ExpectedReprintBannerMsg',     key: 'expectedReprintBannerMsg',     width: 25 },
  ];

  sheet.addRow({ testCase: 'RP_WTC01', feature: 'Reports', ...data });

  await workbook.xlsx.writeFile(EXCEL_FILE);
  console.log(`\n✓ Reports sheet seeded in ${EXCEL_FILE}`);
  console.log('Data:', JSON.stringify(data, null, 2));
}

(async () => {
  try {
    const dbData = await queryDBContext();
    await seedExcel(dbData);
    console.log('\n✓ Done');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
})();
