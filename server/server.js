const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// ✅ CORS middleware
app.use(cors({
  origin: [
    'https://crmfrontend-steel.vercel.app', // 🔁 Vercel frontend
    'http://localhost:5173',                // ✅ Dev environment
  ],
  credentials: true,
}));

// ✅ JSON body parser
app.use(express.json());

// ✅ API Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/leads', require('./src/routes/lead.routes'));
app.use('/api/projects', require('./src/routes/project.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/followups', require('./src/routes/followup.routes'));
app.use('/api/export', require('./src/routes/export.routes'));

// ✅ Root route
app.get('/', (req, res) => {
  res.send('✅ LLCRM Backend is running!');
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
