/**
 * Builds and tests the mock API response for ItemService.svc/jitem/saleshistory/{sku}.
 * Queries DB and constructs the expected JSON structure.
 * Run: node test-data/buildMockItemResponse.js
 */
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

async function buildMockResponse(sku) {
  const client = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });
  await client.connect();

  // Item data
  const itemRes = await client.query(`
    SELECT i.*, u."UpcNo", d."Number" as "DeptNo", d."Description" as "DeptDesc",
      d2."Number" as "ClassNo", d2."Description" as "ClassDesc"
    FROM dbo."Item" i
    LEFT JOIN dbo."Upc" u ON u."ItemId" = i."Id" AND u."IsPrimary" = 1 AND u."RecordDelete" = 0
    LEFT JOIN dbo."Department" d ON d."Id" = i."DepartmentId" AND d."RecordDelete" = 0
    LEFT JOIN dbo."DepartmentClass" d2 ON d2."Id" = i."ClassId" AND d2."RecordDelete" = 0
    WHERE CAST(i."SkuNo" AS TEXT) = $1 AND i."RecordDelete" = 0
    LIMIT 1
  `, [sku]);

  if (!itemRes.rows[0]) {
    await client.end();
    return null; // Item not found
  }
  const item = itemRes.rows[0];

  // Sales history
  const salesRes = await client.query(`
    SELECT "YearWeek", "SalesType", "SalesQuantity"
    FROM dbo."SalesHistory"
    WHERE CAST("SkuNo" AS TEXT) = $1
    ORDER BY "YearWeek" DESC
    LIMIT 12
  `, [sku]);

  // Planogram
  const pogRes = await client.query(`
    SELECT p.*, pg."Description" as "PogDesc", pg."Number" as "PogNo"
    FROM dbo."Planogram" p
    LEFT JOIN dbo."Planogram" pg ON FALSE
    WHERE p."ItemId" = $1 AND p."RecordDelete" = 0
    LIMIT 5
  `, [item.Id]);

  // VendorItem
  const vendorRes = await client.query(`
    SELECT vi.*, v."Name" as "VendorName", v."VendorNo" as "VendorNumber"
    FROM dbo."VendorItem" vi
    JOIN dbo."Vendor" v ON v."Id" = vi."VendorId" AND v."RecordDelete" = 0
    WHERE vi."ItemId" = $1 AND vi."RecordDelete" = 0
    LIMIT 5
  `, [item.Id]).catch(() => ({ rows: [] }));

  // Promotion
  const promoRes = await client.query(`
    SELECT pr."EventNumber", pr."StartDate", pr."EndDate"
    FROM dbo."PromotionDetail" pd
    JOIN dbo."Promotion" pr ON pr."Id" = pd."PromotionId" AND pr."RecordDelete" = 0
    WHERE pd."ItemId" = $1 AND pd."RecordDelete" = 0
    LIMIT 5
  `, [item.Id]).catch(() => ({ rows: [] }));

  // VendorItem columns check
  const viColsRes = await client.query(`SELECT * FROM dbo."VendorItem" LIMIT 1`).catch(() => ({ rows: [] }));
  if (viColsRes.rows[0]) {
    console.log('VendorItem cols:', Object.keys(viColsRes.rows[0]).join(', '));
  }

  await client.end();

  // Build mock response structure
  // Based on common Angular item inquiry response patterns
  const mockResponse = {
    Item: {
      SkuNo: String(item.SkuNo),
      Description: item.Description,
      UpcNo: item.UpcNo || '',
      DepartmentId: item.DepartmentId,
      DepartmentNo: item.DeptNo,
      DepartmentDesc: item.DeptDesc,
      Status: item.Status,
      Type: item.Type,
      AutoReplenished: item.AutoReplenished === 1,
      CanOrder: item.CanOrder === 1,
      SellingUnitOfMeasure: item.SellingUnitOfMeasure,
      WasPrice: parseFloat(item.WasPrice) || 0,
      QuantityOnHand: parseFloat(item.QuantityOnHandFromRetek) || 0,
      QuantityOnOrder: item.PurchaseOrderOnOrder || 0,
      MaximumOrderQuantity: item.MaximumOrderQuantity || 0,
      LastOrderedDate: item.LastOrderedDate,
      LastReceivedDate: item.LastReceivedDate,
      LastAdjustmentDate: item.LastAdjustmentDate,
      LastEventDate: item.LastEventDate,
      LastEventNo: item.LastEventNo,
      Discontinued: item.Discontinued === 1,
      CreatedDate: item.CreatedDate,
    },
    Price: {
      SellingPrice: parseFloat(item.WasPrice) || 9.99,
      RegularPrice: parseFloat(item.WasPrice) || 9.99,
      WasPrice: parseFloat(item.WasPrice) || 17.99,
      Cost: parseFloat(item.WasPrice) * 0.5 || 4.99,
      Margin: parseFloat(item.WasPrice) * 0.5 || 5.00,
    },
    SalesHistory: salesRes.rows.map(r => ({
      WeekNo: r.YearWeek,
      SalesType: r.SalesType,
      SalesQuantity: parseFloat(r.SalesQuantity) || 0,
    })),
    Planogram: pogRes.rows.map(r => ({
      Id: r.Id,
      Number: r.Number,
      Level: r.Level,
      Section: r.Section,
      Description: r.Description,
      Facings: r.Facings,
      Quantity: r.Quantity,
      Sequence: r.Sequence,
      Department: r.Department,
      PogId: r.PogId,
      StartDate: r.StartDate,
      CompletionDate: r.CompletionDate,
    })),
    Vendor: vendorRes.rows.map((r, i) => ({
      VendorNo: r.VendorNumber || r.VendorId,
      VendorName: r.VendorName,
      Pack: r.Pack || 1,
      UOM: r.UOM || 'EA',
      VendorSku: r.VendorSku || '',
      IsPrimary: i === 0,
    })),
    Promotions: promoRes.rows.map(r => ({
      EventNumber: r.EventNumber,
      StartDate: r.StartDate,
      EndDate: r.EndDate,
    })),
    Assortment: [],
    Overstock: [],
  };

  console.log('\nMock response for SKU', sku, ':');
  console.log('  Item:', mockResponse.Item.Description);
  console.log('  SalesHistory rows:', mockResponse.SalesHistory.length);
  console.log('  Planogram rows:', mockResponse.Planogram.length);
  console.log('  Vendor rows:', mockResponse.Vendor.length);
  console.log('  Promotion rows:', mockResponse.Promotions.length);

  return mockResponse;
}

async function main() {
  const mock123458 = await buildMockResponse('123458');
  const mockSku1768 = await buildMockResponse('1768'); // skuWithPlanogram
  const mockSku2 = await buildMockResponse('2'); // skuWithSalesHistory

  const mocks = {
    '123458': mock123458,
    '1768': mockSku1768,
    '2': mockSku2,
  };

  const outputPath = path.join(__dirname, 'mockItemResponses.json');
  fs.writeFileSync(outputPath, JSON.stringify(mocks, null, 2));
  console.log('\nMock responses saved to:', outputPath);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
