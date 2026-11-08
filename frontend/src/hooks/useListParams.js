import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Keeps "?page=2&search=lamp" in the URL instead of in component state.
 * Benefits: the browser Back button works, a page can be bookmarked or shared,
 * and a refresh keeps you where you were.
 */
export function useListParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1);
  const search = searchParams.get("search") ?? "";

  const update = useCallback(
    (changes) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(changes)) {
            const isDefault = value === "" || value == null || (key === "page" && value === 1);
            if (isDefault) next.delete(key);
            else next.set(key, String(value));
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setPage = useCallback((value) => update({ page: value }), [update]);
  const setSearch = useCallback((value) => update({ search: value, page: 1 }), [update]);

  return { page, search, setPage, setSearch };
}
