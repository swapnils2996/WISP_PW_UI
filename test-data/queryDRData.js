const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });

client.connect().then(async () => {
  // OverstockLocation
  const ol = await client.query('SELECT * FROM dbo."OverstockLocation" LIMIT 10');
  console.log('OverstockLocation cols:', ol.fields.map(f => f.name));
  console.log('OverstockLocation rows:', JSON.stringify(ol.rows.slice(0,5)));

  // OverstockSection
  const os = await client.query('SELECT * FROM dbo."OverstockSection" LIMIT 5');
  console.log('OverstockSection cols:', os.fields.map(f => f.name));
  console.log('OverstockSection rows:', JSON.stringify(os.rows.slice(0,3)));

  // Configuration - look for truck/inventory/threshold keys
  const cfg = await client.query(`SELECT "Key","Value" FROM dbo."Configuration" WHERE "Key" ILIKE '%truck%' OR "Key" ILIKE '%inventory%' OR "Key" ILIKE '%overstock%' OR "Key" ILIKE '%replen%' OR "Key" ILIKE '%siso%' OR "Key" ILIKE '%transfer%' OR "Key" ILIKE '%print%' LIMIT 30`);
  console.log('Config rows:', JSON.stringify(cfg.rows));

  // ReplenishmentThresholdBatchHeader
  const rtbh = await client.query('SELECT * FROM dbo."ReplenishmentThresholdBatchHeader" LIMIT 3');
  console.log('ReplenishmentThresholdBatchHeader cols:', rtbh.fields.map(f => f.name));
  console.log('ReplenishmentThresholdBatchHeader rows:', JSON.stringify(rtbh.rows));

  // OverstockLocationMapping
  const olm = await client.query('SELECT * FROM dbo."OverstockLocationMapping" LIMIT 5');
  console.log('OverstockLocationMapping cols:', olm.fields.map(f => f.name));
  console.log('OverstockLocationMapping rows:', JSON.stringify(olm.rows.slice(0,3)));

  await client.end();
}).catch(e => { console.error('Error:', e.message); process.exit(1); });
