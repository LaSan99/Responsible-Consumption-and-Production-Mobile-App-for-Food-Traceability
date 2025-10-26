import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, FlatList, StyleSheet, Alert, TouchableOpacity, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import apiConfig from '../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState([]);
  const [productInfo, setProductInfo] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const alertShownRef = React.useRef(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  useEffect(() => {
    if (stages.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [stages]);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    const batch_code = data.trim();
    setLoading(true);
    setErrorState(null);
    alertShownRef.current = false;

    try {
      const response = await axios.get(`${apiConfig.baseURL}/supply-chain/batch/${batch_code}`);
      
      // Handle case where product exists but has no stages
      if (response.data.noStages) {
        setStages([]);
        setProductInfo({
          name: response.data.product.name,
          batch_code: response.data.product.batch_code
        });
        // Don't show alert here - the UI will display the empty state
      } else {
        // Product exists with stages
        const stagesData = response.data;
        setStages(stagesData);
        
        if (stagesData.length > 0) {
          setProductInfo({
            name: stagesData[0].product_name,
            batch_code: stagesData[0].batch_code
          });
        }
      }
    } catch (error) {
      // Reset state on error
      setStages([]);
      setProductInfo(null);
      
      let errorInfo = { type: 'unknown', message: '' };
      
      // Handle different error scenarios with user-friendly alerts
      if (error.response) {
        // Server responded with an error status
        if (error.response.status === 404) {
          errorInfo = {
            type: 'not_found',
            title: '❌ Product Not Found',
            message: 'No product exists with this batch code in our database. Please verify the QR code is correct.'
          };
          if (!alertShownRef.current) {
            alertShownRef.current = true;
            Alert.alert(
              errorInfo.title,
              errorInfo.message,
              [{ text: 'OK', style: 'default' }]
            );
          }
        } else if (error.response.status === 500) {
          errorInfo = {
            type: 'server_error',
            title: '⚠️ Server Error',
            message: 'Unable to fetch product information. Please try again later.'
          };
          if (!alertShownRef.current) {
            alertShownRef.current = true;
            Alert.alert(
              errorInfo.title,
              errorInfo.message,
              [{ text: 'OK', style: 'default' }]
            );
          }
        } else {
          errorInfo = {
            type: 'server_error',
            title: '⚠️ Error',
            message: `Server returned error: ${error.response.status}. Please try again.`
          };
          if (!alertShownRef.current) {
            alertShownRef.current = true;
            Alert.alert(
              errorInfo.title,
              errorInfo.message,
              [{ text: 'OK', style: 'default' }]
            );
          }
        }
      } else if (error.request) {
        // Request was made but no response received
        errorInfo = {
          type: 'network_error',
          title: '📡 Network Error',
          message: 'Unable to connect to the server. Please check your internet connection and try again.'
        };
        if (!alertShownRef.current) {
          alertShownRef.current = true;
          Alert.alert(
            errorInfo.title,
            errorInfo.message,
            [{ text: 'OK', style: 'default' }]
          );
        }
      } else {
        // Something else happened
        errorInfo = {
          type: 'unknown',
          title: '⚠️ Error',
          message: 'An unexpected error occurred. Please try scanning again.'
        };
        if (!alertShownRef.current) {
          alertShownRef.current = true;
          Alert.alert(
            errorInfo.title,
            errorInfo.message,
            [{ text: 'OK', style: 'default' }]
          );
        }
      }
      
      setErrorState(errorInfo);
      
      // Log error for debugging (only in development)
      if (__DEV__) {
        console.log('Scanner error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getStageIcon = (stageName) => {
    const name = stageName.toLowerCase();
    if (name.includes('manufactur') || name.includes('produc')) return '🏭';
    if (name.includes('warehouse') || name.includes('storage')) return '📦';
    if (name.includes('transport') || name.includes('shipping')) return '🚚';
    if (name.includes('retail') || name.includes('store')) return '🏪';
    if (name.includes('quality') || name.includes('check')) return '✅';
    if (name.includes('import') || name.includes('export')) return '🌍';
    return '📋';
  };

  const getStatusColor = (index, total) => {
    if (index === total - 1) return '#10B981'; // Current stage - green
    if (index < total - 1) return '#4F46E5';   // Completed - indigo
    return '#9CA3AF';                          // Future - gray
  };

  const getStatusText = (index, total) => {
    if (index === total - 1) return 'Current';
    if (index < total - 1) return 'Completed';
    return 'Pending';
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>📷 Camera Access Required</Text>
          <Text style={styles.permissionDescription}>
            We need camera access to scan QR codes and track your products
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {!scanned ? (
        <View style={styles.cameraContainer}>
          <CameraView
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            style={styles.camera}
          />
          <View style={styles.scanOverlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanInstruction}>Position QR code within the frame</Text>
          </View>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Fetching product stages...</Text>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>🔗 Supply Chain Journey</Text>
                <Text style={styles.headerSubtitle}>Track your product's complete journey</Text>
                {productInfo && (
                  <View style={styles.productInfoCard}>
                    <View style={styles.productHeader}>
                      <Ionicons name="cube" size={24} color="#4F46E5" />
                      <Text style={styles.productName}>{productInfo.name}</Text>
                    </View>
                    <View style={styles.batchInfo}>
                      <Ionicons name="barcode" size={16} color="#6B7280" />
                      <Text style={styles.batchCode}>Batch: {productInfo.batch_code}</Text>
                    </View>
                  </View>
                )}
              </View>

              {stages.length > 0 ? (
                <View style={styles.timelineContainer}>
                  <FlatList
                    data={stages}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                      <Animated.View 
                        style={[
                          styles.stageCard,
                          { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0]
                          })}] }
                        ]}
                      >
                        <View style={styles.stageHeader}>
                          <View style={styles.stageIconContainer}>
                            <Text style={styles.stageIcon}>{getStageIcon(item.stage_name)}</Text>
                          </View>
                          <View style={styles.stageTitleContainer}>
                            <Text style={styles.stageName}>{item.stage_name}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(index, stages.length) }]}>
                              <Text style={styles.statusText}>{getStatusText(index, stages.length)}</Text>
                            </View>
                          </View>
                          <View style={styles.stageNumber}>
                            <Text style={styles.stageNumberText}>{index + 1}</Text>
                          </View>
                        </View>

                        <View style={styles.stageContent}>
                          <View style={styles.detailSection}>
                            <View style={styles.detailRow}>
                              <Ionicons name="location" size={16} color="#6B7280" />
                              <Text style={styles.detailLabel}>Location:</Text>
                              <Text style={styles.detailText}>{item.location}</Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                              <Ionicons name="person" size={16} color="#6B7280" />
                              <Text style={styles.detailLabel}>Handler:</Text>
                              <Text style={styles.detailText}>{item.updated_by_name}</Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                              <Ionicons name="time" size={16} color="#6B7280" />
                              <Text style={styles.detailLabel}>Date & Time:</Text>
                              <Text style={styles.detailText}>
                                {new Date(item.timestamp).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Text>
                            </View>
                          </View>

                          {(item.description || item.notes) && (
                            <View style={styles.notesSection}>
                              {item.description && (
                                <View style={styles.noteItem}>
                                  <Ionicons name="document-text" size={14} color="#4F46E5" />
                                  <Text style={styles.noteLabel}>Description:</Text>
                                  <Text style={styles.noteText}>{item.description}</Text>
                                </View>
                              )}
                              {item.notes && (
                                <View style={styles.noteItem}>
                                  <Ionicons name="chatbubble" size={14} color="#4F46E5" />
                                  <Text style={styles.noteLabel}>Notes:</Text>
                                  <Text style={styles.noteText}>{item.notes}</Text>
                                </View>
                              )}
                            </View>
                          )}
                        </View>

                        {index < stages.length - 1 && (
                          <View style={styles.connector}>
                            <View style={styles.connectorLine} />
                            <Ionicons name="chevron-down" size={16} color="#E5E7EB" style={styles.connectorIcon} />
                          </View>
                        )}
                      </Animated.View>
                    )}
                  />
                </View>
              ) : errorState ? (
                <View style={styles.errorState}>
                  <Ionicons 
                    name={errorState.type === 'not_found' ? 'alert-circle-outline' : errorState.type === 'network_error' ? 'cloud-offline-outline' : 'warning-outline'} 
                    size={64} 
                    color={errorState.type === 'not_found' ? '#EF4444' : '#F59E0B'} 
                  />
                  <Text style={styles.errorTitle}>{errorState.title}</Text>
                  <Text style={styles.errorDescription}>
                    {errorState.message}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="cube-outline" size={64} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No Stages Found</Text>
                  <Text style={styles.emptyDescription}>
                    No supply chain stages found for this product
                  </Text>
                </View>
              )}

              <TouchableOpacity 
                style={styles.scanButton} 
                onPress={() => {
                  setScanned(false);
                  setStages([]);
                  setProductInfo(null);
                  setErrorState(null);
                  alertShownRef.current = false;
                  fadeAnim.setValue(0);
                }}
              >
                <Ionicons name="scan" size={20} color="#FFFFFF" />
                <Text style={styles.scanButtonText}>Scan Another Product</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxWidth: 350,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#4F46E5',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scanInstruction: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 16,
  },
  productInfoCard: {
    backgroundColor: '#F8FAFF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  batchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batchCode: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginLeft: 6,
  },
  timelineContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  stageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 0,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    borderLeftWidth: 0,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#FAFBFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stageIcon: {
    fontSize: 20,
  },
  stageTitleContainer: {
    flex: 1,
  },
  stageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stageNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stageContent: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
    marginRight: 6,
    width: 80,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  notesSection: {
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 6,
    marginRight: 6,
    width: 80,
  },
  noteText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
    lineHeight: 18,
  },
  connector: {
    alignItems: 'center',
    marginTop: -10,
  },
  connectorLine: {
    width: 2,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginBottom: 4,
  },
  connectorIcon: {
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  scanButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#4F46E5',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
  },
});