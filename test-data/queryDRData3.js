const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });

client.connect().then(async () => {
  // Get shelf columns
  const shelf = await client.query('SELECT * FROM dbo."OverstockShelf" LIMIT 5');
  console.log('Shelf cols:', shelf.fields.map(f => f.name));
  console.log('Shelf rows:', JSON.stringify(shelf.rows.slice(0,3)));

  // Existing unprinted mappings
  const olm = await client.query(`
    SELECT ol."LocationName", ol."LocationValue", olm."OverstockLocationSection", olm."UserOption", olm."LabelText"
    FROM dbo."OverstockLocationMapping" olm
    JOIN dbo."OverstockLocation" ol ON olm."OverstockLocationId" = ol."Id"
    LIMIT 5
  `);
  console.log('Mappings:', JSON.stringify(olm.rows));

  // Get configuration keys related to truck/inventory
  const cfg = await client.query(`SELECT "Key","Value" FROM dbo."Configuration" WHERE "Key" ILIKE '%Truck%' OR "Key" ILIKE '%Inventory%' OR "Key" ILIKE '%Override%' OR "Key" ILIKE '%SISO%' ORDER BY "Key"`);
  console.log('Config:', JSON.stringify(cfg.rows));

  await client.end();
}).catch(e => { console.error('Error:', e.message); process.exit(1); });
