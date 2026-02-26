const bcrypt = require('bcrypt');
const db = require('../config/db');

const BCRYPT_ROUNDS = 12;

async function listUsers(req, res) {
  const result = await db.query(
    `SELECT id, tenant_id, name, email, role, created_at
     FROM users
     WHERE tenant_id = $1
     ORDER BY created_at DESC`,
    [req.user.tenantId]
  );

  return res.json({ users: result.rows });
}

async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password and role are required' });
  }

  const allowedRoles = ['admin', 'manager', 'secretary', 'employee'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  try {
    const result = await db.query(
      `INSERT INTO users(tenant_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, tenant_id, name, email, role, created_at`,
      [req.user.tenantId, name, email, passwordHash, role]
    );

    return res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'User email already exists for this tenant' });
    }
    return res.status(500).json({ error: 'Unable to create user' });
  }
}

module.exports = { createUser, listUsers };
