import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { AuthProvider } from "./features/auth/AuthProvider.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

/** Providers (things every page needs) wrapped around the routes. */
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}
