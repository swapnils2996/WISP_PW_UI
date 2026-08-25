const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  database: 'isp',
  user: 'postgres',
  password: 'Michaels@1',
  port: 5432,
});

(async () => {
  await client.connect();

  // Get StoreAddress columns
  const cols = await client.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='dbo' AND table_name='StoreAddress' ORDER BY ordinal_position"
  );
  console.log('StoreAddress columns:');
  cols.rows.forEach(c => console.log(' ', c.column_name, ':', c.data_type));

  // Get sample rows
  const rows = await client.query('SELECT * FROM dbo."StoreAddress" LIMIT 10');
  console.log('\nSample rows:');
  rows.rows.forEach(r => console.log(JSON.stringify(r)));

  // Get Store table columns
  const storeCols = await client.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='dbo' AND table_name='Store' ORDER BY ordinal_position"
  );
  console.log('\nStore columns:');
  storeCols.rows.forEach(c => console.log(' ', c.column_name, ':', c.data_type));

  // Sample Store rows
  const storeRows = await client.query('SELECT * FROM dbo."Store" LIMIT 5');
  console.log('\nStore sample:');
  storeRows.rows.forEach(r => console.log(JSON.stringify(r)));

  await client.end();
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
