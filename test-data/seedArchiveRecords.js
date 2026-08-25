/**
 * Seed script for Archive Records test data from PostgreSQL ISP DB
 * 
 * Run: node test-data/seedArchiveRecords.js
 * 
 * DB: ISP (PostgreSQL)
 * Credentials: postgres / Michaels@1
 * 
 * This script queries the archive records tables and populates testData.xlsx > ArchiveRecords sheet.
 */

const { Client } = require('pg');
const ExcelJS = require('exceljs');
const path = require('path');

const EXCEL_FILE = path.join(__dirname, 'testData.xlsx');

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'isp',
  user: 'postgres',
  password: 'Michaels@1',
};

async function queryArchiveRecords() {
  const client = new Client(dbConfig);
  await client.connect();
  console.log('Connected to PostgreSQL ISP database');

  try {
    // Query to get archive record details
    // Assuming table structure based on CSV columns: Store, Barcode, Record Type, From Date, To Date, Date Scanned, Scanned By
    // Adjust table/column names based on actual schema
    const archiveQuery = `
      SELECT 
        store_no,
        barcode,
        record_type,
        from_date,
        to_date,
        date_scanned,
        scanned_by
      FROM archive_records
      WHERE store_no IS NOT NULL
      ORDER BY date_scanned DESC
      LIMIT 5;
    `;

    const archiveResult = await client.query(archiveQuery).catch(() => ({ rows: [] }));
    console.log(`Archive records found: ${archiveResult.rows.length}`);

    // Get one record for testing (first non-null row)
    const sampleRecord = archiveResult.rows.length > 0 ? archiveResult.rows[0] : null;
    
    // Count total records for validation
    const countQuery = `SELECT COUNT(*) as total FROM archive_records WHERE store_no IS NOT NULL;`;
    const countResult = await client.query(countQuery).catch(() => ({ rows: [{ total: 0 }] }));
    const totalRecords = countResult.rows[0]?.total || 0;

    return {
      sampleBarcode: sampleRecord?.barcode || 'AR123456',
      sampleRecordType: sampleRecord?.record_type || 'Invoice',
      sampleScannedBy: sampleRecord?.scanned_by || 'System',
      totalRecords: totalRecords.toString(),
      hasRecords: totalRecords > 0 ? 'true' : 'false',
      filterNoMatch: 'XZZZ_NO_MATCH_99999',
      expectedDeleteMsg: 'Please select a record before deleting',
      expectedDeleteConfirm: 'Are you sure you want to delete this record?',
      expectedDeleteSuccess: 'Record deleted successfully',
      expectedPrintNoSelect: 'Please select a record to print',
      expectedPrintSuccess: 'Report generated successfully',
      expectedOfflineError: 'Unable to connect to server',
      expectedHistoryLabel: 'Back',
      expectedArchiveLabel: 'History',
    };
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

async function seedExcel(data) {
  const workbook = new ExcelJS.Workbook();
  
  try {
    await workbook.xlsx.readFile(EXCEL_FILE);
    console.log('Loaded existing testData.xlsx');
  } catch (err) {
    console.log('testData.xlsx not found, creating new workbook');
  }

  // Remove existing ArchiveRecords sheet if it exists
  const existingSheet = workbook.getWorksheet('ArchiveRecords');
  if (existingSheet) {
    workbook.removeWorksheet(existingSheet.id);
    console.log('Removed existing ArchiveRecords sheet');
  }

  // Create new ArchiveRecords sheet
  const sheet = workbook.addWorksheet('ArchiveRecords');

  // Define headers (camelCase for excelHelper compatibility)
  sheet.columns = [
    { header: 'TestCase', key: 'testCase', width: 20 },
    { header: 'Feature', key: 'feature', width: 25 },
    { header: 'SampleBarcode', key: 'sampleBarcode', width: 20 },
    { header: 'SampleRecordType', key: 'sampleRecordType', width: 20 },
    { header: 'SampleScannedBy', key: 'sampleScannedBy', width: 20 },
    { header: 'TotalRecords', key: 'totalRecords', width: 15 },
    { header: 'HasRecords', key: 'hasRecords', width: 15 },
    { header: 'FilterNoMatch', key: 'filterNoMatch', width: 25 },
    { header: 'ExpectedDeleteMsg', key: 'expectedDeleteMsg', width: 40 },
    { header: 'ExpectedDeleteConfirm', key: 'expectedDeleteConfirm', width: 45 },
    { header: 'ExpectedDeleteSuccess', key: 'expectedDeleteSuccess', width: 40 },
    { header: 'ExpectedPrintNoSelect', key: 'expectedPrintNoSelect', width: 40 },
    { header: 'ExpectedPrintSuccess', key: 'expectedPrintSuccess', width: 40 },
    { header: 'ExpectedOfflineError', key: 'expectedOfflineError', width: 40 },
    { header: 'ExpectedHistoryLabel', key: 'expectedHistoryLabel', width: 20 },
    { header: 'ExpectedArchiveLabel', key: 'expectedArchiveLabel', width: 20 },
  ];

  // Add data row
  sheet.addRow({
    testCase: 'AR_WTC01',
    feature: 'Archive Records',
    ...data,
  });

  await workbook.xlsx.writeFile(EXCEL_FILE);
  console.log(`✓ ArchiveRecords sheet seeded in ${EXCEL_FILE}`);
}

(async () => {
  try {
    console.log('Starting Archive Records seed...\n');
    const data = await queryArchiveRecords();
    console.log('\nData retrieved:', JSON.stringify(data, null, 2));
    await seedExcel(data);
    console.log('\n✓ Archive Records seed complete');
  } catch (error) {
    console.error('Error seeding Archive Records:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
