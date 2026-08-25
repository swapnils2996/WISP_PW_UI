const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });
client.connect().then(async () => {
  // List all tables
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'dbo' ORDER BY table_name
  `);
  console.log('=== All dbo tables ===');
  tables.rows.forEach(r => console.log(' ', r.table_name));
  
  // Check price/cost related
  const price = await client.query(`SELECT * FROM dbo."ItemPrice" LIMIT 1`).catch(e => ({ rows: [], error: e.message }));
  if (price.rows && price.rows[0]) {
    console.log('\nItemPrice cols:', Object.keys(price.rows[0]).join(', '));
    const p2 = await client.query(`SELECT * FROM dbo."ItemPrice" WHERE "ItemId" = 45283 LIMIT 1`);
    if (p2.rows[0]) console.log('ItemPrice for 45283:', JSON.stringify(p2.rows[0]));
  }
  
  await client.end();
}).catch(e => { console.error(e.message); process.exit(1); });
