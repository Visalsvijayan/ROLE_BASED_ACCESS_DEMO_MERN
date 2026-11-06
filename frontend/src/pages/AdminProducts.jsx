import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { adminListProducts, deleteProduct } from "../api.js";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    adminListProducts()
      .then(setProducts)
      .catch((e) => setError(e.response?.data?.message || "Failed to load products"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (p) => {
    if (!window.confirm(`Delete product "${p.name}"?`)) return;
    try {
      await deleteProduct(p._id);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Products (Admin)</h1>
        <Link to="/admin/products/add" className="btn btn-primary">+ Add Product</Link>
      </div>

      {error && <div className="form-error">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td><Link to={`/products/${p._id}`}>{p.name}</Link></td>
                <td>{p.category}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>
                  <span className={`badge ${p.isActive ? "badge-active" : "badge-inactive"}`}>
                    {p.isActive ? "active" : "inactive"}
                  </span>
                </td>
                <td>
                  <Link to={`/admin/products/edit/${p._id}`} className="btn btn-sm">Edit</Link>{" "}
                  <button onClick={() => remove(p)} className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center" }}>No products yet.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminProducts;
