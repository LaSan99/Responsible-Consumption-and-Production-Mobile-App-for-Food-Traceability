import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Animated,
  RefreshControl,
  StatusBar,
  Image,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiConfig from '../config/api';

const { width, height } = Dimensions.get('window');

// Sample farmer images - Replace with your actual images
const FARMER_IMAGES = [
  {
    id: '1',
    image: 'https://i.postimg.cc/2yJ55ZWF/image.png',
    title: 'Organic Farming',
    subtitle: 'Sustainable agriculture practices'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&q=80',
    title: 'Fresh Harvest',
    subtitle: 'Daily fresh produce collection'
  },
  {
    id: '3',
    image: 'https://i.postimg.cc/mZ1FFLdn/image.png',
    title: 'Quality Control',
    subtitle: 'Rigorous quality checks'
  },
  {
    id: '4',
    image: 'https://i.postimg.cc/9f9v7q7M/image.png',
    title: 'Farm to Table',
    subtitle: 'Direct from our farms to you'
  }
];

export default function ProducerProfile({ navigation }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // New state for all products
  const [refreshing, setRefreshing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const imageSliderRef = useRef(null);

  useEffect(() => {
    loadUserData();
    loadProducerProducts();
    loadAllProducts(); // Load all products on component mount
    startImageSlider();
  }, []);

  // Auto-slide images with slower speed (6 seconds)
  const startImageSlider = () => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => 
        prevIndex === FARMER_IMAGES.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000); // Changed from 4000 to 6000 for slower slides
    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (imageSliderRef.current) {
      imageSliderRef.current.scrollToIndex({
        index: currentImageIndex,
        animated: true,
      });
    }
  }, [currentImageIndex]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadUserData(), loadProducerProducts(), loadAllProducts()]);
    setRefreshing(false);
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadProducerProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${apiConfig.baseURL}/products/producer/my-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading producer products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // New function to load all products
  const loadAllProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${apiConfig.baseURL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllProducts(response.data);
    } catch (error) {
      console.error('Error loading all products:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['token', 'user']);
          },
        },
      ]
    );
  };

  const navigateToAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const navigateToManageProducts = () => {
    navigation.navigate('Products');
  };

  const navigateToSupplyChain = () => {
    if (products.length === 0) {
      Alert.alert(
        'No Products',
        'You need to add products first before managing blockchain stages.',
        [{ text: 'Add Product', onPress: navigateToAddProduct }]
      );
      return;
    }
    
    if (products.length === 1) {
      navigation.navigate('BlockchainStages', {
        productId: products[0].id,
        productName: products[0].name
      });
    } else {
      Alert.alert(
        'Select Product',
        'Choose a product to manage its blockchain stages:',
        [
          ...products.slice(0, 3).map(product => ({
            text: product.name,
            onPress: () => navigation.navigate('BlockchainStages', {
              productId: product.id,
              productName: product.name
            })
          })),
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  // Animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [300, 200], // Reduced height since profile is moved down
    extrapolate: 'clamp',
  });

  const imageSliderOpacity = scrollY.interpolate({
    inputRange: [0, 80, 150],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 150],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 80, 150],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [20, 0],
    extrapolate: 'clamp',
  });

  const renderImageItem = ({ item, index }) => (
    <View style={styles.imageSlide}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.sliderImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.imageOverlay}
      >
        <View style={styles.imageTextContainer}>
          <Text style={styles.imageTitle}>{item.title}</Text>
          <Text style={styles.imageSubtitle}>{item.subtitle}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const onImageScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentImageIndex(roundIndex);
  };

  // Function to calculate time ago
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      {/* Fixed Header with Logout ONLY */}
      <Animated.View style={[styles.fixedHeader, { opacity: titleOpacity }]}>
        <View style={styles.headerContent}>
          <Animated.Text 
            style={[
              styles.headerTitle,
              { 
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }]
              }
            ]}
          >
            Profile
          </Animated.Text>
          <TouchableOpacity 
            style={styles.logoutButtonHeader}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView 
        ref={flatListRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {/* Image Slider Section - Clean without profile */}
        <Animated.View 
          style={[
            styles.imageSliderSection, 
            { 
              height: headerHeight,
              opacity: imageSliderOpacity 
            }
          ]}
        >
          <FlatList
            ref={imageSliderRef}
            data={FARMER_IMAGES}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onImageScroll}
            style={styles.imageSlider}
          />
          
          {/* Image Pagination Dots */}
          <View style={styles.paginationContainer}>
            {FARMER_IMAGES.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paginationDot,
                  currentImageIndex === index && styles.paginationDotActive
                ]}
                onPress={() => {
                  setCurrentImageIndex(index);
                  imageSliderRef.current?.scrollToIndex({ index, animated: true });
                }}
              />
            ))}
          </View>
        </Animated.View>

        {/* Profile Section - Moved below slideshow */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#fff', '#f5f5f5']}
                  style={styles.avatarGradient}
                >
                  <Ionicons name="person" size={36} color="#4CAF50" />
                </LinearGradient>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                </View>
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.welcomeText}>Welcome back! 👋</Text>
                <Text style={styles.nameText}>{user?.full_name || 'Producer'}</Text>
                <View style={styles.roleBadge}>
                  <Ionicons name="leaf" size={14} color="#fff" />
                  <Text style={styles.roleText}>Certified Producer</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats Card */}
        <Animated.View 
          style={[
            styles.statsCardContainer,
            { opacity: headerOpacity }
          ]}
        >
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="cube-outline" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.statNumber}>{products.length}</Text>
              <Text style={styles.statLabel}>My Products</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, styles.ordersIcon]}>
                <Ionicons name="trending-up-outline" size={20} color="#FF9800" />
              </View>
              <Text style={styles.statNumber}>{allProducts.length}</Text>
              <Text style={styles.statLabel}>All Products</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, styles.certIcon]}>
                <Ionicons name="ribbon-outline" size={20} color="#2196F3" />
              </View>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Certifications</Text>
            </View>
          </View>
        </Animated.View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Quick Actions Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.sectionDecoration}>
              <View style={styles.decorationDot} />
              <View style={styles.decorationDot} />
              <View style={styles.decorationDot} />
            </View>
          </View>
          
          <View style={styles.actionsGrid}>
            {[
              {
                title: 'Add Product',
                subtitle: 'New listing',
                icon: 'add-circle-outline',
                colors: ['#4CAF50', '#45a049'],
                onPress: navigateToAddProduct
              },
              {
                title: 'Manage',
                subtitle: 'Your products',
                icon: 'cube-outline',
                colors: ['#2196F3', '#1976D2'],
                onPress: navigateToManageProducts
              },
              {
                title: 'Blockchain',
                subtitle: 'Supply chain',
                icon: 'git-network-outline',
                colors: ['#FF9800', '#F57C00'],
                onPress: navigateToSupplyChain
              },
              {
                title: 'Certificates',
                subtitle: 'Manage',
                icon: 'ribbon-outline',
                colors: ['#9C27B0', '#7B1FA2'],
                onPress: () => {
                  if (products.length === 0) {
                    Alert.alert(
                      'No Products',
                      'You need to add products first before managing certifications.',
                      [{ text: 'Add Product', onPress: navigateToAddProduct }]
                    );
                    return;
                  }
                  
                  if (products.length === 1) {
                    navigation.navigate('ProductCertificationManagement', {
                      productId: products[0].id,
                      productName: products[0].name
                    });
                  } else {
                    Alert.alert(
                      'Select Product',
                      'Choose a product to manage its certifications:',
                      [
                        ...products.slice(0, 3).map(product => ({
                          text: product.name,
                          onPress: () => navigation.navigate('ProductCertificationManagement', {
                            productId: product.id,
                            productName: product.name
                          })
                        })),
                        { text: 'Cancel', style: 'cancel' }
                      ]
                    );
                  }
                }
              }
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionItem}
                onPress={action.onPress}
              >
                <LinearGradient
                  colors={action.colors}
                  style={styles.actionIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={action.icon} size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Products Section - Now showing ALL products */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Products</Text>
              {allProducts.length > 0 && (
                <TouchableOpacity 
                  style={styles.seeAllButton}
                  onPress={() => navigation.navigate('AllProducts')}
                >
                  <Text style={styles.seeAllText}>View All</Text>
                  <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
                </TouchableOpacity>
              )}
            </View>

            {allProducts.length > 0 ? (
              <View style={styles.productsList}>
                {allProducts.slice(0, 5).map((product, index) => (
                  <TouchableOpacity 
                    key={product.id} 
                    style={styles.productCard}
                    onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                  >
                    <View style={styles.productHeader}>
                      <View style={styles.productIcon}>
                        <Ionicons name="cube" size={20} color="#4CAF50" />
                      </View>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productCategory}>
                          {product.category || 'No category'}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, styles.activeStatus]}>
                        <Ionicons name="ellipse" size={8} color="#4CAF50" />
                        <Text style={styles.statusText}>
                          {product.status || 'Active'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.productDetails}>
                      <View style={styles.detailItem}>
                        <Ionicons name="barcode-outline" size={14} color="#666" />
                        <Text style={styles.detailText}>
                          Batch: {product.batch_code || 'N/A'}
                        </Text>
                      </View>
                      {product.origin && (
                        <View style={styles.detailItem}>
                          <Ionicons name="location-outline" size={14} color="#666" />
                          <Text style={styles.detailText}>{product.origin}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.productFooter}>
                      <View style={styles.footerItem}>
                        <Text style={styles.footerLabel}>Producer</Text>
                        <Text style={styles.footerValue}>
                          {product.producer_name || user?.full_name || 'Unknown'}
                        </Text>
                      </View>
                      <View style={styles.footerDivider} />
                      <View style={styles.footerItem}>
                        <Text style={styles.footerLabel}>Created</Text>
                        <Text style={styles.footerValue}>
                          {product.created_at ? getTimeAgo(product.created_at) : 'Unknown'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="cube-outline" size={64} color="#e0e0e0" />
                </View>
                <Text style={styles.emptyTitle}>No products available</Text>
                <Text style={styles.emptySubtitle}>
                  There are no products in the system yet. Be the first to add one!
                </Text>
                <TouchableOpacity 
                  style={styles.addFirstProductButton}
                  onPress={navigateToAddProduct}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.addFirstProductText}>Add First Product</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#4CAF50',
    zIndex: 1000,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'System',
  },
  logoutButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'System',
  },
  // Image Slider Styles
  imageSliderSection: {
    position: 'relative',
  },
  imageSlider: {
    width: width,
    height: '100%',
  },
  imageSlide: {
    width: width,
    height: '100%',
    position: 'relative',
  },
  sliderImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    padding: 20,
  },
  imageTextContainer: {
    marginBottom: 30,
  },
  imageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'System',
    marginBottom: 4,
  },
  imageSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'System',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: '#fff',
  },
  // Profile Section - Moved below slideshow
  profileSection: {
    paddingHorizontal: 20,
    marginTop: -40, // Overlap slightly with the image slider
    zIndex: 5,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'System',
    fontWeight: '500',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    fontFamily: 'System',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'System',
  },
  statsCardContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    zIndex: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  ordersIcon: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  certIcon: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'System',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'System',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  content: {
    padding: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'System',
  },
  sectionDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  decorationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginHorizontal: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionItem: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    fontFamily: 'System',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'System',
  },
  recentSection: {
    marginBottom: 30,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    fontFamily: 'System',
    marginRight: 4,
  },
  productsList: {
    gap: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'System',
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontFamily: 'System',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  activeStatus: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'System',
  },
  productDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'System',
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'System',
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'System',
  },
  footerDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#f0f0f0',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    fontFamily: 'System',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'System',
    lineHeight: 20,
  },
  addFirstProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addFirstProductText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
  bottomSpacing: {
    height: 30,
  },
});