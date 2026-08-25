/**
 * Queries DB for item data structure to build mock API responses.
 * Run: node test-data/queryItemData.js
 */
const { Client } = require('pg');

async function main() {
  const client = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });
  await client.connect();

  // Full item data for SKU 123458
  const item = await client.query(`
    SELECT i.*, u."UpcNo",
      d."Number" as "DeptNo", d."Description" as "DeptDesc"
    FROM dbo."Item" i
    LEFT JOIN dbo."Upc" u ON u."ItemId" = i."Id" AND u."IsPrimary" = 1 AND u."RecordDelete" = 0
    LEFT JOIN dbo."Department" d ON d."Id" = i."DepartmentId" AND d."RecordDelete" = 0
    WHERE i."SkuNo" = 123458 AND i."RecordDelete" = 0
    LIMIT 1
  `);
  console.log('\n=== Item columns ===');
  if (item.rows[0]) {
    const row = item.rows[0];
    Object.keys(row).forEach(k => console.log(`  ${k}: ${JSON.stringify(row[k])}`));
  }

  // Sales history
  const sales = await client.query(`
    SELECT * FROM dbo."SalesHistory" WHERE "SkuNo" = 123458 ORDER BY "WeekNo" DESC LIMIT 5
  `);
  console.log('\n=== SalesHistory columns ===');
  if (sales.rows[0]) {
    Object.keys(sales.rows[0]).forEach(k => console.log(`  ${k}: ${JSON.stringify(sales.rows[0][k])}`));
  }
  console.log('Row count:', sales.rowCount);

  // Planogram
  const pog = await client.query(`
    SELECT p.*, pg."Description" as "PogDesc", pg."Number" as "PogNo" 
    FROM dbo."Planogram" p
    LEFT JOIN dbo."Pog" pg ON pg."Id" = p."PogId"
    WHERE p."ItemId" = (SELECT "Id" FROM dbo."Item" WHERE "SkuNo" = 123458 LIMIT 1)
      AND p."RecordDelete" = 0
    LIMIT 3
  `);
  console.log('\n=== Planogram columns ===');
  if (pog.rows[0]) {
    Object.keys(pog.rows[0]).forEach(k => console.log(`  ${k}: ${JSON.stringify(pog.rows[0][k])}`));
  }

  // Vendor
  const vendor = await client.query(`
    SELECT iv.*, v."Name" as "VendorName", v."Number" as "VendorNumber"
    FROM dbo."ItemVendor" iv
    JOIN dbo."Vendor" v ON v."Id" = iv."VendorId" AND v."RecordDelete" = 0
    WHERE iv."ItemId" = (SELECT "Id" FROM dbo."Item" WHERE "SkuNo" = 123458 LIMIT 1)
      AND iv."RecordDelete" = 0
    LIMIT 3
  `);
  console.log('\n=== ItemVendor/Vendor columns ===');
  if (vendor.rows[0]) {
    Object.keys(vendor.rows[0]).forEach(k => console.log(`  ${k}: ${JSON.stringify(vendor.rows[0][k])}`));
  }

  // Promotion  
  const promo = await client.query(`
    SELECT pd.*, pr."EventNumber", pr."StartDate", pr."EndDate"
    FROM dbo."PromotionDetail" pd
    JOIN dbo."Promotion" pr ON pr."Id" = pd."PromotionId" AND pr."RecordDelete" = 0
    WHERE pd."ItemId" = (SELECT "Id" FROM dbo."Item" WHERE "SkuNo" = 123458 LIMIT 1)
      AND pd."RecordDelete" = 0
    LIMIT 3
  `);
  console.log('\n=== Promotion columns ===');
  if (promo.rows[0]) {
    Object.keys(promo.rows[0]).forEach(k => console.log(`  ${k}: ${JSON.stringify(promo.rows[0][k])}`));
  } else {
    console.log('  (no promotions for 123458)');
  }

  // Try to find what "getSkuData" likely returns - check for a view or procedure
  const views = await client.query(`
    SELECT viewname FROM pg_views WHERE schemaname = 'dbo' AND viewname ILIKE '%item%'
  `);
  console.log('\n=== Item-related views ===');
  views.rows.forEach(r => console.log(' ', r.viewname));

  // Check for procs/functions
  const procs = await client.query(`
    SELECT routine_name FROM information_schema.routines 
    WHERE routine_schema = 'dbo' AND routine_name ILIKE '%item%' 
    LIMIT 10
  `);
  console.log('\n=== Item-related routines ===');
  procs.rows.forEach(r => console.log(' ', r.routine_name));

  await client.end();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
