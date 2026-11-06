import Product from "../models/Product.js";

/**
 * GET /api/products
 * Public. List all active products.
 */
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id
 * Public. Get a single product by id.
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products
 * Admin only. Create a new product.
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, image, stock } = req.body;
    if (!name || !description || price == null || !category || stock == null) {
      return res.status(400).json({
        message: "name, description, price, category and stock are required",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/products/:id
 * Admin only. Update an existing product.
 */
export const updateProduct = async (req, res, next) => {
  try {
    const updates = (({ name, description, price, category, image, stock, isActive }) => ({
      name,
      description,
      price,
      category,
      image,
      stock,
      isActive,
    }))(req.body);

    // strip undefined fields
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:id
 * Admin only. Delete a product.
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted", _id: req.params.id });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/admin/all
 * Admin only. List ALL products (including inactive) for the admin UI.
 */
export const adminListProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
};
