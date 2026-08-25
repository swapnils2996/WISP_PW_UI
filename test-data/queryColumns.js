const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });
client.connect().then(async () => {
  const tables = ['SalesHistory', 'Planogram', 'ItemVendor', 'Vendor', 'Promotion', 'PromotionDetail', 'Pog', 'Overstock', 'Assortment'];
  for (const t of tables) {
    try {
      const r = await client.query(`SELECT * FROM dbo."${t}" LIMIT 1`);
      console.log(`${t}: ${Object.keys(r.rows[0] || {}).join(', ')}`);
    } catch(e) { console.log(`${t}: ERROR - ${e.message}`); }
  }
  
  // Also query actual data for SKU 123458
  const salesQ = await client.query(`SELECT * FROM dbo."SalesHistory" WHERE CAST("SkuNo" AS TEXT) = '123458' LIMIT 4`);
  console.log('\nSalesHistory rows for 123458:', salesQ.rowCount);
  if (salesQ.rows[0]) console.log('  First row:', JSON.stringify(salesQ.rows[0]));
  
  const vendQ = await client.query(`
    SELECT iv.*, v."Name", v."Number" FROM dbo."ItemVendor" iv
    JOIN dbo."Vendor" v ON v."Id" = iv."VendorId" AND v."RecordDelete" = 0
    WHERE iv."ItemId" = 45283 AND iv."RecordDelete" = 0 LIMIT 3`);
  console.log('\nVendor rows for item 45283:', vendQ.rowCount);
  vendQ.rows.forEach(r => console.log('  ', JSON.stringify(r)));
  
  await client.end();
}).catch(e => { console.error(e.message); process.exit(1); });
