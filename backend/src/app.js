require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const fileRoutes = require('./routes/fileRoutes');
const integrationRoutes = require('./routes/integrationRoutes');

const userRoutes = require('./routes/userRoutes');
=======
const userRoutes = require('./routes/userRoutes'); // keep this


const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  })
);

app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook/stripe') {
    express.raw({ type: 'application/json' })(req, res, () => {
      req.rawBody = req.body;
      next();
    });
    return;
  }
  next();
});

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/integrations', integrationRoutes);

app.use('/api/users', userRoutes);
=======
app.use('/api/users', userRoutes); // keep this


const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`CRM backend listening on :${port}`);

});
=======
});

