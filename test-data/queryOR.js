const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1'
  });
  await client.connect();
  console.log('Connected');

  // PO with session (fix DISTINCT/ORDER BY issue)
  const poWithSession = await client.query(`
    SELECT po."PurchaseOrderNum", po."OrderStatus", v."Name" as vendorName,
           rs."ReceiverSequenceNum", rs."CartonId"
    FROM dbo."PurchaseOrder" po
    JOIN dbo."Vendor" v ON v."Id" = po."VendorId"
    JOIN dbo."ReceivingSession" rs ON rs."PurchaseOrderId" = po."Id"
    WHERE rs."IsClosed" = 1
    LIMIT 3
  `);
  console.log('POs with sessions:', JSON.stringify(poWithSession.rows));

  // ASNVendorInfo
  const asnCols = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='ASNVendorInfo' ORDER BY ordinal_position LIMIT 20"
  );
  console.log('ASNVendorInfo cols:', asnCols.rows.map(r => r.column_name).join(', '));
  const asnVendors = await client.query('SELECT * FROM dbo."ASNVendorInfo" LIMIT 5');
  console.log('ASN Vendors:', JSON.stringify(asnVendors.rows));

  // Non-CORP POs (store-originated)
  const storeOriPO = await client.query(`
    SELECT po."PurchaseOrderNum", po."OrderStatus", po."Originate", v."Name" as vendorName
    FROM dbo."PurchaseOrder" po
    JOIN dbo."Vendor" v ON v."Id" = po."VendorId"
    WHERE po."Originate" IS NOT NULL AND po."Originate" != 'CORP' AND po."Originate" != ''
    LIMIT 5
  `);
  console.log('Non-CORP POs:', JSON.stringify(storeOriPO.rows));

  // PO items sample
  const poItems = await client.query(`
    SELECT poi."Id", poi."OrderQuantity", poi."Status", poi."CumulativeRecvdQty", i."SkuNo"
    FROM dbo."PurchaseOrderItem" poi
    JOIN dbo."Item" i ON i."Id" = poi."ItemId"
    WHERE poi."Status" = 0
    LIMIT 3
  `);
  console.log('Open PO Items:', JSON.stringify(poItems.rows));

  // FabricOrderItem cols
  const foItemCols = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='FabricOrderItem' ORDER BY ordinal_position LIMIT 20"
  );
  console.log('FabricOrderItem cols:', foItemCols.rows.map(r => r.column_name).join(', '));

  // FabricOrders
  const foRes = await client.query('SELECT * FROM dbo."FabricOrder" LIMIT 3');
  console.log('FabricOrders:', JSON.stringify(foRes.rows));

  // Vendor with open POs
  const vendorWithPO = await client.query(`
    SELECT v."VendorNo", v."Name", COUNT(po."Id") as poCount
    FROM dbo."Vendor" v
    JOIN dbo."PurchaseOrder" po ON po."VendorId" = v."Id"
    WHERE po."OrderStatus" IN (0,1)
    GROUP BY v."VendorNo", v."Name"
    ORDER BY poCount DESC
    LIMIT 3
  `);
  console.log('Vendors with open POs:', JSON.stringify(vendorWithPO.rows));

  await client.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
