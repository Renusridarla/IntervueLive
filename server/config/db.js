import mongoose from 'mongoose';

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/intervuelive';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB] Connected to database at: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[MongoDB] Database connection to ${uri} failed: ${err.message}`);
    
    // Only attempt MongoMemoryServer in local dev environment (not Vercel)
    if (!process.env.VERCEL) {
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`[MongoDB] In-Memory MongoDB connected at: ${memUri}`);
      } catch (memErr) {
        console.error('[MongoDB] Failed to start In-Memory MongoDB:', memErr.message);
      }
    }
  }
};
