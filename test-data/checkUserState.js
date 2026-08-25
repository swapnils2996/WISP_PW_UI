const { Client } = require('pg');

const client = new Client({
  host: 'localhost', port: 5432,
  database: 'isp', user: 'postgres', password: 'Michaels@1'
});

(async () => {
  await client.connect();
  
  const r1 = await client.query(`
    SELECT u."UserName", m."IsLockedOut", m."FailedPasswordAttemptCount", m."IsApproved",
           r."RoleName"
    FROM "aspnet_Users" u
    JOIN "aspnet_Membership" m ON u."UserId" = m."UserId"
    LEFT JOIN "aspnet_UsersInRoles" ur ON ur."UserId" = u."UserId"
    LEFT JOIN "aspnet_Roles" r ON r."RoleId" = ur."RoleId"
    WHERE u."UserName" IN ('2394723','2738971')
  `);
  console.log('User state:');
  r1.rows.forEach(r => console.log(JSON.stringify(r)));
  
  await client.end();
})().catch(err => { console.error(err); process.exit(1); });
