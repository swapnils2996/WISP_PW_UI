const { Client } = require('pg');

async function main() {
  const c = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });
  await c.connect();
  console.log('Connected');

  // Find PriceChange tables
  let r = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='dbo' AND table_name ILIKE '%price%' ORDER BY table_name`);
  console.log('PRICE TABLES:', r.rows.map(x => x.table_name));

  // Find Event/Batch/Item related tables
  r = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='dbo' AND (table_name ILIKE '%event%' OR table_name ILIKE '%batch%' OR table_name ILIKE '%activation%') ORDER BY table_name`);
  console.log('EVENT/BATCH TABLES:', r.rows.map(x => x.table_name));

  await c.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
