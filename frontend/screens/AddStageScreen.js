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

const STAGE_TEMPLATES = [
  { name: 'Harvesting', icon: '🌱', description: 'Product harvested from farm' },
  { name: 'Processing', icon: '🏭', description: 'Product processed and packaged' },
  { name: 'Quality Check', icon: '🔍', description: 'Quality inspection completed' },
  { name: 'Transportation', icon: '🚛', description: 'Product shipped to destination' },
  { name: 'Warehouse Storage', icon: '🏪', description: 'Product stored in warehouse' },
  { name: 'Retail Distribution', icon: '🏬', description: 'Product distributed to retail' },
  { name: 'Final Delivery', icon: '📦', description: 'Product delivered to customer' },
];

export default function AddStageScreen({ navigation, route }) {
  const { productId, productName, onStageAdded } = route.params;
  const [stageData, setStageData] = useState({
    stage_name: '',
    location: '',
    description: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleInputChange = (field, value) => {
    setStageData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setStageData(prev => ({
      ...prev,
      stage_name: template.name,
      description: template.description,
    }));
  };

  const validateForm = () => {
    if (!stageData.stage_name.trim()) {
      Alert.alert('Error', 'Stage name is required');
      return false;
    }
    if (!stageData.location.trim()) {
      Alert.alert('Error', 'Location is required');
      return false;
    }
    return true;
  };

  const handleAddStage = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.post(
        `${apiConfig.baseURL}/supply-chain/${productId}`,
        {
          stage_name: stageData.stage_name.trim(),
          location: stageData.location.trim(),
          description: stageData.description.trim(),
          notes: stageData.notes.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Alert.alert(
        'Success!',
        'Blockchain stage has been added successfully',
        [
          {
            text: 'Add Another',
            onPress: () => {
              setStageData({
                stage_name: '',
                location: '',
                description: '',
                notes: '',
              });
              setSelectedTemplate(null);
            }
          },
          {
            text: 'View Blockchain',
            onPress: () => {
              if (onStageAdded) onStageAdded();
              navigation.goBack();
            },
            style: 'default'
          }
        ]
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add stage. Please try again.';
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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Add Blockchain Stage</Text>
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
              <Ionicons name="cube-outline" size={32} color="#4CAF50" />
              <Text style={styles.formTitle}>New Stage Details</Text>
              <Text style={styles.formSubtitle}>
                Add a new stage to your product's blockchain
              </Text>
            </View>

            {/* Stage Templates */}
            <View style={styles.templatesSection}>
              <Text style={styles.sectionTitle}>Quick Templates</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.templatesContainer}
              >
                {STAGE_TEMPLATES.map((template, index) => (
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

            {/* Stage Name */}
            <Text style={styles.fieldLabel}>Stage Name *</Text>
            {renderInput(
              'Enter stage name (e.g., Harvesting, Processing)',
              stageData.stage_name,
              (text) => handleInputChange('stage_name', text),
              'stage_name'
            )}

            {/* Location */}
            <Text style={styles.fieldLabel}>Location *</Text>
            {renderInput(
              'Enter location (e.g., Green Valley Farm, CA)',
              stageData.location,
              (text) => handleInputChange('location', text),
              'location'
            )}

            {/* Description */}
            <Text style={styles.fieldLabel}>Description</Text>
            {renderInput(
              'Brief description of this stage',
              stageData.description,
              (text) => handleInputChange('description', text),
              'description',
              'default',
              true,
              3
            )}

            {/* Notes */}
            <Text style={styles.fieldLabel}>Additional Notes</Text>
            {renderInput(
              'Any additional notes or details',
              stageData.notes,
              (text) => handleInputChange('notes', text),
              'notes',
              'default',
              true,
              3
            )}

            {/* Blockchain Info */}
            <View style={styles.blockchainInfoContainer}>
              <View style={styles.blockchainHeader}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                <Text style={styles.blockchainTitle}>Blockchain Security</Text>
              </View>
              <Text style={styles.blockchainDescription}>
                This stage will be cryptographically secured and immutably recorded on the blockchain. 
                Once added, it cannot be modified or deleted.
              </Text>
            </View>

            {/* Add Stage Button */}
            <TouchableOpacity
              style={[styles.addButton, isLoading && styles.addButtonDisabled]}
              onPress={handleAddStage}
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
                    <Ionicons name="cube" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Add to Blockchain</Text>
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
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateCardSelected: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  templateIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  templateName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  templateNameSelected: {
    color: '#4CAF50',
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
    height: 80,
    paddingTop: 15,
    paddingBottom: 15,
  },
  blockchainInfoContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  blockchainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  blockchainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  blockchainDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
