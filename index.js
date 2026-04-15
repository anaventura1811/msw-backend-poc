const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const ALLOW_CREDENTIALS = process.env.ALLOW_CREDENTIALS === "true";
const ENABLE_PNA = process.env.ENABLE_PNA !== "false";

app.use(express.json());

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  // If credentials are enabled, do not reply with wildcard.
  const allowOrigin =
    ALLOW_CREDENTIALS && ALLOWED_ORIGIN === "*"
      ? requestOrigin || "null"
      : ALLOWED_ORIGIN;

  if (allowOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  }

  if (ALLOW_CREDENTIALS) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Vary", "Origin, Access-Control-Request-Method, Access-Control-Request-Headers");

  if (ENABLE_PNA && req.headers["access-control-request-private-network"] === "true") {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  return next();
});

app.get("/health", (req, res) => {
  return res.json({
    ok: true,
    message: "Backend POC running",
    receivedOrigin: req.headers.origin || null,
    receivedPnaRequestHeader:
      req.headers["access-control-request-private-network"] || null,
  });
});

app.post("/echo", (req, res) => {
  return res.json({
    ok: true,
    body: req.body,
    headers: {
      origin: req.headers.origin || null,
      accessControlRequestPrivateNetwork:
        req.headers["access-control-request-private-network"] || null,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Backend POC listening on http://localhost:${PORT}`);
  console.log("Config:");
  console.log(`- ALLOWED_ORIGIN=${ALLOWED_ORIGIN}`);
  console.log(`- ALLOW_CREDENTIALS=${ALLOW_CREDENTIALS}`);
  console.log(`- ENABLE_PNA=${ENABLE_PNA}`);
});
