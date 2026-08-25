const { Client } = require('pg');

async function discover() {
  const client = new Client({
    host: 'localhost', port: 5432, database: 'isp',
    user: 'postgres', password: 'Michaels@1'
  });
  await client.connect();
  console.log('Connected to ISP DB');

  const usersWithRoles = await client.query(`
    SELECT u."UserName", ui."name" AS "FullName", r."RoleName",
           m."IsLockedOut", m."CreateDate", m."LastLoginDate", u."LastActivityDate"
    FROM dbo."aspnet_Users" u
    LEFT JOIN dbo."Userinfo" ui ON ui."UserName" = u."UserName"
    LEFT JOIN dbo."aspnet_UsersInRoles" uir ON uir."UserId" = u."UserId"
    LEFT JOIN dbo."aspnet_Roles" r ON r."RoleId" = uir."RoleId"
    LEFT JOIN dbo."aspnet_Membership" m ON m."UserId" = u."UserId"
    WHERE u."UserName" != 'system'
    LIMIT 5
  `);
  console.log('Users with roles:', JSON.stringify(usersWithRoles.rows, null, 2));

  const roles = await client.query(`SELECT "RoleName" FROM dbo."aspnet_Roles"`);
  console.log('All roles:', roles.rows.map(r => r.RoleName).join(', '));

  await client.end();
}
discover().catch(e => console.error('ERROR:', e.message));
