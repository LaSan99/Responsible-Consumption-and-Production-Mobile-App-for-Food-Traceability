import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Alert,
  RefreshControl,
  Image,
  Share
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import apiConfig from "../config/api";

const { width, height } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProduct();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const downloadQRCode = async () => {
    if (!product.qr_code_image) {
      Alert.alert('Error', 'QR code image not available');
      return;
    }

    try {
      // Check and request permission to save to media library
      const { status: currentStatus } = await MediaLibrary.getPermissionsAsync();
      let finalStatus = currentStatus;

      if (currentStatus !== 'granted') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'Please grant permission to save images to your gallery in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => MediaLibrary.requestPermissionsAsync() }
          ]
        );
        return;
      }

      // Download the QR code image using legacy FileSystem API
      const qrCodeUrl = `${apiConfig.baseURL}/${product.qr_code_image.replace(/\\/g, '/')}`;
      const fileName = `qr_code_${product.batch_code}.png`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      console.log('Downloading QR code from:', qrCodeUrl);
      console.log('Saving to:', fileUri);
      
      const downloadResult = await FileSystem.downloadAsync(qrCodeUrl, fileUri);

      if (downloadResult.status === 200) {
        console.log('QR code downloaded successfully');
        
        // Save to media library
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        console.log('Asset created:', asset);
        
        // Try to create album, but don't fail if it already exists
        try {
          await MediaLibrary.createAlbumAsync('Food Traceability QR Codes', asset, false);
        } catch (albumError) {
          console.log('Album creation failed (might already exist):', albumError);
          // Continue anyway, the asset is still saved
        }
        
        Alert.alert(
          'Success!',
          'QR code has been saved to your gallery.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error(`Failed to download QR code. Status: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      Alert.alert('Error', `Failed to download QR code: ${error.message}`);
    }
  };

  const shareQRCode = async () => {
    if (!product.qr_code_image) {
      Alert.alert('Error', 'QR code image not available');
      return;
    }

    try {
      const qrCodeUrl = `${apiConfig.baseURL}/${product.qr_code_image.replace(/\\/g, '/')}`;
      await Share.share({
        message: `QR Code for ${product.name} (Batch: ${product.batch_code})`,
        url: qrCodeUrl,
        title: `QR Code - ${product.name}`
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code. Please try again.');
    }
  };

  const getProductIcon = (productName) => {
    const name = productName.toLowerCase();
    if (name.includes('organic')) return '🌱';
    if (name.includes('fruit')) return '🍎';
    if (name.includes('vegetable')) return '🥕';
    if (name.includes('grain')) return '🌾';
    if (name.includes('dairy')) return '🥛';
    if (name.includes('meat')) return '🥩';
    if (name.includes('fish')) return '🐟';
    if (name.includes('spice')) return '🌶️';
    return '📦';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.errorSubtitle}>
          The product you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProduct}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50', '#8BC34A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Product Details</Text>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#9C27B0']}
              tintColor="#9C27B0"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Product Image */}
          <View style={styles.imageContainer}>
            {product.product_image && !imageError ? (
              <Image 
                source={{ uri: `${apiConfig.baseURL}/${product.product_image.replace(/\\/g, '/')}` }}
                style={styles.productImage}
                resizeMode="cover"
                onError={(error) => {
                  console.log('Image load error:', error);
                  console.log('Image URL:', `${apiConfig.baseURL}/${product.product_image.replace(/\\/g, '/')}`);
                  setImageError(true);
                }}
                onLoad={() => console.log('Image loaded successfully:', `${apiConfig.baseURL}/${product.product_image.replace(/\\/g, '/')}`)}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderIcon}>{getProductIcon(product.name)}</Text>
                <Text style={styles.placeholderText}>
                  {product.product_image ? 'Image Load Error' : 'No Image'}
                </Text>
                {product.product_image && (
                  <Text style={styles.debugText}>
                    URL: {`${apiConfig.baseURL}/${product.product_image.replace(/\\/g, '/')}`}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Product Info Card */}
          <View style={styles.productCard}>
            <View style={styles.productHeader}>
              <View style={styles.productIconContainer}>
                <Text style={styles.productIcon}>{getProductIcon(product.name)}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productBatch}>Batch: {product.batch_code}</Text>
              </View>
            </View>

            {product.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Description</Text>
                <Text style={styles.descriptionText}>{product.description}</Text>
              </View>
            )}

            {/* Product Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Ionicons name="barcode-outline" size={20} color="#666" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Batch Code</Text>
                  <Text style={styles.detailValue}>{product.batch_code}</Text>
                </View>
              </View>

              {product.manufacturer && (
                <View style={styles.detailRow}>
                  <Ionicons name="business-outline" size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Manufacturer</Text>
                    <Text style={styles.detailValue}>{product.manufacturer}</Text>
                  </View>
                </View>
              )}

              {product.category && (
                <View style={styles.detailRow}>
                  <Ionicons name="folder-outline" size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.detailValue}>{product.category}</Text>
                  </View>
                </View>
              )}

              {product.sku && (
                <View style={styles.detailRow}>
                  <Ionicons name="pricetag-outline" size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>SKU</Text>
                    <Text style={styles.detailValue}>{product.sku}</Text>
                  </View>
                </View>
              )}

              {product.created_at && (
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Created Date</Text>
                    <Text style={styles.detailValue}>{formatDate(product.created_at)}</Text>
                  </View>
                </View>
              )}

              {product.updated_at && (
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Last Updated</Text>
                    <Text style={styles.detailValue}>{formatDate(product.updated_at)}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* QR Code Section */}
          {product.qr_code_image && (
            <View style={styles.qrCodeCard}>
              <View style={styles.qrCodeHeader}>
                <Ionicons name="qr-code-outline" size={24} color="#9C27B0" />
                <Text style={styles.qrCodeTitle}>Product QR Code</Text>
              </View>
              <View style={styles.qrCodeContainer}>
                <Image 
                  source={{ uri: `${apiConfig.baseURL}/${product.qr_code_image.replace(/\\/g, '/')}` }}
                  style={styles.qrCodeImage}
                  resizeMode="contain"
                />
                <Text style={styles.qrCodeBatch}>Batch: {product.batch_code}</Text>
              </View>
              <View style={styles.qrCodeActions}>
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={downloadQRCode}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#45a049']}
                    style={styles.downloadButtonGradient}
                  >
                    <Ionicons name="download-outline" size={18} color="#fff" />
                    <Text style={styles.downloadButtonText}>Download</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={shareQRCode}
                >
                  <LinearGradient
                    colors={['#2196F3', '#1976D2']}
                    style={styles.shareButtonGradient}
                  >
                    <Ionicons name="share-outline" size={18} color="#fff" />
                    <Text style={styles.shareButtonText}>Share</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => navigation.navigate('ProductCertifications', { 
                productId, 
                productName: product.name 
              })}
            >
              <LinearGradient
                colors={['#9C27B0', '#7B1FA2']}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name="ribbon-outline" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>View Certifications</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Check Expiry Button */}
            <TouchableOpacity 
              style={styles.checkExpiryButton}
              onPress={() => navigation.navigate('ProductDetailWeather', { 
                productId, 
                productName: product.name 
              })}
            >
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.checkExpiryButtonGradient}
              >
                <Ionicons name="warning-outline" size={20} color="#fff" />
                <Text style={styles.checkExpiryButtonText}>Check Expiry</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Certificate Management Button */}
            {/* <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('ProductCertificationManagement', { 
                productId, 
                productName: product.name 
              })}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.secondaryButtonGradient}
              >
                <Ionicons name="settings-outline" size={20} color="#fff" />
                <Text style={styles.secondaryButtonText}>Manage Certifications</Text>
              </LinearGradient>
            </TouchableOpacity> */}

            {/* Blockchain Button */}
            {/* <TouchableOpacity 
              style={styles.blockchainButton}
              onPress={() => navigation.navigate('BlockchainStages', { 
                productId, 
                productName: product.name,
                batchCode: product.batch_code
              })}
            >
              <LinearGradient
                colors={['#9C27B0', '#7B1FA2']}
                style={styles.blockchainButtonGradient}
              >
                <Ionicons name="link-outline" size={20} color="#fff" />
                <Text style={styles.blockchainButtonText}>View Blockchain</Text>
              </LinearGradient>
            </TouchableOpacity> */}
          </View>

          {/* Additional Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle-outline" size={24} color="#9C27B0" />
              <Text style={styles.infoTitle}>Product Information</Text>
            </View>
            <Text style={styles.infoText}>
              This product is part of our traceability system. You can view and manage its certifications 
              to ensure quality and compliance with industry standards.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  imageContainer: {
    width: width - 40,
    height: 240,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  productIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  productIcon: {
    fontSize: 28,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productBatch: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  descriptionContainer: {
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  detailsContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  actionButtonsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  checkExpiryButton: {
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  checkExpiryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
  },
  checkExpiryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    borderRadius: 12,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  qrCodeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
  },
  qrCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginLeft: 12,
  },
  qrCodeContainer: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    marginBottom: 12,
  },
  qrCodeBatch: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  qrCodeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  downloadButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 14,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  downloadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  shareButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 14,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  blockchainButton: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  blockchainButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  blockchainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});