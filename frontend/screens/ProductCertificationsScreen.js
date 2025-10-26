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
  Alert,
  Modal,
  ScrollView
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

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

  const viewCertificate = (certification) => {
    setSelectedCert(certification);
    setModalVisible(true);
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
              {item.authority}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: certStatus.color }]}>
            <Text style={styles.statusText}>{certStatus.status}</Text>
          </View>
        </View>
        
        <View style={styles.certificationDetails}>
          <View style={styles.detailRow}>
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
        </View>
        
        <TouchableOpacity 
          style={styles.viewCertButton}
          onPress={() => viewCertificate(item)}
        >
          <LinearGradient
            colors={['#9C27B0', '#7B1FA2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.viewCertButtonGradient}
          >
            <Ionicons name="document-text-outline" size={20} color="#fff" />
            <Text style={styles.viewCertButtonText}>View Certificate</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCertificateModal = () => {
    if (!selectedCert) return null;
    const certStatus = getCertificationStatus(selectedCert.expiry_date);
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.certificateScrollContent}
            >
              {/* Certificate Header */}
              <View style={styles.certificateHeader}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close-circle" size={32} color="#9C27B0" />
                </TouchableOpacity>
              </View>

              {/* Certificate Content */}
              <View style={styles.certificateContent}>
                {/* Decorative Border */}
                <View style={styles.certificateBorder}>
                  <View style={styles.certificateInnerBorder}>
                    
                    {/* Top Decorative Elements */}
                    <View style={styles.certificateTopDecor}>
                      <View style={styles.decorLine} />
                      <View style={styles.decorCircle}>
                        <Text style={styles.certificateBigIcon}>
                          {getCertificationIcon(selectedCert.name)}
                        </Text>
                      </View>
                      <View style={styles.decorLine} />
                    </View>

                    {/* Certificate Title */}
                    <Text style={styles.certificateTitle}>CERTIFICATE</Text>
                    <Text style={styles.certificateSubtitle}>OF AUTHENTICITY</Text>

                    {/* Divider */}
                    <View style={styles.certificateDivider} />

                    {/* Certificate Body */}
                    <View style={styles.certificateBody}>
                      <Text style={styles.certificateLabel}>This is to certify that</Text>
                      
                      <View style={styles.productNameContainer}>
                        <Text style={styles.productNameText}>{productName}</Text>
                      </View>

                      <Text style={styles.certificateLabel}>has been certified for</Text>

                      <View style={styles.certificationNameContainer}>
                        <Text style={styles.certificationNameLarge}>{selectedCert.name}</Text>
                      </View>

                      {/* Certification Details Grid */}
                      <View style={styles.detailsGrid}>
                        <View style={styles.detailBox}>
                          <Text style={styles.detailBoxLabel}>Certification Authority</Text>
                          <Text style={styles.detailBoxValue}>{selectedCert.authority}</Text>
                        </View>

                        <View style={styles.detailBox}>
                          <Text style={styles.detailBoxLabel}>Certificate ID</Text>
                          <Text style={styles.detailBoxValue}>#{selectedCert.id}</Text>
                        </View>

                        <View style={styles.detailBox}>
                          <Text style={styles.detailBoxLabel}>Issue Date</Text>
                          <Text style={styles.detailBoxValue}>{formatDate(selectedCert.issued_date)}</Text>
                        </View>

                        {selectedCert.expiry_date && (
                          <View style={styles.detailBox}>
                            <Text style={styles.detailBoxLabel}>Expiry Date</Text>
                            <Text style={styles.detailBoxValue}>{formatDate(selectedCert.expiry_date)}</Text>
                          </View>
                        )}
                      </View>

                      {/* Status Badge */}
                      <View style={styles.certificateStatusContainer}>
                        <View style={[styles.certificateStatusBadge, { backgroundColor: certStatus.color }]}>
                          <Ionicons name="shield-checkmark" size={20} color="#fff" />
                          <Text style={styles.certificateStatusText}>{certStatus.status}</Text>
                        </View>
                      </View>

                      {/* Verification Section */}
                      <View style={styles.verificationSection}>
                        <View style={styles.verificationBadge}>
                          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                          <Text style={styles.verificationLabel}>Verified & Authenticated</Text>
                        </View>
                      </View>

                    </View>

                    {/* Bottom Decorative Elements */}
                    <View style={styles.certificateBottomDecor}>
                      <View style={styles.decorLine} />
                      <Ionicons name="star" size={20} color="#9C27B0" />
                      <View style={styles.decorLine} />
                    </View>

                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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

      {/* Certificate Modal */}
      {renderCertificateModal()}
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.1)',
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
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  viewCertButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewCertButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  viewCertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.95,
    maxHeight: height * 0.9,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  certificateScrollContent: {
    padding: 20,
  },
  certificateHeader: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  closeButton: {
    padding: 5,
  },
  certificateContent: {
    padding: 10,
  },
  certificateBorder: {
    borderWidth: 3,
    borderColor: '#9C27B0',
    borderRadius: 16,
    padding: 8,
    backgroundColor: '#fff',
  },
  certificateInnerBorder: {
    borderWidth: 1,
    borderColor: '#9C27B0',
    borderRadius: 12,
    padding: 24,
    backgroundColor: '#FAFAFA',
  },
  certificateTopDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  decorLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#9C27B0',
    marginHorizontal: 10,
  },
  decorCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  certificateBigIcon: {
    fontSize: 36,
  },
  certificateTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#9C27B0',
    letterSpacing: 4,
    marginBottom: 5,
  },
  certificateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    letterSpacing: 2,
    marginBottom: 20,
  },
  certificateDivider: {
    height: 2,
    backgroundColor: '#9C27B0',
    marginVertical: 20,
    opacity: 0.3,
  },
  certificateBody: {
    paddingVertical: 10,
  },
  certificateLabel: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  productNameContainer: {
    backgroundColor: '#F3E5F5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  productNameText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  certificationNameContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#9C27B0',
    borderStyle: 'dashed',
  },
  certificationNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#9C27B0',
  },
  detailsGrid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailBox: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailBoxLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailBoxValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  certificateStatusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  certificateStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  certificateStatusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  verificationSection: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationLabel: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  certificateBottomDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
});
