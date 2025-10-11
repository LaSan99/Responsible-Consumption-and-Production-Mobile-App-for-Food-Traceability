import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import apiConfig from "../config/api";

const { width, height } = Dimensions.get('window');

export default function ProductCertificationsScreen({ route, navigation }) {
  const { productId, productName } = route.params;
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await axios.get(`${apiConfig.baseURL}/cert/product/${productId}`);
      setCertifications(response.data);
    } catch (error) {
      console.error('Error fetching certifications', error);
      Alert.alert('Error', 'Failed to load certifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCertifications();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getCertificationIcon = (certName) => {
    const name = certName.toLowerCase();
    if (name.includes('organic')) return '🌱';
    if (name.includes('fair trade')) return '🤝';
    if (name.includes('halal')) return '☪️';
    if (name.includes('kosher')) return '✡️';
    if (name.includes('non-gmo')) return '🧬';
    if (name.includes('gluten')) return '🌾';
    if (name.includes('vegan')) return '🌿';
    if (name.includes('iso')) return '📋';
    if (name.includes('haccp')) return '🔬';
    return '🏆';
  };

  const getCertificationStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'Active', color: '#4CAF50' };
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'Expired', color: '#F44336' };
    if (daysUntilExpiry <= 30) return { status: 'Expiring Soon', color: '#FF9800' };
    return { status: 'Active', color: '#4CAF50' };
  };

  const renderItem = ({ item }) => {
    const certStatus = getCertificationStatus(item.expiry_date);
    
    return (
      <View style={styles.certificationCard}>
        <View style={styles.certificationHeader}>
          <View style={styles.certificationIconContainer}>
            <Text style={styles.certificationIcon}>{getCertificationIcon(item.name)}</Text>
          </View>
          <View style={styles.certificationInfo}>
            <Text style={styles.certificationName}>{item.name}</Text>
            <Text style={styles.certificationAuthority}>
              Authority: {item.authority}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: certStatus.color }]}>
            <Text style={styles.statusText}>{certStatus.status}</Text>
          </View>
        </View>
        
        <View style={styles.certificationDetails}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.dateText}>
              Issued: {formatDate(item.issued_date)}
            </Text>
          </View>
          {item.expiry_date && (
            <View style={styles.dateContainer}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.dateText}>
                Expires: {formatDate(item.expiry_date)}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.certificationFooter}>
          <View style={styles.verificationContainer}>
            <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
            <Text style={styles.verificationText}>Verified</Text>
          </View>
          <Text style={styles.certificationId}>ID: #{item.id}</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="ribbon-outline" size={64} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>No Certifications Found</Text>
      <Text style={styles.emptySubtitle}>
        This product doesn't have any certifications yet
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.loadingText}>Loading certifications...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#9C27B0', '#E1BEE7', '#F3E5F5']}
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
            <Text style={styles.headerTitle}>Product Certifications</Text>
            <Text style={styles.headerSubtitle}>{productName || 'Certifications'}</Text>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{certifications.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {certifications.filter(cert => getCertificationStatus(cert.expiry_date).status === 'Active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {certifications.filter(cert => getCertificationStatus(cert.expiry_date).status === 'Expiring Soon').length}
            </Text>
            <Text style={styles.statLabel}>Expiring</Text>
          </View>
        </View>

        {/* Certifications List */}
        <View style={styles.certificationsContainer}>
          {certifications.length > 0 ? (
            <FlatList
              data={certifications}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#9C27B0']}
                  tintColor="#9C27B0"
                />
              }
              contentContainerStyle={styles.listContent}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9C27B0',
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
  certificationsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  listContent: {
    padding: 20,
  },
  certificationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  certificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  certificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  certificationIcon: {
    fontSize: 20,
  },
  certificationInfo: {
    flex: 1,
  },
  certificationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  certificationAuthority: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  certificationDetails: {
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  certificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  certificationId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
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
    lineHeight: 22,
  },
});
