const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const supplyChain = require('./routes/supplyChainRoutes');
const certification = require('./routes/certificationRoutes');
const contactRoutes = require('./routes/contactRoutes');

dotenv.config();
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/supply-chain', supplyChain);
app.use('/cert', certification);
app.use('/contact', contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
