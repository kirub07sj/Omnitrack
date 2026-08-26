// Vercel Serverless Entry Point
// This file imports the compiled Express app and exports it for Vercel's serverless runtime.
const app = require('../dist/server').default;

module.exports = app;
