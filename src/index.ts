import app from "./createApp.js";
import { config } from "./config.js";

export default app;

const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
  try {
    await app.listen({ port: config.PORT, host: config.HOST });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}
