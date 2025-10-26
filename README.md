# 🌱 Responsible Consumption and Production Mobile App for Food Traceability

[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0.0-black.svg)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-orange.svg)](https://mysql.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

A comprehensive mobile application designed to promote responsible consumption and production through complete food traceability. This app enables consumers to track food products from farm to table while providing producers with tools to manage their supply chain and certifications.

## 📱 Features

### 🔍 **Consumer Features**
- **Product Scanning**: QR code scanning to instantly access product information
- **Complete Traceability**: Track products from origin to current location
- **Supply Chain Visualization**: Interactive maps showing product journey
- **Certification Verification**: View and verify product certifications
- **Producer Information**: Find and contact farmers/producers
- **Weather Data**: Historical weather information during production
- **Product Search**: Advanced search functionality across all products

### 🚜 **Producer Features**
- **Product Management**: Add, edit, and manage product listings
- **Supply Chain Tracking**: Add stages and track product journey
- **Certification Management**: Upload and manage product certifications
- **Analytics Dashboard**: Comprehensive analytics and insights
- **QR Code Generation**: Generate QR codes for products
- **Image Upload**: Product image management with cloud storage

### 🔐 **Security & Authentication**
- **Role-based Access**: Separate interfaces for consumers and producers
- **JWT Authentication**: Secure token-based authentication
- **Data Encryption**: Secure data transmission and storage
- **User Profiles**: Comprehensive user profile management

## 🏗️ Architecture

### **Frontend (React Native + Expo)**
```
frontend/
├── screens/           # Application screens
├── context/           # React context providers
├── config/            # API configuration
├── assets/            # Images and static assets
└── components/        # Reusable UI components
```

### **Backend (Node.js + Express)**
```
backend/
├── controllers/       # Business logic controllers
├── models/           # Database models
├── routes/           # API route definitions
├── middleware/       # Authentication & validation
├── migrations/       # Database schema migrations
└── uploads/          # File upload storage
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL Database
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio / Xcode (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/food-traceability-app.git
   cd food-traceability-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Run database migrations
   mysql -u your_username -p your_database < migrations/create_tables.sql
   
   # Start the server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start the Expo development server
   npm start
   ```

4. **Mobile App Installation**
   ```bash
   # Install Expo Go app on your mobile device
   # Scan the QR code from the terminal
   # Or run on simulator/emulator
   npm run android  # for Android
   npm run ios       # for iOS
   ```

## 🗄️ Database Schema

### Core Tables
- **users**: User authentication and profile data
- **products**: Product information and metadata
- **supply_chain_stages**: Product journey tracking
- **certifications**: Product certifications and documents
- **contacts**: Producer contact information

### Key Relationships
- Users can have multiple products (1:many)
- Products can have multiple supply chain stages (1:many)
- Products can have multiple certifications (1:many)

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

### Products
- `GET /products` - Get all products (public)
- `GET /products/producer/my-products` - Get producer's products
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Supply Chain
- `GET /supply-chain/:productId` - Get product supply chain
- `POST /supply-chain` - Add supply chain stage
- `PUT /supply-chain/:id` - Update supply chain stage

### Certifications
- `GET /cert/:productId` - Get product certifications
- `POST /cert` - Add certification
- `PUT /cert/:id` - Update certification

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=food_traceability
JWT_SECRET=your_jwt_secret
UPLOAD_PATH=./uploads
```

### API Configuration
Update `frontend/config/api.js` with your backend URL:

```javascript
export default {
  baseURL: 'http://your-backend-url:5000'
};
```

## 📱 Mobile App Features

### Screens Overview
- **SplashScreen**: App initialization and loading
- **LoginScreen/RegisterScreen**: User authentication
- **HomeScreen**: Dashboard with quick access to features
- **ProductListingScreen**: Browse and search products
- **Scanner**: QR code scanning functionality
- **ProductDetailScreen**: Detailed product information
- **SupplyChainMap**: Interactive supply chain visualization
- **Profile**: User profile management

### Key Components
- **Animated Product Cards**: Smooth animations and transitions
- **Search Functionality**: Real-time product search
- **Image Upload**: Camera and gallery integration
- **Maps Integration**: Location-based features
- **QR Code Scanner**: Barcode scanning capabilities

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Green-themed design promoting sustainability
- **Typography**: Clean, readable fonts with proper hierarchy
- **Animations**: Smooth transitions and micro-interactions
- **Responsive Design**: Optimized for various screen sizes

### User Experience
- **Intuitive Navigation**: Bottom tab navigation for consumers
- **Role-based Interface**: Different layouts for consumers vs producers
- **Offline Support**: Cached data for offline functionality
- **Accessibility**: Screen reader support and proper contrast

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for users
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Secure file handling and storage
- **CORS Configuration**: Proper cross-origin resource sharing

## 📊 Analytics & Insights

### Producer Analytics
- Total products count
- Categorized products tracking
- Products with origin information
- Recent products added
- Category distribution
- Traceability score calculation

### Consumer Insights
- Product search analytics
- Popular products tracking
- Supply chain transparency metrics

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment
1. Set up production database
2. Configure environment variables
3. Deploy to cloud platform (Heroku, AWS, etc.)
4. Set up file storage for uploads

### Mobile App Deployment
1. Build production APK/IPA
2. Submit to app stores
3. Configure push notifications
4. Set up analytics tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** - For the amazing React Native development platform
- **React Navigation** - For seamless navigation solutions
- **MySQL Community** - For robust database support
- **Open Source Community** - For the incredible libraries and tools

## 📞 Support

For support and questions:
- 📧 Email: support@foodtraceability.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/food-traceability-app/issues)
- 📖 Documentation: [Wiki](https://github.com/your-username/food-traceability-app/wiki)

## 🔮 Future Enhancements

- [ ] Blockchain integration for immutable records
- [ ] IoT sensor data integration
- [ ] Machine learning for quality prediction
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Social sharing features
- [ ] Push notifications
- [ ] Offline mode improvements

---

**Made with ❤️ for sustainable food systems and responsible consumption**
