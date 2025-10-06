// NearestSuppliersByProduct.jsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, Alert, StyleSheet, Platform } from "react-native";
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
const DEFAULT_REGION = { latitude: 6.9271, longitude: 79.8612 }; // Colombo

// Android emulator can't use "localhost"
const baseHost =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";
// If using a real device, replace with your PC's LAN IP: e.g. "http://192.168.1.5:5000"

export default function NearestSuppliersByProduct({ productId }) {
  const [me, setMe] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // 1) Get location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission needed", "Enable location to find nearby suppliers.");
          setMe(DEFAULT_REGION);
        } else {
          const loc = await Location.getCurrentPositionAsync({});
          setMe({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }

        // 2) Fetch suppliers for the given product_id
        const url = `${baseHost}/supply-chain/${productId}`;
        const res = await axios.get(url);

        // Accept either an array or an object like { suppliers: [...] } or { stages: [...] }
        const raw = Array.isArray(res.data)
          ? res.data
          : res.data?.suppliers ?? res.data?.stages ?? [];

        // Normalize to { id, name, coords: {latitude, longitude}, address? }
        const normalized = raw
          .map((s, i) => {
            const lat =
              s.latitude ??
              s.lat ??
              s.coords?.latitude ??
              s.location?.lat ??
              s.location?.latitude;
            const lon =
              s.longitude ??
              s.lng ??
              s.lon ??
              s.coords?.longitude ??
              s.location?.lng ??
              s.location?.longitude;

            return {
              id: s.id ?? s.supplier_id ?? s.stage_id ?? i,
              name: s.name ?? s.supplier_name ?? s.stage_name ?? `Supplier ${i + 1}`,
              coords: { latitude: Number(lat), longitude: Number(lon) },
              address: s.address ?? s.location_text ?? s.city ?? s.location ?? undefined,
            };
          })
          .filter(
            (s) =>
              Number.isFinite(s.coords?.latitude) && Number.isFinite(s.coords?.longitude)
          );

        setSuppliers(normalized);
      } catch (e) {
        console.log("Load error:", e?.message);
        Alert.alert("Error", "Couldn't load suppliers.");
        if (!me) setMe(DEFAULT_REGION);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const nearest = useMemo(() => {
    if (!me) return [];
    return suppliers
      .map((s) => ({ ...s, km: distanceKm(me, s.coords) }))
      .filter((s) => s.km <= MAX_RADIUS_KM)
      .sort((a, b) => a.km - b.km)
      .slice(0, NEAREST_COUNT);
  }, [me, suppliers]);

  if (loading || !me) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading suppliers & location…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: me.latitude,
          longitude: me.longitude,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        }}
      >
        {/* You */}
        <Marker coordinate={me} pinColor="blue" title="You" description="Current location" />
        <Circle center={me} radius={MAX_RADIUS_KM * 1000} />

        {/* Nearest suppliers */}
        {nearest.map((s) => (
          <Marker
            key={s.id}
            coordinate={s.coords}
            pinColor="green"
            title={s.name}
            description={`${s.address ?? ""}${s.address ? " • " : ""}${s.km.toFixed(1)} km away`}
          />
        ))}
      </MapView>

      {/* Small legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Nearest suppliers for product #{productId}</Text>
        {nearest.length === 0 ? (
          <Text>No suppliers within {MAX_RADIUS_KM} km</Text>
        ) : (
          nearest.map((s) => (
            <Text key={s.id}>• {s.name} – {s.km.toFixed(1)} km</Text>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  legend: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  legendTitle: { fontWeight: "700", marginBottom: 6 },
});
