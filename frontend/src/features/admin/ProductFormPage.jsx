import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Alert from "../../components/Alert.jsx";
import PageLoader from "../../components/PageLoader.jsx";
import TextField from "../../components/TextField.jsx";
import { ROUTES } from "../../constants/routes.js";
import { useFetch } from "../../hooks/useFetch.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { getErrorMessage, getFieldErrors } from "../../lib/errors.js";
import { adminGetProduct, createProduct, updateProduct } from "../products/productApi.js";

// Form inputs always hold TEXT, so numbers are kept as strings until we submit.
const toFormValues = (product) => ({
  name: product?.name ?? "",
  description: product?.description ?? "",
  price: product ? String(product.price) : "",
  stock: product ? String(product.stock) : "",
  category: product?.category ?? "",
  image: product?.image ?? "",
  isActive: product?.isActive ?? true,
});

function ProductForm({ initial, submitLabel, onSubmit }) {
  const [values, setValues] = useState(() => toFormValues(initial));
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    const { type, checked, value } = event.target;
    setValues((previous) => ({ ...previous, [field]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim(),
        category: values.category.trim(),
        image: values.image.trim(),
        price: Number(values.price),
        stock: Number(values.stock),
        isActive: values.isActive,
      });
    } catch (err) {
      const fields = getFieldErrors(err);
      setFieldErrors(fields);
      setError(Object.keys(fields).length ? "Please fix the highlighted fields." : getErrorMessage(err, "Save failed."));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card form-card">
      <Alert>{error}</Alert>

      <TextField
        label="Name"
        value={values.name}
        onChange={handleChange("name")}
        error={fieldErrors.name}
        required
        maxLength={120}
      />
      <TextField
        label="Description"
        multiline
        value={values.description}
        onChange={handleChange("description")}
        error={fieldErrors.description}
        required
        maxLength={2000}
      />
      <div className="form-row">
        <TextField
          label="Price"
          type="number"
          min="0"
          step="0.01"
          value={values.price}
          onChange={handleChange("price")}
          error={fieldErrors.price}
          required
        />
        <TextField
          label="Stock"
          type="number"
          min="0"
          step="1"
          value={values.stock}
          onChange={handleChange("stock")}
          error={fieldErrors.stock}
          required
        />
      </div>
      <TextField
        label="Category"
        value={values.category}
        onChange={handleChange("category")}
        error={fieldErrors.category}
        required
        maxLength={60}
      />
      <TextField
        label="Image URL (optional)"
        type="url"
        value={values.image}
        onChange={handleChange("image")}
        error={fieldErrors.image}
        hint="A link starting with https://. Leave empty to show a placeholder."
        maxLength={500}
      />
      <div className="form-group">
        <label className="checkbox">
          <input type="checkbox" checked={values.isActive} onChange={handleChange("isActive")} /> Active (visible
          to customers)
        </label>
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

/**
 * Used for both Add and Edit:
 *   /admin/products/add       -> no :id -> create
 *   /admin/products/edit/:id  -> has :id -> load the product, then update
 */
export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  usePageTitle(isEdit ? "Edit product" : "Add product");

  return (
    <div className="container">
      <Link to={ROUTES.ADMIN_PRODUCTS} className="small">
        ← Back to products
      </Link>
      <h1 style={{ margin: "12px 0" }}>{isEdit ? "Edit product" : "Add product"}</h1>

      {isEdit ? (
        <EditProduct id={id} onDone={() => navigate(ROUTES.ADMIN_PRODUCTS)} />
      ) : (
        <ProductForm
          submitLabel="Create product"
          onSubmit={async (payload) => {
            await createProduct(payload);
            navigate(ROUTES.ADMIN_PRODUCTS);
          }}
        />
      )}
    </div>
  );
}

function EditProduct({ id, onDone }) {
  const { data: product, loading, error } = useFetch(adminGetProduct, id);

  if (loading && !product) return <PageLoader />;
  if (error) return <Alert>{error}</Alert>;
  if (!product) return null;

  return (
    <ProductForm
      key={product._id}
      initial={product}
      submitLabel="Save changes"
      onSubmit={async (payload) => {
        await updateProduct(id, payload);
        onDone();
      }}
    />
  );
}
