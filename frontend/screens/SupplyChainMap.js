// NearestSuppliersByProduct.jsx
import React, { useEffect, useMemo, useState } from "react";
import { 
  View, 
  Text, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  Platform, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar 
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // 👈 Add this

// --- simple haversine distance in KM ---
const distanceKm = (a, b) => {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const NEAREST_COUNT = 5;
const MAX_RADIUS_KM = 25;

// Mock data for testing when API fails
const MOCK_SUPPLIERS = [
  {
    id: 1,
    stage_name: "Apple Harvesting",
    location: "Malabe Farms, Colombo",
    description: "Fresh apples harvested from organic orchards",
    notes: "Quality check passed",
    updated_by_name: "Daniru Perera",
    timestamp: "2025-10-06T09:10:17.000Z",
    latitude: 6.9022,
    longitude: 79.9633
  },
  {
    id: 2,
    stage_name: "Processing Center",
    location: "Kaduwela Industrial Zone",
    description: "Washing, sorting and quality control",
    notes: "Batch #234 processed",
    updated_by_name: "Saman Kumara",
    timestamp: "2025-10-06T10:15:22.000Z",
    latitude: 6.9353,
    longitude: 79.9850
  },
  {
    id: 3,
    stage_name: "Distribution Hub",
    location: "Maharagama Distribution Center",
    description: "Regional distribution to retailers",
    notes: "Ready for dispatch",
    updated_by_name: "Kamal Silva",
    timestamp: "2025-10-06T11:20:45.000Z",
    latitude: 6.8481,
    longitude: 79.9264
  },
  {
    id: 4,
    stage_name: "Storage Facility",
    location: "Dehiwala Cold Storage",
    description: "Temperature controlled storage facility",
    notes: "Optimal conditions maintained",
    updated_by_name: "Nimal Fernando",
    timestamp: "2025-10-06T12:30:10.000Z",
    latitude: 6.8525,
    longitude: 79.8631
  },
  {
    id: 5,
    stage_name: "Retail Center",
    location: "Colombo City Market",
    description: "Final retail location for customers",
    notes: "Available for sale",
    updated_by_name: "Priya Rathnayake",
    timestamp: "2025-10-06T13:45:33.000Z",
    latitude: 6.9271,
    longitude: 79.8612
  }
];

// Comprehensive location database for Sri Lanka
const SRI_LANKA_LOCATIONS = {
  "malabe": { latitude: 6.9022, longitude: 79.9633 },
  "colombo": { latitude: 6.9271, longitude: 79.8612 },
  "kaduwela": { latitude: 6.9353, longitude: 79.9850 },
  "maharagama": { latitude: 6.8481, longitude: 79.9264 },
  "dehiwala": { latitude: 6.8525, longitude: 79.8631 },
  "mount lavinia": { latitude: 6.8275, longitude: 79.8625 },
  "kotte": { latitude: 6.8917, longitude: 79.9075 },
};

// Function to geocode location text to coordinates
const geocodeLocation = (locationText) => {
  if (!locationText) return null;
  
  const normalizedLocation = locationText.toLowerCase().trim();
  
  // Check if we have predefined coordinates for this location
  for (const [key, coords] of Object.entries(SRI_LANKA_LOCATIONS)) {
    if (normalizedLocation.includes(key)) {
      return coords;
    }
  }
  
  return null;
};

// ✅ Removed `onBack` prop — now using navigation hook
export default function NearestSuppliersByProduct({ productId = "1" }) {
  const navigation = useNavigation(); // 👈 Get navigation object
  const [userLocation, setUserLocation] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadSuppliers = () => {
    // Use only dummy data - no API calls
    const normalizedMock = MOCK_SUPPLIERS.map((s, index) => ({
      id: s.id || `mock-${index}`,
      name: s.stage_name,
      coords: { latitude: s.latitude, longitude: s.longitude },
      address: s.location,
      description: s.description,
      notes: s.notes,
      updated_by_name: s.updated_by_name,
      timestamp: s.timestamp,
    }));
    
    setSuppliers(normalizedMock);
    setUsingMockData(true);
    setApiError(null);
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== "granted") {
          const errorMsg = "Location permission denied";
          if (isMounted) {
            setLocationError(errorMsg);
            setUserLocation({ latitude: 6.9271, longitude: 79.8612 });
          }
        } else {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            timeout: 10000,
          });

          if (isMounted) {
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
            setLocationError(null);
          }
        }

        loadSuppliers();

      } catch (error) {
        console.error("Load error:", error);
        if (isMounted && error.message.includes("location")) {
          setLocationError(error.message);
        }
      } finally {
        if (isMounted) {
          setTimeout(() => setLoading(false), 1000);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const nearestSuppliers = useMemo(() => {
    if (!userLocation) return [];
    
    const suppliersWithDistance = suppliers.map((s) => ({ 
      ...s, 
      km: distanceKm(userLocation, s.coords) 
    }));
    
    return suppliersWithDistance
      .filter((s) => s.km <= MAX_RADIUS_KM)
      .sort((a, b) => a.km - b.km)
      .slice(0, NEAREST_COUNT);
  }, [userLocation, suppliers]);

  const mapRegion = useMemo(() => {
    if (!userLocation) return null;
    
    const allPoints = [userLocation, ...suppliers.map(s => s.coords)];
    const latitudes = allPoints.map(p => p.latitude);
    const longitudes = allPoints.map(p => p.longitude);
    
    return {
      latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
      longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
      latitudeDelta: Math.max((Math.max(...latitudes) - Math.min(...latitudes)) * 1.5, 0.05),
      longitudeDelta: Math.max((Math.max(...longitudes) - Math.min(...longitudes)) * 1.5, 0.05),
    };
  }, [userLocation, suppliers]);

  const retryLoad = () => {
    setLoading(true);
    setApiError(null);
    loadSuppliers();
    setTimeout(() => setLoading(false), 1000);
  };

  const handleSupplierPress = (supplier) => {
    setSelectedSupplier(supplier);
    setModalVisible(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Invalid date';
    }
  };

  // ✅ Handle back press: go to Home tab
  const handleBackPress = () => {
   navigation.navigate('MainTabs', { screen: 'Home' }); // 👈 Navigate to Home tab
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingTitle}>Loading Supply Chain</Text>
            <Text style={styles.loadingSubtitle}>Getting your location and mapping suppliers...</Text>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Supply Chain Map</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={{ flex: 1 }}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={mapRegion}
          region={mapRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {userLocation && (
            <Marker 
              coordinate={userLocation} 
              pinColor="blue"
              title="Your Location"
              description="You are here"
            />
          )}
          
          {userLocation && (
            <Circle 
              center={userLocation} 
              radius={MAX_RADIUS_KM * 1000} 
              fillColor="rgba(74, 144, 226, 0.15)"
              strokeColor="rgba(74, 144, 226, 0.5)"
              strokeWidth={2}
            />
          )}

          {suppliers.map((supplier) => (
            <Marker
              key={supplier.id}
              coordinate={supplier.coords}
              pinColor="green"
              title={supplier.name}
              description={`${supplier.address}`}
              onPress={() => handleSupplierPress(supplier)}
            />
          ))}

          {nearestSuppliers.map((supplier) => (
            <Marker
              key={`nearest-${supplier.id}`}
              coordinate={supplier.coords}
              pinColor="red"
              title={`📍 ${supplier.name}`}
              description={`${supplier.km.toFixed(1)} km away`}
              onPress={() => handleSupplierPress(supplier)}
            />
          ))}
        </MapView>

        <View style={styles.infoPanel}>
          {apiError && (
            <View style={styles.errorBanner}>
              <Ionicons name="warning" size={16} color="#d32f2f" />
              <Text style={styles.errorBannerText}>{apiError}</Text>
              <TouchableOpacity onPress={retryLoad} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {locationError && (
            <View style={styles.warningBanner}>
              <Ionicons name="location-off" size={16} color="#f57c00" />
              <Text style={styles.warningBannerText}>{locationError}</Text>
            </View>
          )}
          
          <View style={styles.stats}>
            <Text style={styles.statText}>
              📍 Your Location • {suppliers.length} Stages • {nearestSuppliers.length} Nearby
            </Text>
          </View>

          {nearestSuppliers.length === 0 ? (
            <Text style={styles.noSuppliers}>
              No stages within {MAX_RADIUS_KM}km. Try increasing search radius.
            </Text>
          ) : (
            <ScrollView style={styles.nearestList} showsVerticalScrollIndicator={false}>
              <Text style={styles.nearestTitle}>Nearby Stages</Text>
              {nearestSuppliers.map((supplier) => (
                <TouchableOpacity 
                  key={supplier.id} 
                  style={styles.supplierItem}
                  onPress={() => handleSupplierPress(supplier)}
                >
                  <View style={styles.supplierIcon}>
                    <Ionicons name="business" size={16} color="#4A90E2" />
                  </View>
                  <View style={styles.supplierInfo}>
                    <Text style={styles.supplierName}>{supplier.name}</Text>
                    <Text style={styles.supplierDetails}>
                      {supplier.km.toFixed(1)}km • {supplier.address}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#999" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Supplier Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedSupplier && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedSupplier.name}</Text>
                  <TouchableOpacity 
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{selectedSupplier.address}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Coordinates</Text>
                    <Text style={styles.detailValue}>
                      {selectedSupplier.coords.latitude.toFixed(6)}, {selectedSupplier.coords.longitude.toFixed(6)}
                    </Text>
                  </View>
                  
                  {selectedSupplier.description && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Description</Text>
                      <Text style={styles.detailValue}>{selectedSupplier.description}</Text>
                    </View>
                  )}
                  
                  {selectedSupplier.notes && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Notes</Text>
                      <Text style={styles.detailValue}>{selectedSupplier.notes}</Text>
                    </View>
                  )}
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Updated By</Text>
                    <Text style={styles.detailValue}>{selectedSupplier.updated_by_name || 'Unknown'}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Last Updated</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedSupplier.timestamp)}</Text>
                  </View>
                  
                  {selectedSupplier.km && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Distance from You</Text>
                      <Text style={[styles.detailValue, styles.distanceText]}>
                        {selectedSupplier.km.toFixed(1)} kilometers
                      </Text>
                    </View>
                  )}
                </ScrollView>
                
                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={styles.viewOnMapButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="map" size={16} color="#fff" />
                    <Text style={styles.viewOnMapText}>View on Map</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ... (styles remain exactly the same — no changes needed below)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4A90E2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#4A90E2',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 30,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingDots: {
    flexDirection: 'row',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    marginHorizontal: 4,
  },
  dot1: {
    animation: 'pulse 1s infinite',
  },
  dot2: {
    animation: 'pulse 1s infinite 0.2s',
  },
  dot3: {
    animation: 'pulse 1s infinite 0.4s',
  },
  infoPanel: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "white",
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    maxHeight: '40%',
    padding: 16,
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#d32f2f',
    fontSize: 13,
    flex: 1,
    marginLeft: 8,
  },
  warningBanner: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningBannerText: {
    color: '#f57c00',
    fontSize: 13,
    marginLeft: 8,
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  stats: {
    marginBottom: 12,
  },
  statText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
    textAlign: 'center',
  },
  nearestList: {
    maxHeight: 200,
  },
  nearestTitle: {
    fontWeight: "600",
    marginBottom: 12,
    color: '#333',
    fontSize: 16,
  },
  noSuppliers: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 14,
  },
  supplierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  supplierIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  supplierDetails: {
    fontSize: 12,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  distanceText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewOnMapButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  viewOnMapText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});