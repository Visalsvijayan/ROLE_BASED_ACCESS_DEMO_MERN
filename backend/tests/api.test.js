import { describe, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

/**
 * HTTP-level tests that need NO database: they exercise everything that is
 * decided BEFORE the database is touched (routing, validation, authentication
 * headers, CORS, security headers, error format).
 */
describe("API basics", () => {
  test("GET / says the API is running", async () => {
    const res = await request(app).get("/");
    assert.equal(res.status, 200);
    assert.match(res.body.message, /running/i);
  });

  test("GET /api/health reports the database as down when it is not connected", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 503);
    assert.equal(res.body.database, "disconnected");
  });

  test("unknown routes return a JSON 404", async () => {
    const res = await request(app).get("/api/does-not-exist");
    assert.equal(res.status, 404);
    assert.match(res.body.message, /not found/i);
  });

  test("malformed JSON returns 400, not a 500", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{bad json");
    assert.equal(res.status, 400);
    assert.match(res.body.message, /malformed json/i);
  });

  test("security headers are set and the framework is not advertised", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.headers["x-content-type-options"], "nosniff");
    assert.equal(res.headers["x-powered-by"], undefined);
  });
});

describe("CORS", () => {
  test("an allowed origin gets credentials support", async () => {
    const res = await request(app).get("/api/health").set("Origin", "http://localhost:5173");
    assert.equal(res.headers["access-control-allow-origin"], "http://localhost:5173");
    assert.equal(res.headers["access-control-allow-credentials"], "true");
  });

  test("an unknown origin is rejected", async () => {
    const res = await request(app).get("/api/health").set("Origin", "http://evil.example");
    assert.equal(res.status, 403);
  });
});

describe("validation (400) happens before anything else", () => {
  test("login with an empty body lists every problem", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    assert.equal(res.status, 400);
    assert.ok(Array.isArray(res.body.errors) && res.body.errors.length >= 2);
  });

  test("register with a weak password explains why", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Asha", email: "asha@example.com", password: "abc" });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /password/i);
  });

  test("an invalid ObjectId is a 400", async () => {
    const res = await request(app).get("/api/products/not-an-id");
    assert.equal(res.status, 400);
    assert.equal(res.body.message, "Invalid id");
  });

  test("an oversized page limit is rejected", async () => {
    const res = await request(app).get("/api/products?limit=1000");
    assert.equal(res.status, 400);
  });
});

describe("authentication (401) on protected routes", () => {
  const protectedRoutes = [
    ["get", "/api/auth/me"],
    ["get", "/api/users"],
    ["get", "/api/admin/stats"],
    ["get", "/api/products/admin/all"],
    ["post", "/api/products"],
  ];

  for (const [method, path] of protectedRoutes) {
    test(`${method.toUpperCase()} ${path} without a token`, async () => {
      const res = await request(app)[method](path);
      assert.equal(res.status, 401);
      assert.equal(res.body.message, "Not authenticated");
    });
  }

  test("a garbage token is rejected", async () => {
    const res = await request(app).get("/api/users").set("Authorization", "Bearer abc.def.ghi");
    assert.equal(res.status, 401);
    assert.match(res.body.message, /invalid or expired/i);
  });

  test("a non-Bearer scheme is rejected", async () => {
    const res = await request(app).get("/api/users").set("Authorization", "Basic abc");
    assert.equal(res.status, 401);
  });

  test("refresh without a cookie is a 401", async () => {
    const res = await request(app).post("/api/auth/refresh");
    assert.equal(res.status, 401);
  });

  test("logout without a cookie still succeeds (idempotent)", async () => {
    const res = await request(app).post("/api/auth/logout");
    assert.equal(res.status, 200);
  });
});
