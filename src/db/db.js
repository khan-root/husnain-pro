const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://14appstudiopvt:sm0kFvewjeV22ZI7@cluster0.98baoec.mongodb.net/dgdorm?retryWrites=true&w=majority';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 1,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 120000,
  socketTimeoutMS: 180000,
  connectTimeoutMS: 120000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  bufferCommands: true,
  autoIndex: true,
  autoCreate: true
};

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Connecting to MongoDB...');
    mongoose.set('bufferCommands', true);
    mongoose.set('bufferTimeoutMS', 120000);

    cached.promise = mongoose.connect(MONGODB_URI, mongooseOptions).then((mongoose) => {
      console.log('✅ Connected to MongoDB');
      return mongoose;
    }).catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };