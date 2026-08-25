const { Client } = require('pg');

async function main() {
  const client = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });
  await client.connect();

  const q = async (sql) => {
    try { const r = await client.query(sql); return r.rows; }
    catch(e) { return [{ err: e.message }]; }
  };

  // ArchiveRecords count
  console.log('ArchiveRecords count:', JSON.stringify(await q('SELECT COUNT(*) as cnt FROM dbo."ArchiveRecords"')));

  // Alert-related tables
  console.log('Alert tables:', JSON.stringify(await q("SELECT table_name FROM information_schema.tables WHERE table_schema='dbo' AND LOWER(table_name) LIKE '%alert%'")));

  // UIStaticLabel
  console.log('UIStaticLabel:', JSON.stringify(await q('SELECT * FROM dbo."UIStaticLabel" LIMIT 3')));

  // Vendor columns
  console.log('Vendor cols:', JSON.stringify(await q("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='Vendor' ORDER BY ordinal_position LIMIT 10")));

  // LabelRequest columns
  console.log('LabelRequest cols:', JSON.stringify(await q("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='LabelRequest' ORDER BY ordinal_position")));

  // GenericSkuList columns
  console.log('GenericSkuList cols:', JSON.stringify(await q("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='GenericSkuList' ORDER BY ordinal_position")));

  // Users columns
  console.log('Users cols:', JSON.stringify(await q("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='Users' ORDER BY ordinal_position LIMIT 10")));
  console.log('Users rows:', JSON.stringify(await q('SELECT * FROM dbo."Users" LIMIT 3')));

  // PurchaseOrder columns
  console.log('PurchaseOrder cols:', JSON.stringify(await q("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='PurchaseOrder' ORDER BY ordinal_position LIMIT 10")));

  // StoreReceiving columns
  console.log('StoreReceiving cols:', JSON.stringify(await q("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='StoreReceiving' ORDER BY ordinal_position LIMIT 10")));

  // InventoryAdjustmentItem
  console.log('InvAdjItem cols:', JSON.stringify(await q("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='InventoryAdjustmentItem' ORDER BY ordinal_position LIMIT 10")));
  console.log('InvAdjItem rows:', JSON.stringify(await q('SELECT * FROM dbo."InventoryAdjustmentItem" LIMIT 2')));

  // ReceivingSession
  console.log('ReceivingSession cols:', JSON.stringify(await q("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='ReceivingSession' ORDER BY ordinal_position LIMIT 10")));

  // Promotions
  console.log('Promotion cols:', JSON.stringify(await q("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='Promotion' ORDER BY ordinal_position LIMIT 10")));
  console.log('PromotionDetail cols:', JSON.stringify(await q("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='PromotionDetail' ORDER BY ordinal_position LIMIT 10")));

  // Item 123253 with price fields
  console.log('Item 123253 cols:', JSON.stringify(await q("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='Item' ORDER BY ordinal_position")));

  // Vendor with correct column names
  console.log('Vendors sample:', JSON.stringify(await q('SELECT * FROM dbo."Vendor" LIMIT 2')));

  // GenericSkuListCategory
  console.log('GenericSkuListCategory:', JSON.stringify(await q('SELECT * FROM dbo."GenericSkuListCategory" LIMIT 5')));

  // GenericSkuList sample
  console.log('GenericSkuList sample:', JSON.stringify(await q('SELECT * FROM dbo."GenericSkuList" LIMIT 3')));

  // ReturnToVendor sample
  console.log('RTV cols full:', JSON.stringify(await q("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='ReturnToVendor' ORDER BY ordinal_position")));
  console.log('RTV sample:', JSON.stringify(await q('SELECT "Id", "VendorNumber", "RtvStatusId", "Action" FROM dbo."ReturnToVendor" LIMIT 3')));

  await client.end();
  console.log('Done');
}

main().catch(e => { console.error('Fatal:', e.message); });
