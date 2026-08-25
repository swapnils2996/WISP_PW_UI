/**
 * Seeds "Store Address Inquiry" sheet in testData.xlsx from ISP PostgreSQL DB.
 * Queries StageStoreAddress table for real store data.
 */
const { Client } = require('pg');
const ExcelJS = require('exceljs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'testData.xlsx');

const client = new Client({
  host: 'localhost', database: 'isp', user: 'postgres', password: 'Michaels@1', port: 5432,
});

(async () => {
  await client.connect();

  // Get store data from StageStoreAddress (processed records)
  const result = await client.query(`
    SELECT DISTINCT ON ("StoreNo")
      "StoreNo",
      "City",
      "State",
      "ZipCode",
      "Phone",
      "Address1",
      "Address2",
      "Address3",
      "StoreAddressType"
    FROM dbo."StageStoreAddress"
    WHERE "IsProcessed" = 1
      AND "StoreNo" > 0
      AND "City" IS NOT NULL AND "City" != ''
    ORDER BY "StoreNo", "Id" DESC
    LIMIT 100
  `);

  const stores = result.rows;
  console.log(`Found ${stores.length} store records`);

  if (stores.length === 0) {
    throw new Error('No store data found');
  }

  // Pick specific stores for test cases
  const withCity = stores.filter(s => s.City && s.City.trim() && s.City.trim() !== '-');
  const withState = stores.filter(s => s.State && s.State.trim().length === 2);
  const withZip = stores.filter(s => s.ZipCode && s.ZipCode.trim().length >= 5);

  const validStore = stores.find(s => s.City && s.City.trim() && s.State && s.ZipCode) || stores[0];
  const cityStore = withCity[0] || stores[0];
  const stateStore = withState[0] || stores[0];
  const zipStore = withZip[0] || stores[0];
  // Multi-field: store with all fields
  const multiStore = stores.find(s => s.City && s.State && s.ZipCode) || stores[0];
  // Store for Enter key test
  const enterStore = stores[1] || stores[0];
  // Store for grid filter test  
  const filterStore = withCity.length > 1 ? withCity[1] : stores[0];

  // Get a store with non-existent number
  const existingNos = new Set(stores.map(s => s.StoreNo));
  let nonExistentNo = 99999;
  while (existingNos.has(nonExistentNo)) nonExistentNo++;

  console.log('Valid store:', JSON.stringify(validStore));
  console.log('City store:', JSON.stringify(cityStore));
  console.log('State store:', JSON.stringify(stateStore));
  console.log('Zip store:', JSON.stringify(zipStore));
  console.log('Non-existent store no:', nonExistentNo);

  await client.end();

  // Build Excel sheet
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(DATA_FILE);

  // Remove existing sheet if present
  const existing = wb.getWorksheet('Store Address Inquiry');
  if (existing) wb.removeWorksheet(existing.id);

  const ws = wb.addWorksheet('Store Address Inquiry');

  // Headers
  const headers = [
    'TestCase', 'Feature',
    'ValidStoreNo', 'ValidCity', 'ValidState', 'ValidZip',
    'ValidPhone', 'ValidAddress1',
    'CityStoreNo', 'CityName', 'CityState',
    'StateCode', 'StateStoreNo',
    'ZipCode', 'ZipStoreNo',
    'NonExistentStoreNo',
    'MultiStoreNo', 'MultiCity', 'MultiState',
    'FilterKeyword', 'EnterStoreNo',
    'StoreType',
    'ExpectedNoResultsMsg', 'ExpectedEmptyMsg',
  ];
  ws.addRow(headers);

  // Build 17 data rows (one per TC-SAI-01 to TC-SAI-17)
  const rowData = {
    validStoreNo:        String(validStore.StoreNo),
    validCity:           (validStore.City || '').trim(),
    validState:          (validStore.State || '').trim(),
    validZip:            (validStore.ZipCode || '').trim(),
    validPhone:          (validStore.Phone || '').trim(),
    validAddress1:       (validStore.Address1 || '').trim(),
    cityStoreNo:         String(cityStore.StoreNo),
    cityName:            (cityStore.City || '').trim(),
    cityState:           (cityStore.State || '').trim(),
    stateCode:           (stateStore.State || '').trim(),
    stateStoreNo:        String(stateStore.StoreNo),
    zipCode:             (zipStore.ZipCode || '').trim().substring(0, 5),
    zipStoreNo:          String(zipStore.StoreNo),
    nonExistentStoreNo:  String(nonExistentNo),
    multiStoreNo:        String(multiStore.StoreNo),
    multiCity:           (multiStore.City || '').trim(),
    multiState:          (multiStore.State || '').trim(),
    filterKeyword:       (filterStore.City || '').trim().substring(0, 4),
    enterStoreNo:        String(enterStore.StoreNo),
    storeType:           (validStore.StoreAddressType || 'W').trim(),
    expectedNoResultsMsg: 'No results',
    expectedEmptyMsg:    'Please enter at least one search criteria',
  };

  for (let tc = 1; tc <= 17; tc++) {
    ws.addRow([
      `TC-SAI-${String(tc).padStart(2, '0')}`,
      'Store Address Inquiry',
      rowData.validStoreNo,
      rowData.validCity,
      rowData.validState,
      rowData.validZip,
      rowData.validPhone,
      rowData.validAddress1,
      rowData.cityStoreNo,
      rowData.cityName,
      rowData.cityState,
      rowData.stateCode,
      rowData.stateStoreNo,
      rowData.zipCode,
      rowData.zipStoreNo,
      rowData.nonExistentStoreNo,
      rowData.multiStoreNo,
      rowData.multiCity,
      rowData.multiState,
      rowData.filterKeyword,
      rowData.enterStoreNo,
      rowData.storeType,
      rowData.expectedNoResultsMsg,
      rowData.expectedEmptyMsg,
    ]);
  }

  await wb.xlsx.writeFile(DATA_FILE);
  console.log('testData.xlsx updated with "Store Address Inquiry" sheet');
  console.log('Row data summary:', JSON.stringify(rowData, null, 2));
})().catch(e => { console.error(e.message); process.exit(1); });
