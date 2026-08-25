const fs = require('fs');
const filePath = 'pages/IntermittentDefectTestCasesP1.ts';
let content = fs.readFileSync(filePath, 'utf8');

const IA_OLD = `    const iaHistoryPageVisible = await this.page.locator(
      'app-inventory-adjustment-history, table.table-hover, mat-table, table:visible'
    ).first().isVisible({ timeout: 8000 }).catch(() => false);`;

const IA_NEW = `    const iaHistoryPageVisible = await this.page.evaluate(() => {
      const el = document.querySelector('app-inventory-adjustment-history, table.table-hover, mat-table');
      return !!el && (el as HTMLElement).offsetParent !== null;
    }).catch(() => false);`;

let count = 0;
while (content.includes(IA_OLD)) { content = content.replace(IA_OLD, IA_NEW); count++; }

const APP_OLD = `    const appAlertsPageVisible = await this.page.locator('app-application-alerts, table:visible, mat-table:visible').first()
      .isVisible({ timeout: 5000 }).catch(() => false);`;

const APP_NEW = `    const appAlertsPageVisible = await this.page.evaluate(() => {
      const el = document.querySelector('app-alert, mat-table, .mat-table');
      return !!el && (el as HTMLElement).offsetParent !== null;
    }).catch(() => false);`;

while (content.includes(APP_OLD)) { content = content.replace(APP_OLD, APP_NEW); count++; }

fs.writeFileSync(filePath, content);
console.log('Replacements:', count);
