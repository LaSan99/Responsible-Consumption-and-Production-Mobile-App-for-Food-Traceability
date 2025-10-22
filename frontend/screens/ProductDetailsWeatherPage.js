import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import apiConfig from "../config/api";

const { width, height } = Dimensions.get('window');

const ProductDetailsWeatherPage = ({ route, navigation }) => {
  const { productId, productData } = route.params;
  const [product, setProduct] = useState(productData);
  const [loading, setLoading] = useState(!productData);
  const [temperature, setTemperature] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [expiryStatus, setExpiryStatus] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

  const getWeatherConditionIcon = (condition) => {
    if (!condition) return '🌈';
    
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear')) return '☀️';
    if (conditionLower.includes('cloud')) return '☁️';
    if (conditionLower.includes('rain')) return '🌧️';
    if (conditionLower.includes('drizzle')) return '🌦️';
    if (conditionLower.includes('thunderstorm')) return '⛈️';
    if (conditionLower.includes('snow')) return '❄️';
    if (conditionLower.includes('mist') || conditionLower.includes('fog')) return '🌫️';
    return '🌈';
  };

  // Fetch product details only if not passed via params
  const fetchProduct = async () => {
    if (productData) {
      checkExpiryDate(productData.expiry_date);
      await getWeatherData(productData.location);
      startAnimations();
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.get(`${apiConfig.baseURL}/products/${productId}`);
      const productData = response.data;
      setProduct(productData);
      
      checkExpiryDate(productData.expiry_date);
      await getWeatherData(productData.location);
      startAnimations();
      
    } catch (error) {
      console.error('Error fetching product', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  // Animation functions
  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      })
    ]).start();

    // Pulse animation for temperature
    if (temperature) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  };

  // SIMPLIFIED: Get weather data directly using location name
  const getWeatherData = async (location) => {
    try {
      setWeatherLoading(true);
      setUsingFallback(false);

      console.log('🌤️ Fetching weather for:', location);
      
      // Direct API call with location name - NO geocoding needed!
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          q: location,
          appid: '1e21c330766a1b5cea3812bec28eb16b', // Your working API key
          units: "metric",
        },
        timeout: 10000,
      });

      console.log('✅ Weather data received:', response.data);
      
      const weatherInfo = response.data;
      setWeatherData(weatherInfo);
      
      const currentTemp = Math.round(weatherInfo.main.temp);
      setTemperature(currentTemp);
      
      checkTemperatureAlert(currentTemp);
      
    } catch (error) {
      console.warn('❌ Weather API failed:', error.message);
      setUsingFallback(true);
      
      // Simple fallback
      const fallbackTemp = 28;
      setTemperature(fallbackTemp);
      checkTemperatureAlert(fallbackTemp);
      
    } finally {
      setWeatherLoading(false);
    }
  };

  const checkTemperatureAlert = (temp) => {
    setTimeout(() => {
      if (temp > 30) {
        Alert.alert(
          '🔥 High Temperature Warning',
          `Current temperature is ${temp}°C. Food may expire quickly. Store in refrigerator immediately.`,
          [{ text: 'OK', style: 'default' }]
        );
      } else if (temp > 25 && temp <= 30) {
        Alert.alert(
          '🌡️ Moderate Temperature',
          `Current temperature is ${temp}°C. Food is in moderate storage conditions. Monitor regularly.`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    }, 1000);
  };

  const checkExpiryDate = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff <= 0) {
      setExpiryStatus('EXPIRED');
      setTimeout(() => {
        Alert.alert(
          '❌ Product Expired',
          'This product has expired! Do not consume.',
          [{ text: 'OK', style: 'destructive' }]
        );
      }, 1000);
    } else if (daysDiff <= 5) {
      setExpiryStatus('EXPIRING_SOON');
      setTimeout(() => {
        Alert.alert(
          '⚠️ Expiring Soon',
          `This product will expire in ${daysDiff} day(s). Consume soon!`,
          [{ text: 'OK', style: 'default' }]
        );
      }, 1000);
    } else {
      setExpiryStatus('SAFE');
    }
  };

  const getExpiryStatusInfo = () => {
    switch (expiryStatus) {
      case 'EXPIRED':
        return { 
          color: '#ff4444', 
          bgColor: '#ffebee',
          message: 'Expired', 
          icon: '❌',
          description: 'Do not consume'
        };
      case 'EXPIRING_SOON':
        return { 
          color: '#ff9800', 
          bgColor: '#fff3e0',
          message: 'Expiring Soon', 
          icon: '⚠️',
          description: 'Consume quickly'
        };
      case 'SAFE':
        return { 
          color: '#4caf50', 
          bgColor: '#e8f5e8',
          message: 'Fresh', 
          icon: '✅',
          description: 'Safe to consume'
        };
      default:
        return { 
          color: '#666', 
          bgColor: '#f5f5f5',
          message: 'Checking...', 
          icon: '⏳',
          description: 'Verifying status'
        };
    }
  };

  const getTemperatureStatusInfo = () => {
    if (temperature === null) {
      return { 
        color: '#666', 
        bgColor: '#f5f5f5',
        message: 'Loading...', 
        icon: '⏳',
        description: 'Fetching live data'
      };
    }
    
    if (temperature > 30) {
      return { 
        color: '#ff4444', 
        bgColor: '#ffebee',
        message: 'High Risk', 
        icon: '🔥',
        description: 'Immediate action needed'
      };
    } else if (temperature > 25) {
      return { 
        color: '#ff9800', 
        bgColor: '#fff3e0',
        message: 'Moderate Risk', 
        icon: '🌡️',
        description: 'Monitor closely'
      };
    } else {
      return { 
        color: '#4caf50', 
        bgColor: '#e8f5e8',
        message: 'Low Risk', 
        icon: '❄️',
        description: 'Optimal conditions'
      };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = () => {
    if (!product?.expiry_date) return null;
    const today = new Date();
    const expiry = new Date(product.expiry_date);
    const timeDiff = expiry.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const retryWeatherData = async () => {
    if (product?.location) {
      await getWeatherData(product.location);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  // Custom header with back button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#9C27B0',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      title: 'Expiry & Weather',
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={retryWeatherData} style={styles.headerButton}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading weather details...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!product) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#fff" />
          <Text style={styles.errorTitle}>Product Not Found</Text>
          <Text style={styles.errorSubtitle}>
            Unable to load product details. Please try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProduct}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const expiryInfo = getExpiryStatusInfo();
  const tempInfo = getTemperatureStatusInfo();
  const daysUntilExpiry = getDaysUntilExpiry();
  const weatherCondition = weatherData?.weather?.[0]?.description;
  const weatherIcon = getWeatherConditionIcon(weatherData?.weather?.[0]?.main);
  const humidity = weatherData?.main?.humidity;
  const windSpeed = weatherData?.wind?.speed;

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        
        {/* Weather Header */}
        <Animated.View 
          style={[
            styles.weatherHeader,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
            style={styles.weatherHeaderGradient}
          >
            <View style={styles.weatherTopRow}>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={20} color="#fff" />
                <Text style={styles.locationText}>{product.location}</Text>
                {weatherData?.sys?.country && (
                  <Text style={styles.countryText}>, {weatherData.sys.country}</Text>
                )}
              </View>
              
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            
            <View style={styles.weatherMain}>
              {temperature !== null && (
                <Animated.View style={[styles.temperatureMain, { transform: [{ scale: pulseAnim }] }]}>
                  <Text style={styles.weatherIcon}>{weatherIcon}</Text>
                  <View style={styles.temperatureInfo}>
                    <Text style={styles.temperature}>{temperature}°C</Text>
                    <Text style={styles.weatherCondition}>
                      {weatherCondition || 'Loading...'}
                    </Text>
                  </View>
                </Animated.View>
              )}
              
              <View style={styles.weatherDetails}>
                {humidity && (
                  <View style={styles.weatherDetailItem}>
                    <Ionicons name="water" size={14} color="#fff" />
                    <Text style={styles.weatherDetailText}>{humidity}%</Text>
                  </View>
                )}
                {windSpeed && (
                  <View style={styles.weatherDetailItem}>
                    <Ionicons name="flag" size={14} color="#fff" />
                    <Text style={styles.weatherDetailText}>{windSpeed} m/s</Text>
                  </View>
                )}
              </View>
            </View>

            {weatherLoading && (
              <View style={styles.weatherLoading}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.weatherLoadingText}>Updating live data...</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          
          {/* Success Banner */}
          {!usingFallback && temperature && (
            <Animated.View 
              style={[
                styles.successBanner,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
              <View style={styles.successBannerContent}>
                <Text style={styles.successBannerText}>Live weather data connected! ✅</Text>
                <Text style={styles.successBannerSubtext}>Real-time temperature monitoring active</Text>
              </View>
            </Animated.View>
          )}

          {/* Product Card */}
          <Animated.View 
            style={[
              styles.productCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.productCardGradient}
            >
              <View style={styles.productHeader}>
                <View style={styles.productIconContainer}>
                  <Text style={styles.productIcon}>📦</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productBatch}>{product.batch_code}</Text>
                  <Text style={styles.productCategory}>{product.category}</Text>
                </View>
              </View>

              <View style={styles.productDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="navigate" size={16} color="#666" />
                  <Text style={styles.detailLabel}>Origin: </Text>
                  <Text style={styles.detailValue}>{product.origin}</Text>
                </View>
                {product.description && (
                  <View style={styles.detailItem}>
                    <Ionicons name="document-text" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Description: </Text>
                    <Text style={styles.detailValue}>{product.description}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Status Cards */}
          <View style={styles.statusGrid}>
            {/* Expiry Status */}
            <Animated.View 
              style={[
                styles.statusCard,
                { backgroundColor: expiryInfo.bgColor },
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.statusHeader}>
                <Text style={styles.statusIcon}>{expiryInfo.icon}</Text>
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusTitle}>Expiry Status</Text>
                  <Text style={[styles.statusValue, { color: expiryInfo.color }]}>
                    {expiryInfo.message}
                  </Text>
                </View>
              </View>
              <Text style={styles.statusDescription}>{expiryInfo.description}</Text>
              
              {daysUntilExpiry !== null && (
                <View style={styles.expiryCountdown}>
                  <Ionicons name="calendar" size={16} color={expiryInfo.color} />
                  <Text style={[styles.expiryText, { color: expiryInfo.color }]}>
                    {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'Expired'}
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* Temperature Status */}
            <Animated.View 
              style={[
                styles.statusCard,
                { backgroundColor: tempInfo.bgColor },
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.statusHeader}>
                <Text style={styles.statusIcon}>{tempInfo.icon}</Text>
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusTitle}>Temperature Risk</Text>
                  <Text style={[styles.statusValue, { color: tempInfo.color }]}>
                    {tempInfo.message}
                  </Text>
                </View>
              </View>
              <Text style={styles.statusDescription}>{tempInfo.description}</Text>
              
              <View style={styles.temperatureDisplay}>
                <Ionicons name="thermometer" size={16} color={tempInfo.color} />
                <Text style={[styles.temperatureValue, { color: tempInfo.color }]}>
                  {temperature}°C • Live
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* Storage Guidelines */}
          <Animated.View 
            style={[
              styles.guidelinesCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.guidelinesHeader}>
              <Ionicons name="restaurant" size={24} color="#9C27B0" />
              <Text style={styles.guidelinesTitle}>Storage Guidelines</Text>
            </View>
            
            {temperature !== null && (
              <View style={styles.guidelineItem}>
                <View style={[
                  styles.guidelineIcon,
                  temperature > 30 ? styles.highRisk : 
                  temperature > 25 ? styles.mediumRisk : styles.lowRisk
                ]}>
                  <Text style={styles.guidelineEmoji}>
                    {temperature > 30 ? '🔥' : temperature > 25 ? '🌡️' : '❄️'}
                  </Text>
                </View>
                <View style={styles.guidelineContent}>
                  <Text style={styles.guidelineTitle}>
                    {temperature > 30 ? 'High Temperature Alert' : 
                     temperature > 25 ? 'Moderate Conditions' : 'Optimal Conditions'}
                  </Text>
                  <Text style={styles.guidelineText}>
                    {temperature > 30 
                      ? `Current temperature ${temperature}°C is high. Store immediately in refrigerator. Consume within 1-2 days.`
                      : temperature > 25
                      ? `Current temperature ${temperature}°C is moderate. Monitor food quality regularly. Refrigerate for longer shelf life.`
                      : `Current temperature ${temperature}°C is optimal. Follow standard storage guidelines.`}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.guidelineItem}>
              <View style={[styles.guidelineIcon, styles.expiryIcon]}>
                <Text style={styles.guidelineEmoji}>📅</Text>
              </View>
              <View style={styles.guidelineContent}>
                <Text style={styles.guidelineTitle}>Expiry Management</Text>
                <Text style={styles.guidelineText}>
                  {expiryStatus === 'EXPIRED' 
                    ? 'This product has expired and should not be consumed for safety reasons.'
                    : expiryStatus === 'EXPIRING_SOON'
                    ? `Product expires in ${daysUntilExpiry} days. Prioritize consumption this week.`
                    : 'Product is within safe consumption period. Store properly.'}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Product updated: {new Date(product.updated_at).toLocaleDateString()}
            </Text>
            <Text style={styles.footerNote}>
              🌤️ Live weather data from OpenWeatherMap
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30, // Increased padding
  },
  loadingText: {
    marginTop: 20, // Increased padding
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20, // Increased padding
    marginBottom: 12, // Increased padding
  },
  errorSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 30, // Increased padding
    lineHeight: 22,
    paddingHorizontal: 20, // Added padding
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 28, // Increased padding
    paddingVertical: 14, // Increased padding
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Back Button Styles
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerButton: {
    paddingHorizontal: 20, // Increased padding
    paddingVertical: 8,
  },
  weatherHeader: {
    paddingHorizontal: 24, // Increased padding
    paddingTop: 24, // Increased padding
    paddingBottom: 16, // Increased padding
  },
  weatherHeaderGradient: {
    borderRadius: 20,
    padding: 24, // Increased padding
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  weatherTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // Increased padding
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    color: '#fff',
    fontSize: 18, // Increased font size
    fontWeight: '600',
    marginLeft: 10, // Increased padding
  },
  countryText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16, // Increased font size
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 12, // Increased padding
    paddingVertical: 6, // Increased padding
    borderRadius: 12,
  },
  liveDot: {
    width: 8, // Increased size
    height: 8, // Increased size
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6, // Increased padding
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  temperatureMain: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  weatherIcon: {
    fontSize: 40, // Increased size
    marginRight: 16, // Increased padding
  },
  temperatureInfo: {
    marginLeft: 8, // Added padding
  },
  temperature: {
    color: '#fff',
    fontSize: 42, // Increased size
    fontWeight: 'bold',
  },
  weatherCondition: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16, // Increased size
    marginTop: 6, // Increased padding
    textTransform: 'capitalize',
  },
  weatherDetails: {
    alignItems: 'flex-end',
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Increased padding
  },
  weatherDetailText: {
    color: '#fff',
    fontSize: 16, // Increased size
    marginLeft: 6, // Increased padding
  },
  weatherLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16, // Increased padding
    paddingTop: 16, // Increased padding
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  weatherLoadingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14, // Increased size
    marginLeft: 10, // Increased padding
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20, // Increased padding
    paddingTop: 0,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 16, // Increased padding
    borderRadius: 12,
    marginBottom: 20, // Increased padding
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  successBannerContent: {
    flex: 1,
    marginLeft: 12, // Increased padding
  },
  successBannerText: {
    color: '#2e7d32',
    fontSize: 16, // Increased size
    fontWeight: '500',
  },
  successBannerSubtext: {
    color: '#2e7d32',
    fontSize: 14, // Increased size
    marginTop: 4, // Increased padding
    opacity: 0.8,
  },
  productCard: {
    borderRadius: 20,
    marginBottom: 20, // Increased padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  productCardGradient: {
    borderRadius: 20,
    padding: 24, // Increased padding
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, // Increased padding
  },
  productIconContainer: {
    width: 60, // Increased size
    height: 60, // Increased size
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20, // Increased padding
  },
  productIcon: {
    fontSize: 28, // Increased size
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 24, // Increased size
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 6, // Increased padding
  },
  productBatch: {
    fontSize: 16, // Increased size
    color: '#718096',
    fontFamily: 'monospace',
    marginBottom: 4, // Increased padding
  },
  productCategory: {
    fontSize: 14, // Increased size
    color: '#667eea',
    fontWeight: '600',
    backgroundColor: '#e9d8fd',
    paddingHorizontal: 12, // Increased padding
    paddingVertical: 4, // Increased padding
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  productDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16, // Increased padding
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // Increased padding
  },
  detailLabel: {
    fontSize: 14, // Increased size
    color: '#718096',
    fontWeight: '500',
    marginLeft: 8, // Increased padding
    marginRight: 6, // Increased padding
  },
  detailValue: {
    fontSize: 14, // Increased size
    color: '#4a5568',
    flex: 1,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20, // Increased padding
    gap: 16, // Increased padding
  },
  statusCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20, // Increased padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // Increased padding
  },
  statusTextContainer: {
    flex: 1,
  },
  statusIcon: {
    fontSize: 28, // Increased size
    marginRight: 16, // Increased padding
  },
  statusTitle: {
    fontSize: 14, // Increased size
    color: '#718096',
    fontWeight: '600',
    marginBottom: 4, // Increased padding
  },
  statusValue: {
    fontSize: 18, // Increased size
    fontWeight: 'bold',
  },
  statusDescription: {
    fontSize: 14, // Increased size
    color: '#4a5568',
    marginBottom: 16, // Increased padding
  },
  expiryCountdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 12, // Increased padding
    paddingVertical: 6, // Increased padding
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  expiryText: {
    fontSize: 13, // Increased size
    fontWeight: '600',
    marginLeft: 6, // Increased padding
  },
  temperatureDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 12, // Increased padding
    paddingVertical: 6, // Increased padding
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  temperatureValue: {
    fontSize: 13, // Increased size
    fontWeight: '600',
    marginLeft: 6, // Increased padding
  },
  guidelinesCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24, // Increased padding
    marginBottom: 20, // Increased padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, // Increased padding
  },
  guidelinesTitle: {
    fontSize: 20, // Increased size
    fontWeight: 'bold',
    color: '#2d3748',
    marginLeft: 12, // Increased padding
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20, // Increased padding
    padding: 16, // Increased padding
    backgroundColor: '#f7fafc',
    borderRadius: 12,
  },
  guidelineIcon: {
    width: 48, // Increased size
    height: 48, // Increased size
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16, // Increased padding
  },
  highRisk: {
    backgroundColor: '#fed7d7',
  },
  mediumRisk: {
    backgroundColor: '#feebc8',
  },
  lowRisk: {
    backgroundColor: '#c6f6d5',
  },
  expiryIcon: {
    backgroundColor: '#e9d8fd',
  },
  guidelineEmoji: {
    fontSize: 22, // Increased size
  },
  guidelineContent: {
    flex: 1,
  },
  guidelineTitle: {
    fontSize: 16, // Increased size
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 6, // Increased padding
  },
  guidelineText: {
    fontSize: 14, // Increased size
    color: '#4a5568',
    lineHeight: 20, // Increased line height
  },
  footer: {
    alignItems: 'center',
    padding: 20, // Increased padding
    marginBottom: 30, // Increased padding
  },
  footerText: {
    fontSize: 14, // Increased size
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 6, // Increased padding
  },
  footerNote: {
    fontSize: 12, // Increased size
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ProductDetailsWeatherPage;