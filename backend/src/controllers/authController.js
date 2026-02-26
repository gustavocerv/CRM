const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const BCRYPT_ROUNDS = 12;

// Helper to build JWT token
function buildToken(user) {
  return jwt.sign(
    { user_id: user.id, role: user.role, tenant_id: user.tenant_id },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
}

// Admin registration (for first tenant/admin)
async function registerAdmin(req, res) {
  const { companyName, name, email, password } = req.body;
  if (!companyName || !name || !email || !password) {
    return res.status(400).json({ error: 'companyName, name, email and password are required' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const tenantResult = await client.query(
      'INSERT INTO tenants(company_name) VALUES ($1) RETURNING id, company_name',
      [companyName]
    );

    const tenantId = tenantResult.rows[0].id;
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const userResult = await client.query(
      `INSERT INTO users(tenant_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'admin')
       RETURNING id, tenant_id, role, email, name`,
      [tenantId, name, email, passwordHash]
    );

    await client.query('COMMIT');

    const token = buildToken(userResult.rows[0]);
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });

    return res.status(201).json({
      tenant: tenantResult.rows[0],
      user: userResult.rows[0],
      token
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists in this tenant' });
    }
    return res.status(500).json({ error: 'Unable to register admin' });
  } finally {
    client.release();
  }
}

// Login existing users
async function login(req, res) {
  const { email, password } = req.body;

  const result = await db.query(
    'SELECT id, tenant_id, role, password_hash FROM users WHERE email = $1 LIMIT 1',
    [email]
  );

  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = buildToken(user);

  res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
  return res.json({ token });
}

module.exports = { login, registerAdmin };