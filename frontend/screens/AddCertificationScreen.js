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

const CERTIFICATION_TEMPLATES = [
  { name: 'Organic Certification', icon: '🌱', authority: 'USDA Organic', description: 'Certified organic production standards' },
  { name: 'Fair Trade Certified', icon: '🤝', authority: 'Fair Trade USA', description: 'Fair trade practices certification' },
  { name: 'Non-GMO Verified', icon: '🧬', authority: 'Non-GMO Project', description: 'Non-genetically modified verification' },
  { name: 'Gluten-Free Certified', icon: '🌾', authority: 'GFCO', description: 'Gluten-free product certification' },
  { name: 'Vegan Certified', icon: '🌿', authority: 'Vegan Society', description: 'Vegan product certification' },
  { name: 'ISO 22000', icon: '📋', authority: 'ISO', description: 'Food safety management system' },
  { name: 'HACCP Certified', icon: '🔬', authority: 'HACCP International', description: 'Hazard analysis critical control points' },
  { name: 'Halal Certified', icon: '☪️', authority: 'Halal Certification Body', description: 'Halal food certification' },
  { name: 'Kosher Certified', icon: '✡️', authority: 'Orthodox Union', description: 'Kosher food certification' },
];

export default function AddCertificationScreen({ navigation, route }) {
  const { productId, productName, onCertificationAdded } = route.params;
  const [certificationData, setCertificationData] = useState({
    name: '',
    authority: '',
    issued_date: '',
    expiry_date: '',
    description: '',
    certificate_number: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleInputChange = (field, value) => {
    setCertificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setCertificationData(prev => ({
      ...prev,
      name: template.name,
      authority: template.authority,
      description: template.description,
    }));
  };

  const validateForm = () => {
    if (!certificationData.name.trim()) {
      Alert.alert('Error', 'Certification name is required');
      return false;
    }
    if (!certificationData.authority.trim()) {
      Alert.alert('Error', 'Certifying authority is required');
      return false;
    }
    if (!certificationData.issued_date.trim()) {
      Alert.alert('Error', 'Issued date is required');
      return false;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(certificationData.issued_date)) {
      Alert.alert('Error', 'Please enter issued date in YYYY-MM-DD format');
      return false;
    }

    if (certificationData.expiry_date && !dateRegex.test(certificationData.expiry_date)) {
      Alert.alert('Error', 'Please enter expiry date in YYYY-MM-DD format');
      return false;
    }

    return true;
  };

  const handleAddCertification = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      // First create the certification
      const certificationResponse = await axios.post(
        `${apiConfig.baseURL}/cert`,
        {
          name: certificationData.name.trim(),
          authority: certificationData.authority.trim(),
          issued_date: certificationData.issued_date.trim(),
          expiry_date: certificationData.expiry_date.trim() || null,
          description: certificationData.description.trim(),
          certificate_number: certificationData.certificate_number.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const certificationId = certificationResponse.data.id;

      // Then link it to the product
      await axios.post(
        `${apiConfig.baseURL}/cert/link/${productId}`,
        { certificationId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Alert.alert(
        'Success!',
        'Certification has been created and linked to your product successfully',
        [
          {
            text: 'Add Another',
            onPress: () => {
              setCertificationData({
                name: '',
                authority: '',
                issued_date: '',
                expiry_date: '',
                description: '',
                certificate_number: '',
              });
              setSelectedTemplate(null);
            }
          },
          {
            text: 'View Certifications',
            onPress: () => {
              if (onCertificationAdded) onCertificationAdded();
              navigation.goBack();
            },
            style: 'default'
          }
        ]
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to add certification. Please try again.';
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
      colors={['#9C27B0', '#E1BEE7', '#F3E5F5']}
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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Add Certification</Text>
            <Text style={styles.headerSubtitle}>{productName}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formContainer}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Ionicons name="ribbon-outline" size={32} color="#9C27B0" />
              <Text style={styles.formTitle}>New Certification</Text>
              <Text style={styles.formSubtitle}>
                Add a certification to enhance your product's credibility
              </Text>
            </View>

            {/* Certification Templates */}
            <View style={styles.templatesSection}>
              <Text style={styles.sectionTitle}>Popular Certifications</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.templatesContainer}
              >
                {CERTIFICATION_TEMPLATES.map((template, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.templateCard,
                      selectedTemplate?.name === template.name && styles.templateCardSelected
                    ]}
                    onPress={() => selectTemplate(template)}
                  >
                    <Text style={styles.templateIcon}>{template.icon}</Text>
                    <Text style={[
                      styles.templateName,
                      selectedTemplate?.name === template.name && styles.templateNameSelected
                    ]}>
                      {template.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Certification Name */}
            <Text style={styles.fieldLabel}>Certification Name *</Text>
            {renderInput(
              'Enter certification name (e.g., Organic Certification)',
              certificationData.name,
              (text) => handleInputChange('name', text),
              'name'
            )}

            {/* Certifying Authority */}
            <Text style={styles.fieldLabel}>Certifying Authority *</Text>
            {renderInput(
              'Enter certifying authority (e.g., USDA Organic)',
              certificationData.authority,
              (text) => handleInputChange('authority', text),
              'authority'
            )}

            {/* Certificate Number */}
            <Text style={styles.fieldLabel}>Certificate Number</Text>
            {renderInput(
              'Enter certificate number (optional)',
              certificationData.certificate_number,
              (text) => handleInputChange('certificate_number', text),
              'certificate_number'
            )}

            {/* Issued Date */}
            <Text style={styles.fieldLabel}>Issued Date *</Text>
            {renderInput(
              'YYYY-MM-DD (e.g., 2024-01-15)',
              certificationData.issued_date,
              (text) => handleInputChange('issued_date', text),
              'issued_date'
            )}

            {/* Expiry Date */}
            <Text style={styles.fieldLabel}>Expiry Date</Text>
            {renderInput(
              'YYYY-MM-DD (optional, leave blank if no expiry)',
              certificationData.expiry_date,
              (text) => handleInputChange('expiry_date', text),
              'expiry_date'
            )}

            {/* Description */}
            <Text style={styles.fieldLabel}>Description</Text>
            {renderInput(
              'Brief description of the certification',
              certificationData.description,
              (text) => handleInputChange('description', text),
              'description',
              'default',
              true,
              3
            )}

            {/* Certification Info */}
            <View style={styles.certificationInfoContainer}>
              <View style={styles.certificationHeader}>
                <Ionicons name="shield-checkmark" size={20} color="#9C27B0" />
                <Text style={styles.certificationTitle}>Certification Verification</Text>
              </View>
              <Text style={styles.certificationDescription}>
                This certification will be verified and displayed on your product page. 
                Ensure all information is accurate and matches your official certification documents.
              </Text>
            </View>

            {/* Add Certification Button */}
            <TouchableOpacity
              style={[styles.addButton, isLoading && styles.addButtonDisabled]}
              onPress={handleAddCertification}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#9C27B0', '#7B1FA2']}
                style={styles.addButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="ribbon" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Add Certification</Text>
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
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
  templatesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  templatesContainer: {
    paddingRight: 20,
  },
  templateCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateCardSelected: {
    backgroundColor: '#F3E5F5',
    borderColor: '#9C27B0',
  },
  templateIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  templateName: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  templateNameSelected: {
    color: '#9C27B0',
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
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
    borderColor: '#9C27B0',
    backgroundColor: '#faf0fb',
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
    height: 80,
    paddingTop: 15,
    paddingBottom: 15,
  },
  certificationInfoContainer: {
    backgroundColor: '#f0f0ff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  certificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  certificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9C27B0',
    marginLeft: 8,
  },
  certificationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  addButton: {
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#9C27B0',
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
