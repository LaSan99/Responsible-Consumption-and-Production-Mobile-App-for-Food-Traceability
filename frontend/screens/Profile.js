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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  useEffect(() => {
    loadUserData();
  }, []);

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
      // Simulate API call
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
      // Simulate API call
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
            // App.js will automatically detect the change and navigate to login
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
            Alert.alert('Account Deletion', 'Account deletion request submitted. You will be contacted within 24 hours.');
          },
        },
      ]
    );
  };

  const goBack = () => {
    if (navigation.goBack) {
      navigation.goBack();
    } else {
      Alert.alert('Navigation', 'Going back to previous screen');
    }
  };

  const menuItems = [
    { title: 'Privacy Policy', icon: '📋', action: () => Alert.alert('Privacy Policy', 'Opening privacy policy...') },
    { title: 'Terms of Service', icon: '📄', action: () => Alert.alert('Terms', 'Opening terms of service...') },
    { title: 'Help & Support', icon: '❓', action: () => navigation.navigate && navigation.navigate('Contact') },
    { title: 'Rate Our App', icon: '⭐', action: () => Alert.alert('Rating', 'Opening app store...') },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#f8fafc"
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          onPress={() => setIsEditing(!isEditing)} 
          style={styles.editButton}
        >
          <Text style={styles.editText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        {user && (
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <Text style={styles.userName}>{user.full_name}</Text>
            <Text style={styles.userRole}>{user.role}</Text>
          </View>
        )}

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📱</Text>
              <Text style={styles.statNumber}>{stats.productsScanned}</Text>
              <Text style={styles.statLabel}>Products Scanned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🌱</Text>
              <Text style={styles.statNumber}>{stats.sustainabilityScore}%</Text>
              <Text style={styles.statLabel}>Sustainability Score</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🌍</Text>
              <Text style={styles.statNumber}>{stats.carbonFootprint}</Text>
              <Text style={styles.statLabel}>Monthly Footprint</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🏪</Text>
              <Text style={styles.statNumber}>{stats.localPurchases}%</Text>
              <Text style={styles.statLabel}>Local Purchases</Text>
            </View>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                value={profileData.full_name}
                onChangeText={(value) => handleInputChange('full_name', value)}
                editable={isEditing}
                placeholder="Enter your full name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                value={profileData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                editable={isEditing}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                value={profileData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                editable={isEditing}
                keyboardType="phone-pad"
                placeholder="Enter your phone number"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                value={profileData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                editable={isEditing}
                placeholder="Enter your address"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Company</Text>
              <TextInput
                style={[styles.textInput, !isEditing && styles.textInputReadonly]}
                value={profileData.company}
                onChangeText={(value) => handleInputChange('company', value)}
                editable={isEditing}
                placeholder="Enter your company"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {isEditing && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Text>
                <Text style={styles.saveIcon}>💾</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.securityContainer}>
            <TouchableOpacity
              style={styles.securityItem}
              onPress={() => setShowPasswordModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.securityLeft}>
                <Text style={styles.securityIcon}>🔒</Text>
                <Text style={styles.securityTitle}>Change Password</Text>
              </View>
              <Text style={styles.securityArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferencesContainer}>
            {Object.entries(preferences).map(([key, value]) => (
              <View key={key} style={styles.preferenceItem}>
                <View style={styles.preferenceLeft}>
                  <Text style={styles.preferenceIcon}>
                    {key === 'notifications' ? '🔔' : 
                     key === 'emailUpdates' ? '📧' :
                     key === 'locationTracking' ? '📍' :
                     key === 'analytics' ? '📊' : '🌙'}
                  </Text>
                  <Text style={styles.preferenceTitle}>
                    {key === 'notifications' ? 'Push Notifications' :
                     key === 'emailUpdates' ? 'Email Updates' :
                     key === 'locationTracking' ? 'Location Tracking' :
                     key === 'analytics' ? 'Usage Analytics' : 'Dark Mode'}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={(newValue) => handlePreferenceChange(key, newValue)}
                  trackColor={{ false: '#e2e8f0', true: '#10B981' }}
                  thumbColor={value ? '#ffffff' : '#f4f3f4'}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </View>
                <Text style={styles.menuArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.dangerContainer}>
            <TouchableOpacity
              style={styles.dangerItem}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.dangerIcon}>🚪</Text>
              <Text style={styles.dangerTitle}>Logout</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.dangerItem, styles.deleteItem]}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <Text style={styles.dangerIcon}>🗑️</Text>
              <Text style={[styles.dangerTitle, styles.deleteTitle]}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Password</Text>
            <View style={styles.modalPlaceholder} />
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.textInput}
                value={passwordData.currentPassword}
                onChangeText={(value) => handlePasswordChange('currentPassword', value)}
                secureTextEntry
                placeholder="Enter current password"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.textInput}
                value={passwordData.newPassword}
                onChangeText={(value) => handlePasswordChange('newPassword', value)}
                secureTextEntry
                placeholder="Enter new password"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.textInput}
                value={passwordData.confirmPassword}
                onChangeText={(value) => handlePasswordChange('confirmPassword', value)}
                secureTextEntry
                placeholder="Confirm new password"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={handleChangePassword}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.changePasswordButtonText}>
                {isLoading ? 'Changing...' : 'Change Password'}
              </Text>
            </TouchableOpacity>
          </View>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#10B981',
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  editButton: {
    paddingHorizontal: 8,
  },
  editText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
  avatarText: {
    fontSize: 32,
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
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
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#f8fafc',
  },
  textInputReadonly: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  saveIcon: {
    fontSize: 16,
  },
  securityContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  securityTitle: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  securityArrow: {
    fontSize: 16,
    color: '#9ca3af',
  },
  preferencesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  preferenceTitle: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 16,
    color: '#9ca3af',
  },
  dangerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  deleteItem: {
    borderBottomWidth: 0,
  },
  dangerIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dangerTitle: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
  deleteTitle: {
    color: '#dc2626',
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
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalPlaceholder: {
    width: 60,
  },
  modalContent: {
    padding: 20,
  },
  changePasswordButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
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