import { createRequestHandler } from "expo-server/adapter/bun";
import path from "node:path";

const PORT = process.env.PORT || 3000;
const CLIENT_BUILD_DIR = path.join(process.cwd(), "dist/client");
const SERVER_BUILD_DIR = path.join(process.cwd(), "dist/server");

const requestHandler = createRequestHandler({
  build: SERVER_BUILD_DIR,
});

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve static client assets with aggressive caching
    // Prevent serving index.html natively and skipping SSR
    if (url.pathname !== "/" && url.pathname !== "/index.html") {
      const filePath = path.join(CLIENT_BUILD_DIR, url.pathname);
      const file = Bun.file(filePath);

      if (await file.exists()) {
        return new Response(file, {
          headers: {
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // Handle all other routes via Expo's server handler (API routes + SSR)
    return requestHandler(req);
  },
});

console.log(`[server] Running on http://localhost:${server.port}`);
