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
  TextInput,
  Modal,
  Animated,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiConfig from '../config/api';

const { width, height } = Dimensions.get('window');

export default function ProductCertificationManagementScreen({ navigation, route }) {
  const { productId, productName } = route.params;
  const [certifications, setCertifications] = useState([]);
  const [availableCertifications, setAvailableCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCertifications, setFilteredCertifications] = useState([]);
  const [selectedCertification, setSelectedCertification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadCertifications();
    loadAvailableCertifications();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCertifications(certifications);
    } else {
      const filtered = certifications.filter(cert =>
        cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.certificate_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCertifications(filtered);
    }
  }, [searchQuery, certifications]);

  const loadCertifications = async () => {
    try {
      const response = await axios.get(`${apiConfig.baseURL}/cert/product/${productId}`);
      setCertifications(response.data);
    } catch (error) {
      console.error('Error loading certifications:', error);
      Alert.alert('Error', 'Failed to load product certifications');
    }
  };

  const loadAvailableCertifications = async () => {
    try {
      const response = await axios.get(`${apiConfig.baseURL}/cert`);
      setAvailableCertifications(response.data);
    } catch (error) {
      console.error('Error loading available certifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCertifications(), loadAvailableCertifications()]);
    setRefreshing(false);
  };

  const handleAddCertification = () => {
    navigation.navigate('AddCertification', { 
      productId, 
      productName,
      onCertificationAdded: () => {
        loadCertifications();
      }
    });
  };

  const handleLinkExistingCertification = () => {
    const unlinkedCertifications = availableCertifications.filter(
      cert => !certifications.some(prodCert => prodCert.id === cert.id)
    );

    if (unlinkedCertifications.length === 0) {
      Alert.alert(
        'No Available Certifications',
        'All existing certifications are already linked to this product. Create a new certification instead.',
        [{ text: 'Create New', onPress: handleAddCertification }]
      );
      return;
    }

    const alertOptions = unlinkedCertifications.slice(0, 5).map(cert => ({
      text: cert.name,
      onPress: () => linkCertificationToProduct(cert.id)
    }));

    alertOptions.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      'Link Existing Certification',
      'Choose a certification to link to this product:',
      alertOptions
    );
  };

  const linkCertificationToProduct = async (certificationId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${apiConfig.baseURL}/cert/link/${productId}`,
        { certificationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Alert.alert('Success', 'Certification linked successfully');
      loadCertifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to link certification');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
    if (name.includes('usda')) return '🇺🇸';
    if (name.includes('fda')) return '🏛️';
    return '🏆';
  };

  const getCertificationStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'Active', color: '#4CAF50', badgeColor: '#E8F5E8' };
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'Expired', color: '#F44336', badgeColor: '#FFEBEE' };
    if (daysUntilExpiry <= 30) return { status: 'Expiring Soon', color: '#FF9800', badgeColor: '#FFF3E0' };
    return { status: 'Active', color: '#4CAF50', badgeColor: '#E8F5E8' };
  };

  const handleViewCertificate = (certification) => {
    setSelectedCertification(certification);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleShareCertificate = async (certification) => {
    try {
      const shareMessage = `Check out this ${certification.name} certification for ${productName}. Issued by ${certification.authority} on ${formatDate(certification.issued_date)}.`;
      
      await Share.share({
        message: shareMessage,
        title: `${certification.name} Certification`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share certification');
    }
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedCertification(null);
    });
  };

  const renderCertificateModal = () => {
    if (!selectedCertification) return null;

    const certStatus = getCertificationStatus(selectedCertification.expiry_date);

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Certificate Details</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.certificatePreview}>
              <LinearGradient
                colors={['#f8f9fa', '#e9ecef']}
                style={styles.certificateGradient}
              >
                {/* Certificate Header */}
                <View style={styles.certificateHeader}>
                  <View style={styles.certificateSeal}>
                    <Text style={styles.certificateSealIcon}>
                      {getCertificationIcon(selectedCertification.name)}
                    </Text>
                  </View>
                  <Text style={styles.certificateTitle}>CERTIFICATE</Text>
                  <Text style={styles.certificateSubtitle}>OF COMPLIANCE</Text>
                </View>

                {/* Certificate Body */}
                <View style={styles.certificateBody}>
                  <Text style={styles.certificateProductName}>{productName}</Text>
                  <Text style={styles.certificateAwarded}>is hereby awarded the</Text>
                  <Text style={styles.certificateName}>{selectedCertification.name}</Text>
                  <Text style={styles.certificateDescription}>
                    This certificate acknowledges compliance with all relevant standards and requirements
                  </Text>
                </View>

                {/* Certificate Footer */}
                <View style={styles.certificateFooter}>
                  <View style={styles.certificateAuthority}>
                    <Text style={styles.authorityName}>{selectedCertification.authority}</Text>
                    <Text style={styles.authorityTitle}>Certifying Authority</Text>
                  </View>
                  <View style={styles.certificateDates}>
                    <Text style={styles.certificateDate}>
                      Issued: {formatDate(selectedCertification.issued_date)}
                    </Text>
                    {selectedCertification.expiry_date && (
                      <Text style={styles.certificateDate}>
                        Expires: {formatDate(selectedCertification.expiry_date)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Certificate ID */}
                {selectedCertification.certificate_number && (
                  <View style={styles.certificateIdContainer}>
                    <Text style={styles.certificateId}>
                      Certificate ID: {selectedCertification.certificate_number}
                    </Text>
                  </View>
                )}

                {/* Status Ribbon */}
                <View style={[styles.statusRibbon, { backgroundColor: certStatus.color }]}>
                  <Text style={styles.statusRibbonText}>{certStatus.status}</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalActionButton}
                onPress={() => handleShareCertificate(selectedCertification)}
              >
                <Ionicons name="share-outline" size={20} color="#2196F3" />
                <Text style={[styles.modalActionText, { color: '#2196F3' }]}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalActionButton, styles.primaryAction]}
                onPress={closeModal}
              >
                <Text style={[styles.modalActionText, { color: '#fff' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  const renderCertificationItem = ({ item, index }) => {
    const certStatus = getCertificationStatus(item.expiry_date);
    
    return (
      <TouchableOpacity 
        style={[
          styles.certificationCard,
          { animationDelay: `${index * 100}ms` }
        ]} 
        activeOpacity={0.8}
        onPress={() => handleViewCertificate(item)}
      >
        {/* Certificate Border Effect */}
        <View style={styles.certificateBorder}>
          <View style={[styles.cornerDecoration, styles.cornerTopLeft]} />
          <View style={[styles.cornerDecoration, styles.cornerTopRight]} />
          <View style={[styles.cornerDecoration, styles.cornerBottomLeft]} />
          <View style={[styles.cornerDecoration, styles.cornerBottomRight]} />
        </View>

        <View style={styles.certificationHeader}>
          <View style={styles.certificationIconContainer}>
            <Text style={styles.certificationIcon}>{getCertificationIcon(item.name)}</Text>
          </View>
          <View style={styles.certificationInfo}>
            <Text style={styles.certificationName}>{item.name}</Text>
            <Text style={styles.certificationAuthority}>
              {item.authority}
            </Text>
            {item.certificate_number && (
              <Text style={styles.certificateNumber}>
                Cert ID: {item.certificate_number}
              </Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: certStatus.badgeColor }]}>
            <View style={[styles.statusDot, { backgroundColor: certStatus.color }]} />
            <Text style={[styles.statusText, { color: certStatus.color }]}>
              {certStatus.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.certificationDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.detailText}>
                {formatDate(item.issued_date)}
              </Text>
            </View>
            {item.expiry_date && (
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={styles.detailText}>
                  {formatDate(item.expiry_date)}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.certificationFooter}>
          <View style={styles.verificationContainer}>
            <Ionicons name="shield-checkmark" size={14} color="#4CAF50" />
            <Text style={styles.verificationText}>Verified Certificate</Text>
          </View>
          <View style={styles.certificationActions}>
            <TouchableOpacity 
              style={styles.actionIconButton}
              onPress={() => handleViewCertificate(item)}
            >
              <Ionicons name="eye-outline" size={16} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionIconButton}
              onPress={() => handleShareCertificate(item)}
            >
              <Ionicons name="share-outline" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="ribbon-outline" size={80} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>No Certifications Yet</Text>
      <Text style={styles.emptySubtitle}>
        Enhance your product's credibility and market reach by adding professional certifications
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddCertification}>
        <LinearGradient
          colors={['#9C27B0', '#7B1FA2']}
          style={styles.emptyButtonGradient}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>Add First Certification</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
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
            <Text style={styles.headerSubtitle}>{productName}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddCertification}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{certifications.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.statActive]}>
              {certifications.filter(cert => getCertificationStatus(cert.expiry_date).status === 'Active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.statExpiring]}>
              {certifications.filter(cert => getCertificationStatus(cert.expiry_date).status === 'Expiring Soon').length}
            </Text>
            <Text style={styles.statLabel}>Expiring</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.statExpired]}>
              {certifications.filter(cert => getCertificationStatus(cert.expiry_date).status === 'Expired').length}
            </Text>
            <Text style={styles.statLabel}>Expired</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search certifications..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddCertification}>
            <LinearGradient
              colors={['#9C27B0', '#7B1FA2']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Create New</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleLinkExistingCertification}>
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="link-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Link Existing</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Certifications List */}
        <View style={styles.certificationsContainer}>
          {certifications.length > 0 ? (
            <FlatList
              data={filteredCertifications}
              renderItem={renderCertificationItem}
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
              ListEmptyComponent={() => (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search-outline" size={48} color="#ccc" />
                  <Text style={styles.noResultsText}>No certifications found</Text>
                  <Text style={styles.noResultsSubtext}>
                    Try adjusting your search terms
                  </Text>
                </View>
              )}
            />
          ) : (
            renderEmptyState()
          )}
        </View>

        {/* Certificate Modal */}
        {renderCertificateModal()}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  statActive: {
    color: '#4CAF50',
  },
  statExpiring: {
    color: '#FF9800',
  },
  statExpired: {
    color: '#F44336',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#f0f0f0',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  certificationsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
  },
  listContent: {
    padding: 16,
  },
  certificationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  certificateBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cornerDecoration: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: '#9C27B0',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 16,
  },
  certificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  certificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E1BEE7',
  },
  certificationIcon: {
    fontSize: 24,
  },
  certificationInfo: {
    flex: 1,
  },
  certificationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  certificationAuthority: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
    marginBottom: 2,
  },
  certificateNumber: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  certificationDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
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
    marginLeft: 6,
  },
  certificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  emptyButton: {
    borderRadius: 16,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#2D3748',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#718096',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certificatePreview: {
    padding: 20,
  },
  certificateGradient: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#e9ecef',
    position: 'relative',
    overflow: 'hidden',
  },
  certificateHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  certificateSeal: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#9C27B0',
    marginBottom: 16,
  },
  certificateSealIcon: {
    fontSize: 32,
  },
  certificateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    letterSpacing: 2,
  },
  certificateSubtitle: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
    letterSpacing: 1,
  },
  certificateBody: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  certificateProductName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 8,
    textAlign: 'center',
  },
  certificateAwarded: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  certificateName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  certificateDescription: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  certificateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  certificateAuthority: {
    alignItems: 'flex-start',
  },
  authorityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  authorityTitle: {
    fontSize: 12,
    color: '#718096',
    fontStyle: 'italic',
  },
  certificateDates: {
    alignItems: 'flex-end',
  },
  certificateDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  certificateIdContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  certificateId: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  statusRibbon: {
    position: 'absolute',
    top: 20,
    right: -30,
    paddingHorizontal: 32,
    paddingVertical: 6,
    transform: [{ rotate: '45deg' }],
  },
  statusRibbonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  primaryAction: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});