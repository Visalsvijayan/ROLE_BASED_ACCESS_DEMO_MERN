import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { listProducts } from "../api.js";

const Products = () => {
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
      <h1 style={{ marginBottom: 16 }}>Products</h1>
      {error && <div className="form-error">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
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

export default Products;
