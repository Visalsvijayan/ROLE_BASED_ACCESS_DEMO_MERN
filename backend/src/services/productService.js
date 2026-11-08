import Product from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { paginate } from "../utils/pagination.js";

const notFound = () => ApiError.notFound("Product not found");

const buildFilter = ({ search, category, includeInactive }) => {
  const filter = {};
  if (!includeInactive) filter.isActive = true;
  if (category) filter.category = category;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: pattern }, { category: pattern }];
  }
  return filter;
};

/** Public list (active products only) or admin list (everything). */
export const listProducts = ({ page, limit, search, category }, { includeInactive = false } = {}) =>
  paginate(Product, buildFilter({ search, category, includeInactive }), {
    page,
    limit,
    select: "-__v",
  });

/** Public: inactive products look like they don't exist. Admin: sees everything. */
export const getProductById = async (id, { includeInactive = false } = {}) => {
  const product = await Product.findById(id).select("-__v").lean();
  if (!product || (!product.isActive && !includeInactive)) throw notFound();
  return product;
};

export const createProduct = (data) => Product.create(data);

export const updateProduct = async (id, data) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!product) throw notFound();
  return product;
};

export const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw notFound();
};
