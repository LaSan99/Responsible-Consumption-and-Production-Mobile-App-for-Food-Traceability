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
  ScrollView,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    return (
      <Modal
        animationType="fade"
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
              {/* Close Button */}
              <View style={styles.certificateHeader}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close-circle" size={36} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Certificate Content */}
              <View style={styles.certificateContent}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8F8F8']}
                  style={styles.certificatePaper}
                >
                  {/* Decorative Corner Elements */}
                  <View style={styles.cornerTopLeft} />
                  <View style={styles.cornerTopRight} />
                  <View style={styles.cornerBottomLeft} />
                  <View style={styles.cornerBottomRight} />

                  {/* Certificate Border */}
                  <View style={styles.certificateBorder}>
                    <View style={styles.certificateInnerBorder}>
                      
                      {/* Header Section with Logo */}
                      <View style={styles.certificateLogoSection}>
                        <View style={styles.logoContainer}>
                          <Image 
                            source={require('../assets/UEE_Logo-removebg-preview.png')}
                            style={styles.certificateLogo}
                            resizeMode="contain"
                          />
                        </View>
                        <View style={styles.headerTextContainer}>
                          <Text style={styles.organizationName}>Food Traceability System</Text>
                          <Text style={styles.organizationSubtitle}>Responsible Consumption & Production</Text>
                          <View style={styles.sdgBadge}>
                            <Text style={styles.sdgText}>UN SDG 12</Text>
                          </View>
                        </View>
                      </View>

                      {/* Decorative Line */}
                      <View style={styles.decorativeLine}>
                        <View style={styles.decorLineLeft} />
                        <MaterialCommunityIcons name="seal" size={24} color="#9C27B0" />
                        <View style={styles.decorLineRight} />
                      </View>

                      {/* Certificate Title */}
                      <View style={styles.titleSection}>
                        <Text style={styles.certificateTitle}>OFFICIAL CERTIFICATE</Text>
                        <Text style={styles.certificateSubtitle}>OF PRODUCT CERTIFICATION</Text>
                      </View>

                      {/* Certificate Number */}
                      <View style={styles.certNumberContainer}>
                        <Text style={styles.certNumberLabel}>Certificate No:</Text>
                        <Text style={styles.certNumberValue}>FTS-{selectedCert.id}-{new Date(selectedCert.issued_date).getFullYear()}</Text>
                      </View>

                      {/* Main Certificate Body */}
                      <View style={styles.certificateBody}>
                        <Text style={styles.certificateIntroText}>
                          This is to certify that the product
                        </Text>
                        
                        <View style={styles.productNameContainer}>
                          <Text style={styles.productNameText}>{productName}</Text>
                        </View>

                        <Text style={styles.certificateIntroText}>
                          has been inspected and certified to meet the standards and requirements of
                        </Text>

                        <View style={styles.certificationNameContainer}>
                          <View style={styles.certIconBadge}>
                            <Text style={styles.certIconLarge}>{getCertificationIcon(selectedCert.name)}</Text>
                          </View>
                          <Text style={styles.certificationNameLarge}>{selectedCert.name}</Text>
                        </View>

                        {/* Certification Details */}
                        <View style={styles.detailsSection}>
                          <View style={styles.detailsRow}>
                            <View style={styles.detailBoxHalf}>
                              <MaterialCommunityIcons name="shield-check" size={20} color="#9C27B0" />
                              <View style={styles.detailTextContainer}>
                                <Text style={styles.detailBoxLabel}>Certifying Authority</Text>
                                <Text style={styles.detailBoxValue}>{selectedCert.authority}</Text>
                              </View>
                            </View>
                            <View style={styles.detailBoxHalf}>
                              <MaterialCommunityIcons name="calendar-check" size={20} color="#9C27B0" />
                              <View style={styles.detailTextContainer}>
                                <Text style={styles.detailBoxLabel}>Date of Issue</Text>
                                <Text style={styles.detailBoxValue}>{formatDate(selectedCert.issued_date)}</Text>
                              </View>
                            </View>
                          </View>

                          {selectedCert.expiry_date && (
                            <View style={styles.detailsRow}>
                              <View style={styles.detailBoxHalf}>
                                <MaterialCommunityIcons name="calendar-clock" size={20} color="#9C27B0" />
                                <View style={styles.detailTextContainer}>
                                  <Text style={styles.detailBoxLabel}>Valid Until</Text>
                                  <Text style={styles.detailBoxValue}>{formatDate(selectedCert.expiry_date)}</Text>
                                </View>
                              </View>
                              <View style={styles.detailBoxHalf}>
                                <MaterialCommunityIcons name="certificate" size={20} color="#9C27B0" />
                                <View style={styles.detailTextContainer}>
                                  <Text style={styles.detailBoxLabel}>Status</Text>
                                  <View style={[styles.statusInline, { backgroundColor: certStatus.color }]}>
                                    <Text style={styles.statusInlineText}>{certStatus.status}</Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          )}
                        </View>

                        {/* Blockchain Verification */}
                        <View style={styles.blockchainSection}>
                          <View style={styles.blockchainHeader}>
                            <MaterialCommunityIcons name="link-variant" size={20} color="#4CAF50" />
                            <Text style={styles.blockchainTitle}>Blockchain Verified</Text>
                          </View>
                          <Text style={styles.blockchainText}>
                            This certificate is secured on the blockchain for transparency and traceability
                          </Text>
                          <View style={styles.qrCodePlaceholder}>
                            <MaterialCommunityIcons name="qrcode-scan" size={48} color="#666" />
                            <Text style={styles.qrCodeText}>Product ID: {productId}</Text>
                          </View>
                        </View>

                        {/* Signatures Section */}
                        <View style={styles.signaturesSection}>
                          <View style={styles.signatureBox}>
                            <View style={styles.signatureLine} />
                            <Text style={styles.signatureLabel}>Authorized Signatory</Text>
                            <Text style={styles.signatureTitle}>{selectedCert.authority}</Text>
                          </View>
                          <View style={styles.officialSeal}>
                            <View style={styles.sealCircle}>
                              <MaterialCommunityIcons name="seal" size={40} color="#9C27B0" />
                              <Text style={styles.sealText}>OFFICIAL{'\n'}SEAL</Text>
                            </View>
                          </View>
                        </View>

                        {/* Verification Badge */}
                        <View style={styles.verificationFooter}>
                          <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
                          <View style={styles.verificationTextContainer}>
                            <Text style={styles.verificationTitle}>Digitally Verified & Authenticated</Text>
                            <Text style={styles.verificationDate}>Verified on: {currentDate}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Footer */}
                      <View style={styles.certificateFooter}>
                        <View style={styles.footerLine} />
                        <Text style={styles.footerText}>
                          This is a computer-generated certificate and is valid without signature
                        </Text>
                        <Text style={styles.footerSubtext}>
                          For verification, scan the QR code or visit our traceability portal
                        </Text>
                      </View>

                    </View>
                  </View>
                </LinearGradient>
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.95,
    maxHeight: height * 0.92,
    backgroundColor: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
  },
  certificateScrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  certificateHeader: {
    alignItems: 'flex-end',
    marginBottom: 10,
    paddingRight: 5,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 2,
  },
  certificateContent: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  certificatePaper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  // Decorative Corners
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#9C27B0',
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#9C27B0',
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#9C27B0',
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#9C27B0',
    borderBottomRightRadius: 12,
  },
  certificateBorder: {
    margin: 20,
    borderWidth: 2,
    borderColor: '#9C27B0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  certificateInnerBorder: {
    margin: 8,
    borderWidth: 1,
    borderColor: '#E1BEE7',
    borderRadius: 6,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  // Header Section
  certificateLogoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    marginBottom: 12,
  },
  certificateLogo: {
    width: 80,
    height: 80,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  organizationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9C27B0',
    textAlign: 'center',
    marginBottom: 4,
  },
  organizationSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  sdgBadge: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sdgText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  // Decorative Line
  decorativeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  decorLineLeft: {
    flex: 1,
    height: 1,
    backgroundColor: '#9C27B0',
    marginRight: 10,
  },
  decorLineRight: {
    flex: 1,
    height: 1,
    backgroundColor: '#9C27B0',
    marginLeft: 10,
  },
  // Title Section
  titleSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  certificateTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9C27B0',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 4,
  },
  certificateSubtitle: {
    fontSize: 14,
    color: '#666',
    letterSpacing: 2,
    textAlign: 'center',
  },
  // Certificate Number
  certNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3E5F5',
    borderRadius: 20,
    alignSelf: 'center',
  },
  certNumberLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginRight: 6,
  },
  certNumberValue: {
    fontSize: 13,
    color: '#9C27B0',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  // Certificate Body
  certificateBody: {
    paddingVertical: 4,
  },
  certificateIntroText: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  productNameContainer: {
    backgroundColor: '#F3E5F5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#9C27B0',
  },
  productNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  certificationNameContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#9C27B0',
    alignItems: 'center',
  },
  certIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  certIconLarge: {
    fontSize: 32,
  },
  certificationNameLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9C27B0',
    textAlign: 'center',
  },
  // Details Section
  detailsSection: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailBoxHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 4,
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  detailBoxLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailBoxValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    lineHeight: 18,
  },
  statusInline: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusInlineText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Blockchain Section
  blockchainSection: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  blockchainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  blockchainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 8,
  },
  blockchainText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  qrCodePlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  qrCodeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  // Signatures Section
  signaturesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: 10,
  },
  signatureBox: {
    flex: 1,
    marginRight: 10,
  },
  signatureLine: {
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    marginBottom: 8,
    paddingTop: 30,
  },
  signatureLabel: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginBottom: 2,
  },
  signatureTitle: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  officialSeal: {
    width: 100,
    alignItems: 'center',
  },
  sealCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#9C27B0',
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sealText: {
    fontSize: 9,
    color: '#9C27B0',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 1,
  },
  // Verification Footer
  verificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  verificationTextContainer: {
    marginLeft: 10,
  },
  verificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  verificationDate: {
    fontSize: 11,
    color: '#666',
  },
  // Certificate Footer
  certificateFooter: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerLine: {
    width: '50%',
    height: 1,
    backgroundColor: '#9C27B0',
    marginBottom: 12,
    opacity: 0.3,
  },
  footerText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  footerSubtext: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
});
