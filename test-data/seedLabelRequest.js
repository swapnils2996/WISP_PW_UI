/**
 * Seeds "LabelRequest" sheet in testData.xlsx with live data from ISP PostgreSQL DB.
 * Run: node test-data/seedLabelRequest.js
 */
const ExcelJS = require('exceljs');
const { Client } = require('pg');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'testData.xlsx');

async function queryDB() {
  const client = new Client({
    host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1'
  });
  await client.connect();
  console.log('Connected to ISP DB');

  // Valid active SKU with primary UPC
  let validItem = { SkuNo: '123458', UpcNo: '0702946002390', Description: 'CN-MATBOARD B8456' };
  try {
    const r = await client.query(`
      SELECT i."SkuNo"::text AS "SkuNo", u."UpcNo", i."Description"
      FROM dbo."Item" i
      JOIN dbo."Upc" u ON u."ItemId"=i."Id" AND u."IsPrimary"=1 AND u."RecordDelete"=0
      WHERE i."Status"='A' AND i."RecordDelete"=0 LIMIT 1`);
    if (r.rows[0]) validItem = r.rows[0];
  } catch (e) { console.warn('Item query note:', e.message); }

  // Valid planogram for TC-LR-16
  let validPlano = { Department: '6', Number: '517', Level: 'I', Description: 'Fixatives & Adhesives 20\'' };
  try {
    const r = await client.query(`
      SELECT "Department"::text AS "Department", "Number"::text AS "Number", "Level", "Description"
      FROM dbo."Planogram"
      WHERE "RecordDelete"=0 AND "Department" IS NOT NULL
      GROUP BY "Department","Number","Level","Description"
      HAVING COUNT(*) > 3
      ORDER BY COUNT(*) DESC LIMIT 1`);
    if (r.rows[0]) validPlano = r.rows[0];
  } catch (e) { console.warn('Planogram query note:', e.message); }

  // Check Item Maintenance label records (LabelRequestType=2)
  let imHasRecords = false;
  let imRequestReason = 'UPC Change';
  try {
    const r = await client.query(`
      SELECT COUNT(*) AS cnt, "RequestReason"
      FROM dbo."LabelRequest"
      WHERE "LabelRequestType"=2 AND "RequestReason" IS NOT NULL AND "RequestReason"!=''
      GROUP BY "RequestReason"
      ORDER BY COUNT(*) DESC LIMIT 1`);
    if (r.rows[0] && parseInt(r.rows[0].cnt) > 0) {
      imHasRecords = true;
      imRequestReason = r.rows[0].RequestReason;
    }
  } catch (e) { console.warn('IM query note:', e.message); }

  // Label specifications
  let hasLabelSpecs = false;
  try {
    const r = await client.query('SELECT COUNT(*) AS cnt FROM dbo."LabelSpecification"');
    hasLabelSpecs = parseInt(r.rows[0].cnt) > 0;
  } catch (e) { console.warn('LabelSpec query note:', e.message); }

  // User for print popup (TC-LR-11)
  let printUser = 'system';
  try {
    const r = await client.query(`
      SELECT "UserName" FROM dbo."LabelRequest"
      WHERE "UserName" IS NOT NULL AND "UserName"!='' LIMIT 1`);
    if (r.rows[0]) printUser = r.rows[0].UserName;
  } catch (e) { console.warn('User query note:', e.message); }

  // ItemLabelMap - check for mass label items
  let massLabelHasItems = false;
  let massLabelClearanceCount = '0';
  try {
    const r = await client.query(`SELECT COUNT(*) AS cnt FROM dbo."ItemLabelMap" WHERE "LabelType"='D'`);
    const cnt = parseInt(r.rows[0].cnt);
    massLabelHasItems = cnt > 0;
    massLabelClearanceCount = String(cnt);
  } catch (e) { console.warn('Mass label query note:', e.message); }

  await client.end();

  return {
    validSkuNo:               validItem.SkuNo,
    validUpcNo:               validItem.UpcNo,
    validItemDesc:            validItem.Description,
    invalidSkuNo:             '99999999',
    validPlanogramDept:       validPlano.Department,
    validPlanogramNo:         validPlano.Number,
    validPlanogramLevel:      validPlano.Level,
    validPlanogramDesc:       validPlano.Description,
    invalidPlanogramDept:     '999',
    invalidPlanogramNo:       '99999',
    invalidPlanogramLevel:    'A',
    itemMaintenanceHasRecords: String(imHasRecords),
    itemMaintenanceReason:    imRequestReason,
    massLabelHasItems:        String(massLabelHasItems),
    massLabelClearanceCount:  massLabelClearanceCount,
    hasLabelSpecs:            String(hasLabelSpecs),
    printUser:                printUser,
    validPrice:               '1.00',
    validQty:                 '2',
    largeQty:                 '5',
    invalidPrice:             'ABC',
    negativeQty:              '-1',
    zeroQty:                  '0',
    filterNoMatch:            'ZZZZZZZ99999',
    expectedNoRecordsMsg:     'No Records Found',
    expectedNoSelDeleteMsg:   'Select a label to delete',
    expectedPrintNoItemsMsg:  'no labels',
    expectedPlanoNoItemsMsg:  'No Items found',
    expectedPlanoPrintNoSelMsg: 'select',
    expectedMassNoCbMsg:      'select',
    expectedInvalidPriceMsg:  'valid',
    expectedInvalidQtyMsg:    'valid',
    planogramPrintFrom:       '1',
    planogramPrintTo:         '3',
  };
}

async function seedSheet(data) {
  const workbook = new ExcelJS.Workbook();
  try { await workbook.xlsx.readFile(DATA_FILE); } catch { /* new file */ }

  // Remove existing sheet if present
  const existingIdx = workbook.worksheets.findIndex(ws => ws.name === 'LabelRequest');
  if (existingIdx >= 0) workbook.removeWorksheetEx(workbook.worksheets[existingIdx]);

  const sheet = workbook.addWorksheet('LabelRequest');

  const headers = Object.keys(data);
  sheet.addRow(headers);

  // Add 52 identical data rows (one per test case)
  for (let i = 1; i <= 52; i++) {
    sheet.addRow(Object.values(data));
  }

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

  await workbook.xlsx.writeFile(DATA_FILE);
  console.log('Seeded LabelRequest sheet with data:');
  console.log(JSON.stringify(data, null, 2));
}

queryDB().then(seedSheet).catch(e => { console.error('Seed error:', e.message); process.exit(1); });
