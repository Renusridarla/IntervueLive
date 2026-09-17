import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/intervuelive';

  try {
    // Attempt standard connection with 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected to database at: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[MongoDB] Local connection to ${uri} failed (${err.message}). Starting in-memory MongoDB...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[MongoDB] In-Memory MongoDB connected at: ${memUri}`);
    } catch (memErr) {
      console.error('[MongoDB] Failed to start In-Memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};
