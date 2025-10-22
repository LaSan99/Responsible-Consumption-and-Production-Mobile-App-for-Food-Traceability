const Product = require('../models/productModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware for handling single file upload
const uploadSingle = upload.single('product_image');

exports.createProduct = (req, res) => {
  console.log('=== PRODUCT CREATE REQUEST ===');
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.headers['content-type']);
  
  uploadSingle(req, res, (err) => {
    if (err) {
      console.log('File upload error:', err);
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }

    const { name, batch_code, description, category, origin, harvest_date, expiry_date } = req.body;
    if (!name || !batch_code) return res.status(400).json({ message: 'Name and batch code required' });

    // Get the uploaded file path if exists
    const product_image = req.file ? req.file.path : null;
    
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    console.log('Product image path:', product_image);
    console.log('User ID:', req.user ? req.user.id : 'No user');

    Product.create(name, batch_code, description, req.user.id, category, origin, harvest_date, expiry_date, product_image, (err) => {
      if (err) {
        console.log('Database error:', err);
        return res.status(500).json({ message: 'Error creating product', error: err });
      }
      console.log('Product created successfully with image:', product_image);
      res.json({ message: 'Product created successfully' });
    });
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
