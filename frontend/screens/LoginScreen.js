// NearestSuppliersByProduct.jsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, Alert, StyleSheet, Platform, TouchableOpacity } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

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

// Android emulator can't use "localhost"
const baseHost = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

// Mock data for testing when API fails
const MOCK_SUPPLIERS = [
  {
    id: 1,
    stage_name: "Harvested Apples",
    location: "Malabe, Colombo",
    description: "Apples harvested from orchard",
    updated_by_name: "Daniru",
    latitude: 6.9022,
    longitude: 79.9633
  },
  {
    id: 2,
    stage_name: "Processing Center",
    location: "Kaduwela, Colombo",
    description: "Quality check and processing",
    updated_by_name: "Saman",
    latitude: 6.9353,
    longitude: 79.9850
  },
  {
    id: 3,
    stage_name: "Distribution Hub",
    location: "Maharagama, Colombo",
    description: "Distribution to retailers",
    updated_by_name: "Kamal",
    latitude: 6.8481,
    longitude: 79.9264
  },
  {
    id: 4,
    stage_name: "Storage Facility",
    location: "Dehiwala, Colombo",
    description: "Cold storage facility",
    updated_by_name: "Nimal",
    latitude: 6.8525,
    longitude: 79.8631
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
  "piliyandala": { latitude: 6.7958, longitude: 79.9389 },
  "homagama": { latitude: 6.8407, longitude: 80.0136 },
  "ratmalana": { latitude: 6.8219, longitude: 79.8861 },
  "moratuwa": { latitude: 6.7825, longitude: 79.8806 },
};

// Function to geocode location text to coordinates
const geocodeLocation = (locationText) => {
  if (!locationText) return null;
  
  const normalizedLocation = locationText.toLowerCase().trim();
  
  console.log(`Geocoding: "${locationText}" -> "${normalizedLocation}"`);
  
  // Check if we have predefined coordinates for this location
  for (const [key, coords] of Object.entries(SRI_LANKA_LOCATIONS)) {
    if (normalizedLocation.includes(key)) {
      console.log(`Found match: ${key} ->`, coords);
      return coords;
    }
  }
  
  return null;
};

export default function NearestSuppliersByProduct({ productId = "1" }) { // Default productId
  const [userLocation, setUserLocation] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  const loadSuppliers = async (productIdToLoad) => {
    try {
      console.log(`Fetching suppliers for product ${productIdToLoad}...`);
      const url = `${baseHost}/supply-chain/${productIdToLoad}`;
      const res = await axios.get(url, { timeout: 10000 });
      console.log("API Response received:", res.data);

      // Handle different response formats
      const raw = Array.isArray(res.data)
        ? res.data
        : res.data?.suppliers ?? res.data?.stages ?? [];

      console.log('Raw suppliers data:', raw);

      if (raw.length === 0) {
        throw new Error("No suppliers data found in response");
      }

      // Normalize supplier data and geocode locations
      const normalized = raw
        .map((s, index) => {
          // First try explicit coordinates
          let coords = null;
          if (s.latitude && s.longitude) {
            coords = { latitude: Number(s.latitude), longitude: Number(s.longitude) };
          } else if (s.lat && s.lng) {
            coords = { latitude: Number(s.lat), longitude: Number(s.lng) };
          } else {
            // Geocode from location text
            const locationText = s.location ?? s.location_text ?? s.address ?? s.city;
            coords = geocodeLocation(locationText);
          }

          // If still no coordinates, create a fallback
          if (!coords) {
            const variation = (index * 0.002) % 0.02;
            coords = {
              latitude: 6.9271 + variation,
              longitude: 79.8612 + variation,
            };
            console.warn(`Using fallback coordinates for: ${s.location}`, coords);
          }

          return {
            id: s.id ?? s.supplier_id ?? s.stage_id ?? `supplier-${index}-${Date.now()}`,
            name: s.stage_name ?? s.name ?? s.supplier_name ?? `Location ${index + 1}`,
            coords: coords,
            address: s.location ?? s.address ?? s.location_text ?? s.city ?? 'Unknown location',
            description: s.description,
            notes: s.notes,
            updated_by: s.updated_by,
            updated_by_name: s.updated_by_name,
            timestamp: s.timestamp,
          };
        })
        .filter((s) => 
          Number.isFinite(s.coords?.latitude) && 
          Number.isFinite(s.coords?.longitude)
        );

      console.log('Normalized suppliers:', normalized);
      setSuppliers(normalized);
      setUsingMockData(false);
      setApiError(null);

    } catch (error) {
      console.error("API Error:", error.message);
      
      // Use mock data as fallback
      console.log("Using mock data as fallback...");
      const normalizedMock = MOCK_SUPPLIERS.map((s, index) => ({
        id: s.id ?? `mock-${index}`,
        name: s.stage_name,
        coords: { latitude: s.latitude, longitude: s.longitude },
        address: s.location,
        description: s.description,
        updated_by_name: s.updated_by_name,
      }));
      
      setSuppliers(normalizedMock);
      setUsingMockData(true);
      setApiError(`API Error: ${error.message}. Using sample data.`);
    }
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        // 1) Get user's REAL current location with high accuracy
        console.log("Requesting location permission...");
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== "granted") {
          const errorMsg = "Location permission denied. Please enable location services to see your actual position.";
          console.log(errorMsg);
          if (isMounted) {
            setLocationError(errorMsg);
          }
          return;
        }

        console.log("Getting current position...");
        // Use high accuracy for real device location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 15000,
        });

        if (isMounted) {
          const userCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          
          console.log("Real user location obtained:", userCoords);
          setUserLocation(userCoords);
          setLocationError(null);
        }

        // 2) Load suppliers with the product ID (use default if not provided)
        const productIdToLoad = productId || "1";
        await loadSuppliers(productIdToLoad);

      } catch (error) {
        console.error("Load error:", error);
        if (isMounted) {
          if (error.message.includes("location") || error.message.includes("permission")) {
            setLocationError(error.message);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const nearestSuppliers = useMemo(() => {
    if (!userLocation) return [];
    
    const suppliersWithDistance = suppliers.map((s) => ({ 
      ...s, 
      km: distanceKm(userLocation, s.coords) 
    }));
    
    console.log('Suppliers with distances:', suppliersWithDistance);
    
    const nearest = suppliersWithDistance
      .filter((s) => s.km <= MAX_RADIUS_KM)
      .sort((a, b) => a.km - b.km)
      .slice(0, NEAREST_COUNT);
    
    console.log('Nearest suppliers:', nearest);
    return nearest;
  }, [userLocation, suppliers]);

  // Calculate region for map that includes user location and all suppliers
  const mapRegion = useMemo(() => {
    if (!userLocation) return null;
    
    const allPoints = [userLocation, ...suppliers.map(s => s.coords)];
    
    const latitudes = allPoints.map(p => p.latitude);
    const longitudes = allPoints.map(p => p.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    // Calculate deltas with padding
    const latDelta = Math.max((maxLat - minLat) * 1.5, 0.05);
    const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.05);
    
    const region = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
    
    console.log('Map region calculated:', region);
    return region;
  }, [userLocation, suppliers]);

  const retryLoad = () => {
    setLoading(true);
    const productIdToLoad = productId || "1";
    loadSuppliers(productIdToLoad).finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Getting your real location...</Text>
        <Text style={styles.loadingSubtext}>Please ensure location services are enabled</Text>
      </View>
    );
  }

  if (locationError && !userLocation) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>📍 Location Access Required</Text>
        <Text style={styles.errorSubtext}>{locationError}</Text>
        <Text style={styles.infoText}>
          To see your actual position on the map, please grant location permissions in your device settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={mapRegion}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* User's REAL current location with custom marker */}
        {userLocation && (
          <Marker 
            coordinate={userLocation} 
            pinColor="blue"
            title="Your Actual Location"
            description={`Lat: ${userLocation.latitude.toFixed(6)}, Lng: ${userLocation.longitude.toFixed(6)}`}
          />
        )}
        
        {/* Search radius circle around user */}
        {userLocation && (
          <Circle 
            center={userLocation} 
            radius={MAX_RADIUS_KM * 1000} 
            fillColor="rgba(0, 100, 255, 0.15)"
            strokeColor="rgba(0, 100, 255, 0.5)"
            strokeWidth={2}
          />
        )}

        {/* All suppliers */}
        {suppliers.map((supplier) => (
          <Marker
            key={supplier.id}
            coordinate={supplier.coords}
            pinColor="green"
            title={supplier.name}
            description={`${supplier.address} • Updated by: ${supplier.updated_by_name || 'Unknown'}`}
          />
        ))}

        {/* Nearest suppliers with special marker */}
        {nearestSuppliers.map((supplier) => (
          <Marker
            key={`nearest-${supplier.id}`}
            coordinate={supplier.coords}
            pinColor="red"
            title={`📍 ${supplier.name} (${supplier.km.toFixed(1)} km)`}
            description={`${supplier.address} • ${supplier.updated_by_name ? `Updated by: ${supplier.updated_by_name}` : ''}`}
          />
        ))}
      </MapView>

      {/* Information panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.panelTitle}>
          Product #{productId || "1"} - Supply Chain
          {usingMockData && " (Sample Data)"}
        </Text>
        
        {apiError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{apiError}</Text>
            <TouchableOpacity onPress={retryLoad} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.stats}>
          <Text style={styles.statText}>
            📍 Your Location: {userLocation?.latitude.toFixed(6)}, {userLocation?.longitude.toFixed(6)}
          </Text>
          <Text style={styles.statText}>
            📋 Total Locations: {suppliers.length} | 🎯 Within {MAX_RADIUS_KM}km: {nearestSuppliers.length}
          </Text>
        </View>

        {nearestSuppliers.length === 0 ? (
          <Text style={styles.noSuppliers}>
            No supply chain locations within {MAX_RADIUS_KM} km of your position
          </Text>
        ) : (
          <View>
            <Text style={styles.nearestTitle}>Nearest locations to you:</Text>
            {nearestSuppliers.map((supplier) => (
              <Text key={supplier.id} style={styles.supplierItem}>
                • {supplier.name} – {supplier.km.toFixed(1)} km – {supplier.address}
              </Text>
            ))}
          </View>
        )}
        
        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Map Legend:</Text>
          <View style={styles.legendItem}>
            <View style={[styles.colorDot, { backgroundColor: 'blue' }]} />
            <Text style={styles.legendText}>Your actual location</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.colorDot, { backgroundColor: 'red' }]} />
            <Text style={styles.legendText}>Nearest within {MAX_RADIUS_KM}km</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.colorDot, { backgroundColor: 'green' }]} />
            <Text style={styles.legendText}>Other locations</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoPanel: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    maxHeight: '50%',
  },
  panelTitle: { 
    fontWeight: "700", 
    fontSize: 18,
    marginBottom: 12,
    color: '#1a1a1a',
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#d32f2f',
    fontSize: 12,
    flex: 1,
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
    fontWeight: '500',
  },
  nearestTitle: {
    fontWeight: "600",
    marginBottom: 8,
    color: '#444',
    fontSize: 14,
  },
  noSuppliers: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 13,
  },
  supplierItem: {
    fontSize: 12,
    marginBottom: 6,
    color: '#333',
    lineHeight: 16,
  },
  legend: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  legendTitle: {
    fontWeight: "600",
    marginBottom: 8,
    color: '#555',
    fontSize: 13,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
});