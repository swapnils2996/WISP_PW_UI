/**
 * Adds rows PLN_WTC11 through PLN_WTC16 to the "planogram" sheet in testData.xlsx.
 * Run: node test-data/addPlanogramRows.js
 */
const ExcelJS = require('exceljs');
const path = require('path');
const DATA_FILE = path.join(__dirname, 'testData.xlsx');

async function addRows() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(DATA_FILE);
  const sheet = wb.getWorksheet('planogram');
  if (!sheet) { console.error('"planogram" sheet not found'); process.exit(1); }

  const headers = [];
  sheet.getRow(1).eachCell(cell => headers.push(String(cell.value ?? '').trim()));

  const existingRow = sheet.getRow(2);
  const common = {};
  existingRow.eachCell({ includeEmpty: true }, (cell, colIdx) => {
    const h = headers[colIdx - 1];
    if (h && h !== 'TestCase') common[h] = String(cell.value ?? '').trim();
  });

  const existing = new Set();
  sheet.eachRow((row, idx) => {
    if (idx === 1) return;
    existing.add(String(row.getCell(1).value ?? '').trim());
  });

  const newTCs = ['PLN_WTC11','PLN_WTC12','PLN_WTC13','PLN_WTC14','PLN_WTC15','PLN_WTC16'];
  for (const tc of newTCs) {
    if (existing.has(tc)) { console.log(`${tc} already exists, skipping.`); continue; }
    const values = headers.map(h => h === 'TestCase' ? tc : (common[h] ?? ''));
    sheet.addRow(values);
    console.log(`Added ${tc}`);
  }

  await wb.xlsx.writeFile(DATA_FILE);
  console.log('Done.');
}
addRows().catch(err => { console.error(err.message); process.exit(1); });
