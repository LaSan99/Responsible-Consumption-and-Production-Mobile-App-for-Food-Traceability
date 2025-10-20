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

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const fadeAnim = useState(new Animated.Value(0))[0];
  const headerScroll = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadUserData();
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
    full_name: 'Alexandra Chen',
    email: 'alexandra.chen@company.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave, Suite 400',
    company: 'TechCorp Inc.',
    role: 'Senior Product Manager',
    department: 'Product & Design',
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

  const [stats, setStats] = useState({
    projectsCompleted: 24,
    teamMembers: 8,
    satisfactionRate: 96,
    tasksCompleted: 187,
  });

  const loadUserData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(profileData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    headerScroll.setValue(scrollY);
  };

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
          <Text style={styles.settingIcon}>{icon}</Text>
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
          trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <TouchableOpacity style={styles.arrowButton}>
          <Text style={styles.arrowIcon}>›</Text>
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
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
          colors={['#1F2937', '#374151']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {user?.full_name?.charAt(0) || 'A'}
                  </Text>
                </LinearGradient>
                <View style={styles.statusIndicator} />
              </View>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.full_name || 'Alexandra Chen'}</Text>
              <Text style={styles.userRole}>{user?.role || 'Senior Product Manager'}</Text>
              <Text style={styles.userCompany}>{user?.company || 'TechCorp Inc.'}</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statMini}>
                  <Text style={styles.statMiniValue}>{stats.projectsCompleted}</Text>
                  <Text style={styles.statMiniLabel}>Projects</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statMini}>
                  <Text style={styles.statMiniValue}>{stats.teamMembers}</Text>
                  <Text style={styles.statMiniLabel}>Team</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statMini}>
                  <Text style={styles.statMiniValue}>{stats.satisfactionRate}%</Text>
                  <Text style={styles.statMiniLabel}>Satisfaction</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.statsGrid}>
            <ProfessionalStatCard 
              icon="📊" 
              value={stats.projectsCompleted} 
              label="Projects Completed"
              trend={12}
            />
            <ProfessionalStatCard 
              icon="👥" 
              value={stats.teamMembers} 
              label="Team Members"
              trend={5}
            />
            <ProfessionalStatCard 
              icon="⭐" 
              value={`${stats.satisfactionRate}%`} 
              label="Satisfaction Rate"
              trend={3}
            />
            <ProfessionalStatCard 
              icon="✅" 
              value={stats.tasksCompleted} 
              label="Tasks Completed"
              trend={8}
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
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Text style={styles.inputIcon}>👤</Text>
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
                    <Text style={styles.inputIcon}>📧</Text>
                    <Text style={styles.inputLabel}>Email Address</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                    value={profileData.email}
                    onChangeText={(value) => setProfileData(prev => ({ ...prev, email: value }))}
                    editable={isEditing}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Text style={styles.inputIcon}>📱</Text>
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
                    <Text style={styles.inputIcon}>🏢</Text>
                    <Text style={styles.inputLabel}>Department</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                    value={profileData.department}
                    onChangeText={(value) => setProfileData(prev => ({ ...prev, department: value }))}
                    editable={isEditing}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Text style={styles.inputIcon}>📍</Text>
                    <Text style={styles.inputLabel}>Address</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                    value={profileData.address}
                    onChangeText={(value) => setProfileData(prev => ({ ...prev, address: value }))}
                    editable={isEditing}
                    placeholderTextColor="#9CA3AF"
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
                    colors={['#3B82F6', '#1D4ED8']}
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
                  icon="🔒"
                  title="Biometric Login"
                  description="Use Face ID or Touch ID for faster access"
                  value={preferences.biometricLogin}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, biometricLogin: value }))}
                />
                <SettingItem
                  icon="🛡️"
                  title="Two-Factor Authentication"
                  description="Extra security for your account"
                  value={preferences.twoFactorAuth}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, twoFactorAuth: value }))}
                />
                <SettingItem
                  icon="📧"
                  title="Email Notifications"
                  description="Receive important updates via email"
                  value={preferences.emailNotifications}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, emailNotifications: value }))}
                />
                <SettingItem
                  icon="🔔"
                  title="Push Notifications"
                  description="Get instant notifications on your device"
                  value={preferences.pushNotifications}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, pushNotifications: value }))}
                />
                <SettingItem
                  icon="🌙"
                  title="Dark Mode"
                  description="Switch to dark theme"
                  value={preferences.darkMode}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, darkMode: value }))}
                />
                <SettingItem
                  icon="🔄"
                  title="Auto Sync"
                  description="Automatically sync your data"
                  value={preferences.autoSync}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, autoSync: value }))}
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
                      <Text style={styles.securityIcon}>🔑</Text>
                    </View>
                    <View>
                      <Text style={styles.securityTitle}>Change Password</Text>
                      <Text style={styles.securityDescription}>Update your password regularly</Text>
                    </View>
                  </View>
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.securityItem}>
                  <View style={styles.securityLeft}>
                    <View style={styles.securityIconContainer}>
                      <Text style={styles.securityIcon}>👁️</Text>
                    </View>
                    <View>
                      <Text style={styles.securityTitle}>Privacy Settings</Text>
                      <Text style={styles.securityDescription}>Manage your data privacy</Text>
                    </View>
                  </View>
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.securityItem}>
                  <View style={styles.securityLeft}>
                    <View style={styles.securityIconContainer}>
                      <Text style={styles.securityIcon}>📱</Text>
                    </View>
                    <View>
                      <Text style={styles.securityTitle}>Device Management</Text>
                      <Text style={styles.securityDescription}>Manage connected devices</Text>
                    </View>
                  </View>
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Actions</Text>
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>📥</Text>
                  <Text style={styles.actionText}>Export Data</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.logoutButton]}
                  onPress={() => Alert.alert(
                    'Logout', 
                    'Are you sure you want to logout?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Logout', 
                        style: 'destructive',
                        onPress: () => console.log('Logout pressed')
                      }
                    ]
                  )}
                >
                  <Text style={styles.actionIcon}>🚪</Text>
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
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalIllustration}>
                <View style={styles.modalIconContainer}>
                  <Text style={styles.modalIcon}>🔒</Text>
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
                  colors={['#3B82F6', '#1D4ED8']}
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
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
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
    borderColor: '#1F2937',
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
  verifiedIcon: {
    fontSize: 12,
    color: '#10B981',
    marginRight: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
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
    color: '#D1D5DB',
    marginBottom: 2,
  },
  userCompany: {
    fontSize: 14,
    color: '#9CA3AF',
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
    color: '#D1D5DB',
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
    backgroundColor: '#EFF6FF',
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
    color: '#3B82F6',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: '#3B82F6',
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
  inputIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#6B7280',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
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
        shadowColor: '#3B82F6',
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
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingIcon: {
    fontSize: 18,
    color: '#3B82F6',
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
  arrowIcon: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: 'bold',
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
    backgroundColor: '#FEF3F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityIcon: {
    fontSize: 18,
    color: '#DC2626',
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
  actionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
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
  modalClose: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '300',
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
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 32,
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