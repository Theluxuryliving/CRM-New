// server/src/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors({
  origin: 'http://localhost:5173', // adjust this if your frontend is hosted elsewhere
  credentials: true,
}));
app.use(express.json());

// ✅ Route loading
console.log("✅ Starting server and loading routes...");

const authRoutes = require('./routes/auth.routes');
const leadRoutes = require('./routes/lead.routes');
const projectRoutes = require('./routes/project.routes'); // ✅ added
const userRoutes = require('./routes/user.routes');
const followupRoutes = require('./routes/followup.routes'); // ✅ ADD THIS LINE


app.use('/api/auth', authRoutes);     // 🔐 Login, Signup, User Management
app.use('/api/leads', leadRoutes);    // 📋 Leads (GET, POST, etc) — protected route
app.use('/api/projects', projectRoutes); // ✅ added
app.use('/api/users', userRoutes); // ✅
app.use('/api/followups', followupRoutes); // ✅ REGISTER THE ROUTE

// ✅ Root route
app.get('/', (req, res) => {
  res.send('LLCRM backend running ✅');
});

// ❌ 404 fallback
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// ✅ Server start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
