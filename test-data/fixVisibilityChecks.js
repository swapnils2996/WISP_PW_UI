const fs = require('fs');
const filePath = 'pages/IntermittentDefectTestCasesP1.ts';
let content = fs.readFileSync(filePath, 'utf8');

const OLD = "await this.page.locator('app-item-inquiry, input[placeholder*=\"Sku\"]').first()\n      .isVisible({ timeout: 5000 }).catch(() => false);";
const NEW = `await this.page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input')) as HTMLInputElement[];
      return inputs.some(i => /sku|upc/i.test(i.placeholder ?? '') && (i as HTMLElement).offsetParent !== null);
    }).catch(() => false);`;

let count = 0;
while (content.includes(OLD)) {
  content = content.replace(OLD, NEW);
  count++;
}

// Also fix appAlertsPageVisible checks for DTC025, DTC026, DTC027
const OLD2 = "await this.page.locator('app-application-alerts, table:visible').first()\n      .isVisible({ timeout: 5000 }).catch(() => false);";
const NEW2 = `await this.page.evaluate(() => {
      const el = document.querySelector('app-alert, mat-table, table.table-hover');
      return !!el && (el as HTMLElement).offsetParent !== null;
    }).catch(() => false);`;

while (content.includes(OLD2)) {
  content = content.replace(OLD2, NEW2);
  count++;
}

fs.writeFileSync(filePath, content);
console.log('Total replacements:', count);
