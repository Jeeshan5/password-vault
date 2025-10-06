const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration to allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://password-vault-frontend.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Vault item schema
const vaultItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  username: { type: String },
  password: { type: String, required: true },
  url: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const VaultItem = mongoose.model('VaultItem', vaultItemSchema);

// JWT middleware
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ email, password: hashedPassword });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: { id: user._id, email: user.email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Vault routes
app.get('/api/vault', authenticateToken, async (req, res) => {
  try {
    const vaultItems = await VaultItem.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 });
    res.json(vaultItems);
  } catch (error) {
    console.error('Get vault items error:', error);
    res.status(500).json({ error: 'Server error fetching vault items' });
  }
});

app.post('/api/vault', authenticateToken, async (req, res) => {
  try {
    const { title, username, password, url, notes } = req.body;
    
    const vaultItem = new VaultItem({
      userId: req.user.userId,
      title,
      username,
      password,
      url,
      notes
    });

    await vaultItem.save();
    res.status(201).json(vaultItem);
  } catch (error) {
    console.error('Create vault item error:', error);
    res.status(500).json({ error: 'Server error creating vault item' });
  }
});

app.put('/api/vault/:id', authenticateToken, async (req, res) => {
  try {
    const { title, username, password, url, notes } = req.body;
    
    const vaultItem = await VaultItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { title, username, password, url, notes, updatedAt: new Date() },
      { new: true }
    );

    if (!vaultItem) {
      return res.status(404).json({ error: 'Vault item not found' });
    }

    res.json(vaultItem);
  } catch (error) {
    console.error('Update vault item error:', error);
    res.status(500).json({ error: 'Server error updating vault item' });
  }
});

app.delete('/api/vault/:id', authenticateToken, async (req, res) => {
  try {
    const vaultItem = await VaultItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!vaultItem) {
      return res.status(404).json({ error: 'Vault item not found' });
    }

    res.json({ message: 'Vault item deleted successfully' });
  } catch (error) {
    console.error('Delete vault item error:', error);
    res.status(500).json({ error: 'Server error deleting vault item' });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});