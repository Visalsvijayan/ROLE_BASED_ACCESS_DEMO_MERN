import { Link } from "react-router-dom";
import Alert from "../../components/Alert.jsx";
import PageLoader from "../../components/PageLoader.jsx";
import { ROUTES } from "../../constants/routes.js";
import { useFetch } from "../../hooks/useFetch.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { useAuth } from "../auth/useAuth.js";
import ProductCard from "./ProductCard.jsx";
import { listProducts } from "./productApi.js";

const FEATURED = { limit: 4 };

export default function HomePage() {
  usePageTitle();
  const { user } = useAuth();
  const { data, loading, error } = useFetch(listProducts, FEATURED);

  return (
    <div className="container">
      <div className="card">
        <h1>Welcome{user ? `, ${user.name}` : ""} 👋</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          Browse our latest products below.
          {!user && " Create an account to get started."}
        </p>
        <p style={{ marginTop: 12 }}>
          <Link to={ROUTES.PRODUCTS} className="btn btn-primary">
            See all products
          </Link>
        </p>
      </div>

      <h2 style={{ marginBottom: 12 }}>Featured</h2>
      <Alert>{error}</Alert>
      {loading && !data ? (
        <PageLoader />
      ) : (
        <div className="product-grid">
          {data?.items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
      {data?.items.length === 0 && <p className="muted">No products yet.</p>}
    </div>
  );
}
