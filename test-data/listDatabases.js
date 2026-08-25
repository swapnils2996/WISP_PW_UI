const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, database: 'postgres', user: 'postgres', password: 'Michaels@1' });
client.connect().then(async () => {
  const dbs = await client.query('SELECT datname FROM pg_database ORDER BY datname');
  console.log('Databases:', JSON.stringify(dbs.rows.map(r => r.datname)));
  await client.end();
}).catch(e => { console.error('Error:', e.message); process.exit(1); });
