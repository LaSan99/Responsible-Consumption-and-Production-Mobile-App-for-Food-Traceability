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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerScroll = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
    loadProducerProducts();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

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
    role: 'Producer',
    department: 'Agriculture',
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
          company: userObj.company || 'Agricultural Producer',
          role: userObj.role || 'Producer',
          department: userObj.department || 'Agriculture',
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
      
      // Prepare update data
      const updateData = {
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        company: profileData.company,
      };

      // Make API call to update profile
      const response = await axios.put(
        `${apiConfig.baseURL}/auth/profile`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local storage
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
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    headerScroll.setValue(scrollY);
  };

  // Calculate real stats from products
  const getRealStats = () => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const certifiedProducts = products.filter(p => p.certifications && p.certifications.length > 0).length;
    
    return {
      projectsCompleted: totalProducts,
      teamMembers: 1, // Single producer for now
      satisfactionRate: totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0,
      tasksCompleted: totalProducts * 3, // Assuming 3 tasks per product
      activeProducts: activeProducts,
      certifiedProducts: certifiedProducts,
    };
  };

  const stats = getRealStats();

  const ProfessionalStatCard = ({ icon, value, label, trend }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={styles.statIconContainer}>
          <Text style={styles.statIcon}>{icon}</Text>
        </View>
        {trend && (
          <View style={[styles.trendIndicator, { backgroundColor: trend > 0 ? '#10B981' : '#EF4444' }]}>
            <Text style={styles.trendText}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const SettingItem = ({ icon, title, description, value, onValueChange, type = 'switch' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconContainer}>
          <Ionicons name={icon} size={20} color="#3B82F6" />
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
          trackColor={{ false: '#E5E7EB', true: '#4CAF50' }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <TouchableOpacity style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );

  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
        {title}
      </Text>
      {isActive && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );

  const getInitials = (name) => {
    if (!name) return 'P';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      {/* Header */}
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
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.editIcon}>{isEditing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* Profile Hero Section */}
        <LinearGradient
          colors={['#4CAF50', '#388E3C']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(user?.full_name)}
                  </Text>
                </LinearGradient>
                <View style={styles.statusIndicator} />
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                <Text style={styles.verifiedText}>Verified Producer</Text>
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.full_name || 'Producer'}</Text>
              <Text style={styles.userRole}>{profileData.role}</Text>
              <Text style={styles.userCompany}>{profileData.company}</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statMini}>
                  <Text style={styles.statMiniValue}>{stats.projectsCompleted}</Text>
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
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Farm Overview</Text>
          <View style={styles.statsGrid}>
            <ProfessionalStatCard 
              icon="🌱" 
              value={stats.projectsCompleted} 
              label="Total Products"
            />
            <ProfessionalStatCard 
              icon="✅" 
              value={stats.activeProducts} 
              label="Active Products"
            />
            <ProfessionalStatCard 
              icon="📜" 
              value={stats.certifiedProducts} 
              label="Certified Products"
            />
            <ProfessionalStatCard 
              icon="⭐" 
              value={`${stats.satisfactionRate}%`} 
              label="Active Rate"
            />
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TabButton 
            title="Profile" 
            isActive={activeTab === 'profile'} 
            onPress={() => setActiveTab('profile')} 
          />
          <TabButton 
            title="Settings" 
            isActive={activeTab === 'settings'} 
            onPress={() => setActiveTab('settings')} 
          />
          <TabButton 
            title="Security" 
            isActive={activeTab === 'security'} 
            onPress={() => setActiveTab('security')} 
          />
        </View>

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Producer Information</Text>
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Ionicons name="person-outline" size={16} color="#6B7280" />
                    <Text style={styles.inputLabel}>Full Name</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                    value={profileData.full_name}
                    onChangeText={(value) => setProfileData(prev => ({ ...prev, full_name: value }))}
                    editable={isEditing}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Ionicons name="mail-outline" size={16} color="#6B7280" />
                    <Text style={styles.inputLabel}>Email Address</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                    value={profileData.email}
                    onChangeText={(value) => setProfileData(prev => ({ ...prev, email: value }))}
                    editable={isEditing}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Ionicons name="call-outline" size={16} color="#6B7280" />
                    <Text style={styles.inputLabel}>Phone Number</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                    value={profileData.phone}
                    onChangeText={(value) => setProfileData(prev => ({ ...prev, phone: value }))}
                    editable={isEditing}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Ionicons name="business-outline" size={16} color="#6B7280" />
                    <Text style={styles.inputLabel}>Farm/Business Name</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                    value={profileData.company}
                    onChangeText={(value) => setProfileData(prev => ({ ...prev, company: value }))}
                    editable={isEditing}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text style={styles.inputLabel}>Farm Address</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                    value={profileData.address}
                    onChangeText={(value) => setProfileData(prev => ({ ...prev, address: value }))}
                    editable={isEditing}
                    placeholderTextColor="#9CA3AF"
                    multiline
                  />
                </View>
              </View>

              {isEditing && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveProfile}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#45a049']}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>
                      {isLoading ? 'Saving Changes...' : 'Save Changes'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}

        {/* Settings Tab Content */}
        {activeTab === 'settings' && (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <View style={styles.settingsContainer}>
                <SettingItem
                  icon="notifications-outline"
                  title="Push Notifications"
                  description="Get instant notifications about your products"
                  value={preferences.pushNotifications}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, pushNotifications: value }))}
                />
                <SettingItem
                  icon="mail-outline"
                  title="Email Notifications"
                  description="Receive important updates via email"
                  value={preferences.emailNotifications}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, emailNotifications: value }))}
                />
                <SettingItem
                  icon="cloud-upload-outline"
                  title="Auto Sync"
                  description="Automatically sync your product data"
                  value={preferences.autoSync}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, autoSync: value }))}
                />
                <SettingItem
                  icon="moon-outline"
                  title="Dark Mode"
                  description="Switch to dark theme"
                  value={preferences.darkMode}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, darkMode: value }))}
                />
              </View>
            </View>
          </Animated.View>
        )}

        {/* Security Tab Content */}
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
                    <View style={styles.securityIconContainer}>
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
                    <View style={styles.securityIconContainer}>
                      <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
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
                  <Ionicons name="download-outline" size={16} color="#374151" />
                  <Text style={styles.actionText}>Export Data</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.logoutButton]}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={16} color="#DC2626" />
                  <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalIllustration}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="lock-closed-outline" size={32} color="#4CAF50" />
                </View>
                <Text style={styles.modalSubtitle}>Create a strong, unique password</Text>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Current Password</Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={passwordData.currentPassword}
                  onChangeText={(value) => setPasswordData(prev => ({ ...prev, currentPassword: value }))}
                  secureTextEntry
                  placeholder="Enter current password"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>New Password</Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={passwordData.newPassword}
                  onChangeText={(value) => setPasswordData(prev => ({ ...prev, newPassword: value }))}
                  secureTextEntry
                  placeholder="Enter new password"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={passwordData.confirmPassword}
                  onChangeText={(value) => setPasswordData(prev => ({ ...prev, confirmPassword: value }))}
                  secureTextEntry
                  placeholder="Confirm new password"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>
                    {isLoading ? 'Updating Password...' : 'Update Password'}
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

// ... (Keep all the styles from the previous code, they are correct)
// Make sure to copy all the StyleSheet.create styles from the previous response

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
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  editIcon: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 32,
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
    width: 80,
    height: 80,
    borderRadius: 24,
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
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#E8F5E8',
    marginBottom: 2,
  },
  userCompany: {
    fontSize: 14,
    color: '#C8E6C9',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  statMini: {
    flex: 1,
    alignItems: 'center',
  },
  statMiniValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statMiniLabel: {
    fontSize: 12,
    color: '#E8F5E8',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 16,
  },
  trendIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textInputReadonly: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
    borderColor: '#E5E7EB',
  },
  saveButton: {
    borderRadius: 12,
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
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  securityDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  logoutButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  logoutText: {
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  modalButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  modalButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;