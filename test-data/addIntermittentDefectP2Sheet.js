const ExcelJS = require('exceljs');
const { Client } = require('pg');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'testData.xlsx');
const SHEET_NAME = 'IntermittentDefectP2';

async function fetchDbData() {
  const client = new Client({
    host: 'localhost',
    database: 'isp',
    user: 'postgres',
    password: 'Michaels@1',
    port: 5432,
  });

  await client.connect();

  // Active overstock locations count
  const olCountRes = await client.query('SELECT COUNT(*) as cnt FROM dbo."OverstockLocation" WHERE "IsActive"=1');
  const overstockLocationCount = olCountRes.rows[0].cnt;

  // Overstock location names
  const olNamesRes = await client.query('SELECT "LocationName", "LocationValue" FROM dbo."OverstockLocation" WHERE "IsActive"=1 ORDER BY "LocationName" LIMIT 14');
  const overstockLocationNames = olNamesRes.rows.map(r => r.LocationName || r.locationname).join(',');

  // Active user count
  const ucRes = await client.query('SELECT COUNT(*) as total FROM auth.users WHERE is_active=1');
  const activeUserCount = ucRes.rows[0].total;

  // POG deactivation sample
  const pogRes = await client.query('SELECT "PogId", "Description", "Planogram" FROM dbo."POGActivationHeader" WHERE "Deactivation_Flag"=1 ORDER BY "PogId" ASC LIMIT 1');
  const validPogId = pogRes.rows.length ? pogRes.rows[0].PogId || pogRes.rows[0].pogid : '195788';
  const validPogDesc = pogRes.rows.length ? pogRes.rows[0].Description || pogRes.rows[0].description : "Kids Storage 2.5'_PC";

  // PCA event
  const pcaRes = await client.query('SELECT "EventNumber" FROM dbo."PriceActivationEvent" ORDER BY "StartDate" DESC LIMIT 1');
  const validEventNo = pcaRes.rows.length ? pcaRes.rows[0].EventNumber || pcaRes.rows[0].eventnumber : 'PC6943';

  // Department range
  const deptRes = await client.query('SELECT MIN("Number") as minDept, MAX("Number") as maxDept FROM dbo."Department"');
  const validDeptFrom = deptRes.rows[0].mindept || '1';
  const validDeptTo = deptRes.rows[0].maxdept || '98';

  // Alarm update email
  const alarmRes = await client.query("SELECT \"Value\" FROM dbo.\"Configuration\" WHERE \"Key\"='AlarmUpdateToAddress'");
  const alarmEmail = alarmRes.rows.length ? alarmRes.rows[0].Value || alarmRes.rows[0].value : 'Storeform-Lp@michaels.com';

  await client.end();

  return {
    overstockLocationCount,
    overstockLocationNames,
    activeUserCount,
    validPogId: String(validPogId),
    validPogDesc,
    validEventNo,
    validDeptFrom: String(validDeptFrom),
    validDeptTo: String(validDeptTo),
    alarmEmail,
  };
}

