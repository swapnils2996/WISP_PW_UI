const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'isp',
    user: 'postgres',
    password: 'Michaels@1'
  });

  await client.connect();
  console.log('Connected to isp DB');

  // Item with sales history (using SkuNo)
  const itemWithSales = await client.query(`
    SELECT DISTINCT sh."SkuNo", i."Description", i."Status"
    FROM dbo."SalesHistory" sh
    JOIN dbo."Item" i ON CAST(sh."SkuNo" AS TEXT) = CAST(i."SkuNo" AS TEXT)
    WHERE i."Status" = 'A'
    LIMIT 3
  `);
  console.log('Items with sales history:');
  itemWithSales.rows.forEach(r => console.log(JSON.stringify(r)));

  // Item with planogram 
  const itemWithPog = await client.query(`
    SELECT DISTINCT p."ItemId", i."SkuNo", i."Description"
    FROM dbo."Planogram" p
    JOIN dbo."Item" i ON p."ItemId" = i."Id"
    WHERE i."Status" = 'A' AND i."RecordDelete" = 0 AND p."RecordDelete" = 0
    LIMIT 3
  `);
  console.log('Items with planogram:');
  itemWithPog.rows.forEach(r => console.log(JSON.stringify(r)));

  // Item with promotion
  const promoCols = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='Promotion' ORDER BY ordinal_position"
  );
  console.log('Promotion columns:', promoCols.rows.map(r => r.column_name).join(', '));

  const promoDetailCols = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='PromotionDetail' ORDER BY ordinal_position"
  );
  console.log('PromotionDetail columns:', promoDetailCols.rows.map(r => r.column_name).join(', '));

  // Sample active item and UPC from Items with UPC
  const activeItemsWithUpc = await client.query(`
    SELECT i."SkuNo", u."UpcNo", i."Description", i."DepartmentId"
    FROM dbo."Item" i
    JOIN dbo."Upc" u ON u."ItemId" = i."Id" AND u."IsPrimary" = 1 AND u."RecordDelete" = 0
    WHERE i."Status" = 'A' AND i."RecordDelete" = 0
    LIMIT 5
  `);
  console.log('Active items with UPC:');
  activeItemsWithUpc.rows.forEach(r => console.log(JSON.stringify(r)));

  // Get store address info joined
  const storeAddressInfo = await client.query(`
    SELECT s."StoreNo", s."StoreType", a."AddressLine1", a."City", a."State", a."Zip", a."Phone"
    FROM dbo."Store" s
    JOIN dbo."StoreAddress" sa ON sa."StoreID" = s."ID" AND sa."RecordDelete" = 0
    JOIN dbo."Address" a ON a."ID" = sa."AddressID" AND a."RecordDelete" = 0
    WHERE s."RecordDelete" = 0 AND s."CloseDate" IS NULL
    LIMIT 10
  `);
  console.log('Store addresses:');
  storeAddressInfo.rows.forEach(r => console.log(JSON.stringify(r)));

  await client.end();
}

main().catch(err => { console.error(err.message); process.exit(1); });
