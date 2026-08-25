const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });
client.connect().then(async () => {
  // RTItemData - might contain pre-formatted item data for the app
  const rt = await client.query('SELECT * FROM dbo."RTItemData" LIMIT 1');
  if (rt.rows[0]) {
    console.log('RTItemData cols:', Object.keys(rt.rows[0]).join(', '));
    console.log('First row sample:', JSON.stringify(rt.rows[0]).substring(0, 500));
    // Check if it has item data for SKU 123458
    const rtItem = await client.query('SELECT * FROM dbo."RTItemData" WHERE "SkuNo" = 123458 OR CAST("SkuNo" AS TEXT) = \'123458\' LIMIT 1');
    if (rtItem.rows[0]) console.log('RTItemData for 123458:', JSON.stringify(rtItem.rows[0]).substring(0, 800));
    else console.log('No RTItemData for 123458');
  } else {
    console.log('RTItemData is empty');
  }

  // ItemPrice - check if this exists
  const price = await client.query('SELECT * FROM dbo."ItemPrice" LIMIT 1').catch(e => null);
  if (price && price.rows[0]) {
    console.log('\nItemPrice cols:', Object.keys(price.rows[0]).join(', '));
  }

  // Check VendorItem
  const vi = await client.query('SELECT * FROM dbo."VendorItem" WHERE "ItemId" = 45283 LIMIT 2');
  console.log('\nVendorItem cols:', Object.keys(vi.rows[0] || {}).join(', '));
  vi.rows.forEach(r => console.log('  VendorItem:', JSON.stringify(r)));
  
  // Check Vendor for VendorId from VendorItem
  if (vi.rows[0]) {
    const v = await client.query(`SELECT * FROM dbo."Vendor" WHERE "Id" = ${vi.rows[0].VendorId} LIMIT 1`);
    if (v.rows[0]) console.log('  Vendor:', JSON.stringify(v.rows[0]));
  }

  // Check RTSourceData
  const rts = await client.query('SELECT * FROM dbo."RTSourceData" LIMIT 1').catch(e => ({ rows: [], msg: e.message }));
  if (rts.rows && rts.rows[0]) console.log('\nRTSourceData cols:', Object.keys(rts.rows[0]).join(', '));
  
  await client.end();
}).catch(e => { console.error(e.message); process.exit(1); });
