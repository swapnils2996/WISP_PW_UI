const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });

client.connect().then(async () => {
  // Get all overstock locations
  const locs = await client.query('SELECT "LocationName","LocationValue","Category","IsFlex","From","To","MaxFrom","MaxTo" FROM dbo."OverstockLocation" ORDER BY "Category","LocationName"');
  console.log('All Locations:', JSON.stringify(locs.rows));

  // Get all sections
  const secs = await client.query('SELECT "SectionName" FROM dbo."OverstockSection" ORDER BY "SectionName"');
  console.log('Sections:', JSON.stringify(secs.rows.map(r => r.SectionName)));

  // Get overstock shelves
  const shelves = await client.query('SELECT "ShelfName" FROM dbo."OverstockShelf" LIMIT 10');
  console.log('Shelves:', JSON.stringify(shelves.rows.map(r => r.ShelfName)));

  // Get some existing OverstockLocationMapping data
  const olm = await client.query(`
    SELECT ol."LocationName", ol."LocationValue", olm."OverstockLocationSection", olm."UserOption", olm."LabelText"
    FROM dbo."OverstockLocationMapping" olm
    JOIN dbo."OverstockLocation" ol ON olm."OverstockLocationId" = ol."Id"
    WHERE olm."PrintedDate" IS NULL
    LIMIT 10
  `);
  console.log('Existing unprinted mappings:', JSON.stringify(olm.rows));

  // Get ReplenishmentThreshold location data
  const rtlim = await client.query(`
    SELECT COUNT(*) FROM dbo."ReplenishmentThresholdLocationItemMapping"
  `);
  console.log('ReplenishmentThresholdLocationItemMapping count:', rtlim.rows[0].count);

  // Get Transfer data
  const transfer = await client.query(`
    SELECT COUNT(*) FROM dbo."OverstockTransferReportHeader"
  `);
  console.log('OverstockTransferReportHeader count:', transfer.rows[0].count);

  await client.end();
}).catch(e => { console.error('Error:', e.message); process.exit(1); });
