import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrolls to the top when the PAGE changes (not when only ?page= / ?search= change). */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
