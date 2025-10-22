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
import { useNavigation } from '@react-navigation/native';
import axios from "axios";
import { API_BASE_URL } from "@env"; // For React Native (Expo) version


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

// Comprehensive location database for Sri Lanka
const SRI_LANKA_LOCATIONS = {
  // Colombo District
  "colombo": { latitude: 6.9271, longitude: 79.8612, type: "city" },
  "colombo 01": { latitude: 6.9344, longitude: 79.8428, type: "area" },
  "colombo 02": { latitude: 6.9214, longitude: 79.8478, type: "area" },
  "colombo 03": { latitude: 6.9069, longitude: 79.8533, type: "area" },
  "colombo 04": { latitude: 6.8944, longitude: 79.8608, type: "area" },
  "colombo 05": { latitude: 6.8819, longitude: 79.8683, type: "area" },
  "colombo 06": { latitude: 6.8694, longitude: 79.8758, type: "area" },
  "colombo 07": { latitude: 6.9167, longitude: 79.8667, type: "area" },
  "colombo 08": { latitude: 6.9319, longitude: 79.8736, type: "area" },
  "colombo 09": { latitude: 6.9472, longitude: 79.8806, type: "area" },
  "colombo 10": { latitude: 6.9625, longitude: 79.8875, type: "area" },
  "colombo 11": { latitude: 6.9778, longitude: 79.8944, type: "area" },
  "colombo 12": { latitude: 6.9931, longitude: 79.9014, type: "area" },
  "colombo 13": { latitude: 7.0083, longitude: 79.9083, type: "area" },
  "colombo 14": { latitude: 7.0236, longitude: 79.9153, type: "area" },
  "colombo 15": { latitude: 7.0389, longitude: 79.9222, type: "area" },
  
  // Major Cities and Towns
  "malabe": { latitude: 6.9022, longitude: 79.9633, type: "city" },
  "kaduwela": { latitude: 6.9353, longitude: 79.9850, type: "city" },
  "maharagama": { latitude: 6.8481, longitude: 79.9264, type: "city" },
  "dehiwala": { latitude: 6.8525, longitude: 79.8631, type: "city" },
  "mount lavinia": { latitude: 6.8275, longitude: 79.8625, type: "city" },
  "kotte": { latitude: 6.8917, longitude: 79.9075, type: "city" },
  "gampaha": { latitude: 7.0917, longitude: 79.9997, type: "city" },
  "kandy": { latitude: 7.2906, longitude: 80.6337, type: "city" },
  "galle": { latitude: 6.0329, longitude: 80.2168, type: "city" },
  "jaffna": { latitude: 9.6615, longitude: 80.0255, type: "city" },
  "negombo": { latitude: 7.2086, longitude: 79.8358, type: "city" },
  "anuradhapura": { latitude: 8.3114, longitude: 80.4037, type: "city" },
  "trincomalee": { latitude: 8.5874, longitude: 81.2152, type: "city" },
  "badulla": { latitude: 6.9895, longitude: 81.0557, type: "city" },
  "matara": { latitude: 5.9485, longitude: 80.5353, type: "city" },
  "ratnapura": { latitude: 6.6828, longitude: 80.3992, type: "city" },
  "kurunegala": { latitude: 7.4863, longitude: 80.3623, type: "city" },
  "nuwara eliya": { latitude: 6.9707, longitude: 80.7829, type: "city" },
  "batticaloa": { latitude: 7.7167, longitude: 81.7000, type: "city" },
  "hambantota": { latitude: 6.1249, longitude: 81.1186, type: "city" },
  "kalutara": { latitude: 6.5833, longitude: 79.9593, type: "city" },
  "puttalam": { latitude: 8.0333, longitude: 79.8167, type: "city" },
  "vavuniya": { latitude: 8.7500, longitude: 80.5000, type: "city" },
  
  // Suburbs and Areas
  "nugegoda": { latitude: 6.8639, longitude: 79.8997, type: "suburb" },
  "kohuwala": { latitude: 6.8550, longitude: 79.8850, type: "suburb" },
  "battaramulla": { latitude: 6.9000, longitude: 79.9167, type: "suburb" },
  "rajagiriya": { latitude: 6.9083, longitude: 79.8917, type: "suburb" },
  "wellawatte": { latitude: 6.8697, longitude: 79.8628, type: "suburb" },
  "bambalapitiya": { latitude: 6.8847, longitude: 79.8572, type: "suburb" },
  "kollupitiya": { latitude: 6.8972, longitude: 79.8533, type: "suburb" },
  "borella": { latitude: 6.9167, longitude: 79.8833, type: "suburb" },
  "maradana": { latitude: 6.9278, longitude: 79.8681, type: "suburb" },
  "pettah": { latitude: 6.9356, longitude: 79.8500, type: "suburb" },
  "fort": { latitude: 6.9344, longitude: 79.8428, type: "suburb" },
  "slave island": { latitude: 6.9214, longitude: 79.8478, type: "suburb" },
  "hultsdorf": { latitude: 6.9417, longitude: 79.8583, type: "suburb" },
  
  // Industrial Zones
  "biyagama": { latitude: 7.0333, longitude: 79.9833, type: "industrial" },
  "homagama": { latitude: 6.8407, longitude: 80.0131, type: "town" },
  "horana": { latitude: 6.7167, longitude: 80.0667, type: "town" },
  "panadura": { latitude: 6.7133, longitude: 79.9042, type: "town" },
  "moratuwa": { latitude: 6.7833, longitude: 79.8667, type: "town" },
  
  // Kegalle District Locations
  "kegalle": { latitude: 7.2514, longitude: 80.3464, type: "city" },
  "molagoda": { latitude: 7.2333, longitude: 80.3500, type: "town" },
  "warakapola": { latitude: 7.2333, longitude: 80.2833, type: "town" },
  "rambukkana": { latitude: 7.2667, longitude: 80.3833, type: "town" },
  "mawanella": { latitude: 7.2500, longitude: 80.4333, type: "town" },
  "dehiowita": { latitude: 6.9667, longitude: 80.2667, type: "town" },
  "deraniyagala": { latitude: 6.9333, longitude: 80.3333, type: "town" },
  "galigamuwa": { latitude: 7.2333, longitude: 80.3000, type: "town" },
  "yatiyantota": { latitude: 7.0333, longitude: 80.3000, type: "town" },
  "arankele": { latitude: 7.3667, longitude: 80.5000, type: "town" },
  
  // Additional Sri Lankan towns
  "ambalangoda": { latitude: 6.2350, longitude: 80.0544, type: "town" },
  "ampara": { latitude: 7.2833, longitude: 81.6667, type: "city" },
  "avissawella": { latitude: 6.9500, longitude: 80.2167, type: "town" },
  "balangoda": { latitude: 6.6500, longitude: 80.7000, type: "town" },
  "bandarawela": { latitude: 6.8256, longitude: 80.9986, type: "town" },
  "beruwala": { latitude: 6.4739, longitude: 79.9844, type: "town" },
  "chilaw": { latitude: 7.5758, longitude: 79.7956, type: "town" },
  "dambulla": { latitude: 7.8600, longitude: 80.6517, type: "town" },
  "embilipitiya": { latitude: 6.3436, longitude: 80.8503, type: "town" },
  "eravur": { latitude: 7.7667, longitude: 81.6000, type: "town" },
  "gampola": { latitude: 7.1647, longitude: 80.5761, type: "town" },
  "hatton": { latitude: 6.8917, longitude: 80.5958, type: "town" },
  "ja-ela": { latitude: 7.0833, longitude: 79.9000, type: "town" },
  "kadugannawa": { latitude: 7.2542, longitude: 80.5278, type: "town" },
  "kandana": { latitude: 7.0481, longitude: 79.8939, type: "town" },
  "katunayake": { latitude: 7.1647, longitude: 79.8731, type: "town" },
  "kilinochchi": { latitude: 9.3833, longitude: 80.4000, type: "city" },
  "kuliyapitiya": { latitude: 7.4686, longitude: 80.0453, type: "town" },
  "mahiyanganaya": { latitude: 7.3333, longitude: 81.0167, type: "town" },
  "mannar": { latitude: 8.9833, longitude: 79.9000, type: "city" },
  "matale": { latitude: 7.4667, longitude: 80.6167, type: "city" },
  "minuwangoda": { latitude: 7.1733, longitude: 79.9619, type: "town" },
  "monaragala": { latitude: 6.8667, longitude: 81.3500, type: "city" },
  "mullaitivu": { latitude: 9.2833, longitude: 80.8000, type: "city" },
  "nawalapitiya": { latitude: 7.0500, longitude: 80.5333, type: "town" },
  "pelmadulla": { latitude: 6.6250, longitude: 80.5333, type: "town" },
  "piliyandala": { latitude: 6.8000, longitude: 79.9167, type: "town" },
  "polonnaruwa": { latitude: 7.9333, longitude: 81.0000, type: "city" },
  "seeduwa": { latitude: 7.1167, longitude: 79.8833, type: "town" },
  "tangalle": { latitude: 6.0231, longitude: 80.7889, type: "town" },
  "valachchenai": { latitude: 7.9333, longitude: 81.5000, type: "town" },
  "weligama": { latitude: 5.9744, longitude: 80.4294, type: "town" },
  "weligepola": { latitude: 6.4667, longitude: 80.4667, type: "town" },
  "akurana": { latitude: 7.3667, longitude: 80.6333, type: "town" },
  "aluthgama": { latitude: 6.4361, longitude: 79.9967, type: "town" },
  "ambalantota": { latitude: 6.1239, longitude: 81.0253, type: "town" },
  "aralaganwila": { latitude: 7.9167, longitude: 81.0833, type: "town" },
  "awanella": { latitude: 7.2000, longitude: 80.4667, type: "town" },
  "bandaragama": { latitude: 6.7167, longitude: 79.9833, type: "town" },
  "battaramulla": { latitude: 6.9000, longitude: 79.9167, type: "town" },
  "bentota": { latitude: 6.4211, longitude: 79.9989, type: "town" },
  "bulathsinhala": { latitude: 6.6833, longitude: 80.1667, type: "town" },
  "dankotuwa": { latitude: 7.3000, longitude: 79.8667, type: "town" },
  "delgoda": { latitude: 7.1167, longitude: 80.1500, type: "town" },
  "delthara": { latitude: 7.1667, longitude: 80.7500, type: "town" },
  "dikwella": { latitude: 5.9667, longitude: 80.6833, type: "town" },
  "divulapitiya": { latitude: 7.2167, longitude: 80.0000, type: "town" },
  "dodangoda": { latitude: 6.5833, longitude: 80.1167, type: "town" },
  "eheliyagoda": { latitude: 6.8500, longitude: 80.2667, type: "town" },
  "elpitiya": { latitude: 6.2833, longitude: 80.1667, type: "town" },
  "embilipitiya": { latitude: 6.3436, longitude: 80.8503, type: "town" },
  "eravur": { latitude: 7.7667, longitude: 81.6000, type: "town" },
  "galewela": { latitude: 7.8333, longitude: 80.5833, type: "town" },
  "giriulla": { latitude: 7.3333, longitude: 80.1333, type: "town" },
  "hali ela": { latitude: 6.9667, longitude: 81.0333, type: "town" },
  "hambantota": { latitude: 6.1249, longitude: 81.1186, type: "city" },
  "haputale": { latitude: 6.7653, longitude: 80.9561, type: "town" },
  "harispattuwa": { latitude: 7.3000, longitude: 80.6333, type: "town" },
  "hatton": { latitude: 6.8917, longitude: 80.5958, type: "town" },
  "hiriyala": { latitude: 7.6500, longitude: 80.3333, type: "town" },
  "hokandara": { latitude: 6.8833, longitude: 79.9500, type: "town" },
  "horiwila": { latitude: 7.5833, longitude: 80.5833, type: "town" },
  "ingiriya": { latitude: 6.7500, longitude: 80.1667, type: "town" },
  "ja ela": { latitude: 7.0833, longitude: 79.9000, type: "town" },
  "kadawatha": { latitude: 6.9833, longitude: 79.9833, type: "town" },
  "kahawa": { latitude: 7.4167, longitude: 80.5667, type: "town" },
  "kalawanchikudi": { latitude: 7.5333, longitude: 81.7833, type: "town" },
  "kaluwanchikudy": { latitude: 7.5333, longitude: 81.7833, type: "town" },
  "kamburupitiya": { latitude: 6.0667, longitude: 80.5667, type: "town" },
  "kandana": { latitude: 7.0481, longitude: 79.8939, type: "town" },
  "kataragama": { latitude: 6.4167, longitude: 81.3333, type: "town" },
  "kegalla": { latitude: 7.2514, longitude: 80.3464, type: "city" },
  "kelaniya": { latitude: 6.9603, longitude: 79.8978, type: "town" },
  "kinniya": { latitude: 8.5167, longitude: 81.1833, type: "town" },
  "kiribathgoda": { latitude: 6.9833, longitude: 79.9167, type: "town" },
  "kirinda": { latitude: 6.8167, longitude: 81.5167, type: "town" },
  "kitulgala": { latitude: 6.9894, longitude: 80.4167, type: "town" },
  "kotikawatta": { latitude: 6.9108, longitude: 79.8858, type: "town" },
  "kuliyapitiya": { latitude: 7.4686, longitude: 80.0453, type: "town" },
  "kurunegala": { latitude: 7.4863, longitude: 80.3623, type: "city" },
  "madampe": { latitude: 7.4333, longitude: 79.8333, type: "town" },
  "madawala": { latitude: 7.3167, longitude: 80.6833, type: "town" },
  "mahaoya": { latitude: 7.5667, longitude: 81.7000, type: "town" },
  "maharagama": { latitude: 6.8481, longitude: 79.9264, type: "city" },
  "mawanella": { latitude: 7.2500, longitude: 80.4333, type: "town" },
  "meegoda": { latitude: 6.8500, longitude: 80.0833, type: "town" },
  "melsiripura": { latitude: 7.6333, longitude: 80.5667, type: "town" },
  "mirigama": { latitude: 7.2333, longitude: 80.1333, type: "town" },
  "mirissa": { latitude: 5.9469, longitude: 80.4583, type: "town" },
  "moragolla": { latitude: 7.4667, longitude: 80.6167, type: "town" },
  "mulleriyawa": { latitude: 6.9333, longitude: 79.9333, type: "town" },
  "nabadawa": { latitude: 7.6000, longitude: 80.5667, type: "town" },
  "nattandiya": { latitude: 7.4167, longitude: 79.8667, type: "town" },
  "navagattegama": { latitude: 8.1500, longitude: 80.1500, type: "town" },
  "nawalapitiya": { latitude: 7.0500, longitude: 80.5333, type: "town" },
  "nikaweratiya": { latitude: 7.7667, longitude: 80.1167, type: "town" },
  "nivitigala": { latitude: 6.6333, longitude: 80.4167, type: "town" },
  "padukka": { latitude: 6.8333, longitude: 80.1000, type: "town" },
  "paiyagala": { latitude: 6.5500, longitude: 80.0333, type: "town" },
  "palindanuwara": { latitude: 6.5333, longitude: 80.3833, type: "town" },
  "pallekele": { latitude: 7.2667, longitude: 80.6000, type: "town" },
  "pannala": { latitude: 7.3167, longitude: 79.9000, type: "town" },
  "pelmadulla": { latitude: 6.6250, longitude: 80.5333, type: "town" },
  "peradeniya": { latitude: 7.2667, longitude: 80.6000, type: "town" },
  "piliyandala": { latitude: 6.8000, longitude: 79.9167, type: "town" },
  "polgahawela": { latitude: 7.3333, longitude: 80.3000, type: "town" },
  "pussellawa": { latitude: 7.0667, longitude: 80.6333, type: "town" },
  "radawana": { latitude: 7.1667, longitude: 80.0833, type: "town" },
  "radella": { latitude: 6.9667, longitude: 80.5667, type: "town" },
  "ragama": { latitude: 7.0333, longitude: 79.9167, type: "town" },
  "ranala": { latitude: 6.9000, longitude: 79.9500, type: "town" },
  "rattota": { latitude: 7.5167, longitude: 80.6833, type: "town" },
  "ruwanwella": { latitude: 7.0500, longitude: 80.2500, type: "town" },
  "seeduwa": { latitude: 7.1167, longitude: 79.8833, type: "town" },
  "siyambalagoda": { latitude: 6.4000, longitude: 80.8000, type: "town" },
  "talawakelle": { latitude: 6.9333, longitude: 80.6667, type: "town" },
  "talpe": { latitude: 5.9833, longitude: 80.2833, type: "town" },
  "tawalama": { latitude: 6.4333, longitude: 80.5833, type: "town" },
  "telijjawila": { latitude: 6.3167, longitude: 80.3000, type: "town" },
  "thihariya": { latitude: 7.1000, longitude: 80.0333, type: "town" },
  "thiranagama": { latitude: 6.1333, longitude: 80.1167, type: "town" },
  "udugampola": { latitude: 7.1167, longitude: 79.9833, type: "town" },
  "udubaddawa": { latitude: 7.5167, longitude: 80.0833, type: "town" },
  "udupila": { latitude: 7.3667, longitude: 80.6333, type: "town" },
  "uduwara": { latitude: 6.0333, longitude: 80.2167, type: "town" },
  "ulapane": { latitude: 7.4167, longitude: 80.6167, type: "town" },
  "unawatuna": { latitude: 6.0167, longitude: 80.2500, type: "town" },
  "valaichchenai": { latitude: 7.9333, longitude: 81.5000, type: "town" },
  "wadduwa": { latitude: 6.6500, longitude: 79.9333, type: "town" },
  "walasmulla": { latitude: 6.1500, longitude: 80.6833, type: "town" },
  "wathurugama": { latitude: 7.4333, longitude: 80.6333, type: "town" },
  "weligama": { latitude: 5.9744, longitude: 80.4294, type: "town" },
  "weligepola": { latitude: 6.4667, longitude: 80.4667, type: "town" },
  "weliveriya": { latitude: 7.0667, longitude: 80.0667, type: "town" },
  "welivita": { latitude: 7.0333, longitude: 80.2167, type: "town" },
  "wennappuwa": { latitude: 7.3500, longitude: 79.8500, type: "town" },
  "yakkalamulla": { latitude: 6.1000, longitude: 80.3667, type: "town" },
  "yatalamatta": { latitude: 6.7667, longitude: 79.8833, type: "town" },

  // Default coordinates for districts (center points)
  "colombo district": { latitude: 6.9271, longitude: 79.8612, type: "district" },
  "gampaha district": { latitude: 7.0917, longitude: 79.9997, type: "district" },
  "kalutara district": { latitude: 6.5833, longitude: 79.9593, type: "district" },
  "kandy district": { latitude: 7.2906, longitude: 80.6337, type: "district" },
  "matale district": { latitude: 7.4667, longitude: 80.6167, type: "district" },
  "nuwara eliya district": { latitude: 6.9707, longitude: 80.7829, type: "district" },
  "galle district": { latitude: 6.0329, longitude: 80.2168, type: "district" },
  "matara district": { latitude: 5.9485, longitude: 80.5353, type: "district" },
  "hambantota district": { latitude: 6.1249, longitude: 81.1186, type: "district" },
  "jaffna district": { latitude: 9.6615, longitude: 80.0255, type: "district" },
  "kilinochchi district": { latitude: 9.3833, longitude: 80.4000, type: "district" },
  "mannar district": { latitude: 8.9833, longitude: 79.9000, type: "district" },
  "vavuniya district": { latitude: 8.7500, longitude: 80.5000, type: "district" },
  "mullaitivu district": { latitude: 9.2833, longitude: 80.8000, type: "district" },
  "batticaloa district": { latitude: 7.7167, longitude: 81.7000, type: "district" },
  "ampara district": { latitude: 7.2833, longitude: 81.6667, type: "district" },
  "trincomalee district": { latitude: 8.5874, longitude: 81.2152, type: "district" },
  "kurunegala district": { latitude: 7.4863, longitude: 80.3623, type: "district" },
  "puttalam district": { latitude: 8.0333, longitude: 79.8167, type: "district" },
  "anuradhapura district": { latitude: 8.3114, longitude: 80.4037, type: "district" },
  "polonnaruwa district": { latitude: 7.9333, longitude: 81.0000, type: "district" },
  "badulla district": { latitude: 6.9895, longitude: 81.0557, type: "district" },
  "monaragala district": { latitude: 6.8667, longitude: 81.3500, type: "district" },
  "ratnapura district": { latitude: 6.6828, longitude: 80.3992, type: "district" },
  "kegalle district": { latitude: 7.2514, longitude: 80.3464, type: "district" },
};

