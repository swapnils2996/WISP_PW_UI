/**
 * Generates mockStoreData.json from the StageStoreAddress table in ISP DB.
 * Also updates testData.xlsx with real store data.
 */
const { Client } = require('pg');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'testData.xlsx');
const MOCK_FILE = path.join(__dirname, 'mockStoreData.json');

const client = new Client({
  host: 'localhost', database: 'isp', user: 'postgres', password: 'Michaels@1', port: 5432,
});

(async () => {
  await client.connect();

  // Query StageStoreAddress for processed records with valid data
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
      AND "City" IS NOT NULL
      AND "City" != ''
      AND "City" != '-'
    ORDER BY "StoreNo", "Id" DESC
    LIMIT 50
  `);

  const stores = result.rows;
  console.log(`Found ${stores.length} store records`);

  // Build mock response in the format returned by StoreService.svc/jRetrieveStores
  // Based on the grid columns: StoreNo, City, State, Phone, Address1, Address2, Address3, Zip, StoreType
  const storeList = stores.map(s => ({
    StoreNo: s.StoreNo,
    City: (s.City || '').trim(),
    State: (s.State || '').trim(),
    Phone: (s.Phone || '').trim(),
    AddressLine1: (s.Address1 || '').trim(),
    AddressLine2: (s.Address2 || '').trim(),
    AddressLine3: (s.Address3 || '').trim(),
    Zip: (s.ZipCode || '').trim(),
    StoreType: (s.StoreAddressType || 'W').trim(),
  }));

  // Save mock data
  const mockData = { stores: storeList };
  fs.writeFileSync(MOCK_FILE, JSON.stringify(mockData, null, 2));
  console.log(`Saved ${storeList.length} store records to mockStoreData.json`);

  // Get distinct states and cities for test data
  const uniqueStates = [...new Set(storeList.map(s => s.State).filter(s => s && s.length === 2))];
  const uniqueCities = [...new Set(storeList.map(s => s.City).filter(c => c && c.length > 0))];
  const uniqueZips   = [...new Set(storeList.map(s => s.Zip).filter(z => z && z.length >= 5))];

  console.log('States:', uniqueStates);
  console.log('Cities:', uniqueCities.slice(0, 5));
  console.log('Zips:', uniqueZips.slice(0, 5));
  console.log('Store sample:', JSON.stringify(storeList[0]));

  // Pick stores for each test case
  const validStore = storeList.find(s => s.City && s.State && s.Zip) || storeList[0];
  const cityStore  = storeList.find(s => s.City && s.City !== validStore.City) || storeList[0];
  const stateStore = storeList.find(s => s.State) || storeList[0];
  const zipStore   = storeList.find(s => s.Zip && s.Zip.length >= 5) || storeList[0];
  const multiStore = storeList.find(s => s.City && s.State && s.Zip) || storeList[0];
  const enterStore = storeList[1] || storeList[0];
  // Filter keyword: partial match across results (use first few chars of a city that appears multiple times)
  const filterKeyword = storeList.length > 1 ? storeList[0].City.substring(0, 3) : 'NEW';

  // Non-existent store number
  const existingNos = new Set(storeList.map(s => s.StoreNo));
  let nonExistentNo = 99999;
  while (existingNos.has(nonExistentNo)) nonExistentNo++;

  const rowData = {
    validStoreNo:        String(validStore.StoreNo),
    validCity:           validStore.City,
    validState:          validStore.State,
    validZip:            validStore.Zip.substring(0, 5),
    validPhone:          validStore.Phone,
    validAddress1:       validStore.AddressLine1,
    cityStoreNo:         String(cityStore.StoreNo),
    cityName:            cityStore.City,
    cityState:           cityStore.State,
    stateCode:           stateStore.State,
    stateStoreNo:        String(stateStore.StoreNo),
    zipCode:             zipStore.Zip.substring(0, 5),
    zipStoreNo:          String(zipStore.StoreNo),
    nonExistentStoreNo:  String(nonExistentNo),
    multiStoreNo:        String(multiStore.StoreNo),
    multiCity:           multiStore.City,
    multiState:          multiStore.State,
    filterKeyword:       filterKeyword,
    enterStoreNo:        String(enterStore.StoreNo),
    storeType:           validStore.StoreType,
    expectedNoResultsMsg: 'No records found',
    expectedEmptyMsg:    'Please enter search criteria',
  };

  console.log('\nTest data row data:', JSON.stringify(rowData, null, 2));

  await client.end();

  // Update testData.xlsx
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(DATA_FILE);

  const existing = wb.getWorksheet('Store Address Inquiry');
  if (existing) wb.removeWorksheet(existing.id);

  const ws = wb.addWorksheet('Store Address Inquiry');

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

  for (let tc = 1; tc <= 17; tc++) {
    ws.addRow([
      `TC-SAI-${String(tc).padStart(2, '0')}`,
      'Store Address Inquiry',
      rowData.validStoreNo, rowData.validCity, rowData.validState, rowData.validZip,
      rowData.validPhone, rowData.validAddress1,
      rowData.cityStoreNo, rowData.cityName, rowData.cityState,
      rowData.stateCode, rowData.stateStoreNo,
      rowData.zipCode, rowData.zipStoreNo,
      rowData.nonExistentStoreNo,
      rowData.multiStoreNo, rowData.multiCity, rowData.multiState,
      rowData.filterKeyword, rowData.enterStoreNo,
      rowData.storeType,
      rowData.expectedNoResultsMsg, rowData.expectedEmptyMsg,
    ]);
  }

  await wb.xlsx.writeFile(DATA_FILE);
  console.log('\ntestData.xlsx updated with "Store Address Inquiry" sheet');
})().catch(e => { console.error(e.message); process.exit(1); });
