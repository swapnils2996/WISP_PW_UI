/**
 * Seeds "Item Inquiry" sheet in testData.xlsx with live data from ISP PostgreSQL DB.
 * Run: node test-data/seedItemInquiry.js
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
    password: 'Michaels@1',
  });
  await client.connect();
  console.log('Connected to DB');

  // Valid active SKU with primary UPC
  const itemUpcRes = await client.query(`
    SELECT i."SkuNo", u."UpcNo", i."Description", i."DepartmentId"
    FROM dbo."Item" i
    JOIN dbo."Upc" u ON u."ItemId" = i."Id" AND u."IsPrimary" = 1 AND u."RecordDelete" = 0
    WHERE i."Status" = 'A' AND i."RecordDelete" = 0
    LIMIT 1
  `);
  const validItem = itemUpcRes.rows[0] || { SkuNo: '123458', UpcNo: '0702946002390', Description: 'CN-MATBOARD B8456', DepartmentId: 32 };
  console.log('validItem:', validItem.SkuNo, validItem.UpcNo);

  // SKU with planogram data
  const pogRes = await client.query(`
    SELECT DISTINCT i."SkuNo", i."Description"
    FROM dbo."Planogram" p
    JOIN dbo."Item" i ON p."ItemId" = i."Id"
    WHERE i."Status" = 'A' AND i."RecordDelete" = 0 AND p."RecordDelete" = 0
    LIMIT 1
  `);
  const pogItem = pogRes.rows[0] || { SkuNo: validItem.SkuNo, Description: validItem.Description };
  console.log('pogItem:', pogItem.SkuNo);

  // SKU with sales history
  const salesRes = await client.query(`
    SELECT DISTINCT sh."SkuNo", i."Description"
    FROM dbo."SalesHistory" sh
    JOIN dbo."Item" i ON CAST(sh."SkuNo" AS TEXT) = CAST(i."SkuNo" AS TEXT)
    WHERE i."Status" = 'A' AND i."RecordDelete" = 0
    LIMIT 1
  `);
  const salesItem = salesRes.rows[0] || { SkuNo: validItem.SkuNo, Description: validItem.Description };
  console.log('salesItem:', salesItem.SkuNo);

  // SKU with promotions
  const promoRes = await client.query(`
    SELECT DISTINCT i."SkuNo", i."Description"
    FROM dbo."PromotionDetail" pd
    JOIN dbo."Item" i ON pd."ItemId" = i."Id"
    WHERE i."Status" = 'A' AND i."RecordDelete" = 0 AND pd."RecordDelete" = 0
    LIMIT 1
  `);
  const promoItem = promoRes.rows[0] || { SkuNo: validItem.SkuNo, Description: validItem.Description };
  console.log('promoItem:', promoItem.SkuNo);

  // SKU with NO planogram (active item not in Planogram table)
  const noPogRes = await client.query(`
    SELECT i."SkuNo", i."Description"
    FROM dbo."Item" i
    WHERE i."Status" = 'A' AND i."RecordDelete" = 0
      AND i."Id" NOT IN (SELECT DISTINCT "ItemId" FROM dbo."Planogram" WHERE "RecordDelete" = 0)
    LIMIT 1
  `);
  const noPogItem = noPogRes.rows[0] || { SkuNo: '00000002', Description: 'ITEM NO POG' };
  console.log('noPogItem:', noPogItem.SkuNo);

  // SKU with NO sales history
  const noSalesRes = await client.query(`
    SELECT i."SkuNo", i."Description"
    FROM dbo."Item" i
    WHERE i."Status" = 'A' AND i."RecordDelete" = 0
      AND NOT EXISTS (
        SELECT 1 FROM dbo."SalesHistory" sh
        WHERE CAST(sh."SkuNo" AS TEXT) = CAST(i."SkuNo" AS TEXT)
      )
    LIMIT 1
  `);
  const noSalesItem = noSalesRes.rows[0] || { SkuNo: '00000003', Description: 'ITEM NO SALES' };
  console.log('noSalesItem:', noSalesItem.SkuNo);

  // Description keyword that returns multiple results
  const descKeywordRes = await client.query(`
    SELECT substring(i."Description" from 1 for 6) as kw, COUNT(*) as cnt
    FROM dbo."Item" i
    WHERE i."Status" = 'A' AND i."RecordDelete" = 0
      AND length(i."Description") > 6
    GROUP BY substring(i."Description" from 1 for 6)
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
    LIMIT 1
  `);
  const descKeyword = descKeywordRes.rows[0] ? descKeywordRes.rows[0].kw.trim() : 'MATBOARD';
  console.log('descKeyword:', descKeyword);

  await client.end();
  return { validItem, pogItem, salesItem, promoItem, noPogItem, noSalesItem, descKeyword };
}

async function seedItemInquiry() {
  const { validItem, pogItem, salesItem, promoItem, noPogItem, noSalesItem, descKeyword } = await queryDB();

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(DATA_FILE);

  // Remove existing sheet if present
  const existing = wb.getWorksheet('Item Inquiry');
  if (existing) wb.removeWorksheet(existing.id);

  const sheet = wb.addWorksheet('Item Inquiry');

  sheet.columns = [
    { header: 'TestCase',             key: 'testCase',             width: 15 },
    { header: 'Feature',              key: 'feature',              width: 20 },
    { header: 'ValidSkuNo',           key: 'validSkuNo',           width: 15 },
    { header: 'ValidUpcNo',           key: 'validUpcNo',           width: 20 },
    { header: 'ValidItemDesc',        key: 'validItemDesc',        width: 35 },
    { header: 'SkuWithPlanogram',     key: 'skuWithPlanogram',     width: 18 },
    { header: 'SkuWithSalesHistory',  key: 'skuWithSalesHistory',  width: 20 },
    { header: 'SkuWithPromotion',     key: 'skuWithPromotion',     width: 18 },
    { header: 'SkuNoPlanogram',       key: 'skuNoPlanogram',       width: 15 },
    { header: 'SkuNoSalesHistory',    key: 'skuNoSalesHistory',    width: 18 },
    { header: 'InvalidSkuNo',         key: 'invalidSkuNo',         width: 15 },
    { header: 'DescKeyword',          key: 'descKeyword',          width: 20 },
    { header: 'DescNoMatch',          key: 'descNoMatch',          width: 30 },
    { header: 'VendorName',           key: 'vendorName',           width: 20 },
    { header: 'ExpectedNotFoundMsg',  key: 'expectedNotFoundMsg',  width: 50 },
    { header: 'ExpectedEmptyMsg',     key: 'expectedEmptyMsg',     width: 45 },
    { header: 'ExpectedVendorMsg',    key: 'expectedVendorMsg',    width: 55 },
    { header: 'ExpectedNoItemsMsg',   key: 'expectedNoItemsMsg',   width: 25 },
  ];

  // Style header row
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  const skuStr = String(validItem.SkuNo);
  const common = {
    feature:             'Item Inquiry',
    validSkuNo:          skuStr,
    validUpcNo:          String(validItem.UpcNo),
    validItemDesc:       String(validItem.Description),
    skuWithPlanogram:    String(pogItem.SkuNo),
    skuWithSalesHistory: String(salesItem.SkuNo),
    skuWithPromotion:    String(promoItem.SkuNo),
    skuNoPlanogram:      String(noPogItem.SkuNo),
    skuNoSalesHistory:   String(noSalesItem.SkuNo),
    invalidSkuNo:        '00000001',
    descKeyword:         descKeyword,
    descNoMatch:         'xyznonexistentitem123',
    vendorName:          'Amscan',
    expectedNotFoundMsg: `Item with Sku/Upc 00000001 not found.`,
    expectedEmptyMsg:    'Please enter valid sku or upc number.',
    expectedVendorMsg:   'Please enter department number along with vendor',
    expectedNoItemsMsg:  'No items were found',
  };

  const testCases = [
    'TC-INQ-01','TC-INQ-02','TC-INQ-03','TC-INQ-04','TC-INQ-05','TC-INQ-06',
    'TC-INQ-07','TC-INQ-08','TC-INQ-09','TC-INQ-10','TC-INQ-11','TC-INQ-12',
    'TC-INQ-13','TC-INQ-14','TC-INQ-15','TC-INQ-16','TC-INQ-17','TC-INQ-18',
    'TC-INQ-19','TC-INQ-20','TC-INQ-21','TC-INQ-22','TC-INQ-23','TC-INQ-24',
  ];

  testCases.forEach(tc => sheet.addRow({ testCase: tc, ...common }));

  await wb.xlsx.writeFile(DATA_FILE);
  console.log('\n"Item Inquiry" sheet added to testData.xlsx successfully.');
  console.log('  validSkuNo:', common.validSkuNo);
  console.log('  validUpcNo:', common.validUpcNo);
  console.log('  skuWithPlanogram:', common.skuWithPlanogram);
  console.log('  skuWithSalesHistory:', common.skuWithSalesHistory);
  console.log('  skuNoPlanogram:', common.skuNoPlanogram);
  console.log('  skuNoSalesHistory:', common.skuNoSalesHistory);
  console.log('  descKeyword:', common.descKeyword);
}

seedItemInquiry().catch(err => { console.error('Error:', err.message); process.exit(1); });
