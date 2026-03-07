import { Product } from '../models/index.js';

export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { category } : {};
    const products = await Product.findAll({ where });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { product_name, price, category, stock } = req.body;

    if (!product_name || !price || !category || stock === undefined) {
      return res.status(400).json({ error: 'product_name, price, category, and stock are required' });
    }
    if (price <= 0)  return res.status(400).json({ error: 'Price must be greater than 0' });
    if (stock < 0)   return res.status(400).json({ error: 'Stock cannot be negative' });

    const product = await Product.create({ product_name, price, category, stock });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors.map(e => e.message) });
    }
    console.error('addProduct error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ error: 'Valid stock value (>= 0) is required' });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await product.update({ stock });
    res.json({ success: true, data: product });
  } catch (err) {
    console.error('updateStock error:', err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
};