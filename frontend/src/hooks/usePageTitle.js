import { useEffect } from "react";

/** Sets the browser tab title: usePageTitle("Products") -> "Products · MERN Shop". */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · MERN Shop` : "MERN Shop";
  }, [title]);
}
