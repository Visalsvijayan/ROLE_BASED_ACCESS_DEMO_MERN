import { describe, test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import { registerBody, loginBody } from "../src/validators/authValidators.js";
import {
  createProductBody,
  updateProductBody,
  listProductsQuery,
} from "../src/validators/productValidators.js";
import { escapeRegex } from "../src/utils/escapeRegex.js";
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../src/services/tokenService.js";
import { authorize } from "../src/middleware/roleMiddleware.js";
import { ROLES } from "../src/constants/roles.js";

const validProduct = {
  name: "Mug",
  description: "A ceramic mug",
  price: 9.99,
  category: "Home",
  stock: 4,
};

describe("auth validators", () => {
  test("register cleans the input and ignores a client-supplied role", () => {
    const result = registerBody.parse({
      name: "  Asha  ",
      email: "  Asha@Example.COM ",
      password: "Passw0rd1",
      role: "admin",
    });
    assert.equal(result.name, "Asha");
    assert.equal(result.email, "asha@example.com");
    assert.equal("role" in result, false, "role must never come from the request");
  });

  test("register rejects weak passwords", () => {
    const base = { name: "Asha", email: "a@b.co" };
    assert.equal(registerBody.safeParse({ ...base, password: "short1" }).success, false);
    assert.equal(registerBody.safeParse({ ...base, password: "onlyletters" }).success, false);
    assert.equal(registerBody.safeParse({ ...base, password: "12345678" }).success, false);
    assert.equal(registerBody.safeParse({ ...base, password: "Passw0rd1" }).success, true);
  });

  test("login only checks that something was typed", () => {
    assert.equal(loginBody.safeParse({ email: "a@b.co", password: "x" }).success, true);
    assert.equal(loginBody.safeParse({ email: "not-an-email", password: "x" }).success, false);
    assert.equal(loginBody.safeParse({ email: "a@b.co" }).success, false);
  });

  test("a NoSQL-injection style object is rejected, not passed to the database", () => {
    const attack = loginBody.safeParse({ email: { $ne: null }, password: { $ne: null } });
    assert.equal(attack.success, false);
  });
});

describe("product validators", () => {
  test("accepts a valid product and an empty image", () => {
    assert.equal(createProductBody.safeParse(validProduct).success, true);
    assert.equal(createProductBody.safeParse({ ...validProduct, image: "" }).success, true);
  });

  test("rejects negative price, fractional stock and non-http image URLs", () => {
    assert.equal(createProductBody.safeParse({ ...validProduct, price: -1 }).success, false);
    assert.equal(createProductBody.safeParse({ ...validProduct, stock: 1.5 }).success, false);
    assert.equal(
      createProductBody.safeParse({ ...validProduct, image: "javascript:alert(1)" }).success,
      false
    );
  });

  test("drops fields that are not part of the schema", () => {
    const result = createProductBody.parse({ ...validProduct, _id: "x", createdAt: "2000-01-01" });
    assert.equal("_id" in result, false);
    assert.equal("createdAt" in result, false);
  });

  test("an update needs at least one field", () => {
    assert.equal(updateProductBody.safeParse({}).success, false);
    assert.equal(updateProductBody.safeParse({ price: 5 }).success, true);
  });

  test("list query: converts text to numbers, applies defaults and a hard limit cap", () => {
    assert.deepEqual(listProductsQuery.parse({}), { page: 1, limit: 12 });
    assert.equal(listProductsQuery.parse({ page: "3", limit: "5" }).page, 3);
    assert.equal(listProductsQuery.safeParse({ limit: "1000" }).success, false);
    assert.equal(listProductsQuery.safeParse({ page: "0" }).success, false);
  });
});

describe("escapeRegex", () => {
  test("makes special characters literal", () => {
    assert.equal(escapeRegex("a.b*c"), "a\\.b\\*c");
    assert.equal(new RegExp(escapeRegex(".*")).test("anything"), false);
  });
});

describe("tokens", () => {
  const user = { _id: "64b7f0f2c1a2b3c4d5e6f708" };

  test("an access token carries the user id and verifies", () => {
    const payload = verifyAccessToken(signAccessToken(user));
    assert.equal(payload.sub, user._id);
  });

  test("access and refresh tokens cannot be swapped", () => {
    assert.throws(() => verifyRefreshToken(signAccessToken(user)));
    assert.throws(() => verifyAccessToken(signRefreshToken(user).token));
  });

  test("a tampered token is rejected", () => {
    const token = signAccessToken(user);
    const tampered = token.slice(0, -3) + (token.endsWith("aaa") ? "bbb" : "aaa");
    assert.throws(() => verifyAccessToken(tampered));
  });

  test('an unsigned "alg: none" token is rejected', () => {
    const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
    const forged = `${encode({ alg: "none", typ: "JWT" })}.${encode({ sub: user._id })}.`;
    assert.throws(() => verifyAccessToken(forged));
  });

  test("an expired token is rejected", () => {
    const expired = jwt.sign({}, process.env.JWT_ACCESS_SECRET, {
      subject: user._id,
      expiresIn: -10,
    });
    assert.throws(() => verifyAccessToken(expired), { name: "TokenExpiredError" });
  });

  test("refresh tokens issued back-to-back are all different", () => {
    const hashes = new Set(Array.from({ length: 5 }, () => hashToken(signRefreshToken(user).token)));
    assert.equal(hashes.size, 5);
  });

  test("hashToken is stable and does not return the token", () => {
    const { token } = signRefreshToken(user);
    assert.equal(hashToken(token), hashToken(token));
    assert.notEqual(hashToken(token), token);
  });
});

describe("authorize middleware", () => {
  const run = (user, ...roles) => {
    let outcome = "next-not-called";
    authorize(...roles)({ user }, {}, (error) => {
      outcome = error ? error.statusCode : "allowed";
    });
    return outcome;
  };

  test("401 when nobody is logged in", () => {
    assert.equal(run(undefined, ROLES.ADMIN), 401);
  });

  test("403 when the role is not allowed", () => {
    assert.equal(run({ role: ROLES.USER }, ROLES.ADMIN), 403);
  });

  test("allows a matching role", () => {
    assert.equal(run({ role: ROLES.ADMIN }, ROLES.ADMIN), "allowed");
    assert.equal(run({ role: ROLES.USER }, ROLES.USER, ROLES.ADMIN), "allowed");
  });
});
