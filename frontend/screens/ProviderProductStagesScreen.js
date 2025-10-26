import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiConfig from '../config/api';

const { width } = Dimensions.get('window');

export default function ProviderProductStagesScreen({ navigation }) {
  const [productsWithStages, setProductsWithStages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState({});

  useEffect(() => {
    loadProductsWithStages();
  }, []);

  const loadProductsWithStages = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Use optimized endpoint that gets products with stages in a single query
      const response = await axios.get(
        `${apiConfig.baseURL}/supply-chain/producer/products-with-stages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProductsWithStages(response.data);
    } catch (error) {
      console.error('Error loading products with stages:', error);
      Alert.alert('Error', 'Failed to load product stages');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProductsWithStages();
    setRefreshing(false);
  };

  const toggleProductExpansion = (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStageIcon = (stageName) => {
    const name = stageName.toLowerCase();
    if (name.includes('harvest') || name.includes('farm')) return '🌱';
    if (name.includes('process') || name.includes('pack')) return '🏭';
    if (name.includes('transport') || name.includes('ship')) return '🚛';
    if (name.includes('warehouse') || name.includes('storage')) return '🏪';
    if (name.includes('retail') || name.includes('store')) return '🏬';
    if (name.includes('quality') || name.includes('inspect')) return '🔍';
    return '📦';
  };

  const navigateToProductStages = (product) => {
    navigation.navigate('BlockchainStages', {
      productId: product.id,
      productName: product.name,
    });
  };

  const renderStageItem = ({ item, index }) => (
    <View style={styles.stageItem}>
      <View style={styles.stageIconContainer}>
        <Text style={styles.stageIconText}>{getStageIcon(item.stage_name)}</Text>
      </View>
      <View style={styles.stageDetails}>
        <Text style={styles.stageName}>{item.stage_name}</Text>
        <View style={styles.stageMetaRow}>
          <Ionicons name="location-outline" size={12} color="#666" />
          <Text style={styles.stageLocation}>{item.location}</Text>
        </View>
        <View style={styles.stageMetaRow}>
          <Ionicons name="time-outline" size={12} color="#666" />
          <Text style={styles.stageTimestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      </View>
      <View style={styles.blockchainBadge}>
        <Ionicons name="cube-outline" size={14} color="#4CAF50" />
        <Text style={styles.blockNumber}>#{index + 1}</Text>
      </View>
    </View>
  );

  const renderProductItem = ({ item: product }) => {
    const isExpanded = expandedProducts[product.id];
    
    return (
      <View style={styles.productCard}>
        <TouchableOpacity
          style={styles.productHeader}
          onPress={() => toggleProductExpansion(product.id)}
          activeOpacity={0.7}
        >
          <View style={styles.productHeaderLeft}>
            <View style={styles.productIconContainer}>
              <Ionicons name="cube" size={24} color="#4CAF50" />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.productBatch}>#{product.batch_code}</Text>
            </View>
          </View>
          
          <View style={styles.productHeaderRight}>
            <View style={styles.stageCountBadge}>
              <Ionicons name="layers-outline" size={16} color="#fff" />
              <Text style={styles.stageCountText}>{product.stageCount}</Text>
            </View>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {product.stages.length > 0 ? (
              <>
                <View style={styles.stagesHeader}>
                  <Text style={styles.stagesHeaderText}>Supply Chain Stages</Text>
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => navigateToProductStages(product)}
                  >
                    <Text style={styles.viewAllButtonText}>View All</Text>
                    <Ionicons name="arrow-forward" size={14} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={product.stages}
                  renderItem={renderStageItem}
                  keyExtractor={(stage) => stage.id.toString()}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={styles.stageSeparator} />}
                />
                
                <TouchableOpacity
                  style={styles.addStageButton}
                  onPress={() => navigation.navigate('AddStage', {
                    productId: product.id,
                    productName: product.name,
                    onStageAdded: () => loadProductsWithStages()
                  })}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#45a049']}
                    style={styles.addStageGradient}
                  >
                    <Ionicons name="add-circle-outline" size={18} color="#fff" />
                    <Text style={styles.addStageButtonText}>Add New Stage</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.emptyStagesContainer}>
                <Ionicons name="cube-outline" size={40} color="#ccc" />
                <Text style={styles.emptyStagesText}>No stages added yet</Text>
                <TouchableOpacity
                  style={styles.addFirstStageButton}
                  onPress={() => navigation.navigate('AddStage', {
                    productId: product.id,
                    productName: product.name,
                    onStageAdded: () => loadProductsWithStages()
                  })}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#45a049']}
                    style={styles.addFirstStageGradient}
                  >
                    <Ionicons name="add-circle-outline" size={18} color="#fff" />
                    <Text style={styles.addFirstStageButtonText}>Add First Stage</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="cube-outline" size={80} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>No Products Found</Text>
      <Text style={styles.emptySubtitle}>
        Add products to start tracking their supply chain stages
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.emptyButtonGradient}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>Add Product</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading product stages...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      
      {/* Header */}
      <LinearGradient
        colors={['#2E7D32', '#4CAF50', '#8BC34A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={22} color="#10B981" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerTextContent}>
            <Text style={styles.headerSubtitle}>Supply Chain Management</Text>
            <Text style={styles.headerTitle}>Product Stages</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{productsWithStages.length}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {productsWithStages.reduce((sum, p) => sum + p.stageCount, 0)}
          </Text>
          <Text style={styles.statLabel}>Total Stages</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {productsWithStages.filter(p => p.stageCount > 0).length}
          </Text>
          <Text style={styles.statLabel}>Tracked</Text>
        </View>
      </View>

      {/* Products List */}
      {productsWithStages.length > 0 ? (
        <FlatList
          data={productsWithStages}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4CAF50"
              colors={['#4CAF50']}
            />
          }
        />
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 12,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  headerTextContent: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  productHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  productBatch: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  productHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stageCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  stageCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  stagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stagesHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  stageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stageIconText: {
    fontSize: 18,
  },
  stageDetails: {
    flex: 1,
  },
  stageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  stageLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  stageTimestamp: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  blockchainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
  },
  blockNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  stageSeparator: {
    height: 8,
  },
  addStageButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addStageGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  addStageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyStagesContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStagesText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 16,
  },
  addFirstStageButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addFirstStageGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
  },
  addFirstStageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  emptyButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
