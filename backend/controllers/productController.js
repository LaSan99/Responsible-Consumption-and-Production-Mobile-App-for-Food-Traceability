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

// Middleware for handling multiple file uploads (product image + QR code)
const uploadMultiple = upload.fields([
  { name: 'product_image', maxCount: 1 },
  { name: 'qr_code_image', maxCount: 1 }
]);

exports.createProduct = (req, res) => {
  console.log('=== PRODUCT CREATE REQUEST ===');
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.headers['content-type']);
  
  uploadMultiple(req, res, (err) => {
    if (err) {
      console.log('File upload error:', err);
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }

    const { name, batch_code, description, category, origin, harvest_date, expiry_date, qr_code_data } = req.body;
    if (!name || !batch_code) return res.status(400).json({ message: 'Name and batch code required' });

    // Get the uploaded file paths
    const product_image = req.files && req.files.product_image ? req.files.product_image[0].path : null;
    const qr_code_image = req.files && req.files.qr_code_image ? req.files.qr_code_image[0].path : null;
    
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files);
    console.log('Product image path:', product_image);
    console.log('QR code image path:', qr_code_image);
    console.log('QR code data:', qr_code_data);
    console.log('User ID:', req.user ? req.user.id : 'No user');

    Product.create(name, batch_code, description, req.user.id, category, origin, harvest_date, expiry_date, product_image, qr_code_image, qr_code_data, (err) => {
      if (err) {
        console.log('Database error:', err);
        return res.status(500).json({ message: 'Error creating product', error: err });
      }
      console.log('Product created successfully with images:', { product_image, qr_code_image });
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
  console.log('=== PRODUCT UPDATE REQUEST ===');
  console.log('Headers:', req.headers);
  console.log('Product ID:', req.params.id);
  
  uploadMultiple(req, res, (err) => {
    if (err) {
      console.log('File upload error:', err);
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }

    const { name, batch_code, description, category, origin, harvest_date, expiry_date, qr_code_data } = req.body;
    
    if (!name || !batch_code) {
      return res.status(400).json({ message: 'Name and batch code required' });
    }

    // Get the uploaded file paths (only if new files were uploaded)
    const product_image = req.files && req.files.product_image ? req.files.product_image[0].path : undefined;
    const qr_code_image = req.files && req.files.qr_code_image ? req.files.qr_code_image[0].path : undefined;
    
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files);
    console.log('Product image path:', product_image);
    console.log('QR code image path:', qr_code_image);
    console.log('User ID:', req.user ? req.user.id : 'No user');

    Product.update(
      req.params.id, 
      name, 
      batch_code, 
      description, 
      category, 
      origin, 
      harvest_date, 
      expiry_date, 
      product_image, 
      qr_code_image, 
      qr_code_data, 
      (err) => {
        if (err) {
          console.log('Database error:', err);
          return res.status(500).json({ message: 'Error updating product', error: err });
        }
        console.log('Product updated successfully');
        res.json({ message: 'Product updated successfully' });
      }
    );
  });
};

exports.deleteProduct = (req, res) => {
  Product.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting product', error: err });
    res.json({ message: 'Product deleted' });
  });
};
