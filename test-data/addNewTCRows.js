/**
 * Adds rows for TC-INQ-25 through TC-INQ-30 to the "Item Inquiry" sheet in testData.xlsx.
 * Run: node test-data/addNewTCRows.js
 */
const ExcelJS = require('exceljs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'testData.xlsx');

async function addRows() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(DATA_FILE);

  const sheet = wb.getWorksheet('Item Inquiry');
  if (!sheet) { console.error('"Item Inquiry" sheet not found'); process.exit(1); }

  // Read common values from existing row 2 (first data row)
  const headers = [];
  sheet.getRow(1).eachCell(cell => headers.push(String(cell.value ?? '').trim()));

  const existingRow = sheet.getRow(2);
  const common = {};
  existingRow.eachCell({ includeEmpty: true }, (cell, colIdx) => {
    const h = headers[colIdx - 1];
    if (h && h !== 'TestCase') common[h] = String(cell.value ?? '').trim();
  });

  const newTCs = ['TC-INQ-25', 'TC-INQ-26', 'TC-INQ-27', 'TC-INQ-28', 'TC-INQ-29', 'TC-INQ-30'];

  // Check which ones already exist
  const existing = new Set();
  sheet.eachRow((row, idx) => {
    if (idx === 1) return;
    const tc = String(row.getCell(1).value ?? '').trim();
    existing.add(tc);
  });

  for (const tc of newTCs) {
    if (existing.has(tc)) {
      console.log(`${tc} already exists, skipping.`);
      continue;
    }
    const rowData = { TestCase: tc, ...common };
    const values = headers.map(h => rowData[h] ?? '');
    sheet.addRow(values);
    console.log(`Added ${tc}`);
  }

  await wb.xlsx.writeFile(DATA_FILE);
  console.log('Done. testData.xlsx updated.');
}

addRows().catch(err => { console.error('Error:', err.message); process.exit(1); });
