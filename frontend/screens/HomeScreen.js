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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(3);

  // Mock recent products data
  const [recentProducts] = useState([
    { id: 1, name: 'Organic Tomatoes', farm: 'Green Valley Farm', rating: 4.8 },
    { id: 2, name: 'Free Range Eggs', farm: 'Happy Hen Farm', rating: 4.9 },
    { id: 3, name: 'Wild Salmon', farm: 'Ocean Fresh Co.', rating: 4.7 }
  ]);

  const navigationItems = [
    {
      title: 'Products',
      icon: '🛒',
      description: 'Browse traceable products',
      color: '#10B981',
      screen: 'Products'
    },
    {
      title: 'Scan QR',
      icon: '📱',
      description: 'Trace product origin',
      color: '#3B82F6',
      screen: 'Scanner'
    },
    {
      title: 'My Profile',
      icon: '👤',
      description: 'Manage your account',
      color: '#8B5CF6',
      screen: 'Profile'
    },
    {
      title: 'Contact Us',
      icon: '📞',
      description: 'Get support & feedback',
      color: '#F59E0B',
      screen: 'Contact'
    },
    {
      title: 'Analytics',
      icon: '📊',
      description: 'Your consumption insights',
      color: '#6366F1',
      screen: 'Analytics'
    },
    {
      title: 'Certifications',
      icon: '🏆',
      description: 'View verified credentials',
      color: '#EAB308',
      screen: 'Certifications'
    }
  ];

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ]
    );
  };

  const handleNavigation = (screen) => {
    if (navigation.navigate) {
      navigation.navigate(screen);
    } else {
      Alert.alert('Navigation', `Navigating to ${screen} screen`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#f8fafc"
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🌿</Text>
            </View>
            <View>
              <Text style={styles.appName}>FoodTrace</Text>
              <Text style={styles.appTagline}>Responsible Consumption</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationContainer}>
              <Text style={styles.notificationIcon}>🔔</Text>
              {notifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>{notifications}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Section */}
        {user && (
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeLeft}>
                <Text style={styles.welcomeTitle}>Welcome back, {user.full_name}!</Text>
                <Text style={styles.userRole}>Role: {user.role}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <View style={styles.welcomeRight}>
                <View style={styles.dateContainer}>
                  <Text style={styles.dateIcon}>📅</Text>
                  <Text style={styles.dateText}>Today</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {navigationItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={() => handleNavigation(item.screen)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: item.color }]}>
                  <Text style={styles.actionIconText}>{item.icon}</Text>
                </View>
                <Text style={styles.actionTitle}>{item.title}</Text>
                <Text style={styles.actionDescription}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Traced</Text>
            <TouchableOpacity onPress={() => handleNavigation('Products')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productsContainer}>
            {recentProducts.map((product) => (
              <TouchableOpacity key={product.id} style={styles.productCard} activeOpacity={0.7}>
                <View style={styles.productLeft}>
                  <View style={styles.productIcon}>
                    <Text style={styles.productIconText}>🌿</Text>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <View style={styles.productLocation}>
                      <Text style={styles.locationIcon}>📍</Text>
                      <Text style={styles.farmName}>{product.farm}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.productRight}>
                  <Text style={styles.starIcon}>⭐</Text>
                  <Text style={styles.ratingText}>{product.rating}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sustainability Tip */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Text style={styles.tipIconText}>🌿</Text>
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Sustainability Tip</Text>
              <Text style={styles.tipText}>
                Choose locally sourced products to reduce your carbon footprint! 🌱
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.searchContainer}
            onPress={() => handleNavigation('Search')}
            activeOpacity={0.7}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Search for products, farms, or certifications...</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoIcon: {
    fontSize: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  appTagline: {
    fontSize: 12,
    color: '#6b7280',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationContainer: {
    position: 'relative',
    marginRight: 15,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeSection: {
    margin: 20,
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeLeft: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  userRole: {
    fontSize: 14,
    color: '#dcfce7',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: '#dcfce7',
  },
  welcomeRight: {
    alignItems: 'center',
  },
  dateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  dateIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#ffffff',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  productsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  productLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#10B981',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productIconText: {
    fontSize: 20,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  productLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  farmName: {
    fontSize: 12,
    color: '#6b7280',
  },
  productRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  tipCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  tipIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipIconText: {
    fontSize: 18,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#9ca3af',
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
});