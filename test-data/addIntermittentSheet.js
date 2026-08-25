const ExcelJS = require('exceljs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'testData.xlsx');
const SHEET_NAME = 'IntermittentTC';

async function addSheet() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(DATA_FILE);

  const existing = workbook.getWorksheet(SHEET_NAME);
  if (existing) workbook.removeWorksheet(existing.id);

  const sheet = workbook.addWorksheet(SHEET_NAME);

  sheet.addRow([
    'TestCase', 'Feature', 'PoNumber', 'SessionPoNumber',
    'VendorNo', 'Sku', 'Qty', 'FilterValue',
    'WorksheetNoMatchSku', 'IaHistSku', 'ExpectedStoreNo', 'ExpectedBadDate'
  ]);

  const rows = [
    ['ITC-DEF-001', 'Login/Authentication', '', '', '', '', '', '', '', '', 'SR097401', ''],
    ['ITC-DEF-002', 'Login/Authentication', '', '', '', '', '', '', '', '', 'SR097401', ''],
    ['ITC-DEF-003', 'Item Inquiry', '', '', '', '123253', '', '', '', '', '', ''],
    ['ITC-DEF-004', 'Item Inquiry', '', '', '', '123253', '', '', '', '', '', ''],
    ['ITC-DEF-013', 'Planogram', '', '', '', '', '', '', '', '', '', '12/31/1969'],
    ['ITC-DEF-014', 'Order Receiving - RWOPO', '41396081', '', '1', '2287', '5', '', '', '', '', ''],
    ['ITC-DEF-015', 'Order Receiving - Sessions', '', '40720018', '', '', '', '', '', '', '', '12/31/1969'],
    ['ITC-DEF-016', 'Order Receiving - Sessions', '', '40720018', '', '', '', '', '', '', '', ''],
    ['ITC-DEF-017', 'Order Receiving - PO Receive', '41252347', '', '', '', '', '', '', '', '', ''],
    ['ITC-DEF-018', 'Order Receiving - Purchase Orders', '41252347', '', '', '294284', '', '', '', '', '', ''],
    ['ITC-DEF-019', 'Order Receiving - PO Receive', '', '41252347', '', '', '', '', '', '', '', ''],
    ['ITC-DEF-020', 'Order Receiving - RWOPO', '', '', '1', '2287', '5', '', '', '', '', ''],
    ['ITC-DEF-021', 'Order Receiving - RWOPO', '', '', '1', '2287', '5', '', '', '', '', ''],
    ['ITC-DEF-022', 'Order Receiving - RWOPO', '', '', '1', '2287', '5', '', '', '', '', ''],
    ['ITC-DEF-023', 'Order Receiving - RWOPO', '', '', '1', '2287', '5', '', '', '', '', ''],
    ['ITC-DEF-024', 'Order Receiving - RWOPO', '', '', '1', '2287', '0', '', '', '', '', ''],
    ['ITC-DEF-025', 'Order Receiving - RWOPO', '', '', '1', '2287', '5', '', '', '', '', ''],
    ['ITC-DEF-026', 'Order Receiving - Worksheets', '', '', '', '', '', '', '', '', '', ''],
    ['ITC-DEF-027', 'Order Receiving - Worksheets', '', '', '', '', '', '', '700109', '', '', ''],
    ['ITC-DEF-028', 'Inventory Adjustments - History', '', '', '', '', '', '', '', '442857', '', ''],
    ['ITC-DEF-031', 'Print Functionality', '', '', '', '', '', '', '', '', '', ''],
    ['ITC-DEF-034', 'Inventory Adjustments - Transfer', '', '', '', '', '', '91', '', '', '', ''],
    ['ITC-DEF-035', 'Planogram - Activation', '', '', '', '', '', '', '', '', '', ''],
    ['ITC-DEF-036', 'User Management', '', '', '', '', '', '', '', '', '', ''],
    ['ITC-DEF-037', 'User Management', '', '', '', '', '', '', '', '', '', ''],
    ['ITC-DEF-038', 'User Management', '', '', '', '', '', '', '', '', '', ''],
    ['ITC-DEF-039', 'User Management', '', '', '', '', '', '', '', '', '', ''],
  ];

  rows.forEach(r => sheet.addRow(r));

  await workbook.xlsx.writeFile(DATA_FILE);
  console.log(`Sheet "${SHEET_NAME}" added successfully to ${DATA_FILE}`);
}

addSheet().catch(err => { console.error(err); process.exit(1); });
