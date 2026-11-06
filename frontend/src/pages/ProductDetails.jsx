import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProduct } from "../api.js";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then(setProduct)
      .catch((e) => setError(e.response?.data?.message || "Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><div className="form-error">{error}</div></div>;
  if (!product) return null;

  return (
    <div className="container">
      <Link to="/products" style={{ fontSize: 14 }}>← Back to products</Link>
      <div className="card" style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <img
          src={product.image}
          alt={product.name}
          style={{ width: "100%", borderRadius: 8, objectFit: "cover", maxHeight: 320 }}
        />
        <div>
          <h1>{product.name}</h1>
          <p style={{ color: "var(--muted)", marginTop: 6 }}>{product.category}</p>
          <p className="price" style={{ fontSize: 24, marginTop: 12 }}>${product.price.toFixed(2)}</p>
          <p style={{ marginTop: 12 }}>{product.description}</p>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: 14 }}>In stock: {product.stock}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
