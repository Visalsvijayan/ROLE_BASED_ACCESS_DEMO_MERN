import { describe, test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";

import app from "../src/app.js";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import RefreshToken from "../src/models/RefreshToken.js";
import { ROLES } from "../src/constants/roles.js";

/**
 * Full end-to-end RBAC test against a REAL MongoDB.
 *
 * It is skipped unless you opt in, because it WIPES the database it connects to:
 *
 *   MONGO_URI_TEST=mongodb://127.0.0.1:27017/mern_rbac_test npm test
 *
 * As a safety net the database name must contain "test".
 */
const uri = process.env.MONGO_URI_TEST;
const dbName = uri ? new URL(uri).pathname.slice(1) : "";
const enabled = Boolean(uri) && /test/i.test(dbName);

const PASSWORD = "Passw0rd1";
const json = { "Content-Type": "application/json" };
const bearer = (token) => ({ Authorization: `Bearer ${token}` });

describe("RBAC end-to-end", { skip: !enabled && "set MONGO_URI_TEST (database name must contain 'test')" }, () => {
  const state = {};

  before(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    // Wait until the unique indexes (e.g. one account per email) exist.
    await Promise.all([User.init(), Product.init()]);
    // Start from an empty database, in case a previous run was interrupted.
    await Promise.all([User.deleteMany({}), Product.deleteMany({}), RefreshToken.deleteMany({})]);
    await User.create({ name: "Boss", email: "boss@example.com", password: PASSWORD, role: ROLES.ADMIN });
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  describe("registration and login", () => {
    test("register creates a plain user even if the body asks for admin", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Asha", email: "Asha@Example.com", password: PASSWORD, role: "admin" });

      assert.equal(res.status, 201);
      assert.equal(res.body.user.role, ROLES.USER);
      assert.equal(res.body.user.email, "asha@example.com");
      assert.equal("password" in res.body.user, false);
      assert.ok(res.body.accessToken);

      const cookie = res.headers["set-cookie"].join(";");
      assert.match(cookie, /refreshToken=/);
      assert.match(cookie, /HttpOnly/i);

      state.user = res.body.user;
      state.userToken = res.body.accessToken;
      state.userCookie = res.headers["set-cookie"];
    });

    test("a duplicate email is a 409", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Asha 2", email: "asha@example.com", password: PASSWORD });
      assert.equal(res.status, 409);
      assert.equal(res.body.message, "Email already in use");
    });

    test("wrong password is 401, right password is 200", async () => {
      const bad = await request(app).post("/api/auth/login").send({ email: "boss@example.com", password: "nope" });
      assert.equal(bad.status, 401);

      const good = await request(app).post("/api/auth/login").send({ email: "boss@example.com", password: PASSWORD });
      assert.equal(good.status, 200);
      assert.equal(good.body.user.role, ROLES.ADMIN);
      state.adminToken = good.body.accessToken;
    });

    test("/me returns the logged-in user", async () => {
      const res = await request(app).get("/api/auth/me").set(bearer(state.userToken));
      assert.equal(res.status, 200);
      assert.equal(res.body.user.email, "asha@example.com");
    });
  });

  describe("role-based access", () => {
    test("a valid user token is still 403 on admin endpoints", async () => {
      for (const path of ["/api/users", "/api/admin/stats", "/api/products/admin/all"]) {
        const res = await request(app).get(path).set(bearer(state.userToken));
        assert.equal(res.status, 403, path);
      }
      const create = await request(app).post("/api/products").set(bearer(state.userToken)).send({});
      assert.equal(create.status, 403);
    });

    test("an admin can list users (paginated, searchable, no passwords)", async () => {
      const res = await request(app).get("/api/users?limit=1").set(bearer(state.adminToken));
      assert.equal(res.status, 200);
      assert.equal(res.body.items.length, 1);
      assert.equal(res.body.total, 2);
      assert.equal(res.body.totalPages, 2);
      assert.equal(res.body.items.some((u) => "password" in u), false);

      const search = await request(app).get("/api/users?search=asha").set(bearer(state.adminToken));
      assert.deepEqual(search.body.items.map((u) => u.email), ["asha@example.com"]);
    });

    test("an admin can read dashboard stats", async () => {
      const res = await request(app).get("/api/admin/stats").set(bearer(state.adminToken));
      assert.equal(res.status, 200);
      assert.equal(res.body.totalUsers, 2);
    });
  });

  describe("products", () => {
    test("admin creates a product; unknown fields are dropped; bad data is rejected", async () => {
      const bad = await request(app)
        .post("/api/products")
        .set(bearer(state.adminToken))
        .send({ name: "x", description: "d", price: -1, category: "c", stock: 1 });
      assert.equal(bad.status, 400);

      const res = await request(app)
        .post("/api/products")
        .set(bearer(state.adminToken))
        .send({
          name: "Lamp",
          description: "Desk lamp",
          price: 25,
          category: "Home",
          stock: 3,
          isActive: false,
          createdAt: "2000-01-01",
        });
      assert.equal(res.status, 201);
      assert.notEqual(new Date(res.body.createdAt).getFullYear(), 2000);
      state.productId = res.body._id;
    });

    test("an inactive product is hidden publicly but visible to admins", async () => {
      const publicGet = await request(app).get(`/api/products/${state.productId}`);
      assert.equal(publicGet.status, 404);

      const publicList = await request(app).get("/api/products");
      assert.equal(publicList.body.total, 0);

      const adminGet = await request(app).get(`/api/products/admin/${state.productId}`).set(bearer(state.adminToken));
      assert.equal(adminGet.status, 200);
      assert.equal(adminGet.body.isActive, false);
    });

    test("admin activates, then the public can see it", async () => {
      const update = await request(app)
        .put(`/api/products/${state.productId}`)
        .set(bearer(state.adminToken))
        .send({ isActive: true });
      assert.equal(update.status, 200);

      const publicList = await request(app).get("/api/products?search=lam");
      assert.equal(publicList.body.total, 1);
    });

    test("admin deletes it; a second delete is 404", async () => {
      const first = await request(app).delete(`/api/products/${state.productId}`).set(bearer(state.adminToken));
      assert.equal(first.status, 200);
      const second = await request(app).delete(`/api/products/${state.productId}`).set(bearer(state.adminToken));
      assert.equal(second.status, 404);
    });
  });

  describe("sessions", () => {
    test("refresh rotates the cookie and the old one works briefly (two tabs)", async () => {
      const first = await request(app).post("/api/auth/refresh").set("Cookie", state.userCookie);
      assert.equal(first.status, 200);
      assert.ok(first.body.accessToken);
      assert.notDeepEqual(first.headers["set-cookie"], state.userCookie);

      const secondTab = await request(app).post("/api/auth/refresh").set("Cookie", state.userCookie);
      assert.equal(secondTab.status, 200);

      state.userCookie = first.headers["set-cookie"];
    });

    test("logout revokes the refresh token", async () => {
      const login = await request(app).post("/api/auth/login").send({ email: "boss@example.com", password: PASSWORD });
      const cookie = login.headers["set-cookie"];

      const logout = await request(app).post("/api/auth/logout").set("Cookie", cookie);
      assert.equal(logout.status, 200);

      const refresh = await request(app).post("/api/auth/refresh").set("Cookie", cookie);
      assert.equal(refresh.status, 401);
    });
  });

  describe("user management", () => {
    test("an admin cannot deactivate or delete themselves", async () => {
      const boss = await User.findOne({ email: "boss@example.com" });
      const deactivate = await request(app)
        .patch(`/api/users/${boss.id}/status`)
        .set(bearer(state.adminToken))
        .send({ isActive: false });
      assert.equal(deactivate.status, 400);

      const remove = await request(app).delete(`/api/users/${boss.id}`).set(bearer(state.adminToken));
      assert.equal(remove.status, 400);
    });

    test("deactivating a user locks them out immediately, everywhere", async () => {
      const res = await request(app)
        .patch(`/api/users/${state.user._id}/status`)
        .set(bearer(state.adminToken))
        .send({ isActive: false });
      assert.equal(res.status, 200);
      assert.equal(res.body.isActive, false);

      const me = await request(app).get("/api/auth/me").set(bearer(state.userToken));
      assert.equal(me.status, 401);

      const refresh = await request(app).post("/api/auth/refresh").set("Cookie", state.userCookie);
      assert.equal(refresh.status, 401);

      const login = await request(app).post("/api/auth/login").set(json).send({ email: "asha@example.com", password: PASSWORD });
      assert.equal(login.status, 403);
    });

    test("deleting a user works, and the user is gone", async () => {
      const res = await request(app).delete(`/api/users/${state.user._id}`).set(bearer(state.adminToken));
      assert.equal(res.status, 200);

      const again = await request(app).get(`/api/users/${state.user._id}`).set(bearer(state.adminToken));
      assert.equal(again.status, 404);
    });
  });
});
