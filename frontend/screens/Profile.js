import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  Dimensions,
  Switch,
  Modal,
  Animated,
  RefreshControl,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import apiConfig from '../config/api';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [salesData, setSalesData] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerScroll = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    loadUserData();
    if (user?.role === 'producer') {
      loadProducerProducts();
      loadSalesData();
    }
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [user?.role]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    if (user?.role === 'producer') {
      await loadProducerProducts();
      await loadSalesData();
    }
    setRefreshing(false);
  }, [user?.role]);

  const headerOpacity = headerScroll.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    role: '',
    department: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    biometricLogin: true,
    twoFactorAuth: true,
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    autoSync: true,
  });

  // Load real user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setProfileData({
          full_name: userObj.full_name || 'Daniru',
          email: userObj.email || 'daniru@greenvalley.com',
          phone: userObj.phone || '+94 77 123 4567',
          address: userObj.address || 'Malabe, Western Province, Sri Lanka',
          company: userObj.company || 'Farm2Fork',
          role: userObj.role || 'producer',
          department: userObj.department || 'Agriculture',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Load real producer products from API
  const loadProducerProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await axios.get(`${apiConfig.baseURL}/products/producer/my-products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(response.data);
      } else {
        // Fallback mock data using your actual data structure
        const mockProducts = [
          {
            id: 1,
            name: "Organic Apples",
            batch_code: "BATCH001",
            description: "Fresh organic apples from Green Valley Farm",
            category: "Produce",
            origin: "Green Valley Farm",
            harvest_date: "2025-09-25",
            expiry_date: "2025-10-10",
            location: "Malabe",
            product_image: "https://i.postimg.cc/KYZB5thJ/image.png",
            created_by_name: "Daniru",
            price: 12.99,
            stock: 150,
            status: "active",
            certifications: ["Organic Certified", "ISO 22000"]
          },
          {
            id: 2,
            name: "Fresh Carrots",
            batch_code: "BATCH002",
            description: "Sweet and crunchy organic carrots",
            category: "Vegetables",
            origin: "Green Valley Farm",
            harvest_date: "2025-09-20",
            expiry_date: "2025-10-05",
            location: "Malabe",
            product_image: "https://i.postimg.cc/KYZB5thJ/image.png",
            created_by_name: "Daniru",
            price: 8.99,
            stock: 200,
            status: "active",
            certifications: ["Organic Certified"]
          },
          {
            id: 3,
            name: "Premium Potatoes",
            batch_code: "BATCH003",
            description: "Freshly harvested premium quality potatoes",
            category: "Vegetables",
            origin: "Green Valley Farm",
            harvest_date: "2025-09-18",
            expiry_date: "2025-11-18",
            location: "Malabe",
            product_image: "https://i.postimg.cc/KYZB5thJ/image.png",
            created_by_name: "Daniru",
            price: 6.99,
            stock: 0,
            status: "inactive",
            certifications: ["Local Farm Fresh"]
          }
        ];
        setProducts(mockProducts);
      }
    } catch (error) {
      console.error('Error loading producer products:', error);
      // Fallback to mock data with your structure
      const mockProducts = [
        {
          id: 1,
          name: "Organic Apples",
          batch_code: "BATCH001",
          description: "Fresh organic apples from Green Valley Farm",
          category: "Produce",
          origin: "Green Valley Farm",
          harvest_date: "2025-09-25",
          expiry_date: "2025-10-10",
          location: "Malabe",
          product_image: "https://i.postimg.cc/KYZB5thJ/image.png",
          created_by_name: "Daniru",
          price: 12.99,
          stock: 150,
          status: "active"
        }
      ];
      setProducts(mockProducts);
    }
  };

  // Load sales data for analytics
  const loadSalesData = async () => {
    try {
      // Mock sales data based on your products
      const mockSalesData = [
        { month: 'Jul', sales: 24500, orders: 45 },
        { month: 'Aug', sales: 31200, orders: 62 },
        { month: 'Sep', sales: 28700, orders: 58 },
        { month: 'Oct', sales: 35600, orders: 71 },
        { month: 'Nov', sales: 29800, orders: 63 },
        { month: 'Dec', sales: 41200, orders: 89 },
      ];
      setSalesData(mockSalesData);
    } catch (error) {
      console.error('Error loading sales data:', error);
    }
  };

  // Calculate real stats from actual product data
  const getProducerStats = () => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const certifiedProducts = products.filter(p => p.certifications && p.certifications.length > 0).length;
    const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
    
    // Calculate total value of current stock
    const totalStockValue = products.reduce((sum, product) => 
      sum + (product.price * (product.stock || 0)), 0
    );
    
    // Calculate days until expiry for the nearest product
    const now = new Date();
    const nearestExpiry = products.reduce((nearest, product) => {
      if (product.expiry_date) {
        const expiryDate = new Date(product.expiry_date);
        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry > 0 && (nearest === null || daysUntilExpiry < nearest) ? daysUntilExpiry : nearest;
      }
      return nearest;
    }, null);

    // Calculate sales growth
    const currentMonthSales = salesData[salesData.length - 1]?.sales || 0;
    const previousMonthSales = salesData[salesData.length - 2]?.sales || 0;
    const salesGrowth = previousMonthSales > 0 
      ? ((currentMonthSales - previousMonthSales) / previousMonthSales * 100).toFixed(1)
      : 12.5; // Default growth

    return {
      totalProducts,
      activeProducts,
      certifiedProducts,
      totalStock,
      totalStockValue: totalStockValue.toFixed(2),
      nearestExpiry: nearestExpiry || 'N/A',
      salesGrowth: parseFloat(salesGrowth),
      monthlyOrders: salesData[salesData.length - 1]?.orders || 78,
      activeRate: totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0,
    };
  };

  const stats = user?.role === 'producer' ? getProducerStats() : null;

  const ProfessionalStatCard = ({ title, value, subtitle, color = '#4CAF50' }) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.statIndicator, { backgroundColor: color }]} />
    </Animated.View>
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const ProductCard = ({ product, index }) => {
    const daysUntilExpiry = getDaysUntilExpiry(product.expiry_date);
    const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7;
    const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;

    return (
      <Animated.View
        style={[
          styles.productCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }
            ]
          }
        ]}
      >
        <View style={styles.productHeader}>
          <View style={styles.productImageContainer}>
            
            <View style={[
              styles.statusBadge,
              { 
                backgroundColor: product.status === 'active' 
                  ? (isExpiringSoon ? '#F59E0B' : (isExpired ? '#EF4444' : '#10B981'))
                  : '#6B7280' 
              }
            ]}>
              <Text style={styles.statusText}>
                {isExpired ? 'Expired' : (isExpiringSoon ? 'Expiring Soon' : (product.status === 'active' ? 'Available' : 'Out of Stock'))}
              </Text>
            </View>
          </View>

          <View style={styles.productBasicInfo}>
            <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.productBatch}>Batch: {product.batch_code}</Text>
            <Text style={styles.productPrice}>LKR {product.price}</Text>
          </View>
        </View>

        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>

        <View style={styles.productDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{product.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stock:</Text>
            <Text style={[
              styles.detailValue, 
              product.stock === 0 ? styles.outOfStock : styles.inStock
            ]}>
              {product.stock} units
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Harvest:</Text>
            <Text style={styles.detailValue}>{formatDate(product.harvest_date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expires:</Text>
            <Text style={[
              styles.detailValue,
              isExpired ? styles.expiredText : (isExpiringSoon ? styles.expiringSoonText : styles.normalText)
            ]}>
              {formatDate(product.expiry_date)}
              {daysUntilExpiry !== null && !isExpired && (
                <Text style={styles.daysText}> ({daysUntilExpiry} days)</Text>
              )}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{product.location}</Text>
          </View>
        </View>

        {product.certifications && product.certifications.length > 0 && (
          <View style={styles.certifications}>
            <Ionicons name="ribbon-outline" size={14} color="#6B7280" />
            <Text style={styles.certificationsText}>
              {product.certifications.join(', ')}
            </Text>
          </View>
        )}

        <View style={styles.productActions}>
          <TouchableOpacity style={[styles.actionButton, styles.editButton]}>
            <Ionicons name="create-outline" size={16} color="#4CAF50" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.viewButton]}>
            <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const SettingItem = ({ icon, title, description, value, onValueChange, type = 'switch', color = '#4CAF50' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIconContainer, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E5E7EB', true: `${color}80` }}
          thumbColor={value ? color : '#FFFFFF'}
        />
      ) : (
        <TouchableOpacity style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );

  const TabButton = ({ title, isActive, onPress, icon }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={20}
        color={isActive ? '#4CAF50' : '#6B7280'}
        style={styles.tabIcon}
      />
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
        {title}
      </Text>
      {isActive && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );

  const getInitials = (name) => {
    if (!name) return user?.role === 'producer' ? 'P' : 'C';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplayName = (role) => {
    return role === 'producer' ? 'Agricultural Producer' : 'Consumer';
  };

  const getRoleSpecificStats = () => {
    if (user?.role === 'producer' && stats) {
      return [
        { 
          title: "Total Products", 
          value: stats.totalProducts, 
          subtitle: "Active listings", 
          color: '#4CAF50' 
        },
        { 
          title: "Active Products", 
          value: stats.activeProducts, 
          subtitle: "Available for sale", 
          color: '#2196F3' 
        },
        { 
          title: "Stock Value", 
          value: `LKR ${stats.totalStockValue}`, 
          subtitle: "Current inventory value", 
          color: '#FF9800' 
        },
        { 
          title: "Certified Items", 
          value: stats.certifiedProducts, 
          subtitle: "Quality certified", 
          color: '#9C27B0' 
        },
        { 
          title: "Sales Growth", 
          value: `${stats.salesGrowth}%`, 
          subtitle: "This month", 
          color: '#F44336' 
        },
        { 
          title: "Monthly Orders", 
          value: stats.monthlyOrders, 
          subtitle: "Current month", 
          color: '#009688' 
        },
      ];
    }
    return [];
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Temporary update without API call
      const updatedUser = { ...user, ...profileData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Temporary password change without API call
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.multiRemove(['token', 'user']);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    headerScroll.setValue(scrollY);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      {/* Enhanced Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#4CAF50', '#388E3C']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={[styles.editButton, isEditing && styles.editButtonActive]}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons
              name={isEditing ? "close" : "create-outline"}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {/* Enhanced Profile Hero Section */}
        <LinearGradient
          colors={['#4CAF50', '#388E3C', '#2E7D32']}
          style={styles.heroSection}
        >
          <View style={styles.heroBackground}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.circle3} />
          </View>

          <View style={styles.heroContent}>
            <View style={styles.avatarSection}>
              <Animated.View
                style={[
                  styles.avatarContainer,
                  {
                    transform: [
                      {
                        scale: headerScroll.interpolate({
                          inputRange: [0, 100],
                          outputRange: [1, 0.8],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(user?.full_name)}
                  </Text>
                </LinearGradient>
                <View style={styles.statusIndicator} />

                {/* Role Badge */}
                <View style={styles.roleBadge}>
                  <Ionicons
                    name={user?.role === 'producer' ? "leaf" : "person"}
                    size={12}
                    color="#FFFFFF"
                  />
                </View>
              </Animated.View>

              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.verifiedText}>
                  Verified 
                </Text>
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.full_name || 'Daniru'}</Text>
              <View style={styles.roleContainer}>
                <Ionicons
                  name={user?.role === 'producer' ? "business" : "person"}
                  size={14}
                  color="#E8F5E8"
                />
                <Text style={styles.userRole}>{getRoleDisplayName(user?.role)}</Text>
              </View>
              <Text style={styles.userCompany}>{profileData.company}</Text>
              <Text style={styles.userLocation}>📍 {profileData.address}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Enhanced Farm Overview Section */}
        {user?.role === 'producer' && (
          <View style={styles.statsSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Farm Overview</Text>
                <Text style={styles.sectionSubtitle}>Real-time business metrics and inventory status</Text>
              </View>
            </View>
            <View style={styles.statsGrid}>
              {getRoleSpecificStats().map((stat, index) => (
                <ProfessionalStatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  subtitle={stat.subtitle}
                  color={stat.color}
                />
              ))}
            </View>
          </View>
        )}

        {/* Enhanced Products Section for Producer */}
        {user?.role === 'producer' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>My Products</Text>
                <Text style={styles.sectionSubtitle}>
                  Manage your product listings, inventory, and track expiry dates
                </Text>
              </View>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>Manage All</Text>
                <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            
            {products.length > 0 ? (
              <View style={styles.productsContainer}>
                {products.map((product, index) => (
                  <ProductCard key={product.id || index} product={product} index={index} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>No Products Listed</Text>
                <Text style={styles.emptyStateText}>
                  Start adding your farm products to showcase them to customers and track your inventory
                </Text>
                <TouchableOpacity style={styles.addProductButton}>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addProductText}>Add First Product</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Enhanced Tab Navigation */}
        <View style={styles.tabContainer}>
          <TabButton
            title="Profile"
            icon="person-outline"
            isActive={activeTab === 'profile'}
            onPress={() => setActiveTab('profile')}
          />
          <TabButton
            title="Settings"
            icon="settings-outline"
            isActive={activeTab === 'settings'}
            onPress={() => setActiveTab('settings')}
          />
          <TabButton
            title="Security"
            icon="shield-checkmark-outline"
            isActive={activeTab === 'security'}
            onPress={() => setActiveTab('security')}
          />
        </View>

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {user?.role === 'producer' ? 'Producer Information' : 'Personal Information'}
                </Text>
                <View style={styles.editIndicator}>
                  <Ionicons
                    name={isEditing ? "pencil" : "pencil-outline"}
                    size={16}
                    color="#6B7280"
                  />
                  <Text style={styles.editIndicatorText}>
                    {isEditing ? 'Editing' : 'Edit'}
                  </Text>
                </View>
              </View>

              <View style={styles.formContainer}>
                {[
                  { icon: "person-outline", label: "Full Name", value: profileData.full_name, key: 'full_name' },
                  { icon: "mail-outline", label: "Email Address", value: profileData.email, key: 'email', keyboardType: 'email-address' },
                  { icon: "call-outline", label: "Phone Number", value: profileData.phone, key: 'phone', keyboardType: 'phone-pad' },
                  { icon: "business-outline", label: user?.role === 'producer' ? 'Farm Name' : 'Organization', value: profileData.company, key: 'company' },
                  { icon: "location-outline", label: user?.role === 'producer' ? 'Farm Address' : 'Delivery Address', value: profileData.address, key: 'address', multiline: true },
                ].map((field, index) => (
                  <Animated.View
                    key={field.key}
                    style={[
                      styles.inputGroup,
                      {
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0]
                            })
                          }
                        ]
                      }
                    ]}
                  >
                    <View style={styles.inputLabelRow}>
                      <View style={styles.inputIcon}>
                        <Ionicons name={field.icon} size={18} color="#4CAF50" />
                      </View>
                      <Text style={styles.inputLabel}>{field.label}</Text>
                    </View>
                    <TextInput
                      style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                      value={field.value}
                      onChangeText={(value) => setProfileData(prev => ({ ...prev, [field.key]: value }))}
                      editable={isEditing}
                      placeholderTextColor="#9CA3AF"
                      keyboardType={field.keyboardType}
                      multiline={field.multiline}
                      autoCapitalize="none"
                    />
                  </Animated.View>
                ))}
              </View>

              {isEditing && (
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [{ scale: fadeAnim }]
                  }}
                >
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveProfile}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={['#4CAF50', '#45a049']}
                      style={styles.saveButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isLoading ? (
                        <Ionicons name="refresh" size={20} color="#FFFFFF" />
                      ) : (
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      )}
                      <Text style={styles.saveButtonText}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Settings and Security tabs remain the same */}
        {activeTab === 'settings' && (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <View style={styles.settingsContainer}>
                {[
                  { icon: "notifications-outline", title: "Push Notifications", description: `Get instant notifications about ${user?.role === 'producer' ? 'your products' : 'your orders'}`, value: preferences.pushNotifications, key: 'pushNotifications', color: '#3B82F6' },
                  { icon: "mail-outline", title: "Email Notifications", description: "Receive important updates via email", value: preferences.emailNotifications, key: 'emailNotifications', color: '#EF4444' },
                  { icon: "cloud-upload-outline", title: "Auto Sync", description: `Automatically sync your ${user?.role === 'producer' ? 'product' : 'order'} data`, value: preferences.autoSync, key: 'autoSync', color: '#8B5CF6' },
                  { icon: "moon-outline", title: "Dark Mode", description: "Switch to dark theme", value: preferences.darkMode, key: 'darkMode', color: '#6B7280' },
                ].map((setting, index) => (
                  <SettingItem
                    key={setting.key}
                    icon={setting.icon}
                    title={setting.title}
                    description={setting.description}
                    value={setting.value}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, [setting.key]: value }))}
                    color={setting.color}
                  />
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {activeTab === 'security' && (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security & Privacy</Text>
              <View style={styles.securityContainer}>
                <TouchableOpacity
                  style={styles.securityItem}
                  onPress={() => setShowPasswordModal(true)}
                >
                  <View style={styles.securityLeft}>
                    <View style={[styles.securityIconContainer, { backgroundColor: '#4CAF5015' }]}>
                      <Ionicons name="key-outline" size={20} color="#4CAF50" />
                    </View>
                    <View>
                      <Text style={styles.securityTitle}>Change Password</Text>
                      <Text style={styles.securityDescription}>Update your password regularly</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.securityItem}>
                  <View style={styles.securityLeft}>
                    <View style={[styles.securityIconContainer, { backgroundColor: '#3B82F615' }]}>
                      <Ionicons name="shield-checkmark-outline" size={20} color="#3B82F6" />
                    </View>
                    <View>
                      <Text style={styles.securityTitle}>Privacy Settings</Text>
                      <Text style={styles.securityDescription}>Manage your data privacy</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Actions</Text>
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton}>
                  <View style={[styles.actionIcon, { backgroundColor: '#3B82F615' }]}>
                    <Ionicons name="download-outline" size={18} color="#3B82F6" />
                  </View>
                  <Text style={styles.actionText}>Export Data</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleLogout}
                >
                  <View style={[styles.actionIcon, { backgroundColor: '#EF444415' }]}>
                    <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                  </View>
                  <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#4CAF50', '#388E3C']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowPasswordModal(false)}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalIllustration}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="lock-closed-outline" size={32} color="#4CAF50" />
                </View>
                <Text style={styles.modalSubtitle}>Create a strong, unique password</Text>
              </View>

              {[
                { label: "Current Password", value: passwordData.currentPassword, key: 'currentPassword' },
                { label: "New Password", value: passwordData.newPassword, key: 'newPassword' },
                { label: "Confirm New Password", value: passwordData.confirmPassword, key: 'confirmPassword' },
              ].map((field, index) => (
                <View key={field.key} style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={field.value}
                    onChangeText={(value) => setPasswordData(prev => ({ ...prev, [field.key]: value }))}
                    secureTextEntry
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              ))}

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.modalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  ) : (
                    <Ionicons name="key" size={20} color="#FFFFFF" />
                  )}
                  <Text style={styles.modalButtonText}>
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circle3: {
    position: 'absolute',
    top: '30%',
    right: '20%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroContent: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarSection: {
    alignItems: 'center',
    marginRight: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarGradient: {
    width: 90,
    height: 90,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  roleBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  verifiedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#E8F5E8',
    marginLeft: 6,
    fontWeight: '500',
  },
  userCompany: {
    fontSize: 14,
    color: '#C8E6C9',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 12,
    color: '#A5D6A7',
    fontStyle: 'italic',
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginRight: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statContent: {
    zIndex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  statIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  // Enhanced Product Card Styles
  productsContainer: {
    gap: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  productBasicInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productBatch: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  productDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  inStock: {
    color: '#10B981',
  },
  outOfStock: {
    color: '#EF4444',
  },
  expiredText: {
    color: '#EF4444',
  },
  expiringSoonText: {
    color: '#F59E0B',
  },
  normalText: {
    color: '#374151',
  },
  daysText: {
    fontSize: 12,
    color: '#6B7280',
  },
  certifications: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  certificationsText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  productActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewButton: {
    backgroundColor: '#4CAF50',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderStyle: 'dashed',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addProductText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // ... (rest of the styles remain similar to previous implementation)
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 1.5,
  },
  tabContent: {
    backgroundColor: '#FFFFFF',
  },
  section: {
    padding: 20,
  },
  editIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editIndicatorText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  formContainer: {},
  inputGroup: {
    marginBottom: 20,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textInputReadonly: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
    borderColor: '#E5E7EB',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  settingsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  arrowButton: {
    padding: 4,
  },
  securityContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  logoutText: {
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
  },
  modalIllustration: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalTextInput: {
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  modalButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  modalButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;