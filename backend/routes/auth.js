import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, farmName, phone, address } = req.body;

    console.log('Registration request body:', req.body); // Debug

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and password are required'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        status: 'error',
        message: 'User already exists with this email' 
      });
    }

    // Create user data object
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: role || 'consumer'
    };

    // Add address if provided
    if (address) {
      userData.address = address;
    }

    // Handle farmer registration
    if (role === 'farmer') {
      if (!farmName || !phone) {
        return res.status(400).json({
          status: 'error',
          message: 'Farm name and phone are required for farmers'
        });
      }
      userData.farmName = farmName.trim();
      userData.phone = phone.trim();
      
      // Add default location for farmers
      userData.location = {
        address: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        pincode: address?.pincode || ''
      };
    }

    console.log('Creating user with data:', userData); // Debug

    const user = await User.create(userData);

    const token = signToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Registration error details:', error); // Detailed error log
    
    // More specific error messages
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors
      });
    }

    res.status(400).json({
      status: 'error',
      message: error.message || 'Registration failed'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    // FIX: Remove the second parameter from correctPassword
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }

    const token = signToken(user._id);

    res.json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get current user - PROTECTED ROUTE
router.get('/me', auth, async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const user = req.user;
    
    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});
export default router;