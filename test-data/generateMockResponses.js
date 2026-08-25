/**
 * Generates mock API responses for ItemService.svc/jitem/saleshistory/{sku}
 * based on DB data. Outputs mockItemData.json for use in tests.
 * Run: node test-data/generateMockResponses.js
 */
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

async function buildItemResponse(client, sku) {
  // Item + UPC + Department
  const itemRes = await client.query(`
    SELECT i."Id", i."SkuNo", i."Description", i."Status", i."Type",
      i."DepartmentId", i."ClassId", i."SellingUnitOfMeasure", i."AutoReplenished",
      i."CanOrder", i."WasPrice", i."QuantityOnHandFromRetek", i."PurchaseOrderOnOrder",
      i."MaximumOrderQuantity", i."LastOrderedDate", i."LastReceivedDate",
      i."LastAdjustmentDate", i."LastEventDate", i."LastEventNo", i."Discontinued",
      i."CreatedDate", i."DateReceivedFromRetek", i."AssortmentType",
      i."RecommendedOrderPoint" as "SplitQty",
      d."Number" as "DeptNo", d."Description" as "DeptDesc",
      dc."Number" as "ClassNo", dc."Description" as "ClassDesc"
    FROM dbo."Item" i
    LEFT JOIN dbo."Department" d ON d."Id" = i."DepartmentId" AND d."RecordDelete" = 0
    LEFT JOIN dbo."DepartmentClass" dc ON dc."Id" = i."ClassId" AND dc."RecordDelete" = 0
    WHERE CAST(i."SkuNo" AS TEXT) = $1 AND i."RecordDelete" = 0
    LIMIT 1
  `, [String(sku)]);

  if (!itemRes.rows[0]) return null;
  const i = itemRes.rows[0];

  // UPCs
  const upcRes = await client.query(`
    SELECT "UpcNo", "IsPrimary" FROM dbo."Upc"
    WHERE "ItemId" = $1 AND "RecordDelete" = 0
    ORDER BY "IsPrimary" DESC
    LIMIT 5
  `, [i.Id]);

  // Sales History
  const salesRes = await client.query(`
    SELECT "YearWeek", "SalesType", COALESCE("SalesQuantity", 0) as "SalesQuantity"
    FROM dbo."SalesHistory"
    WHERE CAST("SkuNo" AS TEXT) = $1
    ORDER BY "YearWeek" DESC
    LIMIT 12
  `, [String(sku)]);

  // Build WeeklySales structure (group by YearWeek, 4 weeks max)
  const weekMap = {};
  salesRes.rows.forEach(r => {
    const wk = r.YearWeek;
    if (!weekMap[wk]) weekMap[wk] = { WeekNumber: String(wk), UnitsSold: { OnRegularPrice: 0, OnPromotion: 0, OnClearance: 0 } };
    if (r.SalesType === 'R') weekMap[wk].UnitsSold.OnRegularPrice = parseFloat(r.SalesQuantity);
    else if (r.SalesType === 'P') weekMap[wk].UnitsSold.OnPromotion = parseFloat(r.SalesQuantity);
    else if (r.SalesType === 'C') weekMap[wk].UnitsSold.OnClearance = parseFloat(r.SalesQuantity);
  });
  const weeks = Object.values(weekMap).slice(0, 4);
  // Pad to 4 weeks for all SKUs (empty weeks show 0 data)
  while (weeks.length < 4) weeks.push({ WeekNumber: 'W' + (weeks.length + 1), UnitsSold: { OnRegularPrice: 0, OnPromotion: 0, OnClearance: 0 } });

  const avgRegular = weeks.reduce((s, w) => s + w.UnitsSold.OnRegularPrice, 0) / 4;
  const avgPromo   = weeks.reduce((s, w) => s + w.UnitsSold.OnPromotion, 0) / 4;
  const avgClear   = weeks.reduce((s, w) => s + w.UnitsSold.OnClearance, 0) / 4;

  // Planograms
  const pogRes = await client.query(`
    SELECT p."Id", p."Number", p."Level", p."Section", p."Facings",
      p."Description", p."Quantity", p."Sequence", p."Department",
      p."PogId", p."StartDate", p."CompletionDate"
    FROM dbo."Planogram" p
    WHERE p."ItemId" = $1 AND p."RecordDelete" = 0
    LIMIT 10
  `, [i.Id]);

  // VendorItems
  const vendorRes = await client.query(`
    SELECT vi."Id", vi."VendorId", vi."IsPrimary", vi."Sku", vi."Pack",
      vi."UnitOfMeasure", vi."CostPerSUOM",
      v."VendorNo" as "VendorNumber", v."Name" as "VendorName"
    FROM dbo."VendorItem" vi
    JOIN dbo."Vendor" v ON v."Id" = vi."VendorId" AND v."RecordDelete" = 0
    WHERE vi."ItemId" = $1 AND vi."RecordDelete" = 0
    LIMIT 5
  `, [i.Id]).catch(() => ({ rows: [] }));

  // Primary vendor for cost
  const primaryVendor = vendorRes.rows.find(v => v.IsPrimary) || vendorRes.rows[0];
  const cost = primaryVendor ? parseFloat(primaryVendor.CostPerSUOM) || 0 : 0;
  const salePrice = parseFloat(i.WasPrice) || 9.99;

  // Promotions (LogixPromotionItems)
  const promoRes = await client.query(`
    SELECT lp."EventNumber", lp."StartDate", lp."EndDate", lp."PromotionType"
    FROM dbo."Logix_PromotionDetails" lpd
    JOIN dbo."Logix_Promotion" lp ON lp."Id" = lpd."PromotionId"
    WHERE lpd."ItemId" = $1
    LIMIT 5
  `, [i.Id]).catch(() => ({ rows: [] }));

  // Assortments (using Item table AssortmentType)
  const assortRes = await client.query(`
    SELECT i2."SkuNo", u."UpcNo", i2."Description",
      CASE WHEN i2."Id" = $1 THEN 'Parent' ELSE 'Child' END as "Association"
    FROM dbo."Item" i2
    LEFT JOIN dbo."Upc" u ON u."ItemId" = i2."Id" AND u."IsPrimary" = 1 AND u."RecordDelete" = 0
    WHERE i2."Id" = $1 AND i2."AssortmentType" != 'N' AND i2."RecordDelete" = 0
    LIMIT 5
  `, [i.Id]).catch(() => ({ rows: [] }));

  // Overstock
  const overstockRes = await client.query(`
    SELECT ol."Id", ol."LocationName"
    FROM dbo."OverstockLocationItemMapping" olim
    JOIN dbo."OverstockLocation" ol ON ol."Id" = olim."OverstockLocationId" AND ol."RecordDelete" = 0
    WHERE olim."ItemId" = $1 AND olim."RecordDelete" = 0
    LIMIT 5
  `, [i.Id]).catch(() => ({ rows: [] }));

  return {
    SkuNo: String(i.SkuNo),
    Description: i.Description || '',
    Status: i.Status || 'A',
    Type: i.Type || 'B',
    AssortmentType: i.AssortmentType || 'N',
    AutoReplenished: i.AutoReplenished === 1 || i.AutoReplenished === true,
    CanOrder: i.CanOrder === 1 || i.CanOrder === true,
    SellingUnitOfMeasure: i.SellingUnitOfMeasure || 'EA',
    ShowInventoryDate: false,
    IsAMSEnterpriseUE: false,
    IsFetchingAMSPromotion: false,

    // Pricing
    SalePrice: salePrice,
    RegularPrice: salePrice,
    WasPrice: parseFloat(i.WasPrice) || 0,

    // Inventory
    QuantityOnHand: parseFloat(i.QuantityOnHandFromRetek) || 0,
    QuantityOnOrder: i.PurchaseOrderOnOrder || 0,
    SplitQty: i.SplitQty || 0,
    MaximumOrderQuantity: i.MaximumOrderQuantity || 0,
    LastOrderedDate: i.LastOrderedDate || null,
    LastReceivedDate: i.LastReceivedDate || null,
    LastAdjustmentDate: i.LastAdjustmentDate || null,
    LastEventDate: i.LastEventDate || null,
    LastEventNo: i.LastEventNo || '',
    DateReceivedFromRetek: i.DateReceivedFromRetek || null,
    Discontinued: i.Discontinued === 1 || i.Discontinued === true,
    CreatedDate: i.CreatedDate || null,

    // Department
    Department: {
      Number: i.DeptNo || 0,
      Description: i.DeptDesc || ''
    },
    DepartmentClass: {
      Number: i.ClassNo || 0,
      Description: i.ClassDesc || ''
    },

    // UPCs
    Upcs: upcRes.rows.length > 0 ? upcRes.rows.map(u => ({
      UpcNo: String(u.UpcNo),
      IsPrimary: u.IsPrimary === 1 || u.IsPrimary === true
    })) : [{ UpcNo: '', IsPrimary: true }],

    // Sales History
    SalesHistory: {
      WeeklySales: weeks,
      CurrentFourWeekAverage: {
        OnRegularPrice: avgRegular,
        OnPromotion: avgPromo,
        OnClearance: avgClear
      },
      LYPreviousFourWeekAverage: { OnRegularPrice: 0, OnPromotion: 0, OnClearance: 0 },
      LYNextFourWeekAverage:     { OnRegularPrice: 0, OnPromotion: 0, OnClearance: 0 },
    },

    // Planograms
    Planograms: pogRes.rows.map(p => ({
      Id: p.Id,
      Number: p.Number,
      Level: p.Level,
      Section: p.Section,
      Facings: p.Facings,
      Description: p.Description || '',
      Quantity: p.Quantity,
      Sequence: p.Sequence,
      Department: p.Department,
      PogId: p.PogId,
      StartDate: p.StartDate || null,
      CompletionDate: p.CompletionDate || null,
      PegMax: null
    })),

    // VendorItems
    VendorItems: vendorRes.rows.map(v => ({
      Id: v.Id,
      VendorId: v.VendorId,
      IsPrimary: v.IsPrimary === 1 || v.IsPrimary === true,
      Sku: v.Sku || '',
      Pack: v.Pack || 1,
      UnitOfMeasure: v.UnitOfMeasure || 'EA',
      CostPerSUOM: parseFloat(v.CostPerSUOM) || 0,
      Vendor: {
        VendorNo: v.VendorNumber,
        Name: v.VendorName
      }
    })),

    // Promotions
    LogixPromotionItems: promoRes.rows.map(p => ({
      EventNumber: p.EventNumber,
      StartDate: p.StartDate || null,
      EndDate: p.EndDate || null,
      PromotionType: p.PromotionType || ''
    })),
    Promotions: promoRes.rows.map(p => ({
      EventNumber: p.EventNumber,
      StartDate: p.StartDate || null,
      EndDate: p.EndDate || null
    })),

    // Assortment
    Assortments: assortRes.rows.map(a => ({
      Association: a.Association,
      SkuNo: String(a.SkuNo),
      UpcNo: a.UpcNo || '',
      Description: a.Description || ''
    })),

    // Overstock
    OverstockItemMappings: overstockRes.rows.map(o => ({
      Id: o.Id,
      Location: o.LocationName || ''
    })),
  };
}

