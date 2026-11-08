import { useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../../components/Alert.jsx";
import { StatusBadge } from "../../components/Badge.jsx";
import PageLoader from "../../components/PageLoader.jsx";
import Pagination from "../../components/Pagination.jsx";
import ProductImage from "../../components/ProductImage.jsx";
import SearchInput from "../../components/SearchInput.jsx";
import { ROUTES } from "../../constants/routes.js";
import { useFetch } from "../../hooks/useFetch.js";
import { useListParams } from "../../hooks/useListParams.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { getErrorMessage } from "../../lib/errors.js";
import { formatPrice } from "../../lib/format.js";
import { adminListProducts, deleteProduct } from "../products/productApi.js";

const PAGE_SIZE = 10;

export default function ProductsPage() {
  usePageTitle("Manage products");
  const { page, search, setPage, setSearch } = useListParams();
  const { data, loading, error, reload } = useFetch(adminListProducts, { page, limit: PAGE_SIZE, search });

  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const remove = async (product) => {
    if (!window.confirm(`Delete product "${product.name}"? This cannot be undone.`)) return;
    setActionError("");
    setBusyId(product._id);
    try {
      await deleteProduct(product._id);
      if (data.items.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to delete the product."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Products</h1>
        <div className="page-header-actions">
          <SearchInput value={search} onSearch={setSearch} placeholder="Search products..." label="Search products" />
          <Link to={ROUTES.ADMIN_PRODUCT_NEW} className="btn btn-primary">
            + Add product
          </Link>
        </div>
      </div>

      <Alert>{error}</Alert>
      <Alert>{actionError}</Alert>

      {loading && !data ? (
        <PageLoader />
      ) : (
        data && (
          <div className={`table-wrap${loading ? " is-loading" : ""}`}>
            <table>
              <thead>
                <tr>
                  <th aria-label="Image" />
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <ProductImage src={product.image} alt="" className="thumb" />
                    </td>
                    <td>
                      <Link to={ROUTES.ADMIN_PRODUCT_EDIT(product._id)}>{product.name}</Link>
                    </td>
                    <td>{product.category}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <StatusBadge active={product.isActive} />
                    </td>
                    <td className="actions">
                      <Link to={ROUTES.ADMIN_PRODUCT_EDIT(product._id)} className="btn btn-sm">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => remove(product)}
                        disabled={busyId === product._id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      {search ? `No products match "${search}".` : "No products yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      )}

      <p className="muted small" style={{ marginTop: 8 }}>
        {data ? `${data.total} product${data.total === 1 ? "" : "s"} in total` : ""}
      </p>
      <Pagination page={page} totalPages={data?.totalPages} onChange={setPage} disabled={loading} />
    </div>
  );
}
