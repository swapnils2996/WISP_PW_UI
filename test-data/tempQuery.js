const { Client } = require("pg");
const client = new Client({
  host: "localhost",
  database: "isp",
  user: "postgres",
  password: "Michaels@1",
  port: 5432
});
client.connect().then(async () => {
  // PriceActivationEvent - get a valid event
  try {
    const pca = await client.query('SELECT "Id", "EventNumber", "Description", "StartDate" FROM dbo."PriceActivationEvent" ORDER BY "StartDate" DESC LIMIT 3');
    console.log("PCA Events:", JSON.stringify(pca.rows));
  } catch(e) { console.log("pca err:", e.message); }
  
  // Get store number from auth.store
  try {
    const stores = await client.query('SELECT "store_id", "store_number", "store_name" FROM auth.store LIMIT 5');
    console.log("Stores:", JSON.stringify(stores.rows));
  } catch(e) {
    const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='auth' AND table_name='store'");
    console.log("store cols:", cols.rows.map(r=>r.column_name).join(", "));
  }
  
  // POGActivationDetails columns
  try {
    const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='dbo' AND table_name='POGActivationDetails' ORDER BY ordinal_position");
    console.log("POGActivationDetails cols:", cols.rows.map(r=>r.column_name).join(", "));
  } catch(e) { console.log("pogdet err:", e.message); }
  
  // Get planogram with POG type
  try {
    const plan = await client.query('SELECT "PogId", "Description", "Planogram" FROM dbo."POGActivationHeader" LIMIT 3');
    console.log("Planogram sample:", JSON.stringify(plan.rows));
  } catch(e) { console.log("plan err:", e.message); }
  
  // User roles from auth
  try {
    const roles = await client.query("SELECT * FROM auth.roles LIMIT 5");
    console.log("Roles:", JSON.stringify(roles.rows));
  } catch(e) { console.log("roles err:", e.message); }
  
  // Count DU in sys_configuration
  try {
    const syscfg = await client.query('SELECT * FROM auth.sys_configuration LIMIT 10');
    console.log("SysCfg:", JSON.stringify(syscfg.rows));
  } catch(e) { console.log("syscfg err:", e.message); }
  
  // OverstockLocation names for DTC039
  try {
    const olNames = await client.query('SELECT "LocationName", "LocationValue", "IsActive" FROM dbo."OverstockLocation" WHERE "IsActive"=1 ORDER BY "LocationName"');
    console.log("Active OL names:", JSON.stringify(olNames.rows));
  } catch(e) { console.log("OL names err:", e.message); }

  await client.end();
}).catch(e => { console.log("DB Error:", e.message); });