async function addSheet() {
  let dbData = {
    overstockLocationCount: '14',
    overstockLocationNames: 'Drive Aisle,End Cap,Flex,Lockup,Mezzanine,Offsite Container,Onsite Container,Other,Side Counter,Stock Room,Wall',
    activeUserCount: '976',
    validPogId: '195788',
    validPogDesc: "Kids Storage 2.5'_PC",
    validEventNo: 'PC6943',
    validDeptFrom: '1',
    validDeptTo: '98',
    alarmEmail: 'Storeform-Lp@michaels.com',
  };

  try {
    dbData = await fetchDbData();
    console.log('DB data fetched successfully:', JSON.stringify(dbData));
  } catch (e) {
    console.warn('DB fetch failed, using defaults:', e.message);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(DATA_FILE);

  const existing = workbook.getWorksheet(SHEET_NAME);
  if (existing) workbook.removeWorksheet(existing.id);

  const sheet = workbook.addWorksheet(SHEET_NAME);

  const headers = [
    'TestCase', 'Feature', 'WispModernUrl',
    'DisableRFLockNo', 'EnableRFLockNo', 'TimeClockLockNo',
    'ValidOverstockLocation', 'OverstockLocationCount',
    'ValidPogId', 'ValidPogDesc',
    'ValidEventNo',
    'ValidDeptFrom', 'ValidDeptTo', 'HighDeptValue',
    'ActiveUserCount',
    'ValidStoreNo',
    'AlarmEmail',
    'ExpectedLockKeyHeading', 'ExpectedOverstockColHeader',
    'ExpectedHighOverstockNavText', 'ExpectedOvItemListNavOld', 'ExpectedOvItemListNavNew',
    'ExpectedOverrideDayText', 'ExpectedPogDeactHistTitle',
    'ExpectedPlanogramErrIcon',
  ];

  sheet.addRow(headers);

  const wispModernUrl = 'http://isp.stores.michaels.com:8080/webapp/';

  const rows = [
    ['DTC028', 'Deployment Utilities', wispModernUrl, '70606', '6803', '61810', '', '', '', '', '', '', '', '', '', '', '', 'Lock Key Required', '', '', '', '', '', '', ''],
    ['DTC029', 'Deployment Utilities', wispModernUrl, '70606', '6803', '61810', '', '', '', '', '', '', '', '', '', '', '', 'Lock Key Required', '', '', '', '', '', '', ''],
    ['DTC030', 'Deployment Utilities', wispModernUrl, '70606', '6803', '61810', '', '', '', '', '', '', '', '', '', '', '', 'Lock Key Required', '', '', '', '', '', '', ''],
    ['DTC031', 'Direct Replenishment', wispModernUrl, '', '', '', dbData.overstockLocationNames.split(',')[0] || 'Side Counter', dbData.overstockLocationCount, '', '', '', '', '', '', '', '', '', '', 'Overstock Location', '', '', '', '', '', ''],
    ['DTC032', 'Direct Replenishment', wispModernUrl, '', '', '', '', dbData.overstockLocationCount, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['DTC033', 'Direct Replenishment', wispModernUrl, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['DTC034', 'Direct Replenishment', wispModernUrl, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['DTC035', 'Direct Replenishment', wispModernUrl, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'High Overstock Report', '', '', '', '', ''],
    ['DTC036', 'Direct Replenishment', wispModernUrl, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Overstock Item List Report', 'Existing Overstock Filter Report', '', '', ''],
    ['DTC037', 'Direct Replenishment', wispModernUrl, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Truck/Inventory Day', '', ''],
    ['DTC038', 'Direct Replenishment', wispModernUrl, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['DTC039', 'Direct Replenishment', wispModernUrl, '', '', '', '', dbData.overstockLocationCount, '', '', '', '', '', '', '', '', '', '', '', '', '', 'Existing Overstock Filter Report', '', '', ''],
    ['DTC040', 'Electronic Business Forms', wispModernUrl, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['DTC041', 'Electronic Business Forms', wispModernUrl, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['DTC042', 'Electronic Business Forms', wispModernUrl, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['DTC043', 'Planogram - Deactivation', wispModernUrl, '', '', '', '', '', dbData.validPogId, dbData.validPogDesc, '', '', '', '', '', '', '', '', '', '', '', '', '', 'POG Deactivation History', ''],
    ['DTC044', 'Planogram - Activation & Deactivation', wispModernUrl, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'No records found'],
    ['DTC045', 'Price Change Activation', wispModernUrl, '', '', '', '', '', '', '', dbData.validEventNo, '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['DTC046', 'Reports', 'http://isp.stores.michaels.com/webapp/', '', '', '', '', '', '', '', '', dbData.validDeptFrom, dbData.validDeptTo, '2147483648', '', '', '', '', '', '', '', '', '', '', ''],
    ['DTC047', 'Store Address Inquiry', wispModernUrl, '', '', '', '', '', '', '', '', '', '', '', '', '97401', '', '', '', '', '', '', '', '', ''],
    ['DTC048', 'User Management', wispModernUrl, '', '', '', '', '', '', '', '', '', '', '', dbData.activeUserCount, '', '', '', '', '', '', '', '', '', ''],
    ['DTC049', 'User Management', wispModernUrl, '', '', '', '', '', '', '', '', '', '', '', dbData.activeUserCount, '', '', '', '', '', '', '', '', '', ''],
    ['DTC050', 'User Management', wispModernUrl, '', '', '', '', '', '', '', '', '', '', '', dbData.activeUserCount, '', '', '', '', '', '', '', '', '', ''],
  ];

  rows.forEach(r => sheet.addRow(r));

  await workbook.xlsx.writeFile(DATA_FILE);
  console.log(`Sheet "${SHEET_NAME}" added successfully to ${DATA_FILE}`);
}

addSheet().catch(err => { console.error(err); process.exit(1); });
