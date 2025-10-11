import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import axios from 'axios';
import apiConfig from "../config/api";

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${apiConfig.baseURL}/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>📦</Text>
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.errorText}>The product you're looking for doesn't exist</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {product.image && !imageError ? (
          <Image 
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderIcon}>📦</Text>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Product Name */}
        <Text style={styles.title}>{product.name}</Text>

        {/* Batch Code Badge */}
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Batch Code</Text>
            <Text style={styles.badgeValue}>{product.batch_code}</Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.description || 'No description available'}
          </Text>
        </View>

        {/* Product Details Cards */}
        {product.manufacturer && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Manufacturer</Text>
            <Text style={styles.infoValue}>{product.manufacturer}</Text>
          </View>
        )}

        {product.category && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{product.category}</Text>
          </View>
        )}

        {product.sku && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>SKU</Text>
            <Text style={styles.infoValue}>{product.sku}</Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={styles.certButton}
          onPress={() => navigation.navigate('ProductCertifications', { productId })}
        >
          <Text style={styles.certButtonText}>View Certifications</Text>
          <Text style={styles.certButtonIcon}>→</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280'
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24
  },
  backButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  imageContainer: {
    width: width,
    height: 300,
    backgroundColor: '#e5e7eb'
  },
  productImage: {
    width: '100%',
    height: '100%'
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb'
  },
  placeholderIcon: {
    fontSize: 72,
    marginBottom: 8
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500'
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16
  },
  badgeContainer: {
    marginBottom: 24
  },
  badge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  badgeLabel: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  badgeValue: {
    fontSize: 16,
    color: '#5b21b6',
    fontWeight: 'bold'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1'
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500'
  },
  certButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  certButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8
  },
  certButtonIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold'
  }
});