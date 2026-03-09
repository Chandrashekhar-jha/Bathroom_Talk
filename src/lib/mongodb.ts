import mongoose from 'mongoose';

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

async function connectDB(): Promise<typeof mongoose> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Please define the MONGODB_URI environment variable in Project Settings');
        }
        // During build/dev we might not have the URI yet, but we shouldn't crash just by importing it
        return mongoose;
    }

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(uri, {
            bufferCommands: false,
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectDB;
