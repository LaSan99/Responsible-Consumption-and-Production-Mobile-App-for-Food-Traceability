import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  Dimensions,
  Switch,
  Modal,
  Animated,
  RefreshControl,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import apiConfig from '../config/api';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerScroll = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    loadUserData();
    if (user?.role === 'producer') {
      loadProducerProducts();
    }
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [user?.role]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    if (user?.role === 'producer') {
      await loadProducerProducts();
    }
    setRefreshing(false);
  }, [user?.role]);

  const headerOpacity = headerScroll.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    role: '',
    department: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    biometricLogin: true,
    twoFactorAuth: true,
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    autoSync: true,
  });

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setProfileData({
          full_name: userObj.full_name || '',
          email: userObj.email || '',
          phone: userObj.phone || '',
          address: userObj.address || '',
          company: userObj.company || (userObj.role === 'producer' ? 'Agricultural Producer' : 'Consumer'),
          role: userObj.role || 'consumer',
          department: userObj.department || (userObj.role === 'producer' ? 'Agriculture' : 'General'),
        });
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
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      const updateData = {
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        company: profileData.company,
      };

      const response = await axios.put(
        `${apiConfig.baseURL}/auth/profile`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const updatedUser = { ...user, ...updateData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      const passwordUpdateData = {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword,
      };

      await axios.put(
        `${apiConfig.baseURL}/auth/change-password`,
        passwordUpdateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

const handleLogout = async () => {
  try {
    setIsLoading(true);

    // Remove stored authentication data
    await AsyncStorage.multiRemove(['token', 'user']);

  

    console.log("User logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    setIsLoading(false);
  }
};

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    headerScroll.setValue(scrollY);
  };

  // Calculate real stats from products for producer
  const getProducerStats = () => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const certifiedProducts = products.filter(p => p.certifications && p.certifications.length > 0).length;
    const totalRevenue = products.reduce((sum, product) => sum + (product.price * (product.soldQuantity || 0)), 0);
    
    return {
      totalProducts,
      activeProducts,
      certifiedProducts,
      totalRevenue,
      satisfactionRate: totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0,
    };
  };

  // Consumer stats
  const getConsumerStats = () => {
    return {
      ordersCompleted: 12,
      favoriteProducts: 8,
      satisfactionRate: 95,
      reviewsWritten: 6,
      totalSpent: 1247.50,
    };
  };

  const stats = user?.role === 'producer' ? getProducerStats() : getConsumerStats();

  const ProfessionalStatCard = ({ icon, value, label, trend, color }) => (
    <Animated.View 
      style={[
        styles.statCard,
        { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }] 
        }
      ]}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {trend && (
        <View style={[styles.trendIndicator, { backgroundColor: trend > 0 ? '#10B981' : '#EF4444' }]}>
          <Ionicons 
            name={trend > 0 ? "trending-up" : "trending-down"} 
            size={12} 
            color="#FFFFFF" 
          />
          <Text style={styles.trendText}>{Math.abs(trend)}%</Text>
        </View>
      )}
    </Animated.View>
  );

  const ProductCard = ({ product, index }) => (
    <Animated.View 
      style={[
        styles.productCard,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })}
          ]
        }
      ]}
    >
      <View style={styles.productImageContainer}>
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.productImage}
        >
          <Text style={styles.productImageText}>
            {product.name?.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>
        <View style={[styles.statusBadge, 
          { backgroundColor: product.status === 'active' ? '#10B981' : '#6B7280' }]}>
          <Text style={styles.statusText}>{product.status}</Text>
        </View>
      </View>
      
      <View style={styles.productContent}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>
        <View style={styles.productDetails}>
          <Text style={styles.productPrice}>${product.price}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
        </View>
        {product.certifications && product.certifications.length > 0 && (
          <View style={styles.certifications}>
            <Ionicons name="ribbon-outline" size={12} color="#6B7280" />
            <Text style={styles.certificationsText}>
              {product.certifications.length} certifications
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const SettingItem = ({ icon, title, description, value, onValueChange, type = 'switch', color = '#4CAF50' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIconContainer, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E5E7EB', true: `${color}80` }}
          thumbColor={value ? color : '#FFFFFF'}
        />
      ) : (
        <TouchableOpacity style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );

  const TabButton = ({ title, isActive, onPress, icon }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={isActive ? '#4CAF50' : '#6B7280'} 
        style={styles.tabIcon}
      />
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
        {title}
      </Text>
      {isActive && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );

  const getInitials = (name) => {
    if (!name) return user?.role === 'producer' ? 'P' : 'C';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplayName = (role) => {
    return role === 'producer' ? 'Producer' : 'Consumer';
  };

  const getRoleSpecificStats = () => {
    if (user?.role === 'producer') {
      return [
        { icon: "🌱", value: stats.totalProducts, label: "Total Products", color: '#10B981' },
        { icon: "✅", value: stats.activeProducts, label: "Active", color: '#3B82F6' },
        { icon: "📜", value: stats.certifiedProducts, label: "Certified", color: '#8B5CF6' },
        { icon: "💰", value: `$${stats.totalRevenue}`, label: "Revenue", color: '#F59E0B' },
      ];
    } else {
      return [
        { icon: "🛒", value: stats.ordersCompleted, label: "Orders", color: '#10B981' },
        { icon: "❤️", value: stats.favoriteProducts, label: "Favorites", color: '#EF4444' },
        { icon: "⭐", value: `${stats.satisfactionRate}%`, label: "Satisfaction", color: '#F59E0B' },
        { icon: "💰", value: `$${stats.totalSpent}`, label: "Total Spent", color: '#3B82F6' },
      ];
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      {/* Enhanced Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#4CAF50', '#388E3C']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={[styles.editButton, isEditing && styles.editButtonActive]}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons 
              name={isEditing ? "close" : "create-outline"} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {/* Enhanced Profile Hero Section */}
        <LinearGradient
          colors={['#4CAF50', '#388E3C', '#2E7D32']}
          style={styles.heroSection}
        >
          <View style={styles.heroBackground}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.circle3} />
          </View>
          
          <View style={styles.heroContent}>
            <View style={styles.avatarSection}>
              <Animated.View 
                style={[
                  styles.avatarContainer,
                  {
                    transform: [
                      {
                        scale: headerScroll.interpolate({
                          inputRange: [0, 100],
                          outputRange: [1, 0.8],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(user?.full_name)}
                  </Text>
                </LinearGradient>
                <View style={styles.statusIndicator} />
                
                {/* Role Badge */}
                <View style={styles.roleBadge}>
                  <Ionicons 
                    name={user?.role === 'producer' ? "leaf" : "person"} 
                    size={12} 
                    color="#FFFFFF" 
                  />
                </View>
              </Animated.View>
              
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.verifiedText}>
                  Verified {getRoleDisplayName(user?.role)}
                </Text>
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.full_name || getRoleDisplayName(user?.role)}</Text>
              <View style={styles.roleContainer}>
                <Ionicons 
                  name={user?.role === 'producer' ? "business" : "person"} 
                  size={14} 
                  color="#E8F5E8" 
                />
                <Text style={styles.userRole}>{getRoleDisplayName(user?.role)}</Text>
              </View>
              <Text style={styles.userCompany}>{profileData.company}</Text>
              
              <View style={styles.statsRow}>
                {user?.role === 'producer' ? (
                  <>
                    <View style={styles.statMini}>
                      <Text style={styles.statMiniValue}>{stats.totalProducts}</Text>
                      <Text style={styles.statMiniLabel}>Products</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statMini}>
                      <Text style={styles.statMiniValue}>{stats.activeProducts}</Text>
                      <Text style={styles.statMiniLabel}>Active</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statMini}>
                      <Text style={styles.statMiniValue}>{stats.certifiedProducts}</Text>
                      <Text style={styles.statMiniLabel}>Certified</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.statMini}>
                      <Text style={styles.statMiniValue}>{stats.ordersCompleted}</Text>
                      <Text style={styles.statMiniLabel}>Orders</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statMini}>
                      <Text style={styles.statMiniValue}>{stats.favoriteProducts}</Text>
                      <Text style={styles.statMiniLabel}>Favorites</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statMini}>
                      <Text style={styles.statMiniValue}>{stats.reviewsWritten}</Text>
                      <Text style={styles.statMiniLabel}>Reviews</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Enhanced Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>
            {user?.role === 'producer' ? 'Farm Overview' : 'Shopping Overview'}
          </Text>
          <View style={styles.statsGrid}>
            {getRoleSpecificStats().map((stat, index) => (
              <ProfessionalStatCard 
                key={index}
                icon={stat.icon} 
                value={stat.value} 
                label={stat.label}
                color={stat.color}
              />
            ))}
          </View>
        </View>

        {/* Enhanced Products Section for Producer */}
        {user?.role === 'producer' && products.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Products</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.productsScroll}
              contentContainerStyle={styles.productsContainer}
            >
              {products.map((product, index) => (
                <ProductCard key={product._id || index} product={product} index={index} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Enhanced Tab Navigation */}
        <View style={styles.tabContainer}>
          <TabButton 
            title="Profile" 
            icon="person-outline"
            isActive={activeTab === 'profile'} 
            onPress={() => setActiveTab('profile')} 
          />
          <TabButton 
            title="Settings" 
            icon="settings-outline"
            isActive={activeTab === 'settings'} 
            onPress={() => setActiveTab('settings')} 
          />
          <TabButton 
            title="Security" 
            icon="shield-checkmark-outline"
            isActive={activeTab === 'security'} 
            onPress={() => setActiveTab('security')} 
          />
        </View>

        {/* Enhanced Profile Tab Content */}
        {activeTab === 'profile' && (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {user?.role === 'producer' ? 'Producer Information' : 'Personal Information'}
                </Text>
                <View style={styles.editIndicator}>
                  <Ionicons 
                    name={isEditing ? "pencil" : "pencil-outline"} 
                    size={16} 
                    color="#6B7280" 
                  />
                  <Text style={styles.editIndicatorText}>
                    {isEditing ? 'Editing' : 'Edit'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.formContainer}>
                {[
                  { icon: "person-outline", label: "Full Name", value: profileData.full_name, key: 'full_name' },
                  { icon: "mail-outline", label: "Email Address", value: profileData.email, key: 'email', keyboardType: 'email-address' },
                  { icon: "call-outline", label: "Phone Number", value: profileData.phone, key: 'phone', keyboardType: 'phone-pad' },
                  { icon: "business-outline", label: user?.role === 'producer' ? 'Farm/Business Name' : 'Organization', value: profileData.company, key: 'company' },
                  { icon: "location-outline", label: user?.role === 'producer' ? 'Farm Address' : 'Delivery Address', value: profileData.address, key: 'address', multiline: true },
                ].map((field, index) => (
                  <Animated.View 
                    key={field.key}
                    style={[
                      styles.inputGroup,
                      {
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0]
                            })
                          }
                        ]
                      }
                    ]}
                  >
                    <View style={styles.inputLabelRow}>
                      <View style={styles.inputIcon}>
                        <Ionicons name={field.icon} size={18} color="#4CAF50" />
                      </View>
                      <Text style={styles.inputLabel}>{field.label}</Text>
                    </View>
                    <TextInput
                      style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                      value={field.value}
                      onChangeText={(value) => setProfileData(prev => ({ ...prev, [field.key]: value }))}
                      editable={isEditing}
                      placeholderTextColor="#9CA3AF"
                      keyboardType={field.keyboardType}
                      multiline={field.multiline}
                      autoCapitalize="none"
                    />
                  </Animated.View>
                ))}
              </View>

              {isEditing && (
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [{ scale: fadeAnim }]
                  }}
                >
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveProfile}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={['#4CAF50', '#45a049']}
                      style={styles.saveButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isLoading ? (
                        <Ionicons name="refresh" size={20} color="#FFFFFF" />
                      ) : (
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      )}
                      <Text style={styles.saveButtonText}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Enhanced Settings Tab Content */}
        {activeTab === 'settings' && (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <View style={styles.settingsContainer}>
                {[
                  { icon: "notifications-outline", title: "Push Notifications", description: `Get instant notifications about ${user?.role === 'producer' ? 'your products' : 'your orders'}`, value: preferences.pushNotifications, key: 'pushNotifications', color: '#3B82F6' },
                  { icon: "mail-outline", title: "Email Notifications", description: "Receive important updates via email", value: preferences.emailNotifications, key: 'emailNotifications', color: '#EF4444' },
                  { icon: "cloud-upload-outline", title: "Auto Sync", description: `Automatically sync your ${user?.role === 'producer' ? 'product' : 'order'} data`, value: preferences.autoSync, key: 'autoSync', color: '#8B5CF6' },
                  { icon: "moon-outline", title: "Dark Mode", description: "Switch to dark theme", value: preferences.darkMode, key: 'darkMode', color: '#6B7280' },
                ].map((setting, index) => (
                  <SettingItem
                    key={setting.key}
                    icon={setting.icon}
                    title={setting.title}
                    description={setting.description}
                    value={setting.value}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, [setting.key]: value }))}
                    color={setting.color}
                  />
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Enhanced Security Tab Content */}
        {activeTab === 'security' && (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security & Privacy</Text>
              <View style={styles.securityContainer}>
                <TouchableOpacity 
                  style={styles.securityItem}
                  onPress={() => setShowPasswordModal(true)}
                >
                  <View style={styles.securityLeft}>
                    <View style={[styles.securityIconContainer, { backgroundColor: '#4CAF5015' }]}>
                      <Ionicons name="key-outline" size={20} color="#4CAF50" />
                    </View>
                    <View>
                      <Text style={styles.securityTitle}>Change Password</Text>
                      <Text style={styles.securityDescription}>Update your password regularly</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.securityItem}>
                  <View style={styles.securityLeft}>
                    <View style={[styles.securityIconContainer, { backgroundColor: '#3B82F615' }]}>
                      <Ionicons name="shield-checkmark-outline" size={20} color="#3B82F6" />
                    </View>
                    <View>
                      <Text style={styles.securityTitle}>Privacy Settings</Text>
                      <Text style={styles.securityDescription}>Manage your data privacy</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Actions</Text>
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton}>
                  <View style={[styles.actionIcon, { backgroundColor: '#3B82F615' }]}>
                    <Ionicons name="download-outline" size={18} color="#3B82F6" />
                  </View>
                  <Text style={styles.actionText}>Export Data</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleLogout}
                >
                  <View style={[styles.actionIcon, { backgroundColor: '#EF444415' }]}>
                    <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                  </View>
                  <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Enhanced Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#4CAF50', '#388E3C']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowPasswordModal(false)}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalIllustration}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="lock-closed-outline" size={32} color="#4CAF50" />
                </View>
                <Text style={styles.modalSubtitle}>Create a strong, unique password</Text>
              </View>

              {[
                { label: "Current Password", value: passwordData.currentPassword, key: 'currentPassword' },
                { label: "New Password", value: passwordData.newPassword, key: 'newPassword' },
                { label: "Confirm New Password", value: passwordData.confirmPassword, key: 'confirmPassword' },
              ].map((field, index) => (
                <View key={field.key} style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={field.value}
                    onChangeText={(value) => setPasswordData(prev => ({ ...prev, [field.key]: value }))}
                    secureTextEntry
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              ))}

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.modalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  ) : (
                    <Ionicons name="key" size={20} color="#FFFFFF" />
                  )}
                  <Text style={styles.modalButtonText}>
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circle3: {
    position: 'absolute',
    top: '30%',
    right: '20%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroContent: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarSection: {
    alignItems: 'center',
    marginRight: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarGradient: {
    width: 90,
    height: 90,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  roleBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  verifiedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#E8F5E8',
    marginLeft: 6,
    fontWeight: '500',
  },
  userCompany: {
    fontSize: 14,
    color: '#C8E6C9',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    backdropFilter: 'blur(10px)',
  },
  statMini: {
    flex: 1,
    alignItems: 'center',
  },
  statMiniValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statMiniLabel: {
    fontSize: 12,
    color: '#E8F5E8',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.5,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginRight: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 18,
  },
  trendIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Product Card Styles
  productsScroll: {
    marginHorizontal: -20,
  },
  productsContainer: {
    paddingHorizontal: 20,
  },
  productCard: {
    width: width * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  productImageContainer: {
    position: 'relative',
    height: 120,
  },
  productImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  productContent: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  productCategory: {
    fontSize: 11,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: '500',
  },
  certifications: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  certificationsText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 1.5,
  },
  tabContent: {
    backgroundColor: '#FFFFFF',
  },
  section: {
    padding: 20,
  },
  editIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editIndicatorText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  formContainer: {
    // No background, using cards instead
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  textInputReadonly: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
    borderColor: '#E5E7EB',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  arrowButton: {
    padding: 4,
  },
  securityContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  logoutText: {
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
  },
  modalIllustration: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalTextInput: {
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  modalButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  modalButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;