/**
 * Seeds Sheet4 "OrderReceiving" in testData.xlsx with live data from the ISP PostgreSQL DB.
 * Run: node test-data/seedOrderReceiving.js
 */
const ExcelJS = require('exceljs');
const { Client } = require('pg');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'testData.xlsx');

async function queryDB() {
  const client = new Client({
    host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1'
  });
  await client.connect();
  console.log('Connected to isp DB');

  // Open CORP PO (non-Artistree)
  const openCorpPO = await client.query(`
    SELECT po."PurchaseOrderNum", v."Name" as "vendorName", v."VendorNo" as "VendorNo"
    FROM dbo."PurchaseOrder" po
    JOIN dbo."Vendor" v ON v."Id" = po."VendorId"
    WHERE po."OrderStatus" IN (0,1) AND po."Originate" = 'CORP'
      AND v."Name" NOT ILIKE '%artistree%'
    ORDER BY po."LastUpdated" DESC LIMIT 1
  `);
  const openPO = openCorpPO.rows[0] || { PurchaseOrderNum: '41225475', vendorName: 'SHERWIN WILLIAMS CANADA INC', VendorNo: 1838 };

  // Artistree PO (store-originated)
  const artistreePO = await client.query(`
    SELECT po."PurchaseOrderNum", v."Name" as "vendorName", v."VendorNo" as "VendorNo"
    FROM dbo."PurchaseOrder" po
    JOIN dbo."Vendor" v ON v."Id" = po."VendorId"
    WHERE po."OrderStatus" IN (0,1) AND v."Name" ILIKE '%artistree%'
    ORDER BY po."LastUpdated" DESC LIMIT 1
  `);
  const artPO = artistreePO.rows[0] || { PurchaseOrderNum: '40977289', vendorName: 'ARTISTREE INC CANADA', VendorNo: 85707 };

  // Fully received PO
  const fullPO = await client.query(`
    SELECT po."PurchaseOrderNum", v."Name" as "vendorName"
    FROM dbo."PurchaseOrder" po
    JOIN dbo."Vendor" v ON v."Id" = po."VendorId"
    WHERE po."OrderStatus" = 2
    ORDER BY po."LastUpdated" DESC LIMIT 1
  `);
  const fullyReceivedPO = fullPO.rows[0] || { PurchaseOrderNum: '40783306', vendorName: 'SATIN FINE FOODS' };

  // PO with existing session
  const poSession = await client.query(`
    SELECT po."PurchaseOrderNum", rs."CartonId", rs."ReceiverSequenceNum"
    FROM dbo."PurchaseOrder" po
    JOIN dbo."ReceivingSession" rs ON rs."PurchaseOrderId" = po."Id"
    WHERE rs."IsClosed" = 1
    ORDER BY po."Id" DESC LIMIT 1
  `);
  const poWithSession = poSession.rows[0] || { PurchaseOrderNum: '40783306', CartonId: '00008153220201080961', ReceiverSequenceNum: 1 };

  // Open PO item SKU
  const poItemRes = await client.query(`
    SELECT i."SkuNo"
    FROM dbo."PurchaseOrderItem" poi
    JOIN dbo."Item" i ON i."Id" = poi."ItemId"
    WHERE poi."Status" = 0
    LIMIT 1
  `);
  const validSku = poItemRes.rows[0] ? String(poItemRes.rows[0].SkuNo) : '470779';

  // Vendor for Receive Without PO / Worksheets
  const vendorRes = await client.query(`
    SELECT v."VendorNo", v."Name" as "Name"
    FROM dbo."Vendor" v
    WHERE v."RecordDelete" = 0 AND v."Name" NOT ILIKE '%artistree%' AND v."VendorNo" > 100
    LIMIT 3
  `);
  const primaryVendor = vendorRes.rows[0] || { VendorNo: 1838, Name: 'SHERWIN WILLIAMS CANADA INC' };

  await client.end();
  return { openPO, artPO, fullyReceivedPO, poWithSession, validSku, primaryVendor };
}

