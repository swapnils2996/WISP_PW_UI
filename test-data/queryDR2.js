const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });

client.connect().then(async () => {
  // List all schemas
  const schemas = await client.query(`SELECT schema_name FROM information_schema.schemata ORDER BY schema_name`);
  console.log('Schemas:', JSON.stringify(schemas.rows.map(r => r.schema_name)));

  // List tables in all schemas
  const tables = await client.query(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('pg_catalog','information_schema')
    ORDER BY table_schema, table_name
  `);
  console.log('Tables:', JSON.stringify(tables.rows.map(r => r.table_schema + '.' + r.table_name)));

  await client.end();
}).catch(e => { console.error('Error:', e.message); process.exit(1); });
