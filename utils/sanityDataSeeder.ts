import ExcelJS from 'exceljs';
import path from 'path';
import { Client } from 'pg';

export interface SanitySeedRow {
  testCase: string;
  feature: string;
  menuLabel: string;
  expectedTab: string;
  expectedMarker: string;
  dbStoreNo: string;
  dbSkuNo: string;
  dbUpcNo: string;
}

const SOURCE_FILE = '/home/pau_swapnils/Webapp_Sanity.xlsx';
const TARGET_FILE = path.join(__dirname, '..', 'test-data', 'testData.xlsx');
const TARGET_SHEET = 'SanityTest';

const KNOWN_MODULES = [
  'Application Alerts',
  'Archive Records',
  'Deployment Utilities',
  'Direct Replenishment',
  'Generic SKU List Builder',
  'Inventory Adjustments',
  'Item Inquiry',
  'Label Request',
  'Order Receiving',
  'Planogram Activation',
  'Planogram Deactivation',
  'Price Change Activation',
  'Reports',
  'Store Address Inquiry',
  'User Management',
];

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function cellToString(value: ExcelJS.CellValue | undefined): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    if ('text' in value && typeof value.text === 'string') return value.text.trim();
    if ('result' in value && value.result !== undefined && value.result !== null) return String(value.result).trim();
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map(part => part.text).join('').trim();
    }
  }
  return String(value).trim();
}

function pickFirst(record: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    if (record[key]?.trim()) return record[key].trim();
  }
  return '';
}

function inferMenuLabel(text: string): string {
  const normalized = normalizeText(text);
  const match = KNOWN_MODULES.find(module => normalized.includes(normalizeText(module)));
  return match ?? '';
}

async function queryDbValue(client: any, query: string, keys: string[]): Promise<string> {
  try {
    const response = await client.query(query);
    if (!response.rows.length) return '';
    const row = response.rows[0] as Record<string, unknown>;
    for (const key of keys) {
      const value = row[key];
      if (value !== null && value !== undefined && String(value).trim() !== '') return String(value).trim();
    }
    return '';
  } catch {
    return '';
  }
}

async function queryDbContext(): Promise<{ dbStoreNo: string; dbSkuNo: string; dbUpcNo: string }> {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'isp',
    user: 'postgres',
    password: 'Michaels@1',
  });

  try {
    await client.connect();
  } catch {
    return { dbStoreNo: '1', dbSkuNo: '1', dbUpcNo: '0400100100011' };
  }

  const dbStoreNo = await queryDbValue(
    client,
    `
      SELECT s."StoreNo" AS "storeNo"
      FROM dbo."Store" s
      WHERE s."RecordDelete" = 0
      ORDER BY s."StoreNo"
      LIMIT 1
    `,
    ['storeNo']
  );

  const dbSkuNo = await queryDbValue(
    client,
    `
      SELECT i."SkuNo" AS "skuNo"
      FROM dbo."Item" i
      WHERE i."RecordDelete" = 0 AND i."Status" = 'A'
      ORDER BY i."SkuNo"
      LIMIT 1
    `,
    ['skuNo']
  );

  const dbUpcNo = await queryDbValue(
    client,
    `
      SELECT u."UpcNo" AS "upcNo"
      FROM dbo."Upc" u
      WHERE u."RecordDelete" = 0
      ORDER BY u."UpcNo"
      LIMIT 1
    `,
    ['upcNo']
  );

  await client.end().catch(() => {});

  return {
    dbStoreNo: dbStoreNo || '1',
    dbSkuNo: dbSkuNo || '1',
    dbUpcNo: dbUpcNo || '0400100100011',
  };
}

async function readSourceRows(): Promise<Record<string, string>[]> {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(SOURCE_FILE);
  } catch {
    return [];
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headers: string[] = [];
  const records: Record<string, string>[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell((cell, colIndex) => {
        const rawHeader = cellToString(cell.value);
        headers[colIndex - 1] = normalizeKey(rawHeader || `column${colIndex}`);
      });
      return;
    }

    const record: Record<string, string> = {};
    row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
      const key = headers[colIndex - 1];
      if (!key) return;
      record[key] = cellToString(cell.value);
    });

    const values = Object.values(record).map(v => v.trim()).filter(Boolean);
    if (values.length) records.push(record);
  });

  return records;
}

function buildRows(sourceRows: Record<string, string>[], dbData: { dbStoreNo: string; dbSkuNo: string; dbUpcNo: string }): SanitySeedRow[] {
  const built: SanitySeedRow[] = [];

  sourceRows.forEach((row, index) => {
    const testCase = pickFirst(row, ['testcase', 'testcaseid', 'tcid', 'id']) || `SANITY_TC_${String(index + 1).padStart(3, '0')}`;
    const feature = pickFirst(row, ['feature', 'scenario', 'testscenario']) || 'Sanity Test';
    const menuFromColumns = pickFirst(row, ['menu', 'menulabel', 'module', 'screen', 'page', 'navigation']);
    const searchableText = `${menuFromColumns} ${pickFirst(row, ['title', 'description', 'expectedresult'])}`.trim();
    const menuLabel = menuFromColumns || inferMenuLabel(searchableText);
    if (!menuLabel) return;

    const expectedTab = pickFirst(row, ['expectedtab', 'expectedtitle', 'title']) || menuLabel;
    const expectedMarker = pickFirst(row, ['expectedresult', 'expected', 'verification']);

    built.push({
      testCase,
      feature,
      menuLabel,
      expectedTab,
      expectedMarker,
      dbStoreNo: dbData.dbStoreNo,
      dbSkuNo: dbData.dbSkuNo,
      dbUpcNo: dbData.dbUpcNo,
    });
  });

  if (built.length) return built;

  return KNOWN_MODULES.map((menuLabel, index) => ({
    testCase: `SANITY_TC_${String(index + 1).padStart(3, '0')}`,
    feature: 'Sanity Test',
    menuLabel,
    expectedTab: menuLabel,
    expectedMarker: '',
    dbStoreNo: dbData.dbStoreNo,
    dbSkuNo: dbData.dbSkuNo,
    dbUpcNo: dbData.dbUpcNo,
  }));
}

async function writeSheet(rows: SanitySeedRow[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(TARGET_FILE);
  } catch {
    // New workbook
  }

  const existing = workbook.getWorksheet(TARGET_SHEET);
  if (existing) workbook.removeWorksheet(existing.id);

  const sheet = workbook.addWorksheet(TARGET_SHEET);
  sheet.columns = [
    { header: 'TestCase', key: 'testCase', width: 18 },
    { header: 'Feature', key: 'feature', width: 24 },
    { header: 'MenuLabel', key: 'menuLabel', width: 30 },
    { header: 'ExpectedTab', key: 'expectedTab', width: 30 },
    { header: 'ExpectedMarker', key: 'expectedMarker', width: 45 },
    { header: 'DbStoreNo', key: 'dbStoreNo', width: 14 },
    { header: 'DbSkuNo', key: 'dbSkuNo', width: 14 },
    { header: 'DbUpcNo', key: 'dbUpcNo', width: 20 },
  ];

  rows.forEach(row => sheet.addRow(row));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  await workbook.xlsx.writeFile(TARGET_FILE);
}

export async function seedSanityTestData(): Promise<SanitySeedRow[]> {
  const dbData = await queryDbContext();
  const sourceRows = await readSourceRows();
  const rows = buildRows(sourceRows, dbData);
  await writeSheet(rows);
  return rows;
}
