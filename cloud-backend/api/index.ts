// Vercel Serverless Entry Point
// Vercel's @vercel/node builder compiles this .ts file directly.
// We re-export the Express app so Vercel can use it as a request handler.

import app from '../src/server';

export default app;
