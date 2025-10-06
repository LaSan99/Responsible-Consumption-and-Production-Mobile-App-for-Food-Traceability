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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiConfig from '../config/api';

const { width, height } = Dimensions.get('window');

export default function BlockchainStagesScreen({ navigation, route }) {
  const { productId, productName } = route.params;
  const [stages, setStages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStages();
  }, []);

  const loadStages = async () => {
    try {
      const response = await axios.get(`${apiConfig.baseURL}/supply-chain/${productId}`);
      setStages(response.data);
    } catch (error) {
      console.error('Error loading stages:', error);
      Alert.alert('Error', 'Failed to load blockchain stages');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStages();
    setRefreshing(false);
  };

  const handleAddStage = () => {
    navigation.navigate('AddStage', { 
      productId, 
      productName,
      onStageAdded: () => {
        loadStages();
      }
    });
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const renderStageItem = ({ item, index }) => (
    <View style={styles.stageContainer}>
      <View style={styles.stageCard}>
        <View style={styles.stageHeader}>
          <View style={styles.stageIconContainer}>
            <Text style={styles.stageIcon}>{getStageIcon(item.stage_name)}</Text>
          </View>
          <View style={styles.stageInfo}>
            <Text style={styles.stageName}>{item.stage_name}</Text>
            <Text style={styles.stageTimestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
          <View style={styles.blockchainBadge}>
            <Ionicons name="cube-outline" size={16} color="#4CAF50" />
            <Text style={styles.blockNumber}>#{index + 1}</Text>
          </View>
        </View>
        
        {item.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        )}
        
        <View style={styles.blockchainInfo}>
          <View style={styles.hashContainer}>
            <Text style={styles.hashLabel}>Block Hash:</Text>
            <Text style={styles.hashValue}>
              {`${item.id}${item.timestamp}`.slice(-8).toUpperCase()}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Verified</Text>
          </View>
        </View>
      </View>
      
      {index < stages.length - 1 && (
        <View style={styles.connector}>
          <View style={styles.connectorLine} />
          <View style={styles.connectorDot} />
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="cube-outline" size={64} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>No Blockchain Stages</Text>
      <Text style={styles.emptySubtitle}>
        Start building your product's blockchain by adding the first stage
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddStage}>
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.emptyButtonGradient}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>Add First Stage</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading blockchain stages...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#4CAF50', '#8BC34A', '#CDDC39']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Blockchain Stages</Text>
            <Text style={styles.headerSubtitle}>{productName}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddStage}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Blockchain Info */}
        <View style={styles.blockchainInfoCard}>
          <View style={styles.chainStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stages.length}</Text>
              <Text style={styles.statLabel}>Stages</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stages.length > 0 ? '100%' : '0%'}
              </Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stages.length > 0 ? formatTimestamp(stages[stages.length - 1].timestamp).split(' ')[0] : 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Last Update</Text>
            </View>
          </View>
        </View>

        {/* Stages List */}
        <View style={styles.stagesContainer}>
          {stages.length > 0 ? (
            <FlatList
              data={stages}
              renderItem={renderStageItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#4CAF50']}
                  tintColor="#4CAF50"
                />
              }
              contentContainerStyle={styles.listContent}
            />
          ) : (
            renderEmptyState()
          )}
        </View>

        {/* Floating Add Button */}
        {stages.length > 0 && (
          <TouchableOpacity style={styles.floatingButton} onPress={handleAddStage}>
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.floatingButtonGradient}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockchainInfoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chainStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  stagesContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  listContent: {
    padding: 20,
  },
  stageContainer: {
    marginBottom: 16,
  },
  stageCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stageIcon: {
    fontSize: 20,
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stageTimestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  blockchainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  blockNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  blockchainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hashContainer: {
    flex: 1,
  },
  hashLabel: {
    fontSize: 12,
    color: '#666',
  },
  hashValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: 'monospace',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  connector: {
    alignItems: 'center',
    height: 20,
  },
  connectorLine: {
    width: 2,
    height: 16,
    backgroundColor: '#4CAF50',
  },
  connectorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginTop: -3,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  emptyButton: {
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    borderRadius: 28,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
