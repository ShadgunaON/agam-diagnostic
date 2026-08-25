/**
 * Staff Lambda Handler
 * 
 * Provides employee CRUD and Cognito account provisioning.
 * 
 * POST /api/staff     — Admin creates employee (AdminCreateUser + DynamoDB)
 * GET  /api/staff     — Admin/Staff lists employees
 * GET  /api/staff/:id — Admin/Staff gets single employee
 * PUT  /api/staff/:id — Admin updates employee
 */

const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminAddUserToGroupCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const { extractIdentity, isAdmin, isStaff, hasPermission } = require('../shared/auth');
const staffRepo = require('../repositories/dynamo-staff');
const rbacRepo = require('../repositories/dynamo-rbac');

const USER_POOL_ID = process.env.USER_POOL_ID;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

// Canonical application roles that can be assigned to employees
const VALID_STAFF_ROLES = ['admin', 'op', 'path', 'phleb', 'phleb_home', 'phleb_lab'];

// Role → Cognito Group mapping (only used if groups exist)
const ROLE_TO_GROUP = {
  admin: 'AdminGroup',
  op: 'StaffGroup',
  path: 'StaffGroup',
  phleb: 'PhlebGroup',
  phleb_home: 'PhlebGroup',
  phleb_lab: 'StaffGroup',
};

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  };
}

function respond(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify(body),
  };
}

