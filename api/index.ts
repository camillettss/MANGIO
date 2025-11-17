import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express'; // Se usi tRPC adapter
import { appRouter } from './routers'; // Il tuo tRPC router

const app = express();
app.use('/trpc', createExpressMiddleware({ router: appRouter })); // Espone /trpc/*
// Altri middleware (CORS, body-parser, ecc.)

// Per Drizzle: Connetti db con env var
import { drizzle } from 'drizzle-orm/node-postgres';
// ... (usa process.env.DATABASE_URL)

export default app; // Esporta per Vercel serverless