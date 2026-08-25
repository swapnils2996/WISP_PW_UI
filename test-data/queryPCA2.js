const { Client } = require('pg');

async function main() {
  const c = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });
  await c.connect();
  console.log('Connected');

  // PriceActivationEvent columns
  let r = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='dbo' AND table_name='PriceActivationEvent' ORDER BY ordinal_position`);
  console.log('PriceActivationEvent COLS:', r.rows.map(x => x.column_name + ':' + x.data_type));

  // PriceActivationBatch columns
  r = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='dbo' AND table_name='PriceActivationBatch' ORDER BY ordinal_position`);
  console.log('PriceActivationBatch COLS:', r.rows.map(x => x.column_name + ':' + x.data_type));

  // PriceActivationItem columns
  r = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='dbo' AND table_name='PriceActivationItem' ORDER BY ordinal_position`);
  console.log('PriceActivationItem COLS:', r.rows.map(x => x.column_name + ':' + x.data_type));

  // Sample events
  r = await c.query(`SELECT * FROM dbo."PriceActivationEvent" ORDER BY "Id" DESC LIMIT 5`);
  console.log('SAMPLE EVENTS:', JSON.stringify(r.rows, null, 2));

  await c.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
