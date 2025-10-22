import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  SafeAreaView,
  Dimensions,
  Linking,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import apiConfig from '../config/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export default function ContactScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [selectedCategory, setSelectedCategory] = useState('general');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: 'general', title: 'General Inquiry', icon: 'chatbubble-outline' },
    { id: 'technical', title: 'Technical Support', icon: 'build-outline' },
    { id: 'feedback', title: 'Feedback', icon: 'document-text-outline' },
    { id: 'report', title: 'Report Issue', icon: 'warning-outline' },
  ];

  const contactMethods = [
    {
      title: 'Phone Support',
      icon: 'call',
      value: '+1 (555) 123-4567',
      description: 'Mon-Fri, 9AM-6PM EST',
      action: () => Linking.openURL('tel:+15551234567'),
    },
    {
      title: 'Email Support',
      icon: 'mail',
      value: 'support@foodtrace.com',
      description: 'We respond within 24 hours',
      action: () => Linking.openURL('mailto:support@foodtrace.com'),
    },
    {
      title: 'Live Chat',
      icon: 'chatbubble-ellipses',
      value: 'Available Now',
      description: 'Get instant help',
      action: () => Alert.alert('Live Chat', 'Opening live chat...'),
    },
    {
      title: 'Visit Us',
      icon: 'location',
      value: '123 Green Street, Eco City',
      description: 'Mon-Fri, 10AM-5PM',
      action: () => Alert.alert('Location', 'Opening maps...'),
    },
  ];

  const faqItems = [
    {
      question: 'How do I trace a product?',
      answer: 'Simply scan the QR code on the product packaging using our built-in scanner.',
    },
    {
      question: 'What information can I see about products?',
      answer: 'You can view farm origin, certifications, transportation details, and sustainability metrics.',
    },
    {
      question: 'How do I report incorrect product information?',
      answer: 'Use the "Report Issue" category in the contact form or email us directly.',
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${apiConfig.baseURL}/contact/submit`, {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        category: selectedCategory,
      });

      if (response.data.success) {
        Alert.alert(
          'Message Sent Successfully!',
          response.data.message,
          [
            {
              text: 'OK',
              onPress: () => {
                setFormData({
                  name: '',
                  email: '',
                  subject: '',
                  message: '',
                });
                setSelectedCategory('general');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send message. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (navigation.goBack) {
      navigation.goBack();
    } else {
      Alert.alert('Navigation', 'Going back to previous screen');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#4A6572" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeIconContainer}>
              <Ionicons name="headset" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.welcomeTitle}>Get in Touch</Text>
            <Text style={styles.welcomeDescription}>
              We're here to help! Reach out to us with any questions, feedback, or support needs.
            </Text>
          </View>

          {/* Quick Contact Methods */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash" size={20} color="#4A6572" />
              <Text style={styles.sectionTitle}>Quick Contact</Text>
            </View>
            <View style={styles.contactGrid}>
              {contactMethods.map((method, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.contactCard}
                  onPress={method.action}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactIconContainer}>
                    <Ionicons name={method.icon} size={24} color="#4A6572" />
                  </View>
                  <Text style={styles.contactTitle}>{method.title}</Text>
                  <Text style={styles.contactValue}>{method.value}</Text>
                  <Text style={styles.contactDescription}>{method.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Form */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="mail" size={20} color="#4A6572" />
              <Text style={styles.sectionTitle}>Send us a Message</Text>
            </View>
            
            {/* Category Selection */}
            <View style={styles.categoryContainer}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryList}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        selectedCategory === category.id && styles.categoryChipSelected,
                      ]}
                      onPress={() => setSelectedCategory(category.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={category.icon} 
                        size={16} 
                        color={selectedCategory === category.id ? '#FFFFFF' : '#4A6572'} 
                      />
                      <Text
                        style={[
                          styles.categoryText,
                          selectedCategory === category.id && styles.categoryTextSelected,
                        ]}
                      >
                        {category.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    placeholderTextColor="#A0AEC0"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#A0AEC0"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Subject</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="document-text-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter message subject"
                    value={formData.subject}
                    onChangeText={(value) => handleInputChange('subject', value)}
                    placeholderTextColor="#A0AEC0"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Message *</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChangeText={(value) => handleInputChange('message', value)}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    placeholderTextColor="#A0AEC0"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>Sending...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Send Message</Text>
                    <Ionicons name="send" size={18} color="#FFFFFF" style={styles.submitIcon} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="help-circle" size={20} color="#4A6572" />
              <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            </View>
            <View style={styles.faqContainer}>
              {faqItems.map((item, index) => (
                <View key={index} style={styles.faqItem}>
                  <View style={styles.faqHeader}>
                    <Ionicons name="help" size={18} color="#4A6572" />
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                  </View>
                  <View style={styles.faqAnswerContainer}>
                    <Ionicons name="information-circle" size={16} color="#718096" style={styles.faqAnswerIcon} />
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Business Hours */}
          <View style={styles.section}>
            <View style={styles.hoursCard}>
              <View style={styles.hoursHeader}>
                <View style={styles.hoursIconContainer}>
                  <Ionicons name="time" size={20} color="#4A6572" />
                </View>
                <Text style={styles.hoursTitle}>Business Hours</Text>
              </View>
              <View style={styles.hoursContent}>
                <View style={styles.hoursRow}>
                  <Text style={styles.hoursDay}>Monday - Friday</Text>
                  <Text style={styles.hoursTime}>9:00 AM - 6:00 PM EST</Text>
                </View>
                <View style={styles.hoursRow}>
                  <Text style={styles.hoursDay}>Saturday</Text>
                  <Text style={styles.hoursTime}>10:00 AM - 4:00 PM EST</Text>
                </View>
                <View style={styles.hoursRow}>
                  <Text style={styles.hoursDay}>Sunday</Text>
                  <Text style={styles.hoursTime}>Closed</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    letterSpacing: -0.5,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    margin: 20,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  welcomeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginLeft: 8,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contactCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 6,
    textAlign: 'center',
  },
  contactValue: {
    fontSize: 13,
    color: '#4A6572',
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactDescription: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 16,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A6572',
    marginBottom: 12,
  },
  categoryList: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  categoryChipSelected: {
    backgroundColor: '#4A6572',
    borderColor: '#4A6572',
  },
  categoryText: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
    marginLeft: 6,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#2D3748',
    backgroundColor: '#F7FAFC',
    paddingLeft: 44,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingLeft: 16,
  },
  submitButton: {
    backgroundColor: '#4A6572',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4A6572',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: '#A0AEC0',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  submitIcon: {
    marginLeft: 4,
  },
  faqContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  faqItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 8,
    flex: 1,
  },
  faqAnswerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  faqAnswerIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    flex: 1,
  },
  hoursCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  hoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  hoursIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  hoursTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D3748',
  },
  hoursContent: {
    paddingLeft: 4,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  hoursDay: {
    fontSize: 15,
    color: '#4A6572',
    fontWeight: '500',
  },
  hoursTime: {
    fontSize: 15,
    color: '#718096',
    fontWeight: '400',
  },
  bottomSpacing: {
    height: 30,
  },
});