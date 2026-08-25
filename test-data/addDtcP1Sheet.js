const ExcelJS = require('exceljs');
const path = require('path');
const { Client } = require('pg');

const DATA_FILE = path.join(__dirname, 'testData.xlsx');
const SHEET_NAME = 'DtcP1';

async function getDbData() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'isp',
    user: 'postgres',
    password: 'Michaels@1'
  });
  await client.connect();

  const q = async (sql) => {
    try { const r = await client.query(sql); return r.rows; }
    catch(e) { console.warn('Query error:', e.message); return []; }
  };

  // Archive Records finalized count
  const archiveRows = await q('SELECT COUNT(*) as cnt FROM dbo."ArchiveRecords"');
  const archiveFinalizedCount = archiveRows[0] ? archiveRows[0].cnt : '0';

  // Item 123253 details
  const itemRows = await q('SELECT "SkuNo", "Description", "Status", "WasPrice", "LabelContentType" FROM dbo."Item" WHERE "SkuNo" = 123253 LIMIT 1');
  const item123253 = itemRows[0] || { SkuNo: '123253', Description: 'MTBRD B4099 NIGHTSHADE', Status: 'A', WasPrice: '49.99', LabelContentType: '' };

  // Vendor 1
  const vendorRows = await q('SELECT "VendorNo", "Name" FROM dbo."Vendor" WHERE "VendorNo" = 1 LIMIT 1');
  const vendor1 = vendorRows[0] || { VendorNo: 1, Name: 'MICHAELS DISTRIBUTION CENTER #' };

  // Return To Vendor - an open RTV record
  const rtvRows = await q('SELECT "Id", "VendorNumber", "RtvStatusId" FROM dbo."ReturnToVendor" WHERE "RtvStatusId" = 1 LIMIT 1');
  const rtvOpenRow = rtvRows[0] || {};

  // RTV any record
  const rtvAnyRows = await q('SELECT "Id", "VendorNumber", "RtvStatusId" FROM dbo."ReturnToVendor" LIMIT 1');
  const rtvAny = rtvAnyRows[0] || { Id: 620, VendorNumber: 3393 };

  // Inventory Adjustment item with a date
  const iaRows = await q('SELECT ia."Id", i."SkuNo", ia."DateScanned" FROM dbo."InventoryAdjustmentItem" ia JOIN dbo."Item" i ON ia."ItemId" = i."Id" ORDER BY ia."DateScanned" DESC LIMIT 1');
  const iaItem = iaRows[0] || { SkuNo: '123253', DateScanned: null };

  // Promotions for SKU 123253
  const promoRows = await q('SELECT p."EventNo", p."StartDate", p."EndDate" FROM dbo."Promotion" p JOIN dbo."PromotionDetail" pd ON pd."PromotionId" = p."Id" JOIN dbo."Item" i ON pd."ItemId" = i."Id" WHERE i."SkuNo" = 123253 LIMIT 1');
  const promo = promoRows[0] || { EventNo: '', StartDate: '', EndDate: '' };

  // Label Request - any record for UserRequestedLabel or Merchandise
  const labelRows = await q('SELECT "UserName", "LabelRequestType" FROM dbo."LabelRequest" WHERE "LabelRequestType" = \'U\' LIMIT 1');
  const labelUser = labelRows[0] ? labelRows[0].UserName : 'system';

  // Userinfo
  const userinfoRows = await q('SELECT * FROM dbo."Userinfo" LIMIT 2');
  const aspnetUserRows = await q('SELECT "LoweredUserName" FROM dbo."aspnet_Users" LIMIT 2');
  const appUsers = aspnetUserRows.length > 0 ? aspnetUserRows.map(r => r.LoweredUserName).join(', ') : 'system';

  // PurchaseOrder - open PO
  const poRows = await q('SELECT "PurchaseOrderNum", "VendorId", "OrderStatus" FROM dbo."PurchaseOrder" WHERE "OrderStatus" = \'O\' LIMIT 1');
  const openPo = poRows[0] || { PurchaseOrderNum: '', VendorId: '' };

  await client.end();

  return {
    archiveFinalizedCount: String(archiveFinalizedCount),
    sku: String(item123253.SkuNo || '123253'),
    skuDescription: item123253.Description || 'MTBRD B4099 NIGHTSHADE',
    skuWasPrice: String(item123253.WasPrice || ''),
    skuLabelContentType: item123253.LabelContentType || '',
    vendorNo: String(vendor1.VendorNo || '1'),
    vendorName: vendor1.Name || 'MICHAELS DISTRIBUTION CENTER #',
    rtvId: String(rtvAny.Id || '620'),
    rtvVendorNumber: String(rtvAny.VendorNumber || '3393'),
    iaSkuNo: String(iaItem.SkuNo || '123253'),
    promoEventNo: String(promo.EventNo || ''),
    labelPrintUser: labelUser || 'system',
    appUsers,
    openPoNumber: String(openPo.PurchaseOrderNum || ''),
  };
}

