import { describe, expect, test } from "vitest";
import { getErrorMessage, getFieldErrors } from "./errors.js";

describe("getErrorMessage", () => {
  test("prefers the server's message", () => {
    expect(getErrorMessage({ response: { data: { message: "Email already in use" } } })).toBe("Email already in use");
  });
  test("explains network failures", () => {
    expect(getErrorMessage({ request: {} })).toMatch(/cannot reach the server/i);
  });
  test("falls back", () => {
    expect(getErrorMessage(new Error("x"), "Oops")).toBe("Oops");
  });
});

describe("getFieldErrors", () => {
  test("maps the first error of each field", () => {
    const error = {
      response: { data: { errors: [{ path: "price", message: "a" }, { path: "price", message: "b" }, { path: "name", message: "c" }] } },
    };
    expect(getFieldErrors(error)).toEqual({ price: "a", name: "c" });
  });
  test("returns {} when there are none", () => {
    expect(getFieldErrors({})).toEqual({});
  });
});
