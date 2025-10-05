import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import axios from 'axios';
import apiConfig from "../config/api";

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${apiConfig.baseURL}/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.label}>Batch Code:</Text>
      <Text style={styles.text}>{product.batch_code}</Text>
      <Text style={styles.label}>Description:</Text>
      <Text style={styles.text}>{product.description}</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="View Certifications"
          onPress={() => navigation.navigate('ProductCertifications', { productId })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8
  },
  text: {
    fontSize: 16,
    marginBottom: 8
  },
  buttonContainer: {
    marginTop: 20
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
