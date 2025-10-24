import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [qrCodeData, setQrCodeData] = useState(null);
  const qrCodeRef = useRef(null);
  
  // Date picker states
  const [showHarvestDatePicker, setShowHarvestDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);
  const [harvestDate, setHarvestDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(new Date());
  
  // Category picker states
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [categorySearchText, setCategorySearchText] = useState('');
  
  // Food categories for traceability
  const foodCategories = [
    { id: 'fruits', name: 'Fruits', icon: '🍎', description: 'Fresh fruits and berries' },
    { id: 'vegetables', name: 'Vegetables', icon: '🥕', description: 'Fresh vegetables and greens' },
    { id: 'grains', name: 'Grains & Cereals', icon: '🌾', description: 'Rice, wheat, oats, barley' },
    { id: 'legumes', name: 'Legumes & Pulses', icon: '🫘', description: 'Beans, lentils, peas' },
    { id: 'nuts', name: 'Nuts & Seeds', icon: '🥜', description: 'Almonds, walnuts, sunflower seeds' },
    { id: 'herbs', name: 'Herbs & Spices', icon: '🌿', description: 'Fresh herbs and dried spices' },
    { id: 'dairy', name: 'Dairy Products', icon: '🥛', description: 'Milk, cheese, yogurt' },
    { id: 'meat', name: 'Meat & Poultry', icon: '🥩', description: 'Beef, chicken, pork, lamb' },
    { id: 'seafood', name: 'Seafood', icon: '🐟', description: 'Fish, shrimp, crab, lobster' },
    { id: 'eggs', name: 'Eggs', icon: '🥚', description: 'Chicken eggs, duck eggs' },
    { id: 'honey', name: 'Honey & Bee Products', icon: '🍯', description: 'Honey, royal jelly, propolis' },
    { id: 'mushrooms', name: 'Mushrooms', icon: '🍄', description: 'Fresh and dried mushrooms' },
    { id: 'other', name: 'Other', icon: '📦', description: 'Other food products' }
  ];
  
  // Animation states
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Progress tracking
  const [formProgress, setFormProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Animation functions
  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateProgress = (progress) => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const pulseAnimation = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Progress calculation
  const calculateProgress = () => {
    const requiredFields = ['name', 'description', 'harvest_date', 'expiry_date', 'origin', 'category'];
    const completedFields = requiredFields.filter(field => 
      productData[field] && productData[field].trim() !== ''
    );
    const progress = (completedFields.length / requiredFields.length) * 100;
    setFormProgress(progress);
    animateProgress(progress);
    return progress;
  };

  const generateBatchCode = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const productNamePrefix = productData.name.trim().substring(0, 3).toUpperCase() || 'PRD';
    return `${productNamePrefix}-${timestamp}-${randomNum}`;
  };

  // Helper function to format date for display
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Helper function to format date for display with better formatting
  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Date picker handlers
  const handleHarvestDateChange = (event, selectedDate) => {
    setShowHarvestDatePicker(false);
    if (selectedDate) {
      setHarvestDate(selectedDate);
      setProductData(prev => ({
        ...prev,
        harvest_date: formatDate(selectedDate)
      }));
    }
  };

  const handleExpiryDateChange = (event, selectedDate) => {
    setShowExpiryDatePicker(false);
    if (selectedDate) {
      // Validate that expiry date is not today or earlier
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateOnly = new Date(selectedDate);
      selectedDateOnly.setHours(0, 0, 0, 0);
      
      if (selectedDateOnly <= today) {
        Alert.alert(
          'Invalid Date',
          'Expiry date must be after today. Please select a future date.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setExpiryDate(selectedDate);
      setProductData(prev => ({
        ...prev,
        expiry_date: formatDate(selectedDate)
      }));
    }
  };

  // Auto-generate batch code when component mounts
  useEffect(() => {
    const initialBatchCode = generateBatchCode();
    setProductData(prev => ({
      ...prev,
      batch_code: initialBatchCode
    }));
    startAnimations();
  }, []);

  // Track progress when form data changes
  useEffect(() => {
    calculateProgress();
  }, [productData]);

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

  // Generate QR code data when batch code changes (QR contains only batch number)
  useEffect(() => {
    if (productData.batch_code) {
      // QR code contains only the batch number
      console.log('Setting QR code data to:', productData.batch_code);
      setQrCodeData(productData.batch_code);
    }
  }, [productData.batch_code]);

  const captureQRCode = async () => {
    try {
      if (qrCodeRef.current) {
        console.log('Capturing QR code...');
        const uri = await qrCodeRef.current.capture();
        console.log('QR code captured successfully:', uri);
        return uri;
      }
      console.log('QR code ref not available');
      return null;
    } catch (error) {
      console.error('Error capturing QR code:', error);
      return null;
    }
  };

  const handleInputChange = (field, value) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
    pulseAnimation();
  };

  const handleCategorySelect = (category) => {
    setProductData(prev => ({
      ...prev,
      category: category.name
    }));
    setShowCategoryPicker(false);
    setFocusedField('');
    pulseAnimation();
  };

  const getSelectedCategory = () => {
    return foodCategories.find(cat => cat.name === productData.category) || null;
  };

  const getFilteredCategories = () => {
    if (!categorySearchText.trim()) {
      return foodCategories;
    }
    return foodCategories.filter(category =>
      category.name.toLowerCase().includes(categorySearchText.toLowerCase()) ||
      category.description.toLowerCase().includes(categorySearchText.toLowerCase())
    );
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
    // Product Name Validation
    if (!productData.name.trim()) {
      Alert.alert('Validation Error', 'Product name is required');
      return false;
    }
    
    if (productData.name.trim().length < 2) {
      Alert.alert('Validation Error', 'Product name must be at least 2 characters long');
      return false;
    }
    
    if (productData.name.trim().length > 100) {
      Alert.alert('Validation Error', 'Product name must be less than 100 characters');
      return false;
    }
    
    // Check for valid product name (letters, numbers, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z0-9\s\-'&]+$/;
    if (!nameRegex.test(productData.name.trim())) {
      Alert.alert('Validation Error', 'Product name contains invalid characters. Only letters, numbers, spaces, hyphens, apostrophes, and ampersands are allowed');
      return false;
    }
    
    // Location/Origin Validation
    if (!productData.origin.trim()) {
      Alert.alert('Validation Error', 'Product origin/location is required');
      return false;
    }
    
    if (productData.origin.trim().length < 2) {
      Alert.alert('Validation Error', 'Origin/location must be at least 2 characters long');
      return false;
    }
    
    if (productData.origin.trim().length > 100) {
      Alert.alert('Validation Error', 'Origin/location must be less than 100 characters');
      return false;
    }
    
    // Check for valid location (letters, numbers, spaces, hyphens, apostrophes, commas)
    const locationRegex = /^[a-zA-Z0-9\s\-',.]+$/;
    if (!locationRegex.test(productData.origin.trim())) {
      Alert.alert('Validation Error', 'Origin/location contains invalid characters. Only letters, numbers, spaces, hyphens, apostrophes, commas, and periods are allowed');
      return false;
    }
    
    // Batch Code Validation
    if (!productData.batch_code.trim()) {
      Alert.alert('Validation Error', 'Batch code is required');
      return false;
    }
    
    // Category Validation
    if (!productData.category.trim()) {
      Alert.alert('Validation Error', 'Product category is required');
      return false;
    }
    
    // Description Validation
    if (!productData.description.trim()) {
      Alert.alert('Validation Error', 'Product description is required');
      return false;
    }
    
    if (productData.description.trim().length < 10) {
      Alert.alert('Validation Error', 'Product description must be at least 10 characters long');
      return false;
    }
    
    if (productData.description.trim().length > 500) {
      Alert.alert('Validation Error', 'Product description must be less than 500 characters');
      return false;
    }
    
    // Date Validations
    if (!productData.harvest_date.trim()) {
      Alert.alert('Validation Error', 'Harvest date is required');
      return false;
    }
    if (!productData.expiry_date.trim()) {
      Alert.alert('Validation Error', 'Expiry date is required');
      return false;
    }
    
    // Validate expiry date is after harvest date
    const harvestDateObj = new Date(productData.harvest_date);
    const expiryDateObj = new Date(productData.expiry_date);
    
    if (expiryDateObj <= harvestDateObj) {
      Alert.alert('Validation Error', 'Expiry date must be after harvest date');
      return false;
    }
    
    // Validate expiry date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiryDateObj <= today) {
      Alert.alert('Validation Error', 'Expiry date must be after today');
      return false;
    }
    
    // Validate harvest date is not too far in the future (max 1 year)
    const maxHarvestDate = new Date();
    maxHarvestDate.setFullYear(maxHarvestDate.getFullYear() + 1);
    if (harvestDateObj > maxHarvestDate) {
      Alert.alert('Validation Error', 'Harvest date cannot be more than 1 year in the future');
      return false;
    }
    
    return true;
  };

  const handleAddProduct = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Capture QR code image
      console.log('Starting QR code capture...');
      const qrCodeImageUri = await captureQRCode();
      console.log('QR code capture result:', qrCodeImageUri);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', productData.name.trim());
      formData.append('batch_code', productData.batch_code.trim());
      formData.append('description', productData.description.trim());
      formData.append('category', productData.category.trim());
      formData.append('origin', productData.origin.trim());
      formData.append('harvest_date', productData.harvest_date.trim());
      formData.append('expiry_date', productData.expiry_date.trim());
      formData.append('qr_code_data', qrCodeData);
      console.log('QR code data being sent:', qrCodeData);
      
      // Add product image if selected
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

      // Add QR code image if generated
      if (qrCodeImageUri) {
        console.log('Adding QR code image to form data:', qrCodeImageUri);
        formData.append('qr_code_image', {
          uri: qrCodeImageUri,
          type: 'image/png',
          name: `qr_code_${productData.batch_code}.png`,
        });
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
                setHarvestDate(new Date());
                setExpiryDate(new Date());
                setFormProgress(0);
                animateProgress(0);
              }
            },
          {
            text: 'Go to Dashboard',
            onPress: () => navigation.navigate('HomeScreen'),
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
    <View style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50', '#8BC34A', '#CDDC39']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          <View style={styles.patternCircle1} />
          <View style={styles.patternCircle2} />
          <View style={styles.patternCircle3} />
        </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header with Progress Analytics */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Add New Product</Text>
            <Text style={styles.headerSubtitle}>Food Traceability System</Text>
            
            {/* Progress Analytics */}
            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Form Completion</Text>
                <Text style={styles.progressPercentage}>{Math.round(formProgress)}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <Animated.View 
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                        extrapolate: 'clamp',
                      })
                    }
                  ]}
                />
              </View>
            </View>
          </View>
          <View style={styles.placeholder} />
        </Animated.View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Animated.View 
              style={[
                styles.titleSection,
                {
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="leaf-outline" size={28} color="#4CAF50" />
                <Ionicons name="qr-code-outline" size={20} color="#8BC34A" style={styles.iconOverlay} />
              </View>
              <Text style={styles.formTitle}>Product Traceability</Text>
              <Text style={styles.formSubtitle}>
                Track your food from farm to table
              </Text>
            </Animated.View>

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
            </View>

            {/* Category Picker */}
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryLabel}>Product Category *</Text>
              <TouchableOpacity
                style={[
                  styles.categoryPickerButton,
                  focusedField === 'category' && styles.categoryPickerButtonFocused
                ]}
                onPress={() => {
                  setFocusedField('category');
                  setShowCategoryPicker(true);
                }}
              >
                <View style={styles.categoryPickerContent}>
                  <View style={styles.categoryPickerLeft}>
                    {getSelectedCategory() ? (
                      <>
                        <Text style={styles.categoryIcon}>{getSelectedCategory().icon}</Text>
                        <View style={styles.categoryTextContainer}>
                          <Text style={styles.categoryText}>{getSelectedCategory().name}</Text>
                          <Text style={styles.categoryDescription}>{getSelectedCategory().description}</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <Ionicons name="grid-outline" size={20} color="#4CAF50" />
                        <Text style={styles.categoryPlaceholder}>Select product category</Text>
                      </>
                    )}
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Origin */}
            {renderInput(
              'Origin/Location *',
              productData.origin,
              (text) => handleInputChange('origin', text),
              'origin'
            )}

            {/* Harvest Date */}
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Harvest Date *</Text>
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  focusedField === 'harvest_date' && styles.datePickerButtonFocused
                ]}
                onPress={() => {
                  setFocusedField('harvest_date');
                  setShowHarvestDatePicker(true);
                }}
              >
                <View style={styles.datePickerContent}>
                  <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
                  <Text style={[
                    styles.datePickerText,
                    !productData.harvest_date && styles.datePickerPlaceholder
                  ]}>
                    {productData.harvest_date ? formatDateDisplay(harvestDate) : 'Select harvest date'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Expiry Date */}
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Expiry Date *</Text>
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  focusedField === 'expiry_date' && styles.datePickerButtonFocused
                ]}
                onPress={() => {
                  setFocusedField('expiry_date');
                  setShowExpiryDatePicker(true);
                }}
              >
                <View style={styles.datePickerContent}>
                  <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
                  <Text style={[
                    styles.datePickerText,
                    !productData.expiry_date && styles.datePickerPlaceholder
                  ]}>
                    {productData.expiry_date ? formatDateDisplay(expiryDate) : 'Select expiry date'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </View>
              </TouchableOpacity>
            </View>

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

            {/* QR Code Preview Section */}
            {qrCodeData && (
              <View style={styles.qrCodeSection}>
                <Text style={styles.qrCodeSectionTitle}>QR Code Preview</Text>
                {console.log('Rendering QR code section with data:', qrCodeData)}
                <View style={styles.qrCodeContainer}>
                  <ViewShot ref={qrCodeRef} options={{ format: "png", quality: 0.9 }}>
                    <View style={styles.qrCodeWrapper}>
                      <QRCode
                        value={qrCodeData}
                        size={200}
                        color="#000000"
                        backgroundColor="#FFFFFF"
                        logoSize={30}
                        logoMargin={2}
                        logoBorderRadius={15}
                        quietZone={10}
                      />
                      <Text style={styles.qrCodeLabel}>Batch: {productData.batch_code}</Text>
                    </View>
                  </ViewShot>
                </View>
              </View>
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
          </Animated.View>
        </ScrollView>

        {/* Date Pickers */}
        {showHarvestDatePicker && (
          <DateTimePicker
            value={harvestDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleHarvestDateChange}
            maximumDate={new Date()} // Harvest date cannot be in the future
          />
        )}

        {showExpiryDatePicker && (
          <DateTimePicker
            value={expiryDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleExpiryDateChange}
            minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Minimum tomorrow
          />
        )}

        {/* Category Picker Modal */}
        {showCategoryPicker && (
          <View style={styles.categoryModalOverlay}>
            <View style={styles.categoryModal}>
              <View style={styles.categoryModalHeader}>
                <Text style={styles.categoryModalTitle}>Select Product Category</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowCategoryPicker(false);
                    setCategorySearchText('');
                  }}
                  style={styles.categoryModalClose}
                >
                  <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              {/* Search Bar */}
              <View style={styles.categorySearchContainer}>
                <View style={styles.categorySearchInputContainer}>
                  <Ionicons name="search" size={20} color="#95a5a6" style={styles.categorySearchIcon} />
                  <TextInput
                    style={styles.categorySearchInput}
                    placeholder="Search categories..."
                    placeholderTextColor="#95a5a6"
                    value={categorySearchText}
                    onChangeText={setCategorySearchText}
                  />
                  {categorySearchText.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setCategorySearchText('')}
                      style={styles.categorySearchClear}
                    >
                      <Ionicons name="close-circle" size={20} color="#95a5a6" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              
              <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
                {getFilteredCategories().map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      getSelectedCategory()?.id === category.id && styles.categoryOptionSelected
                    ]}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <View style={styles.categoryOptionContent}>
                      <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                      <View style={styles.categoryOptionText}>
                        <Text style={styles.categoryOptionName}>{category.name}</Text>
                        <Text style={styles.categoryOptionDescription}>{category.description}</Text>
                      </View>
                      {getSelectedCategory()?.id === category.id && (
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  patternCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  patternCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -30,
    left: -30,
  },
  patternCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: '40%',
    right: 20,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontWeight: '500',
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
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 32,
    padding: 32,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#f0f8f0',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  iconOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 2,
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e8f5e8',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    transform: [{ scale: 1.01 }],
  },
  textAreaContainer: {
    paddingVertical: 5,
  },
  input: {
    height: 56,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  textArea: {
    height: 120,
    paddingTop: 18,
    paddingBottom: 18,
    textAlignVertical: 'top',
  },
  addButton: {
    borderRadius: 20,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  requiredNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  photoSection: {
    marginBottom: 24,
  },
  photoSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  photoSectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  photoUploadButton: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  photoUploadGradient: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoUploadText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: 12,
    letterSpacing: 0.3,
  },
  photoUploadSubtext: {
    fontSize: 13,
    color: '#95a5a6',
    marginTop: 6,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  batchCodeDisplayContainer: {
    backgroundColor: '#f8fff8',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  batchCodeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  batchCodeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  batchCodeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8f5e8',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  batchCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2e7d32',
    flex: 1,
    letterSpacing: 0.5,
  },
  batchCodeNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  qrCodeSection: {
    marginBottom: 20,
  },
  qrCodeSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  qrCodeSectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  qrCodeContainer: {
    alignItems: 'center',
    backgroundColor: '#f8fff8',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#e8f5e8',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  qrCodeWrapper: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  qrCodeLabel: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dateInputContainer: {
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  datePickerButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: '#e8f5e8',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  datePickerButtonFocused: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
    marginLeft: 12,
    fontWeight: '500',
  },
  datePickerPlaceholder: {
    color: '#95a5a6',
    fontWeight: '400',
  },
  progressContainer: {
    marginTop: 16,
    width: '100%',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  categoryPickerButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: '#e8f5e8',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryPickerButtonFocused: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1.01 }],
  },
  categoryPickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  categoryPlaceholder: {
    fontSize: 16,
    color: '#95a5a6',
    marginLeft: 12,
    fontWeight: '400',
  },
  categoryModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  categoryModal: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    marginHorizontal: 16,
    maxHeight: '85%',
    width: '92%',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 1,
    borderColor: '#f0f8f0',
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f8f0',
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  categoryModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2c3e50',
    letterSpacing: 0.5,
  },
  categoryModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryList: {
    maxHeight: 450,
    paddingVertical: 8,
  },
  categoryOption: {
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryOptionSelected: {
    backgroundColor: '#f0f8f0',
    borderColor: '#4CAF50',
    borderWidth: 2,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  categoryOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryOptionIcon: {
    fontSize: 28,
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    textAlign: 'center',
    lineHeight: 40,
  },
  categoryOptionText: {
    flex: 1,
  },
  categoryOptionName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2c3e50',
    letterSpacing: 0.3,
  },
  categoryOptionDescription: {
    fontSize: 13,
    color: '#95a5a6',
    marginTop: 4,
    fontWeight: '500',
    lineHeight: 18,
  },
  categorySearchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f8f0',
  },
  categorySearchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e8f5e8',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categorySearchIcon: {
    marginRight: 12,
  },
  categorySearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  categorySearchClear: {
    padding: 4,
    marginLeft: 8,
  },
});
