import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Alert,
} from "react-native";
import axios from "axios";
import apiConfig from "../config/api";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function ProductListingScreen({ navigation }) {
  const [products, setProducts] = useState([]);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${apiConfig.baseURL}/products`);
        setProducts(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to fetch products");
      }
    };

    fetchProducts();
  }, []);

  const goBack = () => {
    if (navigation.goBack) {
      navigation.goBack();
    } else {
      Alert.alert("Navigation", "Going back to previous screen");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product List</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        {products.map((product, index) => (
          <View key={index} style={styles.productCard}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productBatch}>Batch: {product.batch_code}</Text>
            <Text style={styles.productDescription}>
              {product.description}
            </Text>
            <Text style={styles.productCreator}>
              Created by: {product.created_by_name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  scrollView: {
    padding: 20,
    paddingBottom: 30,
  },
  productCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  productName: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  productBatch: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
    fontWeight: "500",
  },
  productDescription: {
    fontSize: 15,
    color: "#4B5563",
    marginTop: 8,
    lineHeight: 22,
  },
  productCreator: {
    fontSize: 13,
    color: "#10B981",
    marginTop: 12,
    fontWeight: "600",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
});