// ============================================================
// POST /api/staff — Create Employee
// ============================================================
async function handleCreateStaff(event, identity) {
  // Admin-only authorization (Business rule for Cognito provisioning)
  if (!isAdmin(identity)) {
    return respond(403, { error: 'Only administrators can create staff accounts.' });
  }
  // RBAC Matrix check (Though Admin naturally passes this, we check for matrix completeness)
  if (!(await hasPermission(identity, 'staff', 'create'))) {
    return respond(403, { error: 'Access denied: Missing staff.create permission' });
  }

  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    return respond(400, { error: 'Invalid request body.' });
  }

  const { name, email, phone, role } = body || {};

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return respond(400, { error: 'Employee name is required.' });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return respond(400, { error: 'A valid employee email is required.' });
  }
  if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
    return respond(400, { error: 'Employee phone number is required.' });
  }
  // Fetch dynamic roles to validate
  let validRoles = VALID_STAFF_ROLES;
  try {
    const dbRoles = await rbacRepo.getRoles();
    if (dbRoles) validRoles = dbRoles.map(r => r.id);
  } catch (err) {
    console.warn('Could not fetch roles for validation, using fallback');
  }

  if (!role || !validRoles.includes(role)) {
    return respond(400, {
      error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim()}`;
  const cleanName = name.trim();

  // Step 1: Create Cognito user with AdminCreateUser
  let cognitoUser;
  try {
    const createCommand = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: cleanEmail,
      DesiredDeliveryMediums: ['EMAIL'],
      UserAttributes: [
        { Name: 'email', Value: cleanEmail },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'phone_number', Value: cleanPhone },
        { Name: 'name', Value: cleanName },
        { Name: 'custom:role', Value: role },
      ],
      // Cognito generates the temporary password and sends it via email
      // Do NOT specify TemporaryPassword — let Cognito generate it
    });

    const createResult = await cognitoClient.send(createCommand);
    cognitoUser = createResult.User;
  } catch (err) {
    if (err.name === 'UsernameExistsException') {
      return respond(409, { error: 'An account with this email already exists.' });
    }
    if (err.name === 'InvalidParameterException') {
      return respond(400, { error: `Invalid parameter: ${err.message}` });
    }
    console.error('Cognito AdminCreateUser failed:', err.name, err.message);
    return respond(500, { error: 'Failed to create employee Cognito account.' });
  }

  const cognitoSub = cognitoUser?.Attributes?.find(a => a.Name === 'sub')?.Value;
  if (!cognitoSub) {
    console.error('Cognito user created but sub not found in response.');
    return respond(500, { error: 'Employee account created but identity could not be resolved.' });
  }

  // Step 2: Attempt to add user to Cognito group (best-effort — group may not exist)
  const groupName = ROLE_TO_GROUP[role];
  if (groupName) {
    try {
      await cognitoClient.send(new AdminAddUserToGroupCommand({
        UserPoolId: USER_POOL_ID,
        Username: cleanEmail,
        GroupName: groupName,
      }));
    } catch (err) {
      // Group may not exist yet — this is non-fatal since custom:role is the primary role source
      console.warn(`Could not add user to group ${groupName}: ${err.name} — ${err.message}`);
    }
  }

  // Step 3: Create DynamoDB staff record
  let staffRecord;
  try {
    staffRecord = await staffRepo.createStaff({
      id: cognitoSub,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role,
      department: body.department || 'General',
      status: 'On Duty',
      shift: body.shift || 'Morning',
      joinDate: new Date().toISOString(),
      cognitoUsername: cleanEmail,
      cognitoStatus: 'FORCE_CHANGE_PASSWORD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('DynamoDB staff record creation failed:', err.name, err.message);
    // Cognito user was created but DynamoDB failed — do NOT silently succeed
    return respond(500, {
      error: 'Employee Cognito account was created and invitation sent, but the staff record could not be saved. Please contact support.',
      cognitoUserCreated: true,
    });
  }

  // Success — return sanitized staff record (no passwords, no tokens)
  return respond(201, {
    message: 'Employee created successfully. An invitation email has been sent.',
    staff: staffRecord,
  });
}

// ============================================================
// GET /api/staff — List Employees
// ============================================================
async function handleGetAllStaff(event, identity) {
  if (!(await hasPermission(identity, 'staff', 'view'))) {
    return respond(403, { error: 'Access denied: Missing staff.view permission' });
  }

  try {
    const staff = await staffRepo.getAllStaff();
    return respond(200, staff);
  } catch (err) {
    console.error('Failed to list staff:', err.message);
    return respond(500, { error: 'Failed to retrieve staff list.' });
  }
}

// ============================================================
// GET /api/staff/:id — Get Single Employee
// ============================================================
async function handleGetStaffById(staffId, identity) {
  if (staffId !== identity.sub && !(await hasPermission(identity, 'staff', 'view'))) {
    return respond(403, { error: 'Access denied: Missing staff.view permission' });
  }

  try {
    const staff = await staffRepo.getStaffById(staffId);
    if (!staff) {
      return respond(404, { error: 'Staff member not found.' });
    }
    return respond(200, staff);
  } catch (err) {
    console.error('Failed to get staff:', err.message);
    return respond(500, { error: 'Failed to retrieve staff member.' });
  }
}

// ============================================================
// PUT /api/staff/:id — Update Employee
// ============================================================
async function handleUpdateStaff(staffId, event, identity) {
  if (!(await hasPermission(identity, 'staff', 'edit'))) {
    return respond(403, { error: 'Access denied: Missing staff.edit permission' });
  }

  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    return respond(400, { error: 'Invalid request body.' });
  }

  // Validate role if being changed
  if (body.role) {
    let validRoles = VALID_STAFF_ROLES;
    try {
      const dbRoles = await rbacRepo.getRoles();
      if (dbRoles) validRoles = dbRoles.map(r => r.id);
    } catch (err) {
      console.warn('Could not fetch roles for validation, using fallback');
    }

    if (!validRoles.includes(body.role)) {
      return respond(400, {
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }
  }

  // Block sensitive field modifications
  const blocked = ['id', 'PK', 'SK', 'GSI1PK', 'GSI1SK', 'GSI2PK', 'GSI2SK', 'cognitoUsername', 'email', 'createdAt'];
  for (const key of blocked) {
    delete body[key];
  }

  try {
    const updated = await staffRepo.updateStaff(staffId, body);
    if (!updated) {
      return respond(404, { error: 'Staff member not found.' });
    }
    return respond(200, updated);
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return respond(404, { error: 'Staff member not found.' });
    }
    console.error('Failed to update staff:', err.message);
    return respond(500, { error: 'Failed to update staff member.' });
  }
}

// ============================================================
// RBAC HANDLERS
// ============================================================
async function handleGetRoles(identity) {
  try {
    let roles = await rbacRepo.getRoles();
    if (!roles) {
      const defaultRoles = [
        { id: 'admin', title: 'System Administrator', internal: 'ADMIN', users: 0, desc: 'Unrestricted system access.', color: '#3b82f6' },
        { id: 'op', title: 'Operation Manager', internal: 'OPERATION_MANAGER', users: 0, desc: 'Manages day-to-day operations.', color: '#10b981' },
        { id: 'path', title: 'Lead Pathologist', internal: 'PATHOLOGIST', users: 0, desc: 'Oversees lab results & reports.', color: '#8b5cf6' },
        { id: 'phleb', title: 'Phlebotomist', internal: 'FIELD_AGENT', users: 0, desc: 'Home collection field agents.', color: '#f59e0b' },
        { id: 'phleb_home', title: 'Home Collection Agent', internal: 'HOME_COLLECTION', users: 0, desc: 'Handles home sample collection visits.', color: '#0ea5e9', scope: 'home_collection' },
        { id: 'phleb_lab', title: 'In-Lab Technician', internal: 'IN_LAB_TECH', users: 0, desc: 'Handles in-lab patient visits and sample processing.', color: '#6366f1', scope: 'in_lab' },
      ];
      roles = await rbacRepo.setRoles(defaultRoles);
    }
    return respond(200, roles);
  } catch (err) {
    console.error('Failed to get roles:', err);
    return respond(500, { error: 'Failed to fetch roles.' });
  }
}

async function handleCreateRole(event, identity) {
  if (!isAdmin(identity)) {
    return respond(403, { error: 'Only administrators can create custom roles.' });
  }

  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    return respond(400, { error: 'Invalid JSON body.' });
  }

  const { id, title, internal, desc, color } = body;
  if (!id || !title || !internal) {
    return respond(400, { error: 'Role id, title, and internal identifier are required.' });
  }

  // System roles boundary check
  if (VALID_STAFF_ROLES.includes(id)) {
    return respond(400, { error: 'Cannot override system roles.' });
  }

  try {
    let roles = await rbacRepo.getRoles() || [];
    if (roles.find(r => r.id === id)) {
      return respond(409, { error: 'A role with this ID already exists.' });
    }

    const newRole = { id, title, internal, users: 0, desc: desc || 'Custom role', color: color || '#0ea5e9' };
    roles.push(newRole);
    await rbacRepo.setRoles(roles);

    // Initialize fail-closed permissions matrix
    let perms = await rbacRepo.getPermissions() || [];
    if (!perms.find(p => p.roleId === id)) {
      const emptyModules = defaultMockPermissionsMap.admin.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        permissions: [{ view: false, create: false, edit: false, del: false, assign: false, name: m.permissions[0].name, description: m.permissions[0].description }]
      }));
      perms.push({ id, roleId: id, modules: emptyModules });
      await rbacRepo.setPermissions(perms);
    }

    return respond(201, newRole);
  } catch (err) {
    console.error('Failed to create role:', err);
    return respond(500, { error: 'Failed to create role.' });
  }
}

const ALL_TRUE = { view: true, create: true, edit: true, del: true, assign: true };

const defaultMockPermissionsMap = {
  admin: [
    { id: 'patients', title: 'Patient Records', description: '', permissions: [{ ...ALL_TRUE, name: 'records', description: '' }] },
    { id: 'orders', title: 'Service Orders', description: '', permissions: [{ ...ALL_TRUE, name: 'orders', description: '' }] },
    { id: 'collections', title: 'Collections & Dispatch', description: '', permissions: [{ ...ALL_TRUE, name: 'collections', description: '' }] },
    { id: 'reports', title: 'Reports', description: '', permissions: [{ ...ALL_TRUE, name: 'reports', description: '' }] },
    { id: 'catalog', title: 'Test Catalog', description: '', permissions: [{ ...ALL_TRUE, name: 'catalog', description: '' }] },
    { id: 'staff', title: 'Staff & Roles', description: '', permissions: [{ ...ALL_TRUE, name: 'staff', description: '' }] },
    { id: 'analytics', title: 'Analytics', description: '', permissions: [{ ...ALL_TRUE, name: 'analytics', description: '' }] },
    { id: 'settings', title: 'Settings', description: '', permissions: [{ ...ALL_TRUE, name: 'settings', description: '' }] },
    { id: 'blogs', title: 'Content / Blogs', description: '', permissions: [{ ...ALL_TRUE, name: 'blogs', description: '' }] },
    { id: 'invoices', title: 'Ledger & Invoices', description: '', permissions: [{ ...ALL_TRUE, name: 'invoices', description: '' }] },
    { id: 'reviews', title: 'Reviews', description: '', permissions: [{ ...ALL_TRUE, name: 'reviews', description: '' }] }
  ],
  op: [
    { id: 'patients', title: 'Patient Records', description: '', permissions: [{ view: true, create: true, edit: true, del: false, assign: false, name: 'records', description: '' }] },
    { id: 'orders', title: 'Service Orders', description: '', permissions: [{ view: true, create: true, edit: true, del: false, assign: false, name: 'orders', description: '' }] },
    { id: 'collections', title: 'Collections & Dispatch', description: '', permissions: [{ view: true, create: true, edit: true, del: false, assign: true, name: 'collections', description: '' }] },
    { id: 'reports', title: 'Reports', description: '', permissions: [{ view: true, create: false, edit: false, del: false, assign: false, name: 'reports', description: '' }] },
    { id: 'catalog', title: 'Test Catalog', description: '', permissions: [{ view: true, create: true, edit: true, del: false, assign: false, name: 'catalog', description: '' }] },
    { id: 'staff', title: 'Staff & Roles', description: '', permissions: [{ view: true, create: false, edit: true, del: false, assign: false, name: 'staff', description: '' }] },
    { id: 'invoices', title: 'Ledger & Invoices', description: '', permissions: [{ view: true, create: false, edit: false, del: false, assign: false, name: 'invoices', description: '' }] },
    { id: 'reviews', title: 'Reviews', description: '', permissions: [{ view: true, create: false, edit: false, del: false, assign: false, name: 'reviews', description: '' }] }
  ],
  path: [
    { id: 'patients', title: 'Patient Records', description: '', permissions: [{ view: true, create: false, edit: true, del: false, assign: false, name: 'records', description: '' }] },
    { id: 'orders', title: 'Service Orders', description: '', permissions: [{ view: true, create: false, edit: false, del: false, assign: false, name: 'orders', description: '' }] },
    { id: 'collections', title: 'Collections & Dispatch', description: '', permissions: [{ view: true, create: false, edit: false, del: false, assign: false, name: 'collections', description: '' }] },
    { id: 'reports', title: 'Reports', description: '', permissions: [{ view: true, create: false, edit: true, del: false, assign: false, name: 'reports', description: '' }] }
  ],
  phleb: [
    { id: 'patients', title: 'Patient Records', description: '', permissions: [{ view: true, create: false, edit: false, del: false, assign: false, name: 'records', description: '' }] },
    { id: 'orders', title: 'Service Orders', description: '', permissions: [{ view: true, create: false, edit: true, del: false, assign: false, name: 'orders', description: '' }] },
    { id: 'collections', title: 'Collections & Dispatch', description: '', permissions: [{ view: true, create: false, edit: true, del: false, assign: false, name: 'collections', description: '' }] }
  ],
  phleb_home: [
    { id: 'collections', title: 'Collections & Dispatch', description: '', permissions: [{ view: true, create: false, edit: true, del: false, assign: false, name: 'collections', description: '' }] },
    { id: 'patients', title: 'Patient Records', description: '', permissions: [{ view: true, create: false, edit: false, del: false, assign: false, name: 'records', description: '' }] }
  ],
  phleb_lab: [
    { id: 'collections', title: 'Collections & Dispatch', description: '', permissions: [{ view: true, create: false, edit: true, del: false, assign: false, name: 'collections', description: '' }] },
    { id: 'patients', title: 'Patient Records', description: '', permissions: [{ view: true, create: false, edit: false, del: false, assign: false, name: 'records', description: '' }] }
  ]
};

async function handleGetPermissions(identity) {
  try {
    let perms = await rbacRepo.getPermissions();
    if (!perms) {
      const defaultPermissions = Object.entries(defaultMockPermissionsMap).map(([roleId, modules]) => ({
        id: roleId,
        roleId,
        modules
      }));
      perms = await rbacRepo.setPermissions(defaultPermissions);
    }
    return respond(200, perms);
  } catch (err) {
    console.error('Failed to get permissions:', err);
    return respond(500, { error: 'Failed to fetch permissions.' });
  }
}

async function handleUpdatePermissions(event, identity) {
  if (!isAdmin(identity)) {
    return respond(403, { error: 'Only administrators can modify permissions.' });
  }
  
  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    return respond(400, { error: 'Invalid JSON body.' });
  }

  if (!Array.isArray(body)) {
    return respond(400, { error: 'Expected an array of permission records.' });
  }

  try {
    const updated = await rbacRepo.setPermissions(body);
    return respond(200, updated);
  } catch (err) {
    console.error('Failed to update permissions:', err);
    return respond(500, { error: 'Failed to update permissions.' });
  }
}

// ============================================================
// HANDLER
// ============================================================
exports.handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  const path = event.path || event.rawPath || '';

  // OPTIONS preflight
  if (method === 'OPTIONS') {
    return respond(200, {});
  }

  // Extract authenticated identity
  const identity = extractIdentity(event);
  if (!identity) {
    return respond(401, { error: 'Authentication required.' });
  }

  // RBAC Routes
  if (path.endsWith('/roles') || path.includes('/api/staff/roles')) {
    if (method === 'GET') return handleGetRoles(identity);
    if (method === 'POST') return handleCreateRole(event, identity);
    return respond(405, { error: `Method ${method} not allowed for /roles.` });
  }

  if (path.endsWith('/permissions') || path.includes('/api/staff/permissions')) {
    if (method === 'GET') return handleGetPermissions(identity);
    if (method === 'PUT') return handleUpdatePermissions(event, identity);
    return respond(405, { error: `Method ${method} not allowed for /permissions.` });
  }

  // Route: /api/staff/{staffId}
  const staffIdMatch = path.match(/\/api\/staff\/([^/]+)/);
  const staffId = staffIdMatch ? staffIdMatch[1] : null;

  if (staffId) {
    switch (method) {
      case 'GET':
        return handleGetStaffById(staffId, identity);
      case 'PUT':
        return handleUpdateStaff(staffId, event, identity);
      default:
        return respond(405, { error: `Method ${method} not allowed.` });
    }
  }

  // Route: /api/staff
  switch (method) {
    case 'GET':
      return handleGetAllStaff(event, identity);
    case 'POST':
      return handleCreateStaff(event, identity);
    default:
      return respond(405, { error: `Method ${method} not allowed.` });
  }
};