async function main() {
  const client = new Client({ host: 'localhost', port: 5432, database: 'isp', user: 'postgres', password: 'Michaels@1' });
  await client.connect();

  // SKUs to generate mock responses for
  // 384142 = skuNoSalesHistory, 358341 = skuNoPlanogram
  const skus = ['123458', '1768', '2', '384142', '358341'];
  const SKU_NO_SALES_HISTORY = '384142';

  const mocks = {};
  for (const sku of skus) {
    console.log(`Building mock for SKU ${sku}...`);
    const response = await buildItemResponse(client, sku);
    if (response) {
      // For skuNoSalesHistory: set SalesHistory to null to test "no history" rendering
      if (sku === SKU_NO_SALES_HISTORY) {
        response.SalesHistory = null;
      }
      mocks[sku] = response;
      const shLen = response.SalesHistory ? response.SalesHistory.WeeklySales.length : 'null';
      console.log(`  OK: ${response.Description}, planograms=${response.Planograms.length}, vendors=${response.VendorItems.length}, salesHistory=${shLen}`);
    } else {
      console.log(`  SKU ${sku} not found in DB`);
    }
  }

  await client.end();

  const outputPath = path.join(__dirname, 'mockItemData.json');
  fs.writeFileSync(outputPath, JSON.stringify(mocks, null, 2));
  console.log(`\nMock data saved to: ${outputPath}`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
