const { Client } = require('pg');

const client = new Client({
  host: 'localhost', database: 'isp', user: 'postgres', password: 'Michaels@1', port: 5432,
});

(async () => {
  await client.connect();

  // Get Address table structure
  const addrCols = await client.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='dbo' AND table_name='Address' ORDER BY ordinal_position"
  );
  console.log('Address columns:');
  addrCols.rows.forEach(c => console.log(' ', c.column_name, ':', c.data_type));

  // Get sample address rows
  const addr = await client.query('SELECT * FROM dbo."Address" LIMIT 5');
  console.log('\nAddress sample:');
  addr.rows.forEach(r => console.log(JSON.stringify(r)));

  // Query: Store joined with Address
  const storeWithAddr = await client.query(`
    SELECT 
      s."StoreNo",
      s."StoreType",
      a."City",
      a."State",
      a."Phone",
      a."AddressLine1",
      a."AddressLine2",
      a."AddressLine3",
      a."Zip"
    FROM dbo."Store" s
    JOIN dbo."StoreAddress" sa ON sa."StoreID" = s."ID" AND sa."RecordDelete" = 0
    JOIN dbo."Address" a ON a."AddressID" = sa."AddressID"
    WHERE s."RecordDelete" = 0
    LIMIT 10
  `);
  console.log('\nStore + Address joined:');
  storeWithAddr.rows.forEach(r => console.log(JSON.stringify(r)));

  await client.end();
  process.exit(0);
})().catch(async e => {
  console.error('Error:', e.message);
  // Try StageStoreAddress
  const r = await client.query('SELECT * FROM dbo."StageStoreAddress" LIMIT 3').catch(e2 => ({ rows: [] }));
  if (r.rows.length > 0) {
    console.log('StageStoreAddress sample:', JSON.stringify(r.rows[0]));
  }
  process.exit(1);
});
