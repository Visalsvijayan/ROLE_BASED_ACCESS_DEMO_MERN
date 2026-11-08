import Alert from "../../components/Alert.jsx";
import PageLoader from "../../components/PageLoader.jsx";
import { useFetch } from "../../hooks/useFetch.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { getStats } from "./adminApi.js";

const CARDS = [
  { key: "totalUsers", label: "Total users" },
  { key: "activeUsers", label: "Active users" },
  { key: "totalProducts", label: "Total products" },
  { key: "activeProducts", label: "Active products" },
  { key: "outOfStockProducts", label: "Out of stock" },
];

export default function DashboardPage() {
  usePageTitle("Admin dashboard");
  const { data: stats, loading, error } = useFetch(getStats);

  return (
    <div className="container">
      <h1 style={{ marginBottom: 16 }}>Admin dashboard</h1>
      <Alert>{error}</Alert>

      {loading && !stats ? (
        <PageLoader text="Loading stats..." />
      ) : (
        stats && (
          <div className="stats">
            {CARDS.map(({ key, label }) => (
              <div className="stat-card" key={key}>
                <div className="label">{label}</div>
                <div className="value">{stats[key]}</div>
              </div>
            ))}
          </div>
        )
      )}

      <div className="card">
        <h2>Welcome, admin</h2>
        <p className="muted" style={{ marginTop: 6 }}>
          Manage users and products from the sidebar. Every admin endpoint is protected on the server
          with <code>protect</code> + <code>authorize("admin")</code>.
        </p>
      </div>
    </div>
  );
}