async function addSheet() {
  const dbData = await getDbData();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(DATA_FILE);

  const existing = workbook.getWorksheet(SHEET_NAME);
  if (existing) workbook.removeWorksheet(existing.id);

  const sheet = workbook.addWorksheet(SHEET_NAME);

  // Headers
  sheet.addRow([
    'TestCase', 'Feature', 'Sku', 'SkuDescription', 'SkuWasPrice',
    'ArchiveFinalizedCount', 'VendorNo', 'VendorName',
    'RtvId', 'RtvVendorNumber', 'IaSkuNo',
    'LabelPrintUser', 'AppUsers', 'OpenPoNumber',
    'ExpectedSortAriaPattern', 'ExpectedPaginatorSeparator',
    'ExpectedFilterBackground', 'ExpectedAlertHeaderColor',
    'ExpectedSectionHeaderColor', 'ExpectedPromoColumnCount',
    'ExpectedRwopoGridColumnCount', 'ListTypeName'
  ]);

  const rows = [
    ['DTC001', 'Archive Records', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC002', 'Archive Records - Accessibility', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC003', 'Generic SKU List Builder', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC004', 'Generic SKU List Builder - Accessibility', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC005', 'Generic SKU List Builder - Sort Order', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC006', 'Generic SKU List Builder - Dropdown', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC007', 'Inventory Adjustments - History Accessibility', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC008', 'Inventory Adjustments - Return To Vendor', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC009', 'Inventory Adjustments - History Date Format', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC010', 'Item Inquiry - Section Header Color', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC011', 'Item Inquiry - Label Field', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC012', 'Item Inquiry - Price Values', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC013', 'Item Inquiry - Promotions Table', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC014', 'Item Inquiry - View More Search Options', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC015', 'Item Inquiry - Sales History Order', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC016', 'Item Inquiry - Tab Colors', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC017', 'Label Request - User Requested Labels Print Dialog', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC018', 'Label Request - Merchandise Labels Print Dialog', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC019', 'Label Request - Print Dialog Size', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC020', 'Ordering & Receiving - RWOPO Select Vendor Auto Modal', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC021', 'Ordering & Receiving - RWOPO Select Vendor Title', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC022', 'Ordering & Receiving - RWOPO Grid Columns', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC023', 'Ordering & Receiving - Worksheets Data Load', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC024', 'Application Alert - Grid Cells', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC025', 'Application Alert - Header Text Color', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC026', 'Application Alert - Filter Input Appearance', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
    ['DTC027', 'Application Alert - Paginator Hyphen', dbData.sku, dbData.skuDescription, dbData.skuWasPrice,
      dbData.archiveFinalizedCount, dbData.vendorNo, dbData.vendorName,
      dbData.rtvId, dbData.rtvVendorNumber, dbData.iaSkuNo,
      dbData.labelPrintUser, dbData.appUsers, dbData.openPoNumber,
      'Change sorting for', '-', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0.54)',
      'rgb(255,255,255)', '4', '4', 'Clearance List'],
  ];

  rows.forEach(r => sheet.addRow(r));

  await workbook.xlsx.writeFile(DATA_FILE);
  console.log(`Sheet "${SHEET_NAME}" added/updated successfully in ${DATA_FILE}`);
  console.log('DB data used:', JSON.stringify(dbData, null, 2));
}

addSheet().catch(err => { console.error(err); process.exit(1); });
