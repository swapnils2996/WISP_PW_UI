const { Client } = require('pg');
const dbConfig = { host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' };

(async () => {
  const client = new Client(dbConfig);
  await client.connect();
  console.log('Connected\n');

  // All tables
  const all = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
  console.log('ALL TABLES:');
  all.rows.forEach(r => console.log(' ', r.table_name));

  // Try PO related
  for (const t of ['purchase_order','po_header','po','open_po','purchase_orders','po_activity']) {
    const exists = all.rows.find(r => r.table_name === t);
    if (exists) {
      const sample = await client.query(`SELECT * FROM ${t} LIMIT 3`).catch(e => ({ rows: [], err: e.message }));
      const cnt = await client.query(`SELECT COUNT(*) as c FROM ${t}`).catch(() => ({ rows: [{ c: '?' }] }));
      console.log(`\n--- ${t} (${cnt.rows[0].c} rows) ---`);
      if (sample.rows.length > 0) console.log('Cols:', Object.keys(sample.rows[0]).join(', '));
      sample.rows.forEach(r => console.log(' ', JSON.stringify(r)));
    }
  }

  await client.end();
})();
