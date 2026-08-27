import app from "./app.js";
import { config, isVercel } from "./config.js";

export default app;

if (!isVercel) {
  try {
    await app.listen({ port: config.PORT, host: config.HOST });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}
