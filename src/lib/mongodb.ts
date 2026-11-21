import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
export const databaseName = process.env.DATABASE_NAME;

if (!uri) {
  throw new Error("MONGODB_URI is missing.");
}

if (!databaseName) {
  throw new Error("DATABASE_NAME is missing.");
}

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
};

const client = globalForMongo.mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = client;
}

export const db = client.db(databaseName);
export { client };
