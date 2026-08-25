/**
 * Seeds "UserManagement" sheet in testData.xlsx from ISP PostgreSQL DB.
 * Run: node test-data/seedUserManagement.js
 */
const ExcelJS = require('exceljs');
const { Client } = require('pg');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'testData.xlsx');

async function queryDB() {
  const client = new Client({
    host: 'localhost', port: 5432, database: 'isp',
    user: 'postgres', password: 'Michaels@1'
  });
  await client.connect();
  console.log('Connected to ISP DB');

  // Get non-system users with distinct usernames, roles, and full names
  let users = [];
  try {
    const res = await client.query(`
      SELECT DISTINCT ON (u."UserName")
             u."UserName",
             ui."name"       AS "FullName",
             r."RoleName",
             m."IsLockedOut",
             m."CreateDate",
             m."LastLoginDate",
             u."LastActivityDate"
      FROM dbo."aspnet_Users" u
      LEFT JOIN dbo."Userinfo"          ui  ON ui."UserName" = u."UserName"
      LEFT JOIN dbo."aspnet_UsersInRoles" uir ON uir."UserId" = u."UserId"
      LEFT JOIN dbo."aspnet_Roles"      r   ON r."RoleId"   = uir."RoleId"
      LEFT JOIN dbo."aspnet_Membership" m   ON m."UserId"   = u."UserId"
      WHERE u."UserName" != 'system'
      ORDER BY u."UserName"
      LIMIT 10
    `);
    users = res.rows;
  } catch (e) {
    console.warn('User query error:', e.message);
  }

  // Get all available roles
  let roles = [];
  try {
    const res = await client.query(`SELECT "RoleName" FROM dbo."aspnet_Roles" ORDER BY "RoleName"`);
    roles = res.rows.map(r => r.RoleName);
  } catch (e) {
    console.warn('Roles query error:', e.message);
    roles = ['Admin', 'Associate', 'Manager'];
  }

  await client.end();

  const user1 = users[0] || { UserName: '2394723',  FullName: 'amanda templeton', RoleName: 'Associate' };
  const user2 = users[1] || { UserName: '2738971',  FullName: 'Steve Shepherd',   RoleName: 'Manager' };

  // Pick two distinct roles for role-change tests
  const role1 = roles.find(r => r === 'Manager')          || roles[0] || 'Manager';
  const role2 = roles.find(r => r === 'Associate')        || roles[1] || 'Associate';

  return {
    existingUsername:     String(user1.UserName),
    existingUserFullName: String(user1.FullName   || ''),
    existingUserRole:     String(user1.RoleName   || 'Associate'),
    editableUsername:     String(user2.UserName),
    editableUserFullName: String(user2.FullName   || ''),
    editableUserRole:     String(user2.RoleName   || 'Manager'),
    availableRole1:       role1,
    availableRole2:       role2,
    newUserPassword:      'Test@1234',
    filterNoMatch:        'XZZZ_NO_MATCH_99999',
    expectedCreateSuccess:      'User created successfully',
    expectedUpdateSuccess:      'User updated successfully',
    expectedPasswordMismatch:   'Passwords do not match',
    expectedUsernameRequired:   'Username is required',
    expectedRoleRequired:       'Role is required',
    expectedDuplicateUser:      'Username already exists',
  };
}

async function seedSheet(data) {
  const workbook = new ExcelJS.Workbook();
  try { await workbook.xlsx.readFile(DATA_FILE); } catch (_) { /* new file */ }

  const existingSheet = workbook.getWorksheet('UserManagement');
  if (existingSheet) workbook.removeWorksheet(existingSheet.id);

  const sheet = workbook.addWorksheet('UserManagement');

  const headers = Object.keys(data);
  sheet.addRow(headers);
  // Repeat data row for each of the 25 test cases
  for (let i = 0; i < 25; i++) {
    sheet.addRow(Object.values(data));
  }

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font  = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  sheet.columns.forEach(col => { col.width = 30; });

  await workbook.xlsx.writeFile(DATA_FILE);
  console.log('\nSeeded UserManagement sheet successfully:');
  console.log(JSON.stringify(data, null, 2));
}

queryDB().then(seedSheet).catch(e => { console.error('Seed error:', e.message); process.exit(1); });
