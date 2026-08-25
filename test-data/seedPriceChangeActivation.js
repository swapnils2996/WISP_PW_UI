/**
 * Seeds "PriceChangeActivation" sheet in testData.xlsx from ISP PostgreSQL DB.
 * Run: node test-data/seedPriceChangeActivation.js
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

  // Largest event (most items, any status) - good for UI/hierarchy testing
  let validEvent = { EventNumber: 'PC6943', BatchNumber: 1, SkuNo: '100638', UpcNo: '0886946355387', NewPrice: '2.00', itemCount: 126 };
  try {
    const r = await client.query(`
      SELECT e."EventNumber", b."BatchNumber",
             it."SkuNo"::text AS "SkuNo", u."UpcNo", i."NewPrice"::text AS "NewPrice",
             COUNT(i."Id") OVER (PARTITION BY e."Id") AS item_count
      FROM dbo."PriceActivationEvent" e
      JOIN dbo."PriceActivationBatch" b ON b."EventId"=e."Id"
      JOIN dbo."PriceActivationItem" i ON i."BatchId"=b."Id" AND i."RecordDelete"=0
      JOIN dbo."Item" it ON it."Id"=i."ItemId"
      LEFT JOIN dbo."Upc" u ON u."ItemId"=it."Id" AND u."IsPrimary"=1 AND u."RecordDelete"=0
      WHERE e."RecordDelete"=0
      ORDER BY item_count DESC, e."Id" DESC
      LIMIT 1
    `);
    if (r.rows[0]) validEvent = { ...validEvent, ...r.rows[0] };
  } catch (e) { console.warn('validEvent query:', e.message); }

  // Pending event (ActivationStatus=7, non-zero items) - for E2E activation
  let pendingEvent = { EventNumber: 'PC6988', BatchNumber: 1, pendingSkuNo: '999999' };
  try {
    const r = await client.query(`
      SELECT e."EventNumber", b."BatchNumber", it."SkuNo"::text AS "SkuNo"
      FROM dbo."PriceActivationEvent" e
      JOIN dbo."PriceActivationBatch" b ON b."EventId"=e."Id"
      JOIN dbo."PriceActivationItem" i ON i."BatchId"=b."Id" AND i."RecordDelete"=0 AND i."ActivationStatus"=7
      JOIN dbo."Item" it ON it."Id"=i."ItemId"
      WHERE e."RecordDelete"=0
      LIMIT 1
    `);
    if (r.rows[0]) pendingEvent = { EventNumber: r.rows[0].EventNumber, BatchNumber: r.rows[0].BatchNumber, pendingSkuNo: r.rows[0].SkuNo };
  } catch (e) { console.warn('pendingEvent query:', e.message); }

  // Previously activated event (ActivationStatus=6) - for negative activation test
  let activatedEvent = { EventNumber: 'PC6943' };
  try {
    const r = await client.query(`
      SELECT DISTINCT e."EventNumber"
      FROM dbo."PriceActivationEvent" e
      JOIN dbo."PriceActivationBatch" b ON b."EventId"=e."Id"
      JOIN dbo."PriceActivationItem" i ON i."BatchId"=b."Id" AND i."RecordDelete"=0 AND i."ActivationStatus"=6
      WHERE e."RecordDelete"=0
      ORDER BY e."EventNumber" DESC LIMIT 1
    `);
    if (r.rows[0]) activatedEvent = r.rows[0];
  } catch (e) { console.warn('activatedEvent query:', e.message); }

  // Check event + batch counts
  let hasEvents = false;
  let totalEvents = 0;
  try {
    const r = await client.query(`SELECT COUNT(*) AS cnt FROM dbo."PriceActivationEvent" WHERE "RecordDelete"=0`);
    totalEvents = parseInt(r.rows[0].cnt);
    hasEvents = totalEvents > 0;
  } catch (e) { console.warn('hasEvents query:', e.message); }

  let hasPendingEvents = false;
  try {
    const r = await client.query(`
      SELECT COUNT(DISTINCT e."Id") AS cnt
      FROM dbo."PriceActivationEvent" e
      JOIN dbo."PriceActivationBatch" b ON b."EventId"=e."Id"
      JOIN dbo."PriceActivationItem" i ON i."BatchId"=b."Id" AND i."RecordDelete"=0 AND i."ActivationStatus"=7
      WHERE e."RecordDelete"=0
    `);
    hasPendingEvents = parseInt(r.rows[0].cnt) > 0;
  } catch (e) { console.warn('hasPending query:', e.message); }

  await client.end();

  return {
    // Valid test data
    validEventNo:            String(validEvent.EventNumber || 'PC6943'),
    validBatchNo:            String(validEvent.BatchNumber || '1'),
    validSkuNo:              String(validEvent.SkuNo || '100638'),
    validUpcNo:              String(validEvent.UpcNo || '0886946355387'),
    validNewPrice:           String(validEvent.NewPrice || '2.00'),
    // Pending event data
    pendingEventNo:          String(pendingEvent.EventNumber || 'PC6988'),
    pendingBatchNo:          String(pendingEvent.BatchNumber || '1'),
    pendingSkuNo:            String(pendingEvent.pendingSkuNo || '999999'),
    // Already-activated event
    activatedEventNo:        String(activatedEvent.EventNumber || 'PC6943'),
    // Non-existent values (for negative tests)
    nonExistentEventNo:      'PC99999',
    nonExistentBatchNo:      '99999',
    nonExistentSkuNo:        '9999999',
    // Environment flags
    hasEvents:               String(hasEvents),
    hasPendingEvents:        String(hasPendingEvents),
    totalEvents:             String(totalEvents),
    // Expected messages from UI (verified against CSV test cases)
    expectedNoItemsActivate:  'No items selected to activate!',
    expectedSkuActivateMsg:   'Cannot activate items at Sku level',
    expectedPrevPostedMsg:    'One or more Batches have been previously posted.',
    expectedZeroCountMsg:     'Cannot Activate items: Batch/Item count is 0 for:',
    expectedActivatePopupTitle: 'Activate Items',
    expectedActivationSuccess:  'Activation Processed',
    expectedActivateFail:     'Unable to activate a price change event',
    expectedNoItemsPrintWkst: 'No items selected to print',
    expectedSkuPrintWkst:     'Cannot print items at Sku level',
    expectedZeroCountPrintWkst: 'Cannot print items: Batch/Item count is 0 for:',
    expectedPrintInProgress:  'Printing in progress:',
    expectedNoItemsPrintLabels: 'No items selected to print',
    expectedSkuPrintLabels:   'Cannot print items at Sku level',
    expectedTooManyItemsMsg:  'Total items on event should be less than 2000.',
    expectedNoEventsMsg:      'No price change activation events found',
    expectedNoBatchesMsg:     'No price change activation batches found for the event',
    expectedNoSkusMsg:        'No price change activation  SKUs found for the batch',
    expectedEventNotFound:    'was not found!',
    expectedEmptySearchMsg:   'may not be empty',
  };
}

async function seedSheet(data) {
  const workbook = new ExcelJS.Workbook();
  try { await workbook.xlsx.readFile(DATA_FILE); } catch { /* new file */ }

  const existingIdx = workbook.worksheets.findIndex(ws => ws.name === 'PriceChangeActivation');
  if (existingIdx >= 0) workbook.removeWorksheetEx(workbook.worksheets[existingIdx]);

  const sheet = workbook.addWorksheet('PriceChangeActivation');
  const headers = Object.keys(data);
  sheet.addRow(headers);

  for (let i = 1; i <= 20; i++) {
    sheet.addRow(Object.values(data));
  }

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  await workbook.xlsx.writeFile(DATA_FILE);
  console.log('Seeded PriceChangeActivation sheet:');
  console.log(JSON.stringify(data, null, 2));
}

queryDB().then(seedSheet).catch(e => { console.error('Seed error:', e.message); process.exit(1); });
