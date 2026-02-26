const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

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

  const token = jwt.sign(
    { user_id: user.id, role: user.role, tenant_id: user.tenant_id },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
  return res.json({ token });
}

module.exports = { login };
