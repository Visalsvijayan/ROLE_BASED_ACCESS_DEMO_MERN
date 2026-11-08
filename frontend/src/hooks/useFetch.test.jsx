import { describe, expect, test, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFetch } from "./useFetch.js";

describe("useFetch", () => {
  test("loads data", async () => {
    const fetcher = vi.fn().mockResolvedValue({ n: 1 });
    const { result } = renderHook(() => useFetch(fetcher, { page: 1 }));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ n: 1 });
    expect(fetcher.mock.calls[0][0]).toEqual({ page: 1 });
  });

  test("exposes errors", async () => {
    const fetcher = vi.fn().mockRejectedValue({ response: { data: { message: "boom" } } });
    const { result } = renderHook(() => useFetch(fetcher, {}));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("boom");
  });
});
