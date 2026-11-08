import Alert from "../../components/Alert.jsx";
import PageLoader from "../../components/PageLoader.jsx";
import Pagination from "../../components/Pagination.jsx";
import SearchInput from "../../components/SearchInput.jsx";
import { useFetch } from "../../hooks/useFetch.js";
import { useListParams } from "../../hooks/useListParams.js";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import ProductCard from "./ProductCard.jsx";
import { listProducts } from "./productApi.js";

const PAGE_SIZE = 12;

export default function ProductListPage() {
  usePageTitle("Products");
  const { page, search, setPage, setSearch } = useListParams();
  const { data, loading, error } = useFetch(listProducts, { page, limit: PAGE_SIZE, search });

  return (
    <div className="container">
      <div className="page-header">
        <h1>Products</h1>
        <SearchInput value={search} onSearch={setSearch} placeholder="Search products..." label="Search products" />
      </div>

      <Alert>{error}</Alert>

      {loading && !data ? (
        <PageLoader />
      ) : data && data.items.length === 0 ? (
        <p className="muted">{search ? `No products match "${search}".` : "No products available."}</p>
      ) : (
        <div className={`product-grid${loading ? " is-loading" : ""}`}>
          {data?.items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={data?.totalPages} onChange={setPage} disabled={loading} />
    </div>
  );
}
