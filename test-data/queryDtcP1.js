const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'isp',
    user: 'postgres',
    password: 'Michaels@1'
  });
  await client.connect();
  console.log('Connected');

  // Archive Records - finalized count
  try {
    const r = await client.query('SELECT COUNT(*) as cnt FROM dbo."ArchiveRecord" WHERE "IsFinalized" = true');
    console.log('Finalized archive records:', JSON.stringify(r.rows[0]));
  } catch(e) { console.log('ArchiveRecord error:', e.message); }

  // Try alternate table name
  try {
    const r2 = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='dbo' ORDER BY table_name");
    console.log('All dbo tables:', r2.rows.map(x => x.table_name).join(', '));
  } catch(e) { console.log('Tables error:', e.message); }

  // Item 123253
  try {
    const r = await client.query('SELECT "SkuNo", "Description", "Status" FROM dbo."Item" WHERE "SkuNo" = 123253 LIMIT 1');
    console.log('SKU 123253:', JSON.stringify(r.rows[0]));
  } catch(e) { console.log('Item error:', e.message); }

  // Application Alerts
  try {
    const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='ApplicationAlert' ORDER BY ordinal_position");
    console.log('ApplicationAlert cols:', cols.rows.map(r => r.column_name).join(', '));
    const rows = await client.query('SELECT * FROM dbo."ApplicationAlert" LIMIT 3');
    console.log('ApplicationAlert rows:', JSON.stringify(rows.rows));
  } catch(e) { console.log('ApplicationAlert error:', e.message); }

  // Vendors
  try {
    const r = await client.query('SELECT "VendorNo", "VendorName" FROM dbo."Vendor" WHERE "Status" = \'A\' AND "RecordDelete" = 0 LIMIT 3');
    console.log('Active vendors:', JSON.stringify(r.rows));
  } catch(e) { console.log('Vendor error:', e.message); }

  // Label Request users
  try {
    const r = await client.query('SELECT DISTINCT "PrintedBy" FROM dbo."UserRequestedLabel" WHERE "PrintedBy" IS NOT NULL LIMIT 5');
    console.log('Label users:', JSON.stringify(r.rows));
  } catch(e) { console.log('Label users error:', e.message); }

  // GenericSkuList
  try {
    const r = await client.query('SELECT DISTINCT "ListType" FROM dbo."GenericSkuList" LIMIT 10');
    console.log('GSK list types:', JSON.stringify(r.rows));
  } catch(e) { console.log('GenericSkuList error:', e.message); }

  // IA History
  try {
    const r = await client.query('SELECT "SkuNo", "AdjustDateTime" FROM dbo."InventoryAdjustmentHistory" ORDER BY "AdjustDateTime" DESC LIMIT 3');
    console.log('IA History:', JSON.stringify(r.rows));
  } catch(e) { console.log('IA History error:', e.message); }

  // Worksheets
  try {
    const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='Worksheet' ORDER BY ordinal_position LIMIT 10");
    console.log('Worksheet cols:', cols.rows.map(r => r.column_name).join(', '));
    const rows = await client.query('SELECT * FROM dbo."Worksheet" LIMIT 2');
    console.log('Worksheet rows:', JSON.stringify(rows.rows));
  } catch(e) { console.log('Worksheet error:', e.message); }

  // Return To Vendor
  try {
    const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='ReturnToVendor' ORDER BY ordinal_position LIMIT 10");
    console.log('RTV cols:', cols.rows.map(r => r.column_name).join(', '));
    const rows = await client.query('SELECT * FROM dbo."ReturnToVendor" LIMIT 2');
    console.log('RTV rows:', JSON.stringify(rows.rows));
  } catch(e) { console.log('RTV error:', e.message); }

  // RWOPO - PO data
  try {
    const r = await client.query('SELECT "PoNumber", "VendorNo" FROM dbo."PurchaseOrder" WHERE "Status" = \'O\' LIMIT 3');
    console.log('Open POs:', JSON.stringify(r.rows));
  } catch(e) { console.log('PO error:', e.message); }

  // Merchandise Labels
  try {
    const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='MerchandiseLabel' ORDER BY ordinal_position LIMIT 10");
    console.log('MerchandiseLabel cols:', cols.rows.map(r => r.column_name).join(', '));
  } catch(e) { console.log('MerchandiseLabel error:', e.message); }

  // Users
  try {
    const r = await client.query('SELECT "Username", "FullName" FROM dbo."User" WHERE "RecordDelete" = 0 AND "IsActive" = true LIMIT 5');
    console.log('Active users:', JSON.stringify(r.rows));
  } catch(e) { console.log('User error:', e.message); }

  // Promotions for SKU 123253
  try {
    const r = await client.query('SELECT "EventNo", "StartDate", "EndDate", "Description" FROM dbo."Promotion" p JOIN dbo."PromotionDetail" pd ON pd."EventNo" = p."EventNo" WHERE pd."SkuNo" = 123253 LIMIT 3');
    console.log('Promotions 123253:', JSON.stringify(r.rows));
  } catch(e) { console.log('Promo error:', e.message); }

  await client.end();
  console.log('Done');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(0); });
