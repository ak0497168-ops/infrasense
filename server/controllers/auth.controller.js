import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'infrasense-jwt-super-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      notificationPreferences: {
        email: true,
        push: true,
        sms: false
      }
    });

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, name: user.name, role: user.role || 'CITIZEN' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'CITIZEN',
          notificationPreferences: user.notificationPreferences,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, name: user.name, role: user.role || 'CITIZEN' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'CITIZEN',
          notificationPreferences: user.notificationPreferences,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Account does not have administrative privileges.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, name: user.name, role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      message: 'Admin authorization successful.',
      data: {
        token,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: 'ADMIN',
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'CITIZEN',
        notificationPreferences: user.notificationPreferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const { email, push, sms } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          notificationPreferences: { email, push, sms }
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
