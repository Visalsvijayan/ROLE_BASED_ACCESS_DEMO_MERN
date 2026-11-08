import { Outlet, useLocation } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import ScrollToTop from "../components/ScrollToTop.jsx";
import Navbar from "./Navbar.jsx";

/** Navbar on top + the current page below. Used by every non-admin page. */
export default function MainLayout() {
  const { pathname } = useLocation();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main">
        {/* key={pathname}: after a crash, going to another page resets the error screen */}
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </>
  );
}
