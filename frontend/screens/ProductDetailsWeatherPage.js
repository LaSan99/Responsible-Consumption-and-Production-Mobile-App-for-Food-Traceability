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
  Image,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import apiConfig from "../config/api";

const { width, height } = Dimensions.get('window');

// High-quality product images from Unsplash
const PRODUCT_IMAGES = {
  default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&h=400&fit=crop&q=80',
  dairy: 'https://images.unsplash.com/photo-1566772940195-0d1353e58d55?w=500&h=400&fit=crop&q=80',
  meat: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?w=500&h=400&fit=crop&q=80',
  vegetable: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&h=400&fit=crop&q=80',
  fruit: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&h=400&fit=crop&q=80',
  grains: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500&h=400&fit=crop&q=80',
};

// High-quality weather background images
const WEATHER_BACKGROUNDS = {
  sunny: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=900&h=500&fit=crop&q=85',
  cloudy: 'https://images.unsplash.com/photo-1562155618-e1a8bc2eb12f?w=900&h=500&fit=crop&q=85',
  rainy: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=900&h=500&fit=crop&q=85',
  snowy: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=900&h=500&fit=crop&q=85',
  default: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=900&h=500&fit=crop&q=85',
};

const ProductDetailsWeatherPage = ({ route, navigation }) => {
  const { productId, productData } = route.params;
  const [product, setProduct] = useState(productData);
  const [loading, setLoading] = useState(!productData);
  const [temperature, setTemperature] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [expiryStatus, setExpiryStatus] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [productImage, setProductImage] = useState(PRODUCT_IMAGES.default);
  const [safetyStatus, setSafetyStatus] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [detailedSuggestions, setDetailedSuggestions] = useState([]);
  const [weatherBackground, setWeatherBackground] = useState(WEATHER_BACKGROUNDS.default);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const warningAnim = useState(new Animated.Value(0))[0];

  const getProductImage = (category) => {
    if (!category) return PRODUCT_IMAGES.default;
    
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('dairy') || categoryLower.includes('milk')) return PRODUCT_IMAGES.dairy;
    if (categoryLower.includes('meat')) return PRODUCT_IMAGES.meat;
    if (categoryLower.includes('vegetable')) return PRODUCT_IMAGES.vegetable;
    if (categoryLower.includes('fruit')) return PRODUCT_IMAGES.fruit;
    if (categoryLower.includes('grain') || categoryLower.includes('cereal')) return PRODUCT_IMAGES.grains;
    return PRODUCT_IMAGES.default;
  };

  const getWeatherBackground = (condition) => {
    if (!condition) return WEATHER_BACKGROUNDS.default;
    
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) return WEATHER_BACKGROUNDS.sunny;
    if (conditionLower.includes('cloud')) return WEATHER_BACKGROUNDS.cloudy;
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return WEATHER_BACKGROUNDS.rainy;
    if (conditionLower.includes('snow')) return WEATHER_BACKGROUNDS.snowy;
    return WEATHER_BACKGROUNDS.default;
  };

  const getWeatherConditionIcon = (condition) => {
    if (!condition) return 'partly-sunny';
    
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear')) return 'sunny';
    if (conditionLower.includes('cloud')) return 'cloudy';
    if (conditionLower.includes('rain')) return 'rainy';
    if (conditionLower.includes('drizzle')) return 'rainy';
    if (conditionLower.includes('thunderstorm')) return 'thunderstorm';
    if (conditionLower.includes('snow')) return 'snow';
    if (conditionLower.includes('mist') || conditionLower.includes('fog')) return 'cloud';
    return 'partly-sunny';
  };

  // Generate detailed safety suggestions
  const generateDetailedSuggestions = (temp, daysUntilExpiry, safetyStatus, productCategory) => {
    const suggestions = [];
    const category = productCategory?.toLowerCase() || '';

    // Expiry-based suggestions
    if (daysUntilExpiry <= 0) {
      suggestions.push({
        icon: '🚫',
        title: 'Immediate Disposal Required',
        description: 'Product has expired and may harbor harmful bacteria.',
        reason: 'Expired products can cause food poisoning regardless of storage conditions.',
        urgency: 'high'
      });
      
      suggestions.push({
        icon: '⚠️',
        title: 'Do Not Consume',
        description: 'This product poses serious health risks if consumed.',
        reason: 'Bacterial growth accelerates significantly after expiry date.',
        urgency: 'critical'
      });
    } else if (daysUntilExpiry <= 2) {
      suggestions.push({
        icon: '⏰',
        title: 'Consume Immediately',
        description: 'Product expires within 2 days - use it today.',
        reason: 'Near expiry combined with current temperature accelerates spoilage.',
        urgency: 'high'
      });
    } else if (daysUntilExpiry <= 5) {
      suggestions.push({
        icon: '👀',
        title: 'Monitor Closely',
        description: 'Check product daily for any signs of spoilage.',
        reason: 'Moderate expiry timeframe requires regular quality checks.',
        urgency: 'medium'
      });
    } else {
      suggestions.push({
        icon: '✅',
        title: 'Good Expiry Buffer',
        description: 'Product has sufficient time before expiry.',
        reason: 'Adequate days remaining provide flexibility in consumption.',
        urgency: 'low'
      });
    }

    // Temperature-based suggestions
    if (temp > 30) {
      suggestions.push({
        icon: '🔥',
        title: 'High Temperature Alert',
        description: 'Move product to cooler storage immediately.',
        reason: `Temperatures above 30°C cause rapid bacterial growth in ${category} products.`,
        urgency: 'high'
      });
      
      if (category.includes('dairy') || category.includes('milk')) {
        suggestions.push({
          icon: '🥛',
          title: 'Dairy Safety Critical',
          description: 'Refrigerate below 4°C within 1 hour.',
          reason: 'Dairy products spoil 4x faster in temperatures above 30°C.',
          urgency: 'critical'
        });
      }
      
      if (category.includes('meat')) {
        suggestions.push({
          icon: '🍖',
          title: 'Meat Safety Emergency',
          description: 'Consume immediately or freeze.',
          reason: 'Meat develops dangerous bacteria within 2 hours at 30°C+.',
          urgency: 'critical'
        });
      }
    } else if (temp > 25) {
      suggestions.push({
        icon: '⚠️',
        title: 'Moderate Temperature Warning',
        description: 'Store in coolest available location.',
        reason: 'Ideal bacterial growth range is 25-30°C for most food products.',
        urgency: 'medium'
      });
    } else {
      suggestions.push({
        icon: '✅',
        title: 'Optimal Storage Temperature',
        description: 'Current temperature is ideal for product preservation.',
        reason: 'Temperatures below 25°C significantly slow bacterial growth.',
        urgency: 'low'
      });
    }

    // Category-specific suggestions
    if (category.includes('dairy') || category.includes('milk')) {
      suggestions.push({
        icon: '❄️',
        title: 'Dairy Storage Tip',
        description: 'Maintain temperature below 4°C for maximum freshness.',
        reason: 'Dairy products are highly susceptible to temperature fluctuations.',
        urgency: 'info'
      });
    }
    
    if (category.includes('meat')) {
      suggestions.push({
        icon: '🍖',
        title: 'Meat Handling Advice',
        description: 'Keep refrigerated and separate from other foods.',
        reason: 'Raw meat requires strict temperature control to prevent cross-contamination.',
        urgency: 'info'
      });
    }
    
    if (category.includes('vegetable') || category.includes('fruit')) {
      suggestions.push({
        icon: '🥬',
        title: 'Produce Preservation',
        description: 'Store in cool, dry place away from direct sunlight.',
        reason: 'Fruits and vegetables maintain freshness better in stable, cool environments.',
        urgency: 'info'
      });
    }

    // Safety status specific suggestions
    if (safetyStatus === 'VERY_SAFE') {
      suggestions.push({
        icon: '🎉',
        title: 'Ideal Conditions',
        description: 'Product is in perfect storage conditions.',
        reason: 'Combination of good temperature and sufficient expiry timeframe.',
        urgency: 'low'
      });
    } else if (safetyStatus === 'UNSAFE') {
      suggestions.push({
        icon: '🚨',
        title: 'Safety Critical',
        description: 'DO NOT CONSUME UNDER ANY CIRCUMSTANCES.',
        reason: 'Product poses immediate health risk due to expiry and temperature conditions.',
        urgency: 'critical'
      });
    }

    return suggestions.slice(0, 6); // Limit to 6 most important suggestions
  };

  // Calculate safety status based on temperature and expiry
  const calculateSafetyStatus = (temp, daysUntilExpiry, productCategory) => {
    let status = '';
    let level = '';
    let recommendation = '';

    if (daysUntilExpiry <= 0) {
      status = 'UNSAFE';
      level = 'CRITICAL';
      recommendation = 'Product has expired. Do not consume under any conditions.';
    } else if (temp > 30) {
      if (daysUntilExpiry <= 2) {
        status = 'UNSAFE';
        level = 'HIGH';
        recommendation = 'High temperature and near expiry. Immediate consumption or disposal recommended.';
      } else if (daysUntilExpiry <= 5) {
        status = 'RISKY';
        level = 'HIGH';
        recommendation = 'High temperature accelerating expiry. Consume within 24 hours.';
      } else {
        status = 'CAUTION';
        level = 'MEDIUM';
        recommendation = 'High temperature may reduce shelf life. Store in cool place.';
      }
    } else if (temp > 25) {
      if (daysUntilExpiry <= 2) {
        status = 'RISKY';
        level = 'HIGH';
        recommendation = 'Moderate temperature with near expiry. Consume immediately.';
      } else if (daysUntilExpiry <= 5) {
        status = 'CAUTION';
        level = 'MEDIUM';
        recommendation = 'Monitor closely. Moderate temperature may affect quality.';
      } else {
        status = 'SAFE';
        level = 'LOW';
        recommendation = 'Product is safe but store in cooler conditions for longer shelf life.';
      }
    } else {
      if (daysUntilExpiry <= 2) {
        status = 'CAUTION';
        level = 'MEDIUM';
        recommendation = 'Product expires soon but temperature is optimal. Consume within 2 days.';
      } else if (daysUntilExpiry <= 5) {
        status = 'SAFE';
        level = 'LOW';
        recommendation = 'Optimal temperature conditions. Safe to consume.';
      } else {
        status = 'VERY_SAFE';
        level = 'VERY_LOW';
        recommendation = 'Ideal storage conditions. Product is fresh and safe.';
      }
    }

    // Generate detailed suggestions
    const suggestions = generateDetailedSuggestions(temp, daysUntilExpiry, status, productCategory);
    setDetailedSuggestions(suggestions);

    return { status, level, recommendation };
  };

  const getSafetyStatusInfo = (status, level) => {
    switch (status) {
      case 'VERY_SAFE':
        return {
          color: '#059669',
          bgColor: '#ecfdf5',
          borderColor: '#a7f3d0',
          icon: 'checkmark-circle',
          message: 'Very Safe',
          description: 'Ideal storage conditions',
          emoji: '✅'
        };
      case 'SAFE':
        return {
          color: '#10b981',
          bgColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          icon: 'checkmark',
          message: 'Safe',
          description: 'Good storage conditions',
          emoji: '👍'
        };
      case 'CAUTION':
        return {
          color: '#f59e0b',
          bgColor: '#fffbeb',
          borderColor: '#fed7aa',
          icon: 'warning',
          message: 'Caution Needed',
          description: 'Monitor conditions',
          emoji: '⚠️'
        };
      case 'RISKY':
        return {
          color: '#ea580c',
          bgColor: '#fff7ed',
          borderColor: '#fdba74',
          icon: 'alert-circle',
          message: 'Risky',
          description: 'Immediate attention needed',
          emoji: '🔴'
        };
      case 'UNSAFE':
        return {
          color: '#dc2626',
          bgColor: '#fef2f2',
          borderColor: '#fecaca',
          icon: 'close-circle',
          message: 'Unsafe',
          description: 'Do not consume',
          emoji: '❌'
        };
      default:
        return {
          color: '#6b7280',
          bgColor: '#f9fafb',
          borderColor: '#e5e7eb',
          icon: 'help-circle',
          message: 'Checking...',
          description: 'Evaluating safety',
          emoji: '⏳'
        };
    }
  };

  const getRiskLevelInfo = (level) => {
    switch (level) {
      case 'VERY_LOW':
        return { color: '#059669', label: 'Very Low Risk', width: '20%' };
      case 'LOW':
        return { color: '#10b981', label: 'Low Risk', width: '40%' };
      case 'MEDIUM':
        return { color: '#f59e0b', label: 'Medium Risk', width: '60%' };
      case 'HIGH':
        return { color: '#ea580c', label: 'High Risk', width: '80%' };
      case 'CRITICAL':
        return { color: '#dc2626', label: 'Critical Risk', width: '100%' };
      default:
        return { color: '#6b7280', label: 'Evaluating', width: '10%' };
    }
  };

  // Fetch product details
  const fetchProduct = async () => {
    if (productData) {
      setProductImage(getProductImage(productData.category));
      const daysUntilExpiry = checkExpiryDate(productData.expiry_date);
      await getWeatherData(productData.location, daysUntilExpiry);
      startAnimations();
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.get(`${apiConfig.baseURL}/products/${productId}`);
      const productData = response.data;
      setProduct(productData);
      setProductImage(getProductImage(productData.category));
      
      const daysUntilExpiry = checkExpiryDate(productData.expiry_date);
      await getWeatherData(productData.location, daysUntilExpiry);
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

    // Warning pulse animation for high risk
    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(warningAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(warningAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  };

  const getWeatherData = async (location, daysUntilExpiry) => {
    try {
      setWeatherLoading(true);
      setUsingFallback(false);

      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          q: location,
          appid: '1e21c330766a1b5cea3812bec28eb16b',
          units: "metric",
        },
        timeout: 10000,
      });

      const weatherInfo = response.data;
      setWeatherData(weatherInfo);
      
      const currentTemp = Math.round(weatherInfo.main.temp);
      setTemperature(currentTemp);
      
      // Update weather background based on condition
      const background = getWeatherBackground(weatherInfo.weather[0].main);
      setWeatherBackground(background);
      
      // Calculate safety status with both temperature and expiry
      const safety = calculateSafetyStatus(currentTemp, daysUntilExpiry, product?.category);
      setSafetyStatus(safety.status);
      setRiskLevel(safety.level);
      setRecommendation(safety.recommendation);
      
      checkTemperatureAlert(currentTemp, daysUntilExpiry, safety.status);
      
    } catch (error) {
      console.warn('Weather API failed:', error.message);
      setUsingFallback(true);
      
      const fallbackTemp = 28;
      setTemperature(fallbackTemp);
      const safety = calculateSafetyStatus(fallbackTemp, daysUntilExpiry, product?.category);
      setSafetyStatus(safety.status);
      setRiskLevel(safety.level);
      setRecommendation(safety.recommendation);
      
    } finally {
      setWeatherLoading(false);
    }
  };

  const checkTemperatureAlert = (temp, daysUntilExpiry, safetyStatus) => {
    setTimeout(() => {
      if (safetyStatus === 'UNSAFE') {
        Alert.alert(
          '🚨 UNSAFE TO CONSUME',
          `Product has expired and current temperature (${temp}°C) makes it dangerous to consume.`,
          [{ text: 'UNDERSTOOD', style: 'destructive' }]
        );
      } else if (safetyStatus === 'RISKY') {
        Alert.alert(
          '⚠️ HIGH RISK ALERT',
          `Temperature: ${temp}°C | Expires in: ${daysUntilExpiry} days\n\n${recommendation}`,
          [{ text: 'ACKNOWLEDGE', style: 'default' }]
        );
      } else if (safetyStatus === 'CAUTION') {
        Alert.alert(
          '🔔 CAUTION ADVISED',
          `Temperature: ${temp}°C | Expires in: ${daysUntilExpiry} days\n\n${recommendation}`,
          [{ text: 'GOT IT', style: 'default' }]
        );
      }
    }, 1500);
  };

  const checkExpiryDate = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff <= 0) {
      setExpiryStatus('EXPIRED');
    } else if (daysDiff <= 2) {
      setExpiryStatus('CRITICAL');
    } else if (daysDiff <= 5) {
      setExpiryStatus('WARNING');
    } else {
      setExpiryStatus('SAFE');
    }

    return daysDiff;
  };

  const getExpiryStatusInfo = () => {
    const daysUntilExpiry = getDaysUntilExpiry();
    
    switch (expiryStatus) {
      case 'EXPIRED':
        return { 
          color: '#dc2626', 
          bgColor: '#fef2f2',
          borderColor: '#fecaca',
          message: 'Expired', 
          icon: 'close-circle',
          description: 'Do not consume',
          days: daysUntilExpiry
        };
      case 'CRITICAL':
        return { 
          color: '#ea580c', 
          bgColor: '#fff7ed',
          borderColor: '#fed7aa',
          message: 'Critical', 
          icon: 'warning',
          description: 'Expires very soon',
          days: daysUntilExpiry
        };
      case 'WARNING':
        return { 
          color: '#f59e0b', 
          bgColor: '#fffbeb',
          borderColor: '#fed7aa',
          message: 'Warning', 
          icon: 'alert-circle',
          description: 'Expires soon',
          days: daysUntilExpiry
        };
      case 'SAFE':
        return { 
          color: '#16a34a', 
          bgColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          message: 'Safe', 
          icon: 'checkmark-circle',
          description: 'Within expiry period',
          days: daysUntilExpiry
        };
      default:
        return { 
          color: '#6b7280', 
          bgColor: '#f9fafb',
          borderColor: '#e5e7eb',
          message: 'Checking...', 
          icon: 'time',
          description: 'Verifying status',
          days: daysUntilExpiry
        };
    }
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
      const daysUntilExpiry = getDaysUntilExpiry();
      await getWeatherData(product.location, daysUntilExpiry);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: 'transparent',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: '600',
      },
      title: 'Safety Analysis',
      headerTransparent: true,
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Analyzing product safety...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#6b7280" />
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.errorSubtitle}>
          Unable to load product details. Please try again.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProduct}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const expiryInfo = getExpiryStatusInfo();
  const safetyInfo = getSafetyStatusInfo(safetyStatus, riskLevel);
  const riskInfo = getRiskLevelInfo(riskLevel);
  const daysUntilExpiry = getDaysUntilExpiry();
  const weatherCondition = weatherData?.weather?.[0]?.description;
  const weatherIcon = getWeatherConditionIcon(weatherData?.weather?.[0]?.main);
  const humidity = weatherData?.main?.humidity;

  const getSuggestionUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'critical': return styles.criticalSuggestion;
      case 'high': return styles.highSuggestion;
      case 'medium': return styles.mediumSuggestion;
      case 'low': return styles.lowSuggestion;
      default: return styles.infoSuggestion;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
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
          <ImageBackground
            source={{ uri: weatherBackground }}
            style={styles.weatherBackground}
            imageStyle={styles.weatherBackgroundImage}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
              style={styles.weatherOverlay}
            >
              <View style={styles.weatherTopRow}>
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={20} color="#fff" />
                  <Text style={styles.locationText}>{product.location}</Text>
                </View>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>
              
              <View style={styles.weatherMain}>
                {temperature !== null && (
                  <Animated.View style={[styles.temperatureMain, { transform: [{ scale: pulseAnim }] }]}>
                    <Ionicons name={weatherIcon} size={52} color="#fff" />
                    <View style={styles.temperatureInfo}>
                      <Text style={styles.temperature}>{temperature}°C</Text>
                      <Text style={styles.weatherCondition}>
                        {weatherCondition || 'Loading weather...'}
                      </Text>
                    </View>
                  </Animated.View>
                )}
              </View>

              {/* Weather Details */}
              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetailItem}>
                  <Ionicons name="water" size={16} color="#93c5fd" />
                  <Text style={styles.weatherDetailText}>
                    {humidity || '--'}% Humidity
                  </Text>
                </View>
                <View style={styles.weatherDetailItem}>
                  <Ionicons name="speedometer" size={16} color="#93c5fd" />
                  <Text style={styles.weatherDetailText}>
                    {weatherData?.main?.pressure || '--'} hPa
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </Animated.View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Safety Status Banner */}
          <Animated.View 
            style={[
              styles.safetyBanner,
              { 
                backgroundColor: safetyInfo.bgColor,
                borderColor: safetyInfo.borderColor,
                opacity: warningAnim.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.3, 1]
                })
              }
            ]}
          >
            <View style={styles.safetyHeader}>
              <View style={styles.safetyIconContainer}>
                <Ionicons name={safetyInfo.icon} size={36} color={safetyInfo.color} />
              </View>
              <View style={styles.safetyTextContainer}>
                <Text style={[styles.safetyStatus, { color: safetyInfo.color }]}>
                  {safetyInfo.message}
                </Text>
                <Text style={styles.safetyDescription}>
                  {safetyInfo.description}
                </Text>
              </View>
              <Text style={styles.safetyEmoji}>{safetyInfo.emoji}</Text>
            </View>
            
            {/* Risk Level Bar */}
            <View style={styles.riskLevelContainer}>
              <View style={styles.riskLabels}>
                <Text style={styles.riskLabel}>Low Risk</Text>
                <Text style={styles.riskLabel}>High Risk</Text>
              </View>
              <View style={styles.riskBarBackground}>
                <View 
                  style={[
                    styles.riskBarFill,
                    { 
                      backgroundColor: riskInfo.color,
                      width: riskInfo.width
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.riskLevelText, { color: riskInfo.color }]}>
                {riskInfo.label}
              </Text>
            </View>
          </Animated.View>

          {/* Detailed Safety Suggestions */}
          {detailedSuggestions.length > 0 && (
            <Animated.View 
              style={[
                styles.suggestionsCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.suggestionsHeader}>
                <MaterialIcons name="lightbulb" size={26} color="#7c3aed" />
                <Text style={styles.suggestionsTitle}>Safety Recommendations</Text>
              </View>
              
              <View style={styles.suggestionsList}>
                {detailedSuggestions.map((suggestion, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.suggestionItem,
                      getSuggestionUrgencyStyle(suggestion.urgency)
                    ]}
                  >
                    <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                    <View style={styles.suggestionContent}>
                      <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                      <Text style={styles.suggestionDescription}>
                        {suggestion.description}
                      </Text>
                      <Text style={styles.suggestionReason}>
                        Why: {suggestion.reason}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Recommendation Card */}
          <Animated.View 
            style={[
              styles.recommendationCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.recommendationHeader}>
              <MaterialIcons name="recommend" size={26} color="#7c3aed" />
              <Text style={styles.recommendationTitle}>Safety Summary</Text>
            </View>
            <Text style={styles.recommendationText}>{recommendation}</Text>
            
            <View style={styles.conditionSummary}>
              <View style={styles.conditionItem}>
                <Ionicons name="thermometer" size={18} color="#dc2626" />
                <Text style={styles.conditionLabel}>Temperature:</Text>
                <Text style={styles.conditionValue}>{temperature}°C</Text>
              </View>
              <View style={styles.conditionItem}>
                <Ionicons name="calendar" size={18} color="#dc2626" />
                <Text style={styles.conditionLabel}>Days until expiry:</Text>
                <Text style={styles.conditionValue}>
                  {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'EXPIRED'}
                </Text>
              </View>
            </View>
          </Animated.View>

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
            <View style={styles.productImageContainer}>
              <Image 
                source={{ uri: productImage }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.productImageOverlay}
              />
              <View style={styles.productImageContent}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
              </View>
            </View>

            <View style={styles.productDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="barcode" size={18} color="#7c3aed" />
                  <Text style={styles.detailLabel}>Batch:</Text>
                  <Text style={styles.detailValue}>{product.batch_code}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="navigate" size={18} color="#7c3aed" />
                  <Text style={styles.detailLabel}>Origin:</Text>
                  <Text style={styles.detailValue}>{product.origin}</Text>
                </View>
              </View>
              
              <View style={styles.expiryStatusContainer}>
                <View style={[styles.expiryBadge, { backgroundColor: expiryInfo.bgColor, borderColor: expiryInfo.borderColor }]}>
                  <Ionicons name={expiryInfo.icon} size={22} color={expiryInfo.color} />
                  <Text style={[styles.expiryText, { color: expiryInfo.color }]}>
                    {expiryInfo.message} • {expiryInfo.days > 0 ? `${expiryInfo.days} days` : 'NOW'}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Temperature Impact Analysis */}
          <Animated.View 
            style={[
              styles.analysisCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.analysisHeader}>
              <FontAwesome5 name="temperature-high" size={26} color="#7c3aed" />
              <Text style={styles.analysisTitle}>Temperature Impact Analysis</Text>
            </View>

            <View style={styles.temperatureZones}>
              <View style={[styles.tempZone, temperature <= 25 && styles.activeZone]}>
                <Text style={styles.tempRange}>Below 25°C</Text>
                <Text style={styles.tempStatus}>✅ Safe Zone</Text>
                <Text style={styles.tempDescription}>Normal expiry applies</Text>
              </View>
              
              <View style={[styles.tempZone, temperature > 25 && temperature <= 30 && styles.activeZone]}>
                <Text style={styles.tempRange}>25°C - 30°C</Text>
                <Text style={styles.tempStatus}>⚠️ Caution Zone</Text>
                <Text style={styles.tempDescription}>Expiry may accelerate</Text>
              </View>
              
              <View style={[styles.tempZone, temperature > 30 && styles.activeZone]}>
                <Text style={styles.tempRange}>Above 30°C</Text>
                <Text style={styles.tempStatus}>🚨 Danger Zone</Text>
                <Text style={styles.tempDescription}>Rapid quality degradation</Text>
              </View>
            </View>

            <View style={styles.currentTempIndicator}>
              <Text style={styles.currentTempLabel}>Current Temperature:</Text>
              <Text style={[styles.currentTempValue, 
                temperature > 30 ? styles.dangerTemp : 
                temperature > 25 ? styles.warningTemp : styles.safeTemp
              ]}>
                {temperature}°C
              </Text>
            </View>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Last updated: {new Date(product.updated_at).toLocaleDateString()}
            </Text>
            <Text style={styles.footerNote}>
              Safety analysis based on real-time weather and expiry data
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 30,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 12,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    marginLeft: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    marginRight: 8,
  },
  weatherHeader: {
    height: 240,
    paddingHorizontal: 0,
  },
  weatherBackground: {
    flex: 1,
  },
  weatherBackgroundImage: {
    borderRadius: 0,
  },
  weatherOverlay: {
    flex: 1,
    borderRadius: 0,
    padding: 20,
    justifyContent: 'space-between',
  },
  weatherTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  temperatureMain: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  temperatureInfo: {
    marginLeft: 16,
  },
  temperature: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  weatherCondition: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    marginTop: 4,
    textTransform: 'capitalize',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  weatherDetailText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginLeft: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  safetyBanner: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  safetyIconContainer: {
    marginRight: 16,
  },
  safetyTextContainer: {
    flex: 1,
  },
  safetyStatus: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  safetyDescription: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  safetyEmoji: {
    fontSize: 36,
  },
  riskLevelContainer: {
    marginTop: 12,
  },
  riskLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  riskLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  riskBarBackground: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 5,
    transition: 'width 0.5s ease-in-out',
  },
  riskLevelText: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Suggestions Styles
  suggestionsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 14,
  },
  suggestionsList: {
    gap: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  criticalSuggestion: {
    backgroundColor: '#fef2f2',
    borderLeftColor: '#dc2626',
  },
  highSuggestion: {
    backgroundColor: '#fff7ed',
    borderLeftColor: '#ea580c',
  },
  mediumSuggestion: {
    backgroundColor: '#fffbeb',
    borderLeftColor: '#f59e0b',
  },
  lowSuggestion: {
    backgroundColor: '#f0fdf4',
    borderLeftColor: '#10b981',
  },
  infoSuggestion: {
    backgroundColor: '#f0f9ff',
    borderLeftColor: '#0ea5e9',
  },
  suggestionIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
    lineHeight: 20,
  },
  suggestionReason: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 14,
  },
  recommendationText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 18,
  },
  conditionSummary: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  conditionLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 10,
    marginRight: 8,
  },
  conditionValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  productImageContainer: {
    height: 140,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  productImageContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  productCategory: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '500',
  },
  productDetails: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 8,
    marginRight: 6,
  },
  detailValue: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  expiryStatusContainer: {
    marginTop: 12,
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  expiryText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  analysisCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 14,
  },
  temperatureZones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tempZone: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    marginHorizontal: 6,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  activeZone: {
    borderColor: '#7c3aed',
    backgroundColor: '#faf5ff',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tempRange: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
  },
  tempStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  tempDescription: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 14,
  },
  currentTempIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  currentTempLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
    marginRight: 10,
  },
  currentTempValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  safeTemp: {
    color: '#059669',
  },
  warningTemp: {
    color: '#ea580c',
  },
  dangerTemp: {
    color: '#dc2626',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 6,
  },
  footerNote: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ProductDetailsWeatherPage;