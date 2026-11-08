import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import PageLoader from "../components/PageLoader.jsx";
import ScrollToTop from "../components/ScrollToTop.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

/**
 * Sidebar + content for every /admin/* page. The admin pages are lazy-loaded
 * (downloaded only when first visited), so regular customers never download
 * the admin code. <Suspense> shows the loader while a page is downloading.
 */
export default function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="admin-shell">
      <ScrollToTop />
      <AdminSidebar />
      <main id="main" className="admin-content">
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
