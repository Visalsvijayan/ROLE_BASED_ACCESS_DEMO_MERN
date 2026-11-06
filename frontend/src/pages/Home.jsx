import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { listProducts } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

const Home = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listProducts()
      .then(setProducts)
      .catch((e) => setError(e.response?.data?.message || "Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1>Welcome{user ? `, ${user.name}` : ""} 👋</h1>
        <p style={{ color: "var(--muted)", marginTop: 6 }}>
          Browse our latest products below. This page is available to logged-in
          <strong> user</strong> accounts.
        </p>
        <p style={{ marginTop: 8 }}>
          <Link to="/products" className="btn btn-primary">
            See all products
          </Link>
        </p>
      </div>

      <h2 style={{ marginBottom: 12 }}>Featured</h2>
      {error && <div className="form-error">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="product-grid">
          {products.slice(0, 4).map((p) => (
            <Link key={p._id} to={`/products/${p._id}`} className="product-card">
              <img src={p.image} alt={p.name} />
              <div className="p-body">
                <h3>{p.name}</h3>
                <p style={{ color: "var(--muted)", fontSize: 13 }}>{p.category}</p>
                <p className="price">${p.price.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
