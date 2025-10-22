import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import apiConfig from "../config/api";

const ProductDetailsWeatherPage = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [temperature, setTemperature] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [expiryStatus, setExpiryStatus] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch product details
  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${apiConfig.baseURL}/products/${productId}`);
      const productData = response.data;
      setProduct(productData);
      
      // Check expiry date first
      checkExpiryDate(productData.expiry_date);
      
      // Then get location and temperature based on product location
      await getLocationAndTemperature(productData.location);
      
    } catch (error) {
      console.error('Error fetching product', error);
      setError('Failed to load product details');
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  // Get location coordinates and temperature from APIs
  const getLocationAndTemperature = async (productLocation) => {
    try {
      setWeatherLoading(true);
      setError(null);
      
      console.log('Fetching location data for:', productLocation);
      
      // Step 1: Get coordinates from location name (Geocoding API)
      const geoResponse = await axios.get(
        `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(productLocation)}&limit=1&appid=${apiConfig.weatherAPIKey}`
      );
      
      console.log('Geocoding API response:', geoResponse.data);
      
      if (geoResponse.data && geoResponse.data.length > 0) {
        const locationData = geoResponse.data[0];
        const locationInfo = {
          name: locationData.name,
          country: locationData.country,
          lat: locationData.lat,
          lon: locationData.lon
        };
        setCurrentLocation(locationInfo);
        
        console.log('Location coordinates:', locationInfo);
        
        // Step 2: Get temperature using coordinates
        await getTemperature(locationInfo.lat, locationInfo.lon);
      } else {
        throw new Error(`Location "${productLocation}" not found in weather service`);
      }
      
    } catch (error) {
      console.error('Error fetching location data', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch location data';
      setError(`Location service: ${errorMsg}`);
      
      // Fallback: Use a default temperature based on common conditions
      const fallbackTemp = 28; // Default moderate temperature
      setTemperature(fallbackTemp);
      checkTemperatureAlert(fallbackTemp);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Get temperature from weather API
  const getTemperature = async (lat, lon) => {
    try {
      console.log('Fetching temperature for coordinates:', lat, lon);
      
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiConfig.weatherAPIKey}&units=metric`
      );
      
      console.log('Weather API response:', weatherResponse.data);
      
      const currentTemp = Math.round(weatherResponse.data.main.temp);
      setTemperature(currentTemp);
      checkTemperatureAlert(currentTemp);
      
    } catch (error) {
      console.error('Error fetching temperature', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch temperature';
      setError(`Weather service: ${errorMsg}`);
      
      // Fallback temperature
      const fallbackTemp = 26;
      setTemperature(fallbackTemp);
      checkTemperatureAlert(fallbackTemp);
    }
  };

  // Check temperature and show alerts
  const checkTemperatureAlert = (temp) => {
    if (temp > 30) {
      Alert.alert(
        '⚠️ High Temperature Warning',
        `Current temperature in ${product?.location} is ${temp}°C. Food may expire quickly in these conditions. Store in cooler environment immediately.`,
        [{ text: 'OK' }]
      );
    } else if (temp > 25 && temp <= 30) {
      Alert.alert(
        'ℹ️ Moderate Temperature Zone',
        `Current temperature in ${product?.location} is ${temp}°C. Food is in moderate storage conditions. Monitor regularly and consider refrigeration.`,
        [{ text: 'OK' }]
      );
    } else {
      // Below 25°C - optimal conditions
      console.log(`Temperature ${temp}°C - Optimal storage conditions`);
    }
  };

  // Check expiry date
  const checkExpiryDate = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    console.log(`Expiry check: ${daysDiff} days remaining`);

    if (daysDiff <= 0) {
      setExpiryStatus('EXPIRED');
      Alert.alert(
        '❌ Product Expired',
        'This product has expired! Do not consume.',
        [{ text: 'OK' }]
      );
    } else if (daysDiff <= 5) {
      setExpiryStatus('EXPIRING_SOON');
      Alert.alert(
        '⚠️ Expiring Soon',
        `This product will expire in ${daysDiff} day(s). Consume soon!`,
        [{ text: 'OK' }]
      );
    } else {
      setExpiryStatus('SAFE');
    }
  };

  // Get status color and message for expiry
  const getExpiryStatusInfo = () => {
    switch (expiryStatus) {
      case 'EXPIRED':
        return { color: '#ff4444', message: 'Expired', icon: '❌' };
      case 'EXPIRING_SOON':
        return { color: '#ffaa00', message: 'Expiring Soon', icon: '⚠️' };
      case 'SAFE':
        return { color: '#00c851', message: 'Fresh', icon: '✅' };
      default:
        return { color: '#666', message: 'Checking...', icon: '⏳' };
    }
  };

  // Get temperature status color and message
  const getTemperatureStatusInfo = () => {
    if (temperature === null) {
      return { color: '#666', message: 'Loading...', icon: '⏳' };
    }
    
    if (temperature > 30) {
      return { color: '#ff4444', message: 'High Risk', icon: '🔥' };
    } else if (temperature > 25) {
      return { color: '#ffaa00', message: 'Moderate Risk', icon: '🌡️' };
    } else {
      return { color: '#00c851', message: 'Low Risk', icon: '❄️' };
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <Text style={styles.retryText} onPress={fetchProduct}>
          Tap to retry
        </Text>
      </View>
    );
  }

  const expiryInfo = getExpiryStatusInfo();
  const tempInfo = getTemperatureStatusInfo();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.batchCode}>Batch: {product.batch_code}</Text>
          <Text style={styles.category}>{product.category}</Text>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
            <Text style={styles.errorNote}>Using fallback temperature data</Text>
          </View>
        )}

        {/* Product Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Origin:</Text>
            <Text style={styles.value}>{product.origin}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Current Location:</Text>
            <Text style={styles.value}>{product.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{product.description}</Text>
          </View>
        </View>

        {/* Dates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dates</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Harvest Date:</Text>
            <Text style={styles.value}>{formatDate(product.harvest_date)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Expiry Date:</Text>
            <Text style={styles.value}>{formatDate(product.expiry_date)}</Text>
          </View>
        </View>

        {/* Status Cards */}
        <View style={styles.statusContainer}>
          {/* Expiry Status Card */}
          <View style={[styles.statusCard, { borderLeftColor: expiryInfo.color }]}>
            <Text style={styles.statusTitle}>Expiry Status</Text>
            <Text style={styles.statusIcon}>{expiryInfo.icon}</Text>
            <Text style={[styles.statusValue, { color: expiryInfo.color }]}>
              {expiryInfo.message}
            </Text>
          </View>

          {/* Temperature Status Card */}
          <View style={[styles.statusCard, { borderLeftColor: tempInfo.color }]}>
            <Text style={styles.statusTitle}>Temperature Status</Text>
            {weatherLoading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <>
                <Text style={styles.statusIcon}>{tempInfo.icon}</Text>
                <Text style={[styles.statusValue, { color: tempInfo.color }]}>
                  {tempInfo.message}
                </Text>
                <Text style={styles.temperatureText}>
                  {temperature}°C in {product.location}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Storage Guidelines */}
        <View style={styles.alertInfo}>
          <Text style={styles.alertTitle}>Storage Guidelines</Text>
          
          {temperature !== null && (
            <>
              {temperature > 30 ? (
                <View style={styles.alertItem}>
                  <Text style={styles.alertIcon}>🔥</Text>
                  <Text style={styles.alertTextRed}>
                    High temperature risk! Food may expire quickly. Store in refrigerator immediately and consume within 1-2 days.
                  </Text>
                </View>
              ) : temperature > 25 ? (
                <View style={styles.alertItem}>
                  <Text style={styles.alertIcon}>🌡️</Text>
                  <Text style={styles.alertTextOrange}>
                    Moderate temperature zone. Monitor food quality regularly. Recommended to refrigerate for longer shelf life.
                  </Text>
                </View>
              ) : (
                <View style={styles.alertItem}>
                  <Text style={styles.alertIcon}>❄️</Text>
                  <Text style={styles.alertTextGreen}>
                    Optimal storage temperature. No immediate concerns. Follow normal storage guidelines.
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Expiry Guidelines */}
          <View style={styles.alertItem}>
            <Text style={styles.alertIcon}>📅</Text>
            <Text style={styles.alertText}>
              {expiryStatus === 'EXPIRED' 
                ? 'This product has passed its expiry date and should not be consumed.'
                : expiryStatus === 'EXPIRING_SOON'
                ? 'Product is nearing expiry. Prioritize consumption.'
                : 'Product is within safe consumption period.'
              }
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated: {new Date(product.updated_at).toLocaleString()}
          </Text>
          <Text style={styles.footerNote}>
            Temperature data provided by OpenWeatherMap
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  productName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  batchCode: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  category: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  errorBanner: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  errorBannerText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
  },
  errorNote: {
    color: '#856404',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  temperatureText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  alertInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  alertTextRed: {
    fontSize: 14,
    color: '#dc3545',
    lineHeight: 20,
    flex: 1,
  },
  alertTextOrange: {
    fontSize: 14,
    color: '#fd7e14',
    lineHeight: 20,
    flex: 1,
  },
  alertTextGreen: {
    fontSize: 14,
    color: '#28a745',
    lineHeight: 20,
    flex: 1,
  },
  alertText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerNote: {
    fontSize: 11,
    color: '#adb5bd',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ProductDetailsWeatherPage;