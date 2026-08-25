const { Client } = require('pg');

async function main() {
  const c = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });
  await c.connect();

  // Check PriceActivationItem status meaning - look for ActivationStatus mapping table
  let r = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='dbo' AND table_name ILIKE '%status%' ORDER BY table_name`);
  console.log('STATUS TABLES:', r.rows.map(x => x.table_name));

  // Pending event: any event where some items have ActivationStatus not 6 (activated)?
  r = await c.query(`
    SELECT e."EventNumber", i."ActivationStatus", COUNT(*) as cnt
    FROM dbo."PriceActivationEvent" e
    JOIN dbo."PriceActivationBatch" b ON b."EventId"=e."Id"
    JOIN dbo."PriceActivationItem" i ON i."BatchId"=b."Id" AND i."RecordDelete"=0
    WHERE e."RecordDelete"=0
    GROUP BY e."EventNumber", i."ActivationStatus"
    ORDER BY e."EventNumber", i."ActivationStatus"
    LIMIT 20
  `);
  console.log('EVENT STATUS DISTRIBUTION:', JSON.stringify(r.rows, null, 2));

  // Find event where ActivationStatus = 7 (possibly Pending)
  r = await c.query(`
    SELECT DISTINCT e."EventNumber", e."Id"
    FROM dbo."PriceActivationEvent" e
    JOIN dbo."PriceActivationBatch" b ON b."EventId"=e."Id"
    JOIN dbo."PriceActivationItem" i ON i."BatchId"=b."Id" AND i."RecordDelete"=0
    WHERE e."RecordDelete"=0 AND i."ActivationStatus"=7
    LIMIT 3
  `);
  console.log('EVENTS WITH STATUS=7:', JSON.stringify(r.rows, null, 2));

  // If status 7 found, get details
  if (r.rows.length > 0) {
    const evId = r.rows[0].Id;
    const evNum = r.rows[0].EventNumber;
    const r2 = await c.query(`
      SELECT b."BatchNumber", b."Id" AS batch_id, i."ActivationStatus",
             it."SkuNo"::text, u."UpcNo"
      FROM dbo."PriceActivationBatch" b
      JOIN dbo."PriceActivationItem" i ON i."BatchId"=b."Id" AND i."RecordDelete"=0
      JOIN dbo."Item" it ON it."Id"=i."ItemId"
      LEFT JOIN dbo."Upc" u ON u."ItemId"=it."Id" AND u."IsPrimary"=1 AND u."RecordDelete"=0
      WHERE b."EventId"=$1
      LIMIT 3
    `, [evId]);
    console.log(`DETAILS for status-7 event ${evNum}:`, JSON.stringify(r2.rows, null, 2));
  }

  // Check if there is a "PriceChangeStatus" or similar mapping
  r = await c.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='dbo' AND table_name='PriceActivationEvent'
  `);
  console.log('Event columns:', r.rows.map(x => x.column_name));

  // Get event with most recent start date
  r = await c.query(`
    SELECT e."EventNumber", e."StartDate", e."ReceivedDate",
           COUNT(DISTINCT b."Id") as batches,
           COUNT(DISTINCT i."Id") as items,
           MIN(i."ActivationStatus") as min_status,
           MAX(i."ActivationStatus") as max_status
    FROM dbo."PriceActivationEvent" e
    JOIN dbo."PriceActivationBatch" b ON b."EventId"=e."Id"
    JOIN dbo."PriceActivationItem" i ON i."BatchId"=b."Id" AND i."RecordDelete"=0
    WHERE e."RecordDelete"=0
    GROUP BY e."EventNumber", e."StartDate", e."ReceivedDate"
    ORDER BY e."StartDate" DESC LIMIT 5
  `);
  console.log('RECENT EVENTS:', JSON.stringify(r.rows, null, 2));

  await c.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
