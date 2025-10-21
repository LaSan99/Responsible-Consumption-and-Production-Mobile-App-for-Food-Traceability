import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import apiConfig from '../config/api';

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState([]);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    const batch_code = data.trim();
    setLoading(true);

    try {
      const response = await axios.get(`${apiConfig.baseURL}/supply-chain/batch/${batch_code}`);
      setStages(response.data);
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.status === 404 
        ? 'No product found with this batch code'
        : 'Failed to fetch product stages';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
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
                <Text style={styles.headerTitle}>🔗 Supply Chain Stages</Text>
                <Text style={styles.headerSubtitle}>Track your product journey</Text>
              </View>

              {stages.length > 0 ? (
                <FlatList
                  data={stages}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={styles.listContent}
                  renderItem={({ item, index }) => (
                    <View style={styles.stageCard}>
                      <View style={styles.stageNumber}>
                        <Text style={styles.stageNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.stageContent}>
                        <Text style={styles.stageName}>{item.stage_name}</Text>
                        <View style={styles.locationContainer}>
                          <Text style={styles.locationIcon}>📍</Text>
                          <Text style={styles.locationText}>{item.location}</Text>
                        </View>
                      </View>
                      {index < stages.length - 1 && <View style={styles.connector} />}
                    </View>
                  )}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📦</Text>
                  <Text style={styles.emptyTitle}>No Stages Found</Text>
                  <Text style={styles.emptyDescription}>
                    No supply chain stages found for this product
                  </Text>
                </View>
              )}

              <TouchableOpacity 
                style={styles.scanButton} 
                onPress={() => setScanned(false)}
              >
                <Text style={styles.scanButtonText}>🔍 Scan Another Product</Text>
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
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  stageCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  stageNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stageNumberText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  stageContent: {
    flex: 1,
  },
  stageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  locationText: {
    fontSize: 15,
    color: '#6B7280',
  },
  connector: {
    position: 'absolute',
    left: 41,
    top: 64,
    width: 2,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
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
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});