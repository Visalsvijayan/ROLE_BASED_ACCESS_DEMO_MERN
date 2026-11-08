import { useCallback, useEffect, useState } from "react";
import { getErrorMessage, isCancel } from "../lib/errors.js";

/**
 * Loads data when a component appears and again whenever `params` change.
 *
 *   const { data, loading, error, reload } = useFetch(listProducts, { page, search });
 *
 * `fetcher` is called as fetcher(params, { signal }). It must be a stable
 * function (an exported API function is), not one created during render.
 *
 * Production details handled for you:
 *   - a slow OLD request can never overwrite a newer one (it is cancelled)
 *   - the previous data stays on screen while the next page loads (no flicker)
 *   - leaving the page cancels the request
 */
export function useFetch(fetcher, params) {
  const [result, setResult] = useState({ key: null, data: null, error: "" });
  const [reloadCount, setReloadCount] = useState(0);

  const paramsKey = JSON.stringify(params ?? null);
  const requestKey = `${paramsKey}#${reloadCount}`;

  useEffect(() => {
    const controller = new AbortController();

    fetcher(JSON.parse(paramsKey), { signal: controller.signal })
      .then((data) => setResult({ key: requestKey, data, error: "" }))
      .catch((error) => {
        if (isCancel(error)) return;
        setResult({ key: requestKey, data: null, error: getErrorMessage(error) });
      });

    return () => controller.abort();
  }, [fetcher, paramsKey, requestKey]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  // Still waiting for the answer to the CURRENT request?
  const loading = result.key !== requestKey;

  return { data: result.data, error: loading ? "" : result.error, loading, reload };
}
