import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import apiConfig from "../config/api";

export default function ProductCertificationsScreen({ route }) {
  const { productId } = route.params;
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await axios.get(`${apiConfig.baseURL}/cert/product/${productId}`);
      setCertifications(response.data);
    } catch (error) {
      console.error('Error fetching certifications', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text>Authority: {item.authority}</Text>
      <Text>Issued Date: {item.issued_date}</Text>
      <Text>Expiry Date: {item.expiry_date}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {certifications.length === 0 ? (
        <Text style={styles.center}>No certifications found</Text>
      ) : (
        <FlatList
          data={certifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
