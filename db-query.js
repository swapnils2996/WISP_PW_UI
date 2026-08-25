const ExcelJS = require('exceljs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'test-data', 'testData.xlsx');
const SHEET_NAME = 'GenericSKUListBuilder';

// Data sourced from DB queries:
// GenericSkuListCategory: CLR, GEN, NOP, NST, PKA
// Items (Active, Status=A): SKU 123458 (CN-MATBOARD B8456), 123466 (CN-MATBOARD B8458)
// UPC items: 0400100100011 (SKU=1), 0400100100028 (SKU=2)
// Configuration: QuantityMaximum=9999, QuantityWarningThreshold=150

const headers = [
  'testCase', 'feature',
  'validSku1', 'validSku1Desc',
  'validSku2', 'validSku2Desc',
  'validSku3', 'validSku3Desc',
  'validUpc1',
  'invalidSku',
  'defaultListType',
  'validQty',
  'overMaxQty',
  'warnQty',
  'validReference',
  'expectedMaxQtyMsg',
  'expectedItemExistsMsg',
  'expectedInvalidSkuMsg',
  'expectedNoRecordsMsg',
  'expectedFinalizeCompleteMsg',
  'expectedClearMsg',
  'expectedClearSuccessMsg',
  'expectedRefReqMsg',
  'expectedDeleteConfirmMsg',
  'listTypeClearance',
  'listTypeGeneric',
  'listTypeNotOnPog',
  'listTypeNewStore',
  'listTypePackaway',
];

const rows = [
  {
    testCase: 'GS_WTC01',
    feature: 'Generic SKU List Builder',
    validSku1: '123458',
    validSku1Desc: 'CN-MATBOARD B8456',
    validSku2: '123466',
    validSku2Desc: 'CN-MATBOARD B8458',
    validSku3: '123484',
    validSku3Desc: 'MTBRD B8463V SPANISH WHITE',
    validUpc1: '0400100100011',
    invalidSku: 'INVALID99999',
    defaultListType: 'Generic List',
    validQty: '5',
    overMaxQty: '10000',
    warnQty: '200',
    validReference: 'BOX001',
    expectedMaxQtyMsg: 'Maximum quanity allowed is 9999',
    expectedItemExistsMsg: 'Item already exists',
    expectedInvalidSkuMsg: 'Item not found',
    expectedNoRecordsMsg: 'There are no records to finalize',
    expectedFinalizeCompleteMsg: 'Finalization Complete',
    expectedClearMsg: 'Are you sure you want to delete this item?',
    expectedClearSuccessMsg: 'All Generic Skus for category GEN deleted',
    expectedRefReqMsg: 'Reference or box number is required',
    expectedDeleteConfirmMsg: 'Are you sure you want to delete this item?',
    listTypeClearance: 'Clearance List',
    listTypeGeneric: 'Generic List',
    listTypeNotOnPog: 'Not-on-POG',
    listTypeNewStore: 'New Store Transfer',
    listTypePackaway: 'Seasonal Packaway',
  },
  {
    testCase: 'GS_WTC02',
    feature: 'Generic SKU List Builder',
    validSku1: '123458',
    validSku1Desc: 'CN-MATBOARD B8456',
    validSku2: '123466',
    validSku2Desc: 'CN-MATBOARD B8458',
    validSku3: '123484',
    validSku3Desc: 'MTBRD B8463V SPANISH WHITE',
    validUpc1: '0400100100011',
    invalidSku: 'INVALID99999',
    defaultListType: 'Generic List',
    validQty: '5',
    overMaxQty: '10000',
    warnQty: '200',
    validReference: 'BOX001',
    expectedMaxQtyMsg: 'Maximum quanity allowed is 9999',
    expectedItemExistsMsg: 'Item already exists',
    expectedInvalidSkuMsg: 'Item not found',
    expectedNoRecordsMsg: 'There are no records to finalize',
    expectedFinalizeCompleteMsg: 'Finalization Complete',
    expectedClearMsg: 'Are you sure you want to delete this item?',
    expectedClearSuccessMsg: 'All Generic Skus for category GEN deleted',
    expectedRefReqMsg: 'Reference or box number is required',
    expectedDeleteConfirmMsg: 'Are you sure you want to delete this item?',
    listTypeClearance: 'Clearance List',
    listTypeGeneric: 'Generic List',
    listTypeNotOnPog: 'Not-on-POG',
    listTypeNewStore: 'New Store Transfer',
    listTypePackaway: 'Seasonal Packaway',
  },
  {
    testCase: 'GS_WTC03',
    feature: 'Generic SKU List Builder',
    validSku1: '123458',
    validSku1Desc: 'CN-MATBOARD B8456',
    validSku2: '123466',
    validSku2Desc: 'CN-MATBOARD B8458',
    validSku3: '123484',
    validSku3Desc: 'MTBRD B8463V SPANISH WHITE',
    validUpc1: '0400100100011',
    invalidSku: 'INVALID99999',
    defaultListType: 'Generic List',
    validQty: '5',
    overMaxQty: '10000',
    warnQty: '200',
    validReference: 'BOX001',
    expectedMaxQtyMsg: 'Maximum quanity allowed is 9999',
    expectedItemExistsMsg: 'Item already exists',
    expectedInvalidSkuMsg: 'Item not found',
    expectedNoRecordsMsg: 'There are no records to finalize',
    expectedFinalizeCompleteMsg: 'Finalization Complete',
    expectedClearMsg: 'Are you sure you want to delete this item?',
    expectedClearSuccessMsg: 'All Generic Skus for category GEN deleted',
    expectedRefReqMsg: 'Reference or box number is required',
    expectedDeleteConfirmMsg: 'Are you sure you want to delete this item?',
    listTypeClearance: 'Clearance List',
    listTypeGeneric: 'Generic List',
    listTypeNotOnPog: 'Not-on-POG',
    listTypeNewStore: 'New Store Transfer',
    listTypePackaway: 'Seasonal Packaway',
  },
  {
    testCase: 'GS_WTC04',
    feature: 'Generic SKU List Builder',
    validSku1: '123458',
    validSku1Desc: 'CN-MATBOARD B8456',
    validSku2: '123466',
    validSku2Desc: 'CN-MATBOARD B8458',
    validSku3: '123484',
    validSku3Desc: 'MTBRD B8463V SPANISH WHITE',
    validUpc1: '0400100100011',
    invalidSku: 'INVALID99999',
    defaultListType: 'Generic List',
    validQty: '5',
    overMaxQty: '10000',
    warnQty: '200',
    validReference: 'BOX001',
    expectedMaxQtyMsg: 'Maximum quanity allowed is 9999',
    expectedItemExistsMsg: 'Item already exists',
    expectedInvalidSkuMsg: 'Item not found',
    expectedNoRecordsMsg: 'There are no records to finalize',
    expectedFinalizeCompleteMsg: 'Finalization Complete',
    expectedClearMsg: 'Are you sure you want to delete this item?',
    expectedClearSuccessMsg: 'All Generic Skus for category GEN deleted',
    expectedRefReqMsg: 'Reference or box number is required',
    expectedDeleteConfirmMsg: 'Are you sure you want to delete this item?',
    listTypeClearance: 'Clearance List',
    listTypeGeneric: 'Generic List',
    listTypeNotOnPog: 'Not-on-POG',
    listTypeNewStore: 'New Store Transfer',
    listTypePackaway: 'Seasonal Packaway',
  },
  {
    testCase: 'GS_WTC05',
    feature: 'Generic SKU List Builder',
    validSku1: '123458',
    validSku1Desc: 'CN-MATBOARD B8456',
    validSku2: '123466',
    validSku2Desc: 'CN-MATBOARD B8458',
    validSku3: '123484',
    validSku3Desc: 'MTBRD B8463V SPANISH WHITE',
    validUpc1: '0400100100011',
    invalidSku: 'INVALID99999',
    defaultListType: 'Generic List',
    validQty: '5',
    overMaxQty: '10000',
    warnQty: '200',
    validReference: 'BOX001',
    expectedMaxQtyMsg: 'Maximum quanity allowed is 9999',
    expectedItemExistsMsg: 'Item already exists',
    expectedInvalidSkuMsg: 'Item not found',
    expectedNoRecordsMsg: 'There are no records to finalize',
    expectedFinalizeCompleteMsg: 'Finalization Complete',
    expectedClearMsg: 'Are you sure you want to delete this item?',
    expectedClearSuccessMsg: 'All Generic Skus for category GEN deleted',
    expectedRefReqMsg: 'Reference or box number is required',
    expectedDeleteConfirmMsg: 'Are you sure you want to delete this item?',
    listTypeClearance: 'Clearance List',
    listTypeGeneric: 'Generic List',
    listTypeNotOnPog: 'Not-on-POG',
    listTypeNewStore: 'New Store Transfer',
    listTypePackaway: 'Seasonal Packaway',
  },
  {
    testCase: 'TC-GSB-04',
    feature: 'Generic SKU List Builder',
    validSku1: '123458',
    validSku1Desc: 'CN-MATBOARD B8456',
    validSku2: '123466',
    validSku2Desc: 'CN-MATBOARD B8458',
    validSku3: '123484',
    validSku3Desc: 'MTBRD B8463V SPANISH WHITE',
    validUpc1: '0400100100011',
    invalidSku: 'INVALID99999',
    defaultListType: 'Generic List',
    validQty: '5',
    overMaxQty: '10000',
    warnQty: '200',
    validReference: 'BOX001',
    expectedMaxQtyMsg: 'Maximum quanity allowed is 9999',
    expectedItemExistsMsg: 'Item already exists',
    expectedInvalidSkuMsg: 'Item not found',
    expectedNoRecordsMsg: 'There are no records to finalize',
    expectedFinalizeCompleteMsg: 'Finalization Complete',
    expectedClearMsg: 'Are you sure you want to delete this item?',
    expectedClearSuccessMsg: 'All Generic Skus for category GEN deleted',
    expectedRefReqMsg: 'Reference or box number is required',
    expectedDeleteConfirmMsg: 'Are you sure you want to delete this item?',
    listTypeClearance: 'Clearance List',
    listTypeGeneric: 'Generic List',
    listTypeNotOnPog: 'Not-on-POG',
    listTypeNewStore: 'New Store Transfer',
    listTypePackaway: 'Seasonal Packaway',
  },
];

async function updateExcel() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(DATA_FILE);

  // Remove existing sheet if any
  const existingSheet = workbook.getWorksheet(SHEET_NAME);
  if (existingSheet) workbook.removeWorksheet(existingSheet.id);

  const sheet = workbook.addWorksheet(SHEET_NAME);

  // Header row
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Data rows
  rows.forEach(r => {
    const row = headers.map(h => r[h] || '');
    sheet.addRow(row);
  });

  // Auto column width
  sheet.columns.forEach(col => { col.width = 30; });

  await workbook.xlsx.writeFile(DATA_FILE);
  console.log('testData.xlsx updated with GenericSKUListBuilder sheet successfully.');
}

updateExcel().catch(console.error);
