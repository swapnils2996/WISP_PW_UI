const { Client } = require('pg');

async function main() {
  const c = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });
  await c.connect();
  console.log('Connected');

  // Event with batches and items (count)
  let r = await c.query(`
    SELECT e."EventNumber", e."Id" AS event_id,
           COUNT(DISTINCT b."Id") AS batch_count,
           COUNT(DISTINCT i."Id") AS item_count
    FROM dbo."PriceActivationEvent" e
    LEFT JOIN dbo."PriceActivationBatch" b ON b."EventId"=e."Id"
    LEFT JOIN dbo."PriceActivationItem" i ON i."BatchId"=b."Id" AND i."RecordDelete"=0
    WHERE e."RecordDelete"=0
    GROUP BY e."EventNumber", e."Id"
    HAVING COUNT(DISTINCT b."Id") > 0 AND COUNT(DISTINCT i."Id") > 0
    ORDER BY COUNT(DISTINCT i."Id") DESC
    LIMIT 5
  `);
  console.log('EVENTS WITH BATCHES+ITEMS:', JSON.stringify(r.rows, null, 2));

  // Best event for testing - with batches
  const bestEvent = r.rows[0];
  if (bestEvent) {
    // Get batches for this event
    r = await c.query(`
      SELECT b."Id" AS batch_id, b."BatchNumber", b."Description",
             COUNT(DISTINCT i."Id") AS item_count
      FROM dbo."PriceActivationBatch" b
      LEFT JOIN dbo."PriceActivationItem" i ON i."BatchId"=b."Id" AND i."RecordDelete"=0
      WHERE b."EventId"=$1
      GROUP BY b."Id", b."BatchNumber", b."Description"
      LIMIT 3
    `, [bestEvent.event_id]);
    console.log(`BATCHES for event ${bestEvent.EventNumber}:`, JSON.stringify(r.rows, null, 2));

    const firstBatch = r.rows[0];
    if (firstBatch) {
      // Get items for this batch
      r = await c.query(`
        SELECT i."Id", it."SkuNo"::text AS "SkuNo",
               u."UpcNo", it."Description", i."NewPrice", i."ActivationStatus", i."HasBeenPrinted"
        FROM dbo."PriceActivationItem" i
        JOIN dbo."Item" it ON it."Id"=i."ItemId"
        LEFT JOIN dbo."Upc" u ON u."ItemId"=it."Id" AND u."IsPrimary"=1 AND u."RecordDelete"=0
        WHERE i."BatchId"=$1 AND i."RecordDelete"=0
        LIMIT 3
      `, [firstBatch.batch_id]);
      console.log(`ITEMS for batch ${firstBatch.BatchNumber}:`, JSON.stringify(r.rows, null, 2));
    }
  }

  // ActivationStatus values
  r = await c.query(`SELECT DISTINCT "ActivationStatus", COUNT(*) FROM dbo."PriceActivationItem" WHERE "RecordDelete"=0 GROUP BY "ActivationStatus" ORDER BY "ActivationStatus"`);
  console.log('ActivationStatus values:', JSON.stringify(r.rows, null, 2));

  await c.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
