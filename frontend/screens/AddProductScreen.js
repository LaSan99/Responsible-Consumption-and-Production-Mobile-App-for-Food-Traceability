import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiConfig from '../config/api';

const { width, height } = Dimensions.get('window');

export default function AddProductScreen({ navigation }) {
  const [productData, setProductData] = useState({
    name: '',
    batch_code: '',
    description: '',
    category: '',
    origin: '',
    harvest_date: '',
    expiry_date: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const handleInputChange = (field, value) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!productData.name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }
    if (!productData.batch_code.trim()) {
      Alert.alert('Error', 'Batch code is required');
      return false;
    }
    if (!productData.description.trim()) {
      Alert.alert('Error', 'Product description is required');
      return false;
    }
    return true;
  };

  const handleAddProduct = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.post(
        `${apiConfig.baseURL}/products`,
        {
          name: productData.name.trim(),
          batch_code: productData.batch_code.trim(),
          description: productData.description.trim(),
          category: productData.category.trim(),
          origin: productData.origin.trim(),
          harvest_date: productData.harvest_date.trim(),
          expiry_date: productData.expiry_date.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Alert.alert(
        'Success!',
        'Product has been added successfully',
        [
          {
            text: 'Add Another',
            onPress: () => {
              setProductData({
                name: '',
                batch_code: '',
                description: '',
                category: '',
                origin: '',
                harvest_date: '',
                expiry_date: '',
              });
            }
          },
          {
            text: 'Go to Dashboard',
            onPress: () => navigation.navigate('ProducerProfile'),
            style: 'default'
          }
        ]
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add product. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    placeholder,
    value,
    onChangeText,
    fieldName,
    keyboardType = 'default',
    multiline = false,
    numberOfLines = 1
  ) => (
    <View style={[
      styles.inputContainer,
      focusedField === fieldName && styles.inputContainerFocused,
      multiline && styles.textAreaContainer
    ]}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#999"
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocusedField(fieldName)}
        onBlur={() => setFocusedField('')}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );

  return (
    <LinearGradient
      colors={['#4CAF50', '#8BC34A', '#CDDC39']}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Product</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formContainer}>
            <View style={styles.titleSection}>
              <Ionicons name="cube-outline" size={32} color="#4CAF50" />
              <Text style={styles.formTitle}>Product Details</Text>
              <Text style={styles.formSubtitle}>
                Enter the information for your new product
              </Text>
            </View>

            {/* Product Name */}
            {renderInput(
              'Product Name *',
              productData.name,
              (text) => handleInputChange('name', text),
              'name'
            )}

            {/* Batch Code */}
            {renderInput(
              'Batch Code *',
              productData.batch_code,
              (text) => handleInputChange('batch_code', text),
              'batch_code'
            )}

            {/* Category */}
            {renderInput(
              'Category (e.g., Fruits, Vegetables, Grains)',
              productData.category,
              (text) => handleInputChange('category', text),
              'category'
            )}

            {/* Origin */}
            {renderInput(
              'Origin/Location',
              productData.origin,
              (text) => handleInputChange('origin', text),
              'origin'
            )}

            {/* Harvest Date */}
            {renderInput(
              'Harvest Date (YYYY-MM-DD)',
              productData.harvest_date,
              (text) => handleInputChange('harvest_date', text),
              'harvest_date'
            )}

            {/* Expiry Date */}
            {renderInput(
              'Expiry Date (YYYY-MM-DD)',
              productData.expiry_date,
              (text) => handleInputChange('expiry_date', text),
              'expiry_date'
            )}

            {/* Description */}
            {renderInput(
              'Product Description *',
              productData.description,
              (text) => handleInputChange('description', text),
              'description',
              'default',
              true,
              4
            )}

            {/* Add Product Button */}
            <TouchableOpacity
              style={[styles.addButton, isLoading && styles.addButtonDisabled]}
              onPress={handleAddProduct}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.addButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Add Product</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Required Fields Note */}
            <Text style={styles.requiredNote}>
              * Required fields
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  formContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputContainerFocused: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  textAreaContainer: {
    paddingVertical: 5,
  },
  input: {
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 15,
    paddingBottom: 15,
  },
  addButton: {
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  requiredNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
