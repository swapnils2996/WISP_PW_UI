/**
 * Seeds Sheet3 "Inquiry" in testData.xlsx with live data queried from the ISP PostgreSQL DB.
 * Run: node test-data/seedInquiry.js
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

  // Valid active SKU with primary UPC
  const itemUpcRes = await client.query(`
    SELECT i."SkuNo", u."UpcNo", i."Description", i."DepartmentId"
    FROM dbo."Item" i
    JOIN dbo."Upc" u ON u."ItemId" = i."Id" AND u."IsPrimary" = 1 AND u."RecordDelete" = 0
    WHERE i."Status" = 'A' AND i."RecordDelete" = 0
    LIMIT 1
  `);
  const validItem = itemUpcRes.rows[0] || { SkuNo: '123458', UpcNo: '0702946002390', Description: 'CN-MATBOARD B8456', DepartmentId: 32 };

  // Item with planogram data
  const pogItemRes = await client.query(`
    SELECT DISTINCT i."SkuNo", i."Description"
    FROM dbo."Planogram" p
    JOIN dbo."Item" i ON p."ItemId" = i."Id"
    WHERE i."Status" = 'A' AND i."RecordDelete" = 0 AND p."RecordDelete" = 0
    LIMIT 1
  `);
  const pogItem = pogItemRes.rows[0] || { SkuNo: '1768', Description: 'BEA FBRC STIFFENER 8 OZ' };

  // Item with sales history
  const salesItemRes = await client.query(`
    SELECT DISTINCT sh."SkuNo", i."Description"
    FROM dbo."SalesHistory" sh
    JOIN dbo."Item" i ON CAST(sh."SkuNo" AS TEXT) = CAST(i."SkuNo" AS TEXT)
    WHERE i."Status" = 'A' AND i."RecordDelete" = 0
    LIMIT 1
  `);
  const salesItem = salesItemRes.rows[0] || { SkuNo: '2', Description: 'HOME DECOR DEPT QUICK CODE' };

  // Item with promotion data
  const promoItemRes = await client.query(`
    SELECT DISTINCT i."SkuNo", i."Description"
    FROM dbo."PromotionDetail" pd
    JOIN dbo."Item" i ON pd."ItemId" = i."Id"
    WHERE i."Status" = 'A' AND i."RecordDelete" = 0 AND pd."RecordDelete" = 0
    LIMIT 1
  `);
  const promoItem = promoItemRes.rows[0] || { SkuNo: validItem.SkuNo, Description: validItem.Description };

  // Store address data for Store Address Inquiry tests
  const storeRes = await client.query(`
    SELECT s."StoreNo", s."StoreType", a."City", a."State", a."Zip", a."AddressLine1"
    FROM dbo."Store" s
    JOIN dbo."StoreAddress" sa ON sa."StoreID" = s."ID" AND sa."RecordDelete" = 0
    JOIN dbo."Address" a ON a."ID" = sa."AddressID" AND a."RecordDelete" = 0
    WHERE s."RecordDelete" = 0 AND s."CloseDate" IS NULL AND a."City" IS NOT NULL AND a."City" <> '-'
    LIMIT 1
  `);
  const store = storeRes.rows[0] || { StoreNo: 1, City: 'FORT WORTH', State: 'TX', Zip: '76177-4528', StoreType: 'W' };

  // Second store for multi-store searches
  const storeStateRes = await client.query(`
    SELECT DISTINCT a."State", COUNT(s."ID") as cnt
    FROM dbo."Store" s
    JOIN dbo."StoreAddress" sa ON sa."StoreID" = s."ID" AND sa."RecordDelete" = 0
    JOIN dbo."Address" a ON a."ID" = sa."AddressID" AND a."RecordDelete" = 0
    WHERE s."RecordDelete" = 0 AND s."CloseDate" IS NULL AND a."State" IS NOT NULL AND a."State" NOT IN ('','-')
    GROUP BY a."State"
    HAVING COUNT(s."ID") > 1
    ORDER BY cnt DESC
    LIMIT 1
  `);
  const multiState = storeStateRes.rows[0] ? storeStateRes.rows[0].State : 'TX';

  await client.end();
  return { validItem, pogItem, salesItem, promoItem, store, multiState };
}

async function seedInquiry() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(DATA_FILE);

  // Remove existing Sheet3 if present
  const existing = wb.getWorksheet('Inquiry');
  if (existing) wb.removeWorksheet(existing.id);

  const { validItem, pogItem, salesItem, promoItem, store, multiState } = await queryDB();

  const inqSheet = wb.addWorksheet('Inquiry');
  inqSheet.columns = [
    { header: 'TestCase',             key: 'testCase',             width: 15 },
    { header: 'Feature',              key: 'feature',              width: 22 },
    { header: 'ValidSkuNo',           key: 'validSkuNo',           width: 15 },
    { header: 'ValidUpcNo',           key: 'validUpcNo',           width: 18 },
    { header: 'ValidItemDesc',        key: 'validItemDesc',        width: 35 },
    { header: 'SkuWithPlanogram',     key: 'skuWithPlanogram',     width: 18 },
    { header: 'SkuWithSalesHistory',  key: 'skuWithSalesHistory',  width: 20 },
    { header: 'SkuWithPromotion',     key: 'skuWithPromotion',     width: 18 },
    { header: 'InvalidSkuNo',         key: 'invalidSkuNo',         width: 15 },
    { header: 'DescKeyword',          key: 'descKeyword',          width: 20 },
    { header: 'DescNoMatch',          key: 'descNoMatch',          width: 30 },
    { header: 'VendorName',           key: 'vendorName',           width: 20 },
    { header: 'ValidStoreNo',         key: 'validStoreNo',         width: 15 },
    { header: 'ValidCity',            key: 'validCity',            width: 20 },
    { header: 'ValidState',           key: 'validState',           width: 12 },
    { header: 'ValidZip',             key: 'validZip',             width: 15 },
    { header: 'MultiResultState',     key: 'multiResultState',     width: 18 },
    { header: 'NonExistentStoreNo',   key: 'nonExistentStoreNo',   width: 20 },
    { header: 'ExpectedNotFoundMsg',  key: 'expectedNotFoundMsg',  width: 45 },
    { header: 'ExpectedEmptyMsg',     key: 'expectedEmptyMsg',     width: 40 },
    { header: 'ExpectedVendorMsg',    key: 'expectedVendorMsg',    width: 50 },
    { header: 'ExpectedNoItemsMsg',   key: 'expectedNoItemsMsg',   width: 25 },
  ];

  const skuStr = String(validItem.SkuNo);
  const common = {
    validSkuNo:           skuStr,
    validUpcNo:           String(validItem.UpcNo),
    validItemDesc:        String(validItem.Description),
    skuWithPlanogram:     String(pogItem.SkuNo),
    skuWithSalesHistory:  String(salesItem.SkuNo),
    skuWithPromotion:     String(promoItem.SkuNo),
    invalidSkuNo:         '00000001',
    descKeyword:          'MATBOARD',
    descNoMatch:          'xyznonexistentitem123',
    vendorName:           'Amscan',
    validStoreNo:         String(store.StoreNo),
    validCity:            String(store.City),
    validState:           String(store.State),
    validZip:             String(store.Zip).split('-')[0],
    multiResultState:     String(multiState),
    nonExistentStoreNo:   '99999',
    expectedNotFoundMsg:  `Item with Sku/Upc ${skuStr.substring(0,8)} not found.`,
    expectedEmptyMsg:     'Please enter valid sku or upc number.',
    expectedVendorMsg:    'Please enter department number along with vendor',
    expectedNoItemsMsg:   'No items were found',
  };

  const rows = [
    { testCase: 'INQ_WTC01', feature: 'ItemInquiry',      ...common },
    { testCase: 'INQ_WTC02', feature: 'ItemInquiry',      ...common },
    { testCase: 'INQ_WTC03', feature: 'ItemInquiry',      ...common },
    { testCase: 'INQ_WTC04', feature: 'ItemInquiry',      ...common },
    { testCase: 'INQ_WTC05', feature: 'ItemInquiry',      ...common },
    { testCase: 'INQ_WTC06', feature: 'ItemInquiry',      ...common },
    { testCase: 'INQ_WTC07', feature: 'ItemInquiry',      ...common },
    { testCase: 'INQ_WTC08', feature: 'ItemInquiry',      ...common },
    { testCase: 'SAI_WTC01', feature: 'StoreAddressInq',  ...common },
    { testCase: 'SAI_WTC02', feature: 'StoreAddressInq',  ...common },
    { testCase: 'SAI_WTC03', feature: 'StoreAddressInq',  ...common },
    { testCase: 'SAI_WTC04', feature: 'StoreAddressInq',  ...common },
    { testCase: 'SAI_WTC05', feature: 'StoreAddressInq',  ...common },
    { testCase: 'SAI_WTC06', feature: 'StoreAddressInq',  ...common },
  ];

  rows.forEach(r => inqSheet.addRow(r));

  await wb.xlsx.writeFile(DATA_FILE);
  console.log('Sheet3 "Inquiry" added to testData.xlsx');
  console.log('  validSkuNo:', common.validSkuNo);
  console.log('  validUpcNo:', common.validUpcNo);
  console.log('  skuWithPlanogram:', common.skuWithPlanogram);
  console.log('  skuWithSalesHistory:', common.skuWithSalesHistory);
  console.log('  validStoreNo:', common.validStoreNo);
  console.log('  validCity:', common.validCity);
  console.log('  multiResultState:', common.multiResultState);
}

seedInquiry().catch(err => { console.error('Error:', err.message); process.exit(1); });
