/**
 * Seeds the "DirectReplenishment" sheet in testData.xlsx
 * with data sourced from the dbo schema in the ISP PostgreSQL DB.
 */
const ExcelJS = require('exceljs');
const { Client } = require('pg');
const path = require('path');

const XLSX_FILE = path.join(__dirname, 'testData.xlsx');

async function seed() {
  const client = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });
  await client.connect();

  // Fetch location data
  const locs = await client.query(`
    SELECT "LocationName","LocationValue","Category","IsFlex","From","To","MaxFrom","MaxTo"
    FROM dbo."OverstockLocation"
    ORDER BY "Category","LocationName"
  `);

  // Fetch config for truck/inventory override flags
  const cfg = await client.query(`
    SELECT "Key","Value" FROM dbo."Configuration"
    WHERE "Key" IN ('DisableTruckOverride','DisableInventoryOverride','MinCountOfOverstockLocationInBatch')
  `);
  const cfgMap = {};
  cfg.rows.forEach(r => { cfgMap[r.Key] = r.Value; });

  await client.end();

  // Build unique location name list for dropdown expected values
  const uniqueLocationNames = [...new Set(
    locs.rows
      .filter(r => r.Category <= 4 || (r.Category === 5 && r.IsFlex === 0))
      .map(r => r.LocationName)
  )].sort().join(',');

  // Stock Room is Category 2 (simple From/To number range) - good for basic tests
  const cat2Loc = locs.rows.find(r => r.LocationName === 'Stock Room');
  // Side Counter is Category 1 (section + shelf + box)
  const cat1Loc = locs.rows.find(r => r.LocationName === 'Side Counter' && r.Category === 1);

  // Test data rows - one row per TC (all TCs share same data pool but different test case IDs)
  const headers = [
    'TestCase','Feature',
    'ValidLocation','ValidLocationValue','ValidLocationCategory',
    'ValidLocationFrom','ValidLocationTo',
    'ValidSectionFrom','ValidSectionTo',
    'ValidShelfIdentifier','ValidShelfFrom','ValidShelfTo',
    'ValidOption',
    'TruckDayLabel','InventoryDayLabel',
    'DisableTruckOverride','DisableInventoryOverride',
    'LocationDropdownValues',
    'NonExistentNumber',
    'TransferLocation','TransferLocationFrom','TransferLocationTo',
    'ExpectedTruckDayConfirm','ExpectedInventoryDayConfirm',
    'ExpectedSuccessPrefix','ExpectedFailPrefix','ExpectedAlreadyCompletedMsg',
    'ExpectedPrintError','ExpectedReportError',
  ];

  const sharedData = {
    Feature: 'Direct Replenishment',
    ValidLocation: cat2Loc ? cat2Loc.LocationName : 'Stock Room',
    ValidLocationValue: cat2Loc ? cat2Loc.LocationValue : 'SR',
    ValidLocationCategory: cat2Loc ? String(cat2Loc.Category) : '2',
    ValidLocationFrom: '1',
    ValidLocationTo: '5',
    ValidSectionFrom: cat1Loc ? cat1Loc.From : 'A',
    ValidSectionTo: 'C',
    ValidShelfIdentifier: 'CAP',
    ValidShelfFrom: '1',
    ValidShelfTo: '2',
    ValidOption: '1',
    TruckDayLabel: 'Truck Day',
    InventoryDayLabel: 'Inventory Day',
    DisableTruckOverride: cfgMap['DisableTruckOverride'] ?? 'False',
    DisableInventoryOverride: cfgMap['DisableInventoryOverride'] ?? 'False',
    LocationDropdownValues: uniqueLocationNames,
    NonExistentNumber: '9999',
    TransferLocation: cat2Loc ? cat2Loc.LocationName : 'Stock Room',
    TransferLocationFrom: '6',
    TransferLocationTo: '10',
    ExpectedTruckDayConfirm: 'Are you sure today is a Truck Day?',
    ExpectedInventoryDayConfirm: 'Are you sure today is a Inventory Day?',
    ExpectedSuccessPrefix: 'Successfully updated today as ',
    ExpectedFailPrefix: 'Failed updating ',
    ExpectedAlreadyCompletedMsg: 'SISO List already generated',
    ExpectedPrintError: 'Report could not be printed',
    ExpectedReportError: 'Report could not be generated',
  };

  const testCases = [
    'DR_WTC01','DR_WTC02','DR_WTC03','DR_WTC04','DR_WTC05',
    'DR_WTC06','DR_WTC07','DR_WTC08','DR_WTC09','DR_WTC10',
    'DR_WTC11','DR_WTC12','DR_WTC13','DR_WTC14','DR_WTC15',
    'DR_WTC16','DR_WTC17','DR_WTC18','DR_WTC19','DR_WTC20',
    'DR_WTC21','DR_WTC22','DR_WTC23','DR_WTC24','DR_WTC25',
    'DR_WTC26','DR_WTC27','DR_WTC28','DR_WTC29',
  ];

  const rows = testCases.map(tc => ({ TestCase: tc, ...sharedData }));

  // Write to Excel
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_FILE);

  // Remove existing sheet if present
  const existing = wb.getWorksheet('DirectReplenishment');
  if (existing) wb.removeWorksheet(existing.id);

  const sheet = wb.addWorksheet('DirectReplenishment');
  sheet.addRow(headers);
  rows.forEach(row => {
    sheet.addRow(headers.map(h => row[h] ?? ''));
  });

  await wb.xlsx.writeFile(XLSX_FILE);
  console.log(`Seeded ${rows.length} rows into DirectReplenishment sheet in ${XLSX_FILE}`);
}

seed().catch(e => { console.error(e.message); process.exit(1); });
