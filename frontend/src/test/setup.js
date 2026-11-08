import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount whatever a test rendered, so tests can't affect each other.
afterEach(cleanup);
