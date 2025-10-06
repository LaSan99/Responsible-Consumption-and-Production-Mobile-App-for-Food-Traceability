import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiConfig from '../config/api';

const { width, height } = Dimensions.get('window');

export default function ProducerProfile({ navigation }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadUserData();
    loadProducerProducts();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
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

  const navigateToAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const navigateToManageProducts = () => {
    navigation.navigate('Products');
  };

  const navigateToSupplyChain = () => {
    if (products.length === 0) {
      Alert.alert(
        'No Products',
        'You need to add products first before managing blockchain stages.',
        [{ text: 'Add Product', onPress: navigateToAddProduct }]
      );
      return;
    }
    
    if (products.length === 1) {
      // Navigate directly if only one product
      navigation.navigate('BlockchainStages', {
        productId: products[0].id,
        productName: products[0].name
      });
    } else {
      // Show product selection if multiple products
      Alert.alert(
        'Select Product',
        'Choose a product to manage its blockchain stages:',
        [
          ...products.slice(0, 3).map(product => ({
            text: product.name,
            onPress: () => navigation.navigate('BlockchainStages', {
              productId: product.id,
              productName: product.name
            })
          })),
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#4CAF50', '#8BC34A', '#CDDC39']}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.nameText}>{user?.full_name || 'Producer'}</Text>
            <View style={styles.roleContainer}>
              <Ionicons name="leaf" size={16} color="#4CAF50" />
              <Text style={styles.roleText}>Producer</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="cube-outline" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up-outline" size={24} color="#FF9800" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#2196F3" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Certifications</Text>
          </View>
        </View>

        {/* Action Cards */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={navigateToAddProduct}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.actionGradient}
            >
              <Ionicons name="add-circle-outline" size={32} color="#fff" />
              <Text style={styles.actionTitle}>Add Product</Text>
              <Text style={styles.actionSubtitle}>List a new product</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={navigateToManageProducts}
          >
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.actionGradient}
            >
              <Ionicons name="cube-outline" size={32} color="#fff" />
              <Text style={styles.actionTitle}>Manage Products</Text>
              <Text style={styles.actionSubtitle}>View & edit products</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={navigateToSupplyChain}
          >
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.actionGradient}
            >
              <Ionicons name="git-network-outline" size={32} color="#fff" />
              <Text style={styles.actionTitle}>Blockchain Stages</Text>
              <Text style={styles.actionSubtitle}>Manage supply chain</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('ProductCertifications')}
          >
            <LinearGradient
              colors={['#9C27B0', '#7B1FA2']}
              style={styles.actionGradient}
            >
              <Ionicons name="ribbon-outline" size={32} color="#fff" />
              <Text style={styles.actionTitle}>Certifications</Text>
              <Text style={styles.actionSubtitle}>Manage certificates</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Products */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Products</Text>
          {products.length > 0 ? (
            products.slice(0, 3).map((product, index) => (
              <View key={index} style={styles.productItem}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productCategory}>
                    {product.category || 'No category'} • Batch: {product.batch_code}
                  </Text>
                  {product.origin && (
                    <Text style={styles.productOrigin}>📍 {product.origin}</Text>
                  )}
                </View>
                <View style={styles.productStatus}>
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No products yet</Text>
              <Text style={styles.emptySubtext}>Add your first product to get started</Text>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF5722" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
    flex: 1,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 16,
    flex: 1,
  },
  recentSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  productOrigin: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  productStatus: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5722',
  },
});
