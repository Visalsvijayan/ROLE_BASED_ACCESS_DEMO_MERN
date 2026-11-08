import { Link, useParams } from "react-router-dom";
import Alert from "../../components/Alert.jsx";
import PageLoader from "../../components/PageLoader.jsx";
import ProductImage from "../../components/ProductImage.jsx";
import { ROUTES } from "../../constants/routes.js";
import { useFetch } from "../../hooks/useFetch.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { formatPrice } from "../../lib/format.js";
import { getProduct } from "./productApi.js";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { data: product, loading, error } = useFetch(getProduct, id);
  usePageTitle(product?.name ?? "Product");

  return (
    <div className="container">
      <Link to={ROUTES.PRODUCTS} className="small">
        ← Back to products
      </Link>

      <div style={{ marginTop: 12 }}>
        <Alert>{error}</Alert>
        {loading && !product && <PageLoader />}
      </div>

      {product && !error && (
        <div className="card details-grid">
          <ProductImage src={product.image} alt={product.name} className="details-image" />
          <div>
            <h1>{product.name}</h1>
            <p className="muted" style={{ marginTop: 6 }}>
              {product.category}
            </p>
            <p className="price price-lg" style={{ marginTop: 12 }}>
              {formatPrice(product.price)}
            </p>
            <p style={{ marginTop: 12 }}>{product.description}</p>
            <p className="muted small" style={{ marginTop: 12 }}>
              {product.stock > 0 ? `In stock: ${product.stock}` : "Out of stock"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