async function seedOrderReceiving() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(DATA_FILE);

  const existing = wb.getWorksheet('OrderReceiving');
  if (existing) wb.removeWorksheet(existing.id);

  const { openPO, artPO, fullyReceivedPO, poWithSession, validSku, primaryVendor } = await queryDB();

  const sheet = wb.addWorksheet('OrderReceiving');
  sheet.columns = [
    { header: 'TestCase',              key: 'testCase',              width: 15 },
    { header: 'Feature',               key: 'feature',               width: 25 },
    { header: 'OpenPoNumber',          key: 'openPoNumber',          width: 18 },
    { header: 'OpenVendorName',        key: 'openVendorName',        width: 30 },
    { header: 'OpenVendorNo',          key: 'openVendorNo',          width: 15 },
    { header: 'ArtistreePoNumber',     key: 'artistreePoNumber',     width: 20 },
    { header: 'ArtistreeVendorName',   key: 'artistreeVendorName',   width: 30 },
    { header: 'FullyReceivedPoNumber', key: 'fullyReceivedPoNumber', width: 22 },
    { header: 'PoWithSessionNumber',   key: 'poWithSessionNumber',   width: 22 },
    { header: 'SessionCartonId',       key: 'sessionCartonId',       width: 28 },
    { header: 'ValidSkuNo',            key: 'validSkuNo',            width: 15 },
    { header: 'VendorNo',              key: 'vendorNo',              width: 12 },
    { header: 'VendorName',            key: 'vendorName',            width: 30 },
    { header: 'FilterNoMatch',         key: 'filterNoMatch',         width: 30 },
    { header: 'ExpectedFilterMsg',     key: 'expectedFilterMsg',     width: 60 },
    { header: 'ExpectedEmptyCritMsg',  key: 'expectedEmptyCritMsg',  width: 40 },
    { header: 'ExpectedCancelPOMsg',   key: 'expectedCancelPOMsg',   width: 45 },
    { header: 'ExpectedCancelItmMsg',  key: 'expectedCancelItmMsg',  width: 50 },
    { header: 'ExpectedNoPOSelectMsg', key: 'expectedNoPOSelectMsg', width: 45 },
    { header: 'ExpectedPrintNoSelMsg', key: 'expectedPrintNoSelMsg', width: 55 },
    { header: 'ExpectedAuditNoCarton', key: 'expectedAuditNoCarton', width: 40 },
    { header: 'ExpectedAuditNoAudit',  key: 'expectedAuditNoAudit',  width: 40 },
    { header: 'ExpectedFinalizeMsg',   key: 'expectedFinalizeMsg',   width: 40 },
    { header: 'ExpectedNoItemsMsg',    key: 'expectedNoItemsMsg',    width: 40 },
    { header: 'ExpectedReceiveAllMsg', key: 'expectedReceiveAllMsg', width: 50 },
    { header: 'ExpectedClearMsg',      key: 'expectedClearMsg',      width: 55 },
    { header: 'WsNoSelFinalizeMsg',    key: 'wsNoSelFinalizeMsg',    width: 40 },
    { header: 'WsNoItemsFinalizeMsg',  key: 'wsNoItemsFinalizeMsg',  width: 40 },
    { header: 'WsNoVendorSelectMsg',   key: 'wsNoVendorSelectMsg',   width: 40 },
  ];

  const common = {
    openPoNumber:          String(openPO.PurchaseOrderNum),
    openVendorName:        String(openPO.vendorName || openPO.vendorname || 'SHERWIN WILLIAMS CANADA INC'),
    openVendorNo:          String(openPO.VendorNo || openPO.vendorno || 1838),
    artistreePoNumber:     String(artPO.PurchaseOrderNum),
    artistreeVendorName:   String(artPO.vendorName || artPO.vendorname || 'ARTISTREE INC CANADA'),
    fullyReceivedPoNumber: String(fullyReceivedPO.PurchaseOrderNum),
    poWithSessionNumber:   String(poWithSession.PurchaseOrderNum),
    sessionCartonId:       String(poWithSession.CartonId),
    validSkuNo:            validSku,
    vendorNo:              String(primaryVendor.VendorNo || primaryVendor.vendorno || 1838),
    vendorName:            String(primaryVendor.Name || primaryVendor.name || 'SHERWIN WILLIAMS CANADA INC'),
    filterNoMatch:         'XYZXYZ_NO_MATCH_99999',
    expectedFilterMsg:     'The specified filter criteria returned no results. Displaying previous results instead.',
    expectedEmptyCritMsg:  'Please enter the search criteria!',
    expectedCancelPOMsg:   'Purchase order cancelled',
    expectedCancelItmMsg:  'Purchase order item cancelled',
    expectedNoPOSelectMsg: 'Please select a PO or an item in a PO',
    expectedPrintNoSelMsg: 'You must select a receiver header record from the grid below',
    expectedAuditNoCarton: 'Carton Id cannot be blank',
    expectedAuditNoAudit:  'Auditor Name cannot be blank',
    expectedFinalizeMsg:   'Receiver session has been finalized.',
    expectedNoItemsMsg:    'There are no records to receive',
    expectedReceiveAllMsg: 'Received quantities will be updated for all items - continue?',
    expectedClearMsg:      'Received Quantities will be cleared for all items! Continue?',
    wsNoSelFinalizeMsg:    'Please select a worksheet to finalize.',
    wsNoItemsFinalizeMsg:  'No items are assigned to this worksheet',
    wsNoVendorSelectMsg:   'An Orderable Vendor must be selected.',
  };

  const rows = [
    { testCase: 'OR_WTC01', feature: 'PurchaseOrders',        ...common },
    { testCase: 'OR_WTC02', feature: 'PurchaseOrders',        ...common },
    { testCase: 'OR_WTC03', feature: 'PurchaseOrders',        ...common },
    { testCase: 'OR_WTC04', feature: 'PurchaseOrders',        ...common },
    { testCase: 'OR_WTC05', feature: 'PurchaseOrders',        ...common },
    { testCase: 'OR_WTC06', feature: 'PurchaseOrders',        ...common },
    { testCase: 'OR_WTC07', feature: 'POReceivingSessions',   ...common },
    { testCase: 'OR_WTC08', feature: 'POReceivingSessions',   ...common },
    { testCase: 'OR_WTC09', feature: 'PORReceive',            ...common },
    { testCase: 'OR_WTC10', feature: 'PORReceive',            ...common },
    { testCase: 'OR_WTC11', feature: 'PORReceive',            ...common },
    { testCase: 'OR_WTC12', feature: 'PORReceive',            ...common },
    { testCase: 'OR_WTC13', feature: 'ReceiveWithoutPO',      ...common },
    { testCase: 'OR_WTC14', feature: 'ReceiveWithoutPO',      ...common },
    { testCase: 'OR_WTC15', feature: 'Worksheets',            ...common },
    { testCase: 'OR_WTC16', feature: 'Worksheets',            ...common },
  ];

  rows.forEach(r => sheet.addRow(r));
  await wb.xlsx.writeFile(DATA_FILE);

  console.log('Sheet4 "OrderReceiving" added to testData.xlsx');
  console.log('  openPoNumber:', common.openPoNumber, '(' + common.openVendorName + ')');
  console.log('  artistreePoNumber:', common.artistreePoNumber, '(' + common.artistreeVendorName + ')');
  console.log('  fullyReceivedPoNumber:', common.fullyReceivedPoNumber);
  console.log('  poWithSessionNumber:', common.poWithSessionNumber);
  console.log('  validSkuNo:', common.validSkuNo);
  console.log('  vendorNo:', common.vendorNo, '(' + common.vendorName + ')');
}

seedOrderReceiving().catch(err => { console.error('Error:', err.message); process.exit(1); });
