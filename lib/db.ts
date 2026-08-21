import { MongoClient, type Db } from 'mongodb'

declare global {
  var __aetherMongoPromise: Promise<MongoClient> | undefined
}

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL)
}

export async function getDb(): Promise<Db | null> {
  const url = process.env.DATABASE_URL
  if (!url) return null

  if (!globalThis.__aetherMongoPromise) {
    const client = new MongoClient(url, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    })
    globalThis.__aetherMongoPromise = client.connect()
  }

  const client = await globalThis.__aetherMongoPromise
  return client.db(process.env.DATABASE_NAME || undefined)
}
