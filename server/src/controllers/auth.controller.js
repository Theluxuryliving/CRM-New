const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'default_dev_secret';

// 🔐 Utility: Generate Token
const generateToken = (userId, role, email) => {
  return jwt.sign({ userId, role, email }, JWT_SECRET, { expiresIn: '7d' });
};

// ✅ SIGNUP
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    const token = generateToken(user.id, user.role, user.email);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ Signup Error:', err);
    res.status(500).json({ message: 'Signup failed. Try again later.' });
  }
};

// ✅ LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '📩 Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: '❌ Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: '❌ Invalid credentials' });
    }

    const token = generateToken(user.id, user.role, user.email);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ message: 'Login failed. Please try again later.' });
  }
};

// ✅ GET USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(users);
  } catch (err) {
    console.error('❌ Get Users Error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// ✅ CHANGE USER ROLE
exports.changeRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) return res.status(400).json({ message: 'New role is required' });

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
    });

    res.json({ message: '✅ Role updated successfully', user });
  } catch (err) {
    console.error('❌ Change Role Error:', err);
    res.status(500).json({ message: 'Failed to change role' });
  }
};
