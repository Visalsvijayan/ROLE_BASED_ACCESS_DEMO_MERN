import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createProduct, updateProduct, getProduct } from "../api.js";

/**
 * AdminProductForm — used for both Add and Edit.
 *   /admin/products/add       -> no :id  -> create
 *   /admin/products/edit/:id  -> has :id -> update
 */
const AdminProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "https://via.placeholder.com/400x300?text=Product",
    stock: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getProduct(id)
      .then((p) =>
        setForm({
          name: p.name || "",
          description: p.description || "",
          price: String(p.price ?? ""),
          category: p.category || "",
          image: p.image || "",
          stock: String(p.stock ?? ""),
          isActive: p.isActive ?? true,
        })
      )
      .catch((e) => setError(e.response?.data?.message || "Failed to load product"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const onChange = (key) => (e) => {
    const value = key === "isActive" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate("/admin/products");
    } catch (e2) {
      setError(e2.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <Link to="/admin/products">← Back to products</Link>
      <h1 style={{ marginTop: 12 }}>{isEdit ? "Edit Product" : "Add Product"}</h1>
      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 600 }}>
        <div className="form-group">
          <label>Name</label>
          <input value={form.name} onChange={onChange("name")} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={onChange("description")} required />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label>Price</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={onChange("price")} required />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input type="number" min="0" value={form.stock} onChange={onChange("stock")} required />
          </div>
        </div>
        <div className="form-group">
          <label>Category</label>
          <input value={form.category} onChange={onChange("category")} required />
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input value={form.image} onChange={onChange("image")} />
        </div>
        <div className="form-group">
          <label>
            <input type="checkbox" checked={form.isActive} onChange={onChange("isActive")} /> Active (visible to public)
          </label>
        </div>
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : isEdit ? "Save changes" : "Create product"}
        </button>
      </form>
    </div>
  );
};

export default AdminProductForm;
