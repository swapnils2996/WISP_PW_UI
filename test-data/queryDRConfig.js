const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });
client.connect().then(async () => {
  const res = await client.query(`SELECT "Key","Value" FROM dbo."Configuration" WHERE "Key" ILIKE 'SDR%' ORDER BY "Key"`);
  console.log('SDR config rows:', JSON.stringify(res.rows));
  await client.end();
}).catch(e => { console.error(e.message); process.exit(1); });
