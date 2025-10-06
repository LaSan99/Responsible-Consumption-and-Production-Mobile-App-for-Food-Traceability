const Product = require('../models/productModel');

exports.createProduct = (req, res) => {
  const { name, batch_code, description } = req.body;
  if (!name || !batch_code) return res.status(400).json({ message: 'Name and batch code required' });

  Product.create(name, batch_code, description, req.user.id, (err) => {
    if (err) return res.status(500).json({ message: 'Error creating product', error: err });
    res.json({ message: 'Product created' });
  });
};

exports.getProducts = (req, res) => {
  Product.getAll((err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching products' });
    res.json(results);
  });
};

exports.getProductById = (req, res) => {
  Product.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching product' });
    if (results.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(results[0]);
  });
};

exports.getProductsByProducer = (req, res) => {
  Product.getByProducer(req.user.id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching producer products' });
    res.json(results);
  });
};

exports.updateProduct = (req, res) => {
  const { name, batch_code, description } = req.body;
  Product.update(req.params.id, name, batch_code, description, (err) => {
    if (err) return res.status(500).json({ message: 'Error updating product', error: err });
    res.json({ message: 'Product updated' });
  });
};

exports.deleteProduct = (req, res) => {
  Product.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting product', error: err });
    res.json({ message: 'Product deleted' });
  });
};
