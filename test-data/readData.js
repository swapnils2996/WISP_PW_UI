const XLSX = require('../node_modules/xlsx');
const path = require('path');

const wb = XLSX.readFile(path.join(__dirname, '..', 'test-data', 'testData.xlsx'));
const ws = wb.Sheets['UserManagement'];
if (!ws) {
  console.log('Sheets:', Object.keys(wb.Sheets));
  process.exit(1);
}
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
console.log('Headers:', rows[0]);
if (rows[1]) {
  const headers = rows[0];
  const data = rows[1];
  headers.forEach((h, i) => console.log(`${h}: ${data[i]}`));
}
