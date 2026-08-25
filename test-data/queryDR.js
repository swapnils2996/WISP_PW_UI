const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, database: 'postgres', user: 'postgres', password: 'Michaels@1' });

client.connect().then(async () => {
  // Find SISO/DR/Overstock tables
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema='public' 
    AND (table_name ILIKE '%overstock%' 
      OR table_name ILIKE '%siso%' 
      OR table_name ILIKE '%replen%' 
      OR table_name ILIKE '%transfer%'
      OR table_name ILIKE '%location%'
      OR table_name ILIKE '%dr%'
      OR table_name ILIKE '%truck%'
      OR table_name ILIKE '%inventory%'
    )
    ORDER BY table_name
  `);
  console.log('Matching tables:', JSON.stringify(tables.rows.map(r => r.table_name)));

  // Check for location types / dropdown data
  const locTypes = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema='public' 
    ORDER BY table_name LIMIT 80
  `);
  console.log('All tables:', JSON.stringify(locTypes.rows.map(r => r.table_name)));

  await client.end();
}).catch(e => { console.error('DB ERROR:', e.message); process.exit(1); });
