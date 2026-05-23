#!/usr/bin/env node

const path = require("node:path");

const compression = require("compression");
const express = require("express");
const morgan = require("morgan");
const { createRequestHandler } = require("expo-server/adapter/express");

const PORT = process.env.PORT || 3000;
const CLIENT_BUILD_DIR = path.join(process.cwd(), "dist/client");
const SERVER_BUILD_DIR = path.join(process.cwd(), "dist/server");

const app = express();

app.use(compression());
app.disable("x-powered-by");
app.use(morgan("tiny"));

app.use(
  express.static(CLIENT_BUILD_DIR, {
    immutable: true,
    index: false,
    maxAge: "1y",
  }),
);

app.all(
  "/{*all}",
  createRequestHandler({
    build: SERVER_BUILD_DIR,
    environment: process.env.NODE_ENV,
  }),
);

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);
});
