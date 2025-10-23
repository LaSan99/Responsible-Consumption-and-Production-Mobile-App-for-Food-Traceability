import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
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
  const [productImage, setProductImage] = useState(null);

  const generateBatchCode = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const productNamePrefix = productData.name.trim().substring(0, 3).toUpperCase() || 'PRD';
    return `${productNamePrefix}-${timestamp}-${randomNum}`;
  };

  // Auto-generate batch code when component mounts
  useEffect(() => {
    const initialBatchCode = generateBatchCode();
    setProductData(prev => ({
      ...prev,
      batch_code: initialBatchCode
    }));
  }, []);

  // Regenerate batch code when product name changes
  useEffect(() => {
    if (productData.name.trim()) {
      const newBatchCode = generateBatchCode();
      setProductData(prev => ({
        ...prev,
        batch_code: newBatchCode
      }));
    }
  }, [productData.name]);

  const handleInputChange = (field, value) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      console.log('Opening gallery...');
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        console.log('Permission denied for gallery');
        return;
      }

      console.log('Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('Gallery result:', result);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Image selected:', result.assets[0]);
        setProductImage(result.assets[0]);
      } else {
        console.log('No image selected or result was canceled');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      console.log('Opening camera...');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        console.log('Camera permission denied');
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
        return;
      }

      console.log('Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('Camera result:', result);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Photo taken:', result.assets[0]);
        setProductImage(result.assets[0]);
      } else {
        console.log('No photo taken or result was canceled');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const showImagePicker = () => {
    console.log('showImagePicker called');
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a product photo',
      [
        { 
          text: 'Camera', 
          onPress: () => {
            console.log('Camera option selected');
            takePhoto();
          }
        },
        { 
          text: 'Gallery', 
          onPress: () => {
            console.log('Gallery option selected');
            pickImage();
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const removeImage = () => {
    setProductImage(null);
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
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', productData.name.trim());
      formData.append('batch_code', productData.batch_code.trim());
      formData.append('description', productData.description.trim());
      formData.append('category', productData.category.trim());
      formData.append('origin', productData.origin.trim());
      formData.append('harvest_date', productData.harvest_date.trim());
      formData.append('expiry_date', productData.expiry_date.trim());
      
      // Add image if selected
      if (productImage) {
        console.log('Adding image to form data:', productImage);
        formData.append('product_image', {
          uri: productImage.uri,
          type: 'image/jpeg',
          name: 'product_image.jpg',
        });
      } else {
        console.log('No image selected');
      }
      
      const response = await axios.post(
        `${apiConfig.baseURL}/products`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      Alert.alert(
        'Success!',
        'Product has been added successfully',
        [
            {
              text: 'Add Another',
              onPress: () => {
                const newBatchCode = generateBatchCode();
                setProductData({
                  name: '',
                  batch_code: newBatchCode,
                  description: '',
                  category: '',
                  origin: '',
                  harvest_date: '',
                  expiry_date: '',
                });
                setProductImage(null);
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

            {/* Batch Code - Auto Generated */}
            <View style={styles.batchCodeDisplayContainer}>
              <View style={styles.batchCodeLabelContainer}>
                <Ionicons name="qr-code-outline" size={20} color="#4CAF50" />
                <Text style={styles.batchCodeLabel}>Auto-Generated Batch Code</Text>
              </View>
              <View style={styles.batchCodeDisplay}>
                <Text style={styles.batchCodeText}>{productData.batch_code}</Text>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.batchCodeNote}>
                This code will be used for QR code generation and product tracking
              </Text>
            </View>

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

            {/* Product Photo Section */}
            <View style={styles.photoSection}>
              <Text style={styles.photoSectionTitle}>Product Photo</Text>
              <Text style={styles.photoSectionSubtitle}>
                Add a photo of your product (optional)
              </Text>
              
              {productImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: productImage.uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={removeImage}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.photoUploadButton}
                  onPress={showImagePicker}
                >
                  <LinearGradient
                    colors={['#f0f0f0', '#e0e0e0']}
                    style={styles.photoUploadGradient}
                  >
                    <Ionicons name="camera-outline" size={32} color="#666" />
                    <Text style={styles.photoUploadText}>Tap to add photo</Text>
                    <Text style={styles.photoUploadSubtext}>Camera or Gallery</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

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
  photoSection: {
    marginBottom: 20,
  },
  photoSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  photoSectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  photoUploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  photoUploadGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoUploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
  },
  photoUploadSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
  },
  batchCodeDisplayContainer: {
    backgroundColor: '#f0f8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  batchCodeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  batchCodeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  batchCodeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  batchCodeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    flex: 1,
  },
  batchCodeNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
});
