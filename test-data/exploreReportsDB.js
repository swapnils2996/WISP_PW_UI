const { Client } = require('pg');

const dbConfig = {
  host: 'localhost', port: 5432, database: 'isp',
  user: 'postgres', password: 'Michaels@1',
};

(async () => {
  const client = new Client(dbConfig);
  await client.connect();
  console.log('Connected to ISP DB\n');

  try {
    // All tables containing "report" in name
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND LOWER(table_name) LIKE '%report%'
      ORDER BY table_name;
    `);
    console.log('=== Report-related tables ===');
    tables.rows.forEach(r => console.log(' ', r.table_name));

    // Also check for trailer/manifest/purchase/planogram
    const others = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (LOWER(table_name) LIKE '%trailer%'
          OR LOWER(table_name) LIKE '%manifest%'
          OR LOWER(table_name) LIKE '%purchase%'
          OR LOWER(table_name) LIKE '%planogram%'
          OR LOWER(table_name) LIKE '%department%'
          OR LOWER(table_name) LIKE '%inbound%'
          OR LOWER(table_name) LIKE '%pool%')
      ORDER BY table_name;
    `);
    console.log('\n=== Other relevant tables ===');
    others.rows.forEach(r => console.log(' ', r.table_name));

    // Sample each report table (up to 3 rows)
    for (const row of tables.rows) {
      const sample = await client.query(`SELECT * FROM "${row.table_name}" LIMIT 3`).catch(e => ({ rows: [], error: e.message }));
      const count = await client.query(`SELECT COUNT(*) as cnt FROM "${row.table_name}"`).catch(() => ({ rows: [{ cnt: '?' }] }));
      console.log(`\n--- ${row.table_name} (${count.rows[0]?.cnt} rows) ---`);
      if (sample.rows.length > 0) {
        console.log('  Columns:', Object.keys(sample.rows[0]).join(', '));
        sample.rows.slice(0, 1).forEach(r => console.log('  Sample:', JSON.stringify(r)));
      } else {
        console.log('  No rows or error');
      }
    }

    // department info
    const deptQ = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND LOWER(table_name) LIKE '%dept%'
      ORDER BY table_name;
    `);
    console.log('\n=== Dept-related tables ===');
    deptQ.rows.forEach(r => console.log(' ', r.table_name));

    // Check for existing reports stored files
    const repFiles = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (LOWER(table_name) LIKE '%print%'
          OR LOWER(table_name) LIKE '%reprint%')
      ORDER BY table_name;
    `).catch(() => ({ rows: [] }));
    console.log('\n=== Print/Reprint tables ===');
    repFiles.rows.forEach(r => console.log(' ', r.table_name));

  } finally {
    await client.end();
  }
})();
