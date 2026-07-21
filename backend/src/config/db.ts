import mongoose from 'mongoose'
import { env } from './env.js'

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null }
global.mongooseCache = cache

export async function connectDb(): Promise<typeof mongoose> {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is not set')
  }

  if (cache.conn) {
    return cache.conn
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(env.mongodbUri, {
      bufferCommands: false,
    })
  }

  cache.conn = await cache.promise
  return cache.conn
}
