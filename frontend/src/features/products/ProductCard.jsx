import { Link } from "react-router-dom";
import ProductImage from "../../components/ProductImage.jsx";
import { ROUTES } from "../../constants/routes.js";
import { formatPrice } from "../../lib/format.js";

export default function ProductCard({ product }) {
  return (
    <Link to={ROUTES.PRODUCT(product._id)} className="product-card">
      <ProductImage src={product.image} alt={product.name} />
      <div className="p-body">
        <h3>{product.name}</h3>
        <p className="muted small">{product.category}</p>
        <p className="price">{formatPrice(product.price)}</p>
        {product.stock === 0 && <span className="badge badge-inactive">Out of stock</span>}
      </div>
    </Link>
  );
}
