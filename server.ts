import app from "./src/app.js";

export default app;

// Vercel intercepts listen() as the serverless entry. Do not await: the
// interceptor may never resolve, which hung the previous lambda boot.
app.listen({ port: 3000 });
