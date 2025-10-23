import React, { useEffect, useState } from "react";
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
import apiConfig from "../config/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const ProductCard = ({ product, onPress, index }) => {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.productCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
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

        <TouchableOpacity style={styles.viewButton} onPress={onPress}>
          <Text style={styles.viewButtonText}>Details</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default function ProductListingScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = new Animated.Value(0);

  useEffect(() => {
    fetchProducts();
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${apiConfig.baseURL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error(error);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      
      <LinearGradient
        colors={["#10B981", "#059669"]}
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

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{products.length}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </View>
        <View style={[styles.statCard, styles.statCardMiddle]}>
          <Text style={styles.statNumber}>
            {products.filter((p) => p.category).length}
          </Text>
          <Text style={styles.statLabel}>Categorized</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {products.filter((p) => p.origin).length}
          </Text>
          <Text style={styles.statLabel}>With Origin</Text>
        </View>
      </View>

      <ScrollView
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
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#10B981",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  statCardMiddle: {
    backgroundColor: "#ECFDF5",
    borderColor: "#D1FAE5",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#10B981",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scrollView: {
    padding: 20,
    paddingBottom: 30,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
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
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
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
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 10,
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
    width: 32,
    height: 32,
    borderRadius: 10,
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
  viewButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    gap: 6,
    shadowColor: "#10B981",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
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
});