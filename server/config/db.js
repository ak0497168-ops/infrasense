import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;
let useMemoryStore = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/infrasense';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    useMemoryStore = false;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Real MongoDB not reachable (${error.message}).`);
    console.log('[Database] Activating high-fidelity In-Memory Data Engine with pre-seeded civic infrastructure dataset.');
    useMemoryStore = true;
    isConnected = true;
    return null;
  }
};

export const isUsingMemoryStore = () => useMemoryStore;