// Enhanced geocoding function with better location parsing
const geocodeLocation = (locationText) => {
  if (!locationText) return { latitude: 6.9271, longitude: 79.8612 }; // Default to Colombo
  
  const normalizedLocation = locationText.toLowerCase().trim();
  
  console.log(`Geocoding: "${locationText}" -> "${normalizedLocation}"`);
  
  // Remove common prefixes and suffixes for better matching
  const cleanedLocation = normalizedLocation
    .replace(/\b(sri|lanka|lk|ceylon|district|town|city|area)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log(`Cleaned location: "${cleanedLocation}"`);
  
  // Exact match first
  if (SRI_LANKA_LOCATIONS[cleanedLocation]) {
    console.log(`Exact match found: ${cleanedLocation}`);
    return SRI_LANKA_LOCATIONS[cleanedLocation];
  }
  
  // Split by common separators and clean each part
  const locationParts = cleanedLocation.split(/[\s,.-]+/).filter(part => part.length > 2);
  
  console.log(`Location parts:`, locationParts);
  
  // Strategy 1: Look for specific town/village names first
  for (const part of locationParts) {
    if (SRI_LANKA_LOCATIONS[part] && SRI_LANKA_LOCATIONS[part].type !== "district") {
      console.log(`Specific location match: ${part}`);
      return SRI_LANKA_LOCATIONS[part];
    }
  }
  
  // Strategy 2: Look for district names and use district center
  for (const part of locationParts) {
    const districtKey = part + " district";
    if (SRI_LANKA_LOCATIONS[districtKey]) {
      console.log(`District match: ${districtKey}`);
      return SRI_LANKA_LOCATIONS[districtKey];
    }
  }
  
  // Strategy 3: Check if any location contains the parts
  for (const [key, coords] of Object.entries(SRI_LANKA_LOCATIONS)) {
    // Skip if it's a district (we want more specific locations)
    if (coords.type === "district") continue;
    
    // Check if any part matches the key
    for (const part of locationParts) {
      if (key.includes(part) && part.length > 3) {
        console.log(`Partial match: ${part} in ${key}`);
        return coords;
      }
    }
  }
  
  // Strategy 4: Try combined location search (e.g., "molagoda kegalle")
  const combinedSearch = locationParts.join(' ');
  if (combinedSearch.length > 5) {
    for (const [key, coords] of Object.entries(SRI_LANKA_LOCATIONS)) {
      if (key.includes(combinedSearch) || combinedSearch.includes(key)) {
        console.log(`Combined match: ${combinedSearch} with ${key}`);
        return coords;
      }
    }
  }
  
  // Strategy 5: District fallback for known districts
  const districtFallbacks = {
    "kegalle": "kegalle district",
    "ratnapura": "ratnapura district", 
    "gampaha": "gampaha district",
    "kalutara": "kalutara district",
    "colombo": "colombo district",
    "kandy": "kandy district",
    "galle": "galle district",
    "matara": "matara district",
    "hambantota": "hambantota district",
    "jaffna": "jaffna district",
    "anuradhapura": "anuradhapura district",
    "badulla": "badulla district",
    "matale": "matale district",
    "nuwara": "nuwara eliya district",
    "puttalam": "puttalam district",
    "polonnaruwa": "polonnaruwa district",
    "monaragala": "monaragala district",
  };
  
  for (const part of locationParts) {
    if (districtFallbacks[part]) {
      console.log(`District fallback: ${part} -> ${districtFallbacks[part]}`);
      return SRI_LANKA_LOCATIONS[districtFallbacks[part]];
    }
  }}
// Mock data for testing when API fails
const MOCK_PRODUCTS = [
  {
    "id": 1,
    "name": "Organic Apples",
    "batch_code": "BATCH001",
    "description": "Fresh organic apples from Green Valley Farm",
    "category": "Produce",
    "origin": "Green Valley Farm",
    "harvest_date": "2025-09-25",
    "expiry_date": "2025-10-10",
    "location": "Malabe",
    "created_by_name": "Daniru"
  },
  {
    "id": 2,
    "name": "Basmati Rice",
    "batch_code": "BATCH002",
    "description": "Premium quality basmati rice",
    "category": "Grains",
    "origin": "Rice Fields Co.",
    "harvest_date": "2025-09-20",
    "expiry_date": "2026-03-20",
    "location": "Colombo",
    "created_by_name": "Saman"
  },
  {
    "id": 3,
    "name": "Ceylon Tea",
    "batch_code": "BATCH003",
    "description": "Freshly harvested Ceylon tea leaves",
    "category": "Beverages",
    "origin": "Hill Country Plantation",
    "harvest_date": "2025-09-28",
    "expiry_date": "2026-09-28",
    "location": "Kandy",
    "created_by_name": "Kamal"
  },
  {
    "id": 4,
    "name": "Coconut Oil",
    "batch_code": "BATCH004",
    "description": "Pure virgin coconut oil",
    "category": "Oils",
    "origin": "Coastal Mills",
    "harvest_date": "2025-09-15",
    "expiry_date": "2026-09-15",
    "location": "Galle",
    "created_by_name": "Nimal"
  },
  {
    "id": 5,
    "name": "Spices Collection",
    "batch_code": "BATCH005",
    "description": "Assorted traditional spices",
    "category": "Spices",
    "origin": "Spice Garden",
    "harvest_date": "2025-09-10",
    "expiry_date": "2026-09-10",
    "location": "Matara",
    "created_by_name": "Priya"
  }
];

export default function NearestSuppliersByProduct() {
  const navigation = useNavigation();
  const [userLocation, setUserLocation] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

const fetchProducts = async () => {
  try {
    setApiError(null);
    setUsingMockData(false);

    // Log URL to verify it's loading from .env
    console.log("Fetching from:", `${API_BASE_URL}/products`);

    // Try to fetch from API
    const response = await axios.get(`${API_BASE_URL}/products`);

    const data = response.data;

    // Transform API data
    const productsWithCoords = data.map((product) => ({
      ...product,
      coords: geocodeLocation(product.location),
      address: product.location,
      stage_name: product.name,
    }));

    setProducts(productsWithCoords);

  } catch (error) {
    console.error("API Error:", error.message);

    setApiError("Failed to fetch products. Using sample data.");
    setUsingMockData(true);

    // Use mock data as fallback
    const mockWithCoords = MOCK_PRODUCTS.map((product) => ({
      ...product,
      coords: geocodeLocation(product.location),
      address: product.location,
      stage_name: product.name,
    }));

    setProducts(mockWithCoords);
  }
};


  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        // Get user location
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

        // Fetch products
        await fetchProducts();

      } catch (error) {
        console.error("Load error:", error);
        if (isMounted && error.message.includes("location")) {
          setLocationError(error.message);
        }
        if (isMounted) {
          setApiError('Failed to load data. Using sample products.');
          setUsingMockData(true);
          
          const mockWithCoords = MOCK_PRODUCTS.map(product => ({
            ...product,
            coords: geocodeLocation(product.location),
            address: product.location,
            stage_name: product.name
          }));
          
          setProducts(mockWithCoords);
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

  const nearestProducts = useMemo(() => {
    if (!userLocation) return [];
    
    const productsWithDistance = products.map((p) => ({ 
      ...p, 
      km: distanceKm(userLocation, p.coords) 
    }));
    
    return productsWithDistance
      .filter((p) => p.km <= MAX_RADIUS_KM)
      .sort((a, b) => a.km - b.km)
      .slice(0, NEAREST_COUNT);
  }, [userLocation, products]);

  const mapRegion = useMemo(() => {
    if (!userLocation) return null;
    
    const allPoints = [userLocation, ...products.map(p => p.coords)].filter(Boolean);
    const latitudes = allPoints.map(p => p.latitude);
    const longitudes = allPoints.map(p => p.longitude);
    
    return {
      latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
      longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
      latitudeDelta: Math.max((Math.max(...latitudes) - Math.min(...latitudes)) * 1.5, 0.05),
      longitudeDelta: Math.max((Math.max(...longitudes) - Math.min(...longitudes)) * 1.5, 0.05),
    };
  }, [userLocation, products]);

  const retryLoad = () => {
    setLoading(true);
    setApiError(null);
    fetchProducts();
    setTimeout(() => setLoading(false), 1000);
  };

  const handleProductPress = (product) => {
    setSelectedProduct(product);
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

  const handleBackPress = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  // Get unique categories for filtering
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories;
  }, [products]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingTitle}>Loading Products Map</Text>
            <Text style={styles.loadingSubtitle}>Getting your location and mapping products...</Text>
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
        <Text style={styles.headerTitle}>Products Map</Text>
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

          {/* All Products Markers */}
          {products.map((product) => (
            <Marker
              key={product.id}
              coordinate={product.coords}
              pinColor="#FF6B35"
              title={product.name}
              description={`${product.category} • ${product.location}`}
              onPress={() => handleProductPress(product)}
            />
          ))}

          {/* Nearest Products with different color */}
          {nearestProducts.map((product) => (
            <Marker
              key={`nearest-${product.id}`}
              coordinate={product.coords}
              pinColor="green"
              title={`📍 ${product.name}`}
              description={`${product.km.toFixed(1)} km away`}
              onPress={() => handleProductPress(product)}
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
              📍 Your Location • {products.length} Products • {nearestProducts.length} Nearby
              {usingMockData && " • Using Sample Data"}
            </Text>
          </View>

          {nearestProducts.length === 0 ? (
            <Text style={styles.noSuppliers}>
              No products within {MAX_RADIUS_KM}km. Try increasing search radius.
            </Text>
          ) : (
            <ScrollView style={styles.nearestList} showsVerticalScrollIndicator={false}>
              <Text style={styles.nearestTitle}>Nearby Products</Text>
              {nearestProducts.map((product) => (
                <TouchableOpacity 
                  key={product.id} 
                  style={styles.supplierItem}
                  onPress={() => handleProductPress(product)}
                >
                  <View style={styles.supplierIcon}>
                    <Ionicons name="cube" size={16} color="#4A90E2" />
                  </View>
                  <View style={styles.supplierInfo}>
                    <Text style={styles.supplierName}>{product.name}</Text>
                    <Text style={styles.supplierDetails}>
                      {product.km.toFixed(1)}km • {product.category} • {product.location}
                    </Text>
                    <Text style={styles.batchCode}>Batch: {product.batch_code}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#999" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Product Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                  <TouchableOpacity 
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Batch Code</Text>
                    <Text style={styles.detailValue}>{selectedProduct.batch_code}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.detailValue}>{selectedProduct.category}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{selectedProduct.location}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Coordinates</Text>
                    <Text style={styles.detailValue}>
                      {selectedProduct.coords.latitude.toFixed(6)}, {selectedProduct.coords.longitude.toFixed(6)}
                    </Text>
                  </View>
                  
                  {selectedProduct.description && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Description</Text>
                      <Text style={styles.detailValue}>{selectedProduct.description}</Text>
                    </View>
                  )}
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Origin</Text>
                    <Text style={styles.detailValue}>{selectedProduct.origin}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Harvest Date</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedProduct.harvest_date)}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Expiry Date</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedProduct.expiry_date)}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Created By</Text>
                    <Text style={styles.detailValue}>{selectedProduct.created_by_name}</Text>
                  </View>
                  
                  {selectedProduct.km && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Distance from You</Text>
                      <Text style={[styles.detailValue, styles.distanceText]}>
                        {selectedProduct.km.toFixed(1)} kilometers
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
    marginBottom: 2,
  },
  batchCode: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
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