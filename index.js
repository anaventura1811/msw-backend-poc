const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;
const LEGACY_ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
const CORS_ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS || LEGACY_ALLOWED_ORIGIN || "*";
const ALLOW_CREDENTIALS = process.env.ALLOW_CREDENTIALS === "true";
const ENABLE_PNA = process.env.ENABLE_PNA !== "false";
const DEFAULT_ALLOWED_HEADERS = "Content-Type, Authorization, X-Requested-With";
const DEFAULT_ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";

const allowedOrigins = CORS_ALLOWED_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function getAllowedOrigin(requestOrigin) {
  if (!requestOrigin) {
    return null;
  }

  if (allowedOrigins.includes("*")) {
    return ALLOW_CREDENTIALS ? requestOrigin : "*";
  }

  return allowedOrigins.includes(requestOrigin) ? requestOrigin : null;
}

app.use(express.json());

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  const allowOrigin = getAllowedOrigin(requestOrigin);

  if (requestOrigin && !allowOrigin) {
    if (req.method === "OPTIONS") {
      return res.status(403).json({ error: "Origin not allowed by CORS policy" });
    }

    return res.status(403).json({ error: "Origin not allowed by CORS policy" });
  }

  if (allowOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  }
  if (ALLOW_CREDENTIALS) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  const requestedHeaders = req.headers["access-control-request-headers"];
  const requestedMethod = req.headers["access-control-request-method"];

  res.setHeader("Access-Control-Allow-Headers", requestedHeaders || DEFAULT_ALLOWED_HEADERS);
  res.setHeader(
    "Access-Control-Allow-Methods",
    requestedMethod ? `${requestedMethod},OPTIONS` : DEFAULT_ALLOWED_METHODS
  );
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
  console.log(`- CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}`);
  console.log(`- ALLOW_CREDENTIALS=${ALLOW_CREDENTIALS}`);
  console.log(`- ENABLE_PNA=${ENABLE_PNA}`);
});
