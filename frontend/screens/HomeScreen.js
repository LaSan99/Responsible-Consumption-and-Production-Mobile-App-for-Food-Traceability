import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  SafeAreaView,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(3);
  const scrollY = new Animated.Value(0);
  const [activeTab, setActiveTab] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);

  const sliderImages = [
    {
      id: 1,
      image: 'https://i.postimg.cc/HxGSfbP6/image.png',
      title: 'Fresh Organic Produce',
      subtitle: 'Direct from local farms'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3JvY2VyeSUyMHN0b3JlfGVufDB8fDB8fHww&w=1000&q=80',
      title: 'Trace Your Food',
      subtitle: 'Know your food\'s journey'
    },
    {
      id: 3,
      image: 'https://i.postimg.cc/14x5FCWX/image.png',
      title: 'Support Local Farmers',
      subtitle: 'Build sustainable communities'
    }
  ];

  const [recentProducts] = useState([
    { 
      id: 1, 
      name: 'Organic Tomatoes', 
      farm: 'Green Valley Farm', 
      rating: 4.8,
      price: '$12.99/kg',
      verified: true,
      freshness: 95
    },
    { 
      id: 2, 
      name: 'Free Range Eggs', 
      farm: 'Happy Hen Farm', 
      rating: 4.9,
      price: '$8.50/dozen',
      verified: true,
      freshness: 98
    },
    { 
      id: 3, 
      name: 'Wild Salmon', 
      farm: 'Ocean Fresh Co.', 
      rating: 4.7,
      price: '$24.99/kg',
      verified: true,
      freshness: 92
    }
  ]);

  const navigationItems = [
    {
      title: 'Products',
      icon: 'storefront-outline',
      iconFamily: 'Ionicons',
      description: 'Browse items',
      gradient: ['#667eea', '#764ba2'],
      screen: 'Products'
    },
    {
      title: 'Scan QR',
      icon: 'qr-code-scanner',
      iconFamily: 'MaterialIcons',
      description: 'Trace origin',
      gradient: ['#f093fb', '#f5576c'],
      screen: 'Scanner'
    },
   
    {
      title: 'Analytics',
      icon: 'stats-chart',
      iconFamily: 'Ionicons',
      description: 'Insights',
      gradient: ['#fa709a', '#dcc22fff'],
      screen: 'Analytics'
    },
    {
      title: 'Certificates',
      icon: 'certificate',
      iconFamily: 'FontAwesome5',
      description: 'Credentials',
      gradient:  ['#4facfe', '#41c0c7ff'],
      screen: 'Certifications'
    },
    {
      title: 'Find Farmer',
      icon: 'map-marker-radius',
      iconFamily: 'MaterialIcons',
      description: 'Nearby farms',
      gradient: ['#21ada6ff', '#37fb8fff'],
      screen: 'FindFarmerScreen', 
    },
    {
      title: 'Supply Map',
      icon: 'map-outline',
      iconFamily: 'Ionicons',
      description: 'Track stages',
      gradient: ['#0a064aff', '#9791cdff'],
      screen: 'SupplyChainMap',
    },
  ];

  const quickStats = [
    { label: 'Scanned', value: '24', icon: 'scan', change: '+12%', color: '#667eea' },
    { label: 'CO₂ Saved', value: '8.4kg', icon: 'leaf', change: '+8%', color: '#43e97b' },
    { label: 'Rating', value: '4.9', icon: 'star', change: '+0.2', color: '#fa709a' },
  ];

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    };
    loadUser();

    // Auto slide every 5 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  const handleNavigation = (screen) => {
    if (navigation.navigate) {
      navigation.navigate(screen);
    } else {
      Alert.alert('Navigation', `Opening ${screen}`);
    }
  };

  const renderIcon = (iconName, iconFamily, size = 24, color = '#FFF') => {
    switch (iconFamily) {
      case 'Ionicons':
        return <Ionicons name={iconName} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName} size={size} color={color} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={iconName} size={size} color={color} />;
      case 'Feather':
        return <Feather name={iconName} size={size} color={color} />;
      default:
        return <Ionicons name={iconName} size={size} color={color} />;
    }
  };

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" translucent />
      
      {/* Floating Header */}
      <SafeAreaView style={styles.headerContainer}>
        <Animated.View style={[styles.header, { transform: [{ scale: headerScale }] }]}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={28} color="#10B981" />
            </View>
            <View>
              <Text style={styles.appTitle}>Farm2Fork</Text>
              <Text style={styles.appSubtitle}>Smart Tracking</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
           
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={22} color="#1F2937" />
              {notifications > 0 && <View style={styles.notificationDot} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Image Slider */}
        <View style={styles.sliderContainer}>
          <View style={styles.sliderWrapper}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const slide = Math.round(event.nativeEvent.contentOffset.x / width);
                setCurrentSlide(slide);
              }}
              scrollEventThrottle={16}
            >
              {sliderImages.map((slide) => (
                <View key={slide.id} style={styles.slide}>
                  <Image 
                    source={{ uri: slide.image }} 
                    style={styles.slideImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.slideGradient}
                  >
                    <View style={styles.slideContent}>
                      <Text style={styles.slideTitle}>{slide.title}</Text>
                      <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </ScrollView>
            
            {/* Slider Indicators */}
            <View style={styles.sliderIndicators}>
              {sliderImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    currentSlide === index && styles.indicatorActive
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

       

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Enhanced Search */}
          <TouchableOpacity
            style={styles.searchCard}
            onPress={() => handleNavigation('Search')}
            activeOpacity={0.8}
          >
            <View style={styles.searchIconBox}>
              <Ionicons name="search" size={20} color="#667eea" />
            </View>
            <Text style={styles.searchPlaceholder}>Search products, farms...</Text>
            <View style={styles.micButton}>
              <Ionicons name="mic-outline" size={18} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          {/* Category Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['All', 'Fresh', 'Organic', 'Local', 'Seafood'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabChip,
                    activeTab === tab.toLowerCase() && styles.tabChipActive
                  ]}
                  onPress={() => setActiveTab(tab.toLowerCase())}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.tabText,
                    activeTab === tab.toLowerCase() && styles.tabTextActive
                  ]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Quick Actions Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Access</Text>
              <TouchableOpacity>
                <Ionicons name="grid-outline" size={20} color="#667eea" />
              </TouchableOpacity>
            </View>
            <View style={styles.actionsGrid}>
              {navigationItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionCard}
                  onPress={() => handleNavigation(item.screen)}
                  activeOpacity={0.75}
                >
                  <LinearGradient
                    colors={item.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionGradient}
                  >
                    <View style={styles.actionTop}>
                      <View style={styles.actionIconCircle}>
                        {renderIcon(item.icon, item.iconFamily, 24, '#FFF')}
                      </View>
                      <View style={styles.arrowCircle}>
                        <Ionicons name="arrow-forward" size={14} color="#FFF" />
                      </View>
                    </View>
                    <View style={styles.actionBottom}>
                      <Text style={styles.actionTitle}>{item.title}</Text>
                      <Text style={styles.actionDesc}>{item.description}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recently Traced Products */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Recently Traced</Text>
                <Text style={styles.sectionSubtitle}>Your latest scans</Text>
              </View>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => handleNavigation('Products')}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color="#667eea" />
              </TouchableOpacity>
            </View>

            {recentProducts.map((product) => (
              <TouchableOpacity 
                key={product.id} 
                style={styles.productCard}
                activeOpacity={0.8}
              >
                <View style={styles.productImageBox}>
                  <LinearGradient
                    colors={['#667eea22', '#764ba222']}
                    style={styles.productImageGradient}
                  >
                    <Ionicons name="leaf" size={28} color="#667eea" />
                  </LinearGradient>
                  {product.verified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    </View>
                  )}
                </View>

                <View style={styles.productDetails}>
                  <View style={styles.productHeader}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <View style={styles.ratingBox}>
                      <Ionicons name="star" size={14} color="#FBBF24" />
                      <Text style={styles.ratingText}>{product.rating}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.productMeta}>
                    <Ionicons name="location" size={14} color="#9CA3AF" />
                    <Text style={styles.farmName}>{product.farm}</Text>
                  </View>

                  <View style={styles.productFooter}>
                    <Text style={styles.priceText}>{product.price}</Text>
                    <View style={styles.freshnessBar}>
                      <View style={styles.freshnessLabel}>
                        <Ionicons name="fitness" size={12} color="#10B981" />
                        <Text style={styles.freshnessText}>{product.freshness}% Fresh</Text>
                      </View>
                      <View style={styles.freshnessProgress}>
                        <View style={[styles.freshnessIndicator, { width: `${product.freshness}%` }]} />
                      </View>
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.moreButton}>
                  <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sustainability Card */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.sustainabilityCard} activeOpacity={0.9}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sustainabilityGradient}
              >
                <View style={styles.sustainabilityLeft}>
                  <View style={styles.sustainabilityIcon}>
                    <Ionicons name="earth" size={28} color="#FFF" />
                  </View>
                  <View style={styles.sustainabilityContent}>
                    <View style={styles.tipBadge}>
                      <Ionicons name="bulb" size={12} color="#10B981" />
                      <Text style={styles.tipBadgeText}>Eco Tip</Text>
                    </View>
                    <Text style={styles.sustainabilityTitle}>Go Local, Go Green</Text>
                    <Text style={styles.sustainabilityText}>
                      Support local farmers and reduce your carbon footprint by 40%
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.5)" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Impact Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Impact</Text>
            <View style={styles.impactGrid}>
              <View style={styles.impactCard}>
                <View style={styles.impactIconBox}>
                  <Ionicons name="leaf-outline" size={24} color="#10B981" />
                </View>
                <Text style={styles.impactValue}>128kg</Text>
                <Text style={styles.impactLabel}>CO₂ Reduced</Text>
              </View>
              <View style={styles.impactCard}>
                <View style={styles.impactIconBox}>
                  <Ionicons name="water-outline" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.impactValue}>2,450L</Text>
                <Text style={styles.impactLabel}>Water Saved</Text>
              </View>
              <View style={styles.impactCard}>
                <View style={styles.impactIconBox}>
                  <Ionicons name="people-outline" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.impactValue}>12</Text>
                <Text style={styles.impactLabel}>Farmers Helped</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  // Slider Styles
  sliderContainer: {
    marginTop: Platform.OS === 'ios' ? 100 : 120,
    marginBottom: 20,
  },
  sliderWrapper: {
    position: 'relative',
  },
  slide: {
    width: width - 40,
    height: 200,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  slideContent: {
    marginBottom: 10,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  sliderIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorActive: {
    backgroundColor: '#FFF',
    width: 24,
  },
  // Stats Container
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    alignSelf: 'flex-start',
  },
  changeText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
  mainContent: {
    paddingHorizontal: 20,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    marginBottom: 24,
  },
  tabChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  tabChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFF',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  actionGradient: {
    padding: 20,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  actionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBottom: {
    marginTop: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  productImageBox: {
    width: 70,
    height: 70,
    marginRight: 16,
    position: 'relative',
  },
  productImageGradient: {
    width: 70,
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  productName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  farmName: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#667eea',
  },
  freshnessBar: {
    flex: 1,
    marginLeft: 12,
  },
  freshnessLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  freshnessText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
  freshnessProgress: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  freshnessIndicator: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sustainabilityCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  sustainabilityGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  sustainabilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sustainabilityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sustainabilityContent: {
    flex: 1,
  },
  tipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 4,
  },
  tipBadgeText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '800',
  },
  sustainabilityTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  sustainabilityText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    lineHeight: 18,
  },
  impactGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  impactCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  impactIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '700',
    textAlign: 'center',
  },
  bottomSpace: {
    height: 60,
  },
});