/**
 * Seeds Sheet5 "InventoryAdjustments" in testData.xlsx with live data from the ISP PostgreSQL DB.
 * Run: node test-data/seedInventoryAdjustments.js
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
  console.log('Connected to isp DB');

  // Valid active SKU with primary UPC (used for RTV item add + transfer item add)
  const itemRes = await client.query(`
    SELECT i."SkuNo", u."UpcNo", i."Description"
    FROM dbo."Item" i
    JOIN dbo."Upc" u ON u."ItemId" = i."Id" AND u."IsPrimary" = 1 AND u."RecordDelete" = 0
    WHERE i."Status" = 'A' AND i."RecordDelete" = 0
    LIMIT 1
  `);
  const validItem = itemRes.rows[0] || { SkuNo: '123458', UpcNo: '0702946002390', Description: 'CN-MATBOARD B8456' };

  // Any existing RTV record (for UI tests – single finalized record in DB)
  let openRtv = { RaNo: '', VendorName: '' };
  let finalizedRtv = { RaNo: '', VendorName: '' };
  try {
    const res = await client.query(`
      SELECT rtv."ReturnAuthorizationNumber" AS "RaNo",
             rtv."VendorNumber"::text AS "VendorNumber",
             rtv."RtvStatusId"
      FROM dbo."ReturnToVendor" rtv
      ORDER BY rtv."Id" DESC
      LIMIT 5
    `);
    for (const row of res.rows) {
      const raNo = row.RaNo || '';
      // RtvStatusId=2 → Finalized; others → open
      if (row.RtvStatusId === 2 || row.RtvStatusId === '2') {
        if (!finalizedRtv.RaNo) finalizedRtv.RaNo = raNo;
      } else {
        if (!openRtv.RaNo) openRtv.RaNo = raNo;
      }
    }
    // Fallback: use same record for both if only one exists
    if (!openRtv.RaNo && res.rows[0]) openRtv.RaNo = res.rows[0].RaNo || '';
    if (!finalizedRtv.RaNo && res.rows[0]) finalizedRtv.RaNo = res.rows[0].RaNo || '';
  } catch (e) { console.warn('RTV query note:', e.message); }

  // Vendor (for RTV creation context) - use the VendorNumber from ReturnToVendor
  let vendor = { VendorName: 'TEST VENDOR' };
  try {
    const res = await client.query(`
      SELECT v."Name" AS "VendorName"
      FROM dbo."Vendor" v
      WHERE v."RecordDelete" = 0 AND v."VendorNo" > 0
      ORDER BY v."Id" ASC
      LIMIT 1
    `);
    if (res.rows[0]) vendor = res.rows[0];
  } catch (e) { console.warn('Vendor query skipped:', e.message); }

  // Destination store (different from store 1) for outbound transfer
  let destStore = { StoreNo: '2', City: 'UNKNOWN' };
  try {
    const res = await client.query(`
      SELECT s."StoreNo"::text AS "StoreNo", a."City"
      FROM dbo."Store" s
      JOIN dbo."StoreAddress" sa ON sa."StoreID" = s."ID" AND sa."RecordDelete" = 0
      JOIN dbo."Address"      a  ON a."ID" = sa."AddressID" AND a."RecordDelete" = 0
      WHERE s."RecordDelete" = 0
        AND s."CloseDate" IS NULL
        AND s."StoreNo" <> 1
        AND a."City" IS NOT NULL AND a."City" NOT IN ('', '-')
      LIMIT 1
    `);
    if (res.rows[0]) destStore = res.rows[0];
  } catch (e) { console.warn('Dest store query skipped:', e.message); }

  // Open store transfer (Status != 'Finalized')
  let openTransferExists = false;
  try {
    const res = await client.query(`
      SELECT 1 FROM dbo."StoreTransfer"
      WHERE "Status" != 'Finalized'
      LIMIT 1
    `);
    openTransferExists = res.rows.length > 0;
  } catch (e) { console.warn('Open transfer query skipped:', e.message); }

  // Finalized store transfer
  let finalizedTransferExists = false;
  try {
    const res = await client.query(`
      SELECT 1 FROM dbo."StoreTransfer"
      WHERE "Status" = 'Finalized'
      LIMIT 1
    `);
    finalizedTransferExists = res.rows.length > 0;
  } catch (e) { console.warn('Finalized transfer query skipped:', e.message); }

  // IA History – InventoryAdjustmentItem has records (11059+ found)
  let iaHistoryHasRecords = false;
  try {
    const res = await client.query(`SELECT 1 FROM dbo."InventoryAdjustmentItem" LIMIT 1`);
    iaHistoryHasRecords = res.rows.length > 0;
  } catch (e) { console.warn('IA History query skipped:', e.message); }

  // QOH/NOH Worksheets – derive from InventoryPrecountItem or CorporateDirectedCountsItem
  let qohHasRecords = false;
  try {
    const res = await client.query(`SELECT 1 FROM dbo."InventoryPrecountItem" LIMIT 1`);
    qohHasRecords = res.rows.length > 0;
  } catch (e) { console.warn('QOH/Precount query skipped:', e.message); }

  let nohHasRecords = false;
  try {
    const res = await client.query(`SELECT 1 FROM dbo."CorporateDirectedCountsItem" LIMIT 1`);
    nohHasRecords = res.rows.length > 0;
  } catch (e) { console.warn('NOH/CDC query skipped:', e.message); }

  await client.end();
  return {
    validItem, openRtv, finalizedRtv, vendor, destStore,
    openTransferExists, finalizedTransferExists,
    iaHistoryHasRecords, qohHasRecords, nohHasRecords,
  };
}

async function seedInventoryAdjustments() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(DATA_FILE);

  const existing = wb.getWorksheet('InventoryAdjustments');
  if (existing) wb.removeWorksheet(existing.id);

  const {
    validItem, openRtv, finalizedRtv, vendor, destStore,
    openTransferExists, finalizedTransferExists,
    iaHistoryHasRecords, qohHasRecords, nohHasRecords,
  } = await queryDB();

  const sheet = wb.addWorksheet('InventoryAdjustments');
  sheet.columns = [
    { header: 'TestCase',                     key: 'testCase',                     width: 15 },
    { header: 'Feature',                      key: 'feature',                      width: 25 },
    { header: 'ValidSkuNo',                   key: 'validSkuNo',                   width: 15 },
    { header: 'ValidUpcNo',                   key: 'validUpcNo',                   width: 18 },
    { header: 'ValidItemDesc',                key: 'validItemDesc',                width: 35 },
    { header: 'OpenRtvRaNo',                  key: 'openRtvRaNo',                  width: 15 },
    { header: 'FinalizedRtvRaNo',             key: 'finalizedRtvRaNo',             width: 18 },
    { header: 'VendorName',                   key: 'vendorName',                   width: 30 },
    { header: 'DestStoreNo',                  key: 'destStoreNo',                  width: 15 },
    { header: 'FilterNoMatch',                key: 'filterNoMatch',                width: 30 },
    { header: 'InvalidSkuNo',                 key: 'invalidSkuNo',                 width: 15 },
    { header: 'ValidQty',                     key: 'validQty',                     width: 10 },
    { header: 'OverMaxQty',                   key: 'overMaxQty',                   width: 12 },
    { header: 'ExpectedRaRequired',           key: 'expectedRaRequired',           width: 30 },
    { header: 'ExpectedItemAdded',            key: 'expectedItemAdded',            width: 50 },
    { header: 'ExpectedRtvFinalized',         key: 'expectedRtvFinalized',         width: 25 },
    { header: 'ExpectedPrintNoFinalized',     key: 'expectedPrintNoFinalized',     width: 55 },
    { header: 'ExpectedDeleteBlocked',        key: 'expectedDeleteBlocked',        width: 65 },
    { header: 'ExpectedItemNotFound',         key: 'expectedItemNotFound',         width: 30 },
    { header: 'ExpectedBlankSkuMsg',          key: 'expectedBlankSkuMsg',          width: 40 },
    { header: 'ExpectedQohSameMsg',           key: 'expectedQohSameMsg',           width: 85 },
    { header: 'ExpectedQohInvalidQty',        key: 'expectedQohInvalidQty',        width: 35 },
    { header: 'ExpectedQohPrintNoWS',         key: 'expectedQohPrintNoWS',         width: 55 },
    { header: 'ExpectedNohNoItems',           key: 'expectedNohNoItems',           width: 80 },
    { header: 'ExpectedNohInvalidQty',        key: 'expectedNohInvalidQty',        width: 35 },
    { header: 'ExpectedIaHistNoRecords',      key: 'expectedIaHistNoRecords',      width: 55 },
    { header: 'ExpectedTransferNoSel',        key: 'expectedTransferNoSel',        width: 45 },
    { header: 'ExpectedTransferNoItems',      key: 'expectedTransferNoItems',      width: 80 },
    { header: 'ExpectedTransferDelFinalized', key: 'expectedTransferDelFinalized', width: 55 },
    { header: 'ExpectedTransferPrintNotFin',  key: 'expectedTransferPrintNotFin',  width: 55 },
    { header: 'IaHistoryHasRecords',          key: 'iaHistoryHasRecords',          width: 20 },
    { header: 'QohHasRecords',                key: 'qohHasRecords',                width: 15 },
    { header: 'NohHasRecords',                key: 'nohHasRecords',                width: 15 },
    { header: 'OpenTransferExists',           key: 'openTransferExists',           width: 20 },
    { header: 'FinalizedTransferExists',      key: 'finalizedTransferExists',      width: 22 },
  ];

  const common = {
    validSkuNo:                    String(validItem.SkuNo   || validItem.skuno   || '123458'),
    validUpcNo:                    String(validItem.UpcNo   || validItem.upcno   || '0702946002390'),
    validItemDesc:                 String(validItem.Description || validItem.description || 'CN-MATBOARD B8456'),
    openRtvRaNo:                   String(openRtv.RaNo      || openRtv.rano      || ''),
    finalizedRtvRaNo:              String(finalizedRtv.RaNo || finalizedRtv.rano || ''),
    vendorName:                    String(vendor.VendorName || vendor.vendorname || 'TEST VENDOR'),
    destStoreNo:                   String(destStore.StoreNo || destStore.storeno || ''),
    filterNoMatch:                 'XYZXYZ_NO_MATCH_99999',
    invalidSkuNo:                  '00000001',
    validQty:                      '1',
    overMaxQty:                    '9999',
    expectedRaRequired:            'RA# is required.',
    expectedItemAdded:             'Item successfully added to RTV worksheet.',
    expectedRtvFinalized:          'RTV Finalized.',
    expectedPrintNoFinalized:      'Cannot print slips for RTVs unless finalized.',
    expectedDeleteBlocked:         'Deletion of a corporate or finalized RTV worksheet is not allowed.',
    expectedItemNotFound:          'Item not found.',
    expectedBlankSkuMsg:           'Please enter a valid Sku or UPC.',
    expectedQohSameMsg:            'The adjusted value is the same as current QOH.Please enter a different value for QOH to be adjusted.',
    expectedQohInvalidQty:         'Please enter a valid quantity',
    expectedQohPrintNoWS:          'There are no QOH worksheets. Nothing can be printed.',
    expectedNohNoItems:            'There are no items on the NOH Worksheets to edit at this time. Click on history button to view history.',
    expectedNohInvalidQty:         'Please enter a valid quantity',
    expectedIaHistNoRecords:       'No Inventory Adjustment History records found.',
    expectedTransferNoSel:         'Please select a transfer to finalize.',
    expectedTransferNoItems:       'There are no items on this transfer. Add atleast one item to the transfer before finalizing',
    expectedTransferDelFinalized:  'Unable to delete a transfer that has been finalized',
    expectedTransferPrintNotFin:   'Unable to print a transfer that has not been finalized',
    iaHistoryHasRecords:           String(iaHistoryHasRecords),
    qohHasRecords:                 String(qohHasRecords),
    nohHasRecords:                 String(nohHasRecords),
    openTransferExists:            String(openTransferExists),
    finalizedTransferExists:       String(finalizedTransferExists),
  };

  const rows = [
    { testCase: 'IA_WTC01', feature: 'ReturnToVendor',         ...common },
    { testCase: 'IA_WTC02', feature: 'ReturnToVendor',         ...common },
    { testCase: 'IA_WTC03', feature: 'ReturnToVendor',         ...common },
    { testCase: 'IA_WTC04', feature: 'RtvItem',                ...common },
    { testCase: 'IA_WTC05', feature: 'QohValidation',          ...common },
    { testCase: 'IA_WTC06', feature: 'QohValidation',          ...common },
    { testCase: 'IA_WTC07', feature: 'QohValidation',          ...common },
    { testCase: 'IA_WTC08', feature: 'NohValidation',          ...common },
    { testCase: 'IA_WTC09', feature: 'NohValidation',          ...common },
    { testCase: 'IA_WTC10', feature: 'NohValidation',          ...common },
    { testCase: 'IA_WTC11', feature: 'IaHistory',              ...common },
    { testCase: 'IA_WTC12', feature: 'IaHistory',              ...common },
    { testCase: 'IA_WTC13', feature: 'OutboundTransfer',       ...common },
    { testCase: 'IA_WTC14', feature: 'OutboundTransfer',       ...common },
    { testCase: 'IA_WTC15', feature: 'OutboundTransfer',       ...common },
    { testCase: 'IA_WTC16', feature: 'CrossModuleResilience',  ...common },
  ];

  rows.forEach(r => sheet.addRow(r));
  await wb.xlsx.writeFile(DATA_FILE);

  console.log('Sheet5 "InventoryAdjustments" added to testData.xlsx');
  console.log('  validSkuNo:          ', common.validSkuNo);
  console.log('  validUpcNo:          ', common.validUpcNo);
  console.log('  openRtvRaNo:         ', common.openRtvRaNo   || '(none found)');
  console.log('  finalizedRtvRaNo:    ', common.finalizedRtvRaNo || '(none found)');
  console.log('  vendorName:          ', common.vendorName);
  console.log('  destStoreNo:         ', common.destStoreNo   || '(none found)');
  console.log('  iaHistoryHasRecords: ', common.iaHistoryHasRecords);
  console.log('  qohHasRecords:       ', common.qohHasRecords);
  console.log('  nohHasRecords:       ', common.nohHasRecords);
  console.log('  openTransferExists:  ', common.openTransferExists);
}

seedInventoryAdjustments().catch(err => { console.error('Error:', err.message); process.exit(1); });
