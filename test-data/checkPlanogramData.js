const ExcelJS = require('exceljs');
const path = require('path');
(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path.join(__dirname, 'testData.xlsx'));
  const sheet = wb.getWorksheet('planogram');
  const headers = [];
  sheet.getRow(1).eachCell(cell => headers.push(String(cell.value ?? '').trim()));
  sheet.eachRow((row, i) => {
    if (i === 1) return;
    const tc = String(row.getCell(1).value ?? '').trim();
    if (tc === 'PLN_WTC16') {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = String(row.getCell(idx+1).value ?? '').trim(); });
      console.log(JSON.stringify(obj, null, 2));
    }
  });
})();
