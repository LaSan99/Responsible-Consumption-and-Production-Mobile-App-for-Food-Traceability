import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Alert,
  Animated,
  RefreshControl,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiConfig from "../config/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const ProductCard = ({ product, onPress, index, userRole, onEdit, onDelete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      Animated.delay(index * 150),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Shimmer effect
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, []);

  const handlePress = () => {
    // Pulse animation on press
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setTimeout(() => onPress(), 150);
  };

  return (
    <Animated.View
      style={[
        styles.productCard,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: Animated.multiply(scaleAnim, pulseAnim) }
          ],
        },
      ]}
    >
      {/* Product Image */}
      {product.product_image && (
        <View style={styles.productImageContainer}>
          <Image 
            source={{ uri: `${apiConfig.baseURL}/${product.product_image.replace(/\\/g, '/')}` }} 
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>
      )}

      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="cube" size={20} color="#10B981" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.productName} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.productBatch}>#{product.batch_code}</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.infoGrid}>
        {product.category && (
          <View style={styles.infoItem}>
            <Ionicons name="pricetag" size={14} color="#8B5CF6" />
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{product.category}</Text>
          </View>
        )}
        {product.origin && (
          <View style={styles.infoItem}>
            <Ionicons name="location" size={14} color="#F59E0B" />
            <Text style={styles.infoLabel}>Origin</Text>
            <Text style={styles.infoValue}>{product.origin}</Text>
          </View>
        )}
      </View>

      {product.description && (
        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>
      )}

      <View style={styles.dateContainer}>
        {product.harvest_date && (
          <View style={styles.dateItem}>
            <Ionicons name="calendar-outline" size={12} color="#6B7280" />
            <Text style={styles.dateText}>Harvested {product.harvest_date}</Text>
          </View>
        )}
        {product.expiry_date && (
          <View style={styles.dateItem}>
            <Ionicons name="time-outline" size={12} color="#EF4444" />
            <Text style={styles.dateText}>Expires {product.expiry_date}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.creatorContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {product.created_by_name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.creatorName} numberOfLines={1}>
            {product.created_by_name}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          {/* Producer-only action buttons */}
          {userRole === 'producer' && (
            <>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit(product);
                }}
              >
                <Ionicons name="create-outline" size={18} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete(product);
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity style={styles.viewButton} onPress={handlePress}>
            <Text style={styles.viewButtonText}>Details</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default function ProductListingScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    categorizedProducts: 0,
    productsWithOrigin: 0,
    recentProducts: 0,
    categoryDistribution: {},
    traceabilityScore: 0
  });
  
  // Animation states
  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadUserRole();
    fetchProducts();
    
    // Start animations
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Background animation
    Animated.loop(
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadUserRole = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.role);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      let response;
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      // If producer: fetch only their products (authenticated)
      // If consumer: fetch all products (public)
      if (user && user.role === 'producer' && token) {
        response = await axios.get(`${apiConfig.baseURL}/products/producer/my-products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await axios.get(`${apiConfig.baseURL}/products`);
      }
      
      const productsData = response.data;
      setProducts(productsData);
      
      // Calculate analytics
      const totalProducts = productsData.length;
      const categorizedProducts = productsData.filter(p => p.category).length;
      const productsWithOrigin = productsData.filter(p => p.origin).length;
      const recentProducts = productsData.filter(p => {
        const createdDate = new Date(p.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate > weekAgo;
      }).length;
      
      // Category distribution
      const categoryDistribution = {};
      productsData.forEach(product => {
        if (product.category) {
          categoryDistribution[product.category] = (categoryDistribution[product.category] || 0) + 1;
        }
      });
      
      // Calculate traceability score
      const traceabilityScore = Math.round(
        ((categorizedProducts + productsWithOrigin) / (totalProducts * 2)) * 100
      );
      
      setAnalytics({
        totalProducts,
        categorizedProducts,
        productsWithOrigin,
        recentProducts,
        categoryDistribution,
        traceabilityScore
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert("Error", "Failed to fetch products");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const goBack = () => {
    if (navigation.goBack) {
      navigation.goBack();
    } else {
      Alert.alert("Navigation", "Going back to previous screen");
    }
  };

  const handleEditProduct = (product) => {
    // Navigate to AddProduct screen with product data for editing
    navigation.navigate('AddProduct', { product });
  };

  const handleDeleteProduct = (product) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`${apiConfig.baseURL}/products/${product.id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert("Success", "Product deleted successfully");
              fetchProducts(); // Refresh the list
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert("Error", "Failed to delete product. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      
      {/* Animated Background Elements */}
      <Animated.View 
        style={[
          styles.backgroundPattern,
          {
            opacity: 0.1,
          },
        ]}
      >
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
        <View style={styles.patternCircle3} />
        <View style={styles.patternCircle4} />
      </Animated.View>
      
      {/* Fixed Header */}
      <LinearGradient
        colors={["#2E7D32", "#4CAF50", "#8BC34A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={22} color="#10B981" />
            </View>
          </TouchableOpacity>
          <View style={styles.headerTextContent}>
            <Text style={styles.headerSubtitle}>Supply Chain</Text>
            <Text style={styles.headerTitle}>Product List</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={["#10B981"]}
          />
        }
      >
        {/* Stats Cards */}
        <Animated.View 
          style={[
            styles.statsContainer,
            {
              opacity: statsAnim,
            },
          ]}
        >
          <View style={styles.statCard}>
            <Ionicons name="cube" size={24} color="#4CAF50" style={styles.statIconTop} />
            <Text style={styles.statNumber}>{analytics.totalProducts}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          
          <View style={[styles.statCard, styles.statCardMiddle]}>
            <Ionicons name="pricetag" size={24} color="#4CAF50" style={styles.statIconTop} />
            <Text style={styles.statNumber}>{analytics.categorizedProducts}</Text>
            <Text style={styles.statLabel}>Categorized</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="location" size={24} color="#4CAF50" style={styles.statIconTop} />
            <Text style={styles.statNumber}>{analytics.productsWithOrigin}</Text>
            <Text style={styles.statLabel}>With Origin</Text>
          </View>
        </Animated.View>

        {/* Analytics Section */}
        <Animated.View 
          style={[
            styles.analyticsContainer,
            {
              opacity: statsAnim,
            },
          ]}
        >
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsIconContainer}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.analyticsNumber}>{analytics.traceabilityScore}%</Text>
              <Text style={styles.analyticsText}>Traceability</Text>
            </View>
            
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsIconContainer}>
                <Ionicons name="trending-up" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.analyticsNumber}>{analytics.recentProducts}</Text>
              <Text style={styles.analyticsText}>Recent</Text>
            </View>
            
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsIconContainer}>
                <Ionicons name="apps" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.analyticsNumber}>
                {Object.keys(analytics.categoryDistribution).length}
              </Text>
              <Text style={styles.analyticsText}>Categories</Text>
            </View>
          </View>
        </Animated.View>

        {/* Products Title */}
        <View style={styles.productsHeader}>
          <Text style={styles.productsTitle}>All Products</Text>
          <Text style={styles.productsCount}>{products.length} items</Text>
        </View>

        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No Products Yet</Text>
            <Text style={styles.emptyStateText}>
              Products will appear here once they're added
            </Text>
          </View>
        ) : (
          products.map((product, index) => (
            <ProductCard
              key={product.id || index}
              product={product}
              index={index}
              userRole={userRole}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onPress={() =>
                navigation.navigate("ProductDetail", { productId: product.id })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    backgroundColor: '#E8F5E9',
  },
  patternCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    top: -80,
    right: -80,
  },
  patternCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(139, 195, 74, 0.12)',
    bottom: -50,
    left: -50,
  },
  patternCircle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    top: '35%',
    right: -20,
  },
  patternCircle4: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    top: '55%',
    left: -20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#10B981",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    marginRight: 12,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  headerTextContent: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 0,
  },
  statIconTop: {
    marginBottom: 8,
  },
  statCardMiddle: {
    backgroundColor: "#F0FDF4",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#10B981",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  scrollView: {
    paddingBottom: 30,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 0,
    overflow: "hidden",
  },
  productImageContainer: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  productBatch: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    fontFamily: "monospace",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  statusText: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },
  infoGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  infoItem: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  infoLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  productDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  dateContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginTop: 12,
  },
  creatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  creatorName: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  viewButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    gap: 6,
    shadowColor: "#10B981",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  statIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyticsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 0,
  },
  analyticsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  analyticsNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4CAF50',
    marginBottom: 4,
  },
  analyticsText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  productsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
});