import React, { useState, useEffect } from 'react';
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
  SafeAreaView,
  Dimensions,
  Switch,
  Modal,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    loadUserData();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    role: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
    emailUpdates: false,
    locationTracking: true,
    analytics: true,
    darkMode: false,
  });

  const [stats, setStats] = useState({
    productsScanned: 145,
    sustainabilityScore: 85,
    carbonFootprint: '2.3 kg CO2',
    localPurchases: 67,
  });

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setProfileData({
          full_name: parsedUser.full_name || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
          address: parsedUser.address || '',
          company: parsedUser.company || '',
          role: parsedUser.role || '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePreferenceChange = (preference, value) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: value,
    }));
  };

  const validateProfile = () => {
    if (!profileData.full_name.trim()) {
      Alert.alert('Error', 'Full name is required');
      return false;
    }
    
    if (!profileData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const validatePassword = () => {
    if (!passwordData.currentPassword) {
      Alert.alert('Error', 'Current password is required');
      return false;
    }
    
    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...user, ...profileData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordModal(false);
      
      Alert.alert('Success', 'Password changed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
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
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Account deletion request submitted.');
          },
        },
      ]
    );
  };

  const SectionButton = ({ title, icon, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.sectionButton, isActive && styles.sectionButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.sectionButtonIcon, isActive && styles.sectionButtonIconActive]}>
        {icon}
      </Text>
      <Text style={[styles.sectionButtonText, isActive && styles.sectionButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const StatCard = ({ icon, value, label, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const MenuItem = ({ icon, title, onPress, isLast }) => (
    <TouchableOpacity
      style={[styles.menuItem, isLast && styles.menuItemLast]}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <View style={styles.menuIconContainer}>
          <Text style={styles.menuIcon}>{icon}</Text>
        </View>
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <View style={styles.menuArrowContainer}>
        <Text style={styles.menuArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.editIcon}>{isEditing ? '✕' : '✏️'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header with Enhanced Design */}
        <Animated.View 
          style={[
            styles.profileHeader,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#818cf8', '#6366f1']}
            style={styles.avatarContainer}
          >
            <Text style={styles.avatarText}>
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </LinearGradient>
          <Text style={styles.userName}>{user?.full_name || 'User Name'}</Text>
          <Text style={styles.userRole}>{user?.role || 'Member'}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        </Animated.View>

        {/* Quick Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              icon="📱" 
              value={stats.productsScanned} 
              label="Products Scanned" 
              color="#10b981"
            />
            <StatCard 
              icon="🌱" 
              value={`${stats.sustainabilityScore}%`} 
              label="Sustainability" 
              color="#f59e0b"
            />
            <StatCard 
              icon="🌍" 
              value={stats.carbonFootprint} 
              label="Carbon Footprint" 
              color="#ef4444"
            />
            <StatCard 
              icon="🏪" 
              value={`${stats.localPurchases}%`} 
              label="Local Purchases" 
              color="#8b5cf6"
            />
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.sectionTabs}>
          <SectionButton 
            title="Profile" 
            icon="👤" 
            isActive={activeSection === 'profile'}
            onPress={() => setActiveSection('profile')}
          />
          <SectionButton 
            title="Preferences" 
            icon="⚙️" 
            isActive={activeSection === 'preferences'}
            onPress={() => setActiveSection('preferences')}
          />
          <SectionButton 
            title="Security" 
            icon="🔒" 
            isActive={activeSection === 'security'}
            onPress={() => setActiveSection('security')}
          />
        </View>

        {/* Profile Information */}
        {activeSection === 'profile' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.editIndicator}>
                <Text style={styles.editIndicatorText}>
                  {isEditing ? 'Editing...' : 'Read Only'}
                </Text>
              </View>
            </View>
            
            <View style={styles.formContainer}>
              {[
                { label: 'Full Name', field: 'full_name', icon: '👤' },
                { label: 'Email Address', field: 'email', icon: '📧', keyboardType: 'email-address' },
                { label: 'Phone Number', field: 'phone', icon: '📱', keyboardType: 'phone-pad' },
                { label: 'Address', field: 'address', icon: '🏠' },
                { label: 'Company', field: 'company', icon: '💼' },
              ].map((item, index) => (
                <View key={item.field} style={styles.inputWrapper}>
                  <View style={styles.inputLabelContainer}>
                    <Text style={styles.inputIcon}>{item.icon}</Text>
                    <Text style={styles.inputLabel}>{item.label}</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      !isEditing && styles.textInputReadonly
                    ]}
                    value={profileData[item.field]}
                    onChangeText={(value) => handleInputChange(item.field, value)}
                    editable={isEditing}
                    placeholder={`Enter your ${item.label.toLowerCase()}`}
                    placeholderTextColor="#9ca3af"
                    keyboardType={item.keyboardType}
                  />
                </View>
              ))}

              {isEditing && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveProfile}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>
                      {isLoading ? '🔄 Saving...' : '💾 Save Changes'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Preferences Section */}
        {activeSection === 'preferences' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Preferences</Text>
            <View style={styles.preferencesContainer}>
              {[
                { key: 'notifications', label: 'Push Notifications', icon: '🔔' },
                { key: 'emailUpdates', label: 'Email Updates', icon: '📧' },
                { key: 'locationTracking', label: 'Location Tracking', icon: '📍' },
                { key: 'analytics', label: 'Usage Analytics', icon: '📊' },
                { key: 'darkMode', label: 'Dark Mode', icon: '🌙' },
              ].map((pref, index) => (
                <View key={pref.key} style={[
                  styles.preferenceItem,
                  index === 4 && styles.preferenceItemLast
                ]}>
                  <View style={styles.preferenceLeft}>
                    <Text style={styles.preferenceIcon}>{pref.icon}</Text>
                    <View>
                      <Text style={styles.preferenceTitle}>{pref.label}</Text>
                      <Text style={styles.preferenceDescription}>
                        {pref.key === 'notifications' ? 'Receive push notifications' :
                         pref.key === 'emailUpdates' ? 'Get email updates and news' :
                         pref.key === 'locationTracking' ? 'Allow location access' :
                         pref.key === 'analytics' ? 'Help improve the app' : 'Enable dark theme'}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={preferences[pref.key]}
                    onValueChange={(value) => handlePreferenceChange(pref.key, value)}
                    trackColor={{ false: '#e2e8f0', true: '#10b981' }}
                    thumbColor="#ffffff"
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Security Section */}
        {activeSection === 'security' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security & Privacy</Text>
            <View style={styles.menuContainer}>
              <MenuItem 
                icon="🔒" 
                title="Change Password" 
                onPress={() => setShowPasswordModal(true)}
              />
              <MenuItem 
                icon="👁️" 
                title="Privacy Settings" 
                onPress={() => Alert.alert('Privacy', 'Privacy settings')}
              />
              <MenuItem 
                icon="📱" 
                title="Two-Factor Authentication" 
                onPress={() => Alert.alert('2FA', 'Two-factor authentication')}
              />
              <MenuItem 
                icon="🔍" 
                title="Data & Permissions" 
                onPress={() => Alert.alert('Data', 'Data permissions')}
                isLast
              />
            </View>
          </View>
        )}

        {/* Additional Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>
          <View style={styles.menuContainer}>
            <MenuItem 
              icon="📋" 
              title="Privacy Policy" 
              onPress={() => Alert.alert('Privacy Policy', 'Opening...')}
            />
            <MenuItem 
              icon="📄" 
              title="Terms of Service" 
              onPress={() => Alert.alert('Terms', 'Opening...')}
            />
            <MenuItem 
              icon="❓" 
              title="Help & Support" 
              onPress={() => navigation.navigate?.('Contact')}
            />
            <MenuItem 
              icon="⭐" 
              title="Rate Our App" 
              onPress={() => Alert.alert('Rating', 'Opening app store...')}
              isLast
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <View style={styles.dangerContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Enhanced Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.modalHeader}
          >
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Text style={styles.modalCancel}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Password</Text>
            <View style={styles.modalPlaceholder} />
          </LinearGradient>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalIllustration}>
              <Text style={styles.modalIllustrationIcon}>🔒</Text>
              <Text style={styles.modalIllustrationText}>
                Create a strong password to secure your account
              </Text>
            </View>

            {[
              { label: 'Current Password', field: 'currentPassword' },
              { label: 'New Password', field: 'newPassword' },
              { label: 'Confirm New Password', field: 'confirmPassword' },
            ].map((item, index) => (
              <View key={item.field} style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>{item.label}</Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={passwordData[item.field]}
                  onChangeText={(value) => handlePasswordChange(item.field, value)}
                  secureTextEntry
                  placeholder={`Enter ${item.label.toLowerCase()}`}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            ))}

            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.changePasswordGradient}
              >
                <Text style={styles.changePasswordButtonText}>
                  {isLoading ? '🔄 Changing Password...' : '🔐 Change Password'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
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
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  verifiedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsSection: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  sectionTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  sectionButtonActive: {
    backgroundColor: '#6366f1',
  },
  sectionButtonIcon: {
    fontSize: 16,
    marginRight: 6,
    color: '#6b7280',
  },
  sectionButtonIconActive: {
    color: '#ffffff',
  },
  sectionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  sectionButtonTextActive: {
    color: '#ffffff',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editIndicator: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editIndicatorText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#6b7280',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f8fafc',
  },
  textInputReadonly: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
    borderColor: '#f1f5f9',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  preferencesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  preferenceItemLast: {
    borderBottomWidth: 0,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIcon: {
    fontSize: 20,
    marginRight: 16,
    color: '#6366f1',
  },
  preferenceTitle: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIcon: {
    fontSize: 18,
    color: '#6366f1',
  },
  menuTitle: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  menuArrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuArrow: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  dangerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 16,
    color: '#6b7280',
  },
  logoutText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  deleteIcon: {
    fontSize: 20,
    marginRight: 16,
    color: '#ef4444',
  },
  deleteText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  modalCancel: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalPlaceholder: {
    width: 20,
  },
  modalContent: {
    padding: 20,
  },
  modalIllustration: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
  },
  modalIllustrationIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalIllustrationText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalInputContainer: {
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
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f8fafc',
  },
  changePasswordButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  changePasswordGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  changePasswordButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
  },
});