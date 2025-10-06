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
    { id: 'general', title: 'General Inquiry', icon: '💬' },
    { id: 'technical', title: 'Technical Support', icon: '🔧' },
    { id: 'feedback', title: 'Feedback', icon: '📝' },
    { id: 'report', title: 'Report Issue', icon: '⚠️' },
  ];

  const contactMethods = [
    {
      title: 'Phone Support',
      icon: '📞',
      value: '+1 (555) 123-4567',
      description: 'Mon-Fri, 9AM-6PM EST',
      action: () => Linking.openURL('tel:+15551234567'),
    },
    {
      title: 'Email Support',
      icon: '✉️',
      value: 'support@foodtrace.com',
      description: 'We respond within 24 hours',
      action: () => Linking.openURL('mailto:support@foodtrace.com'),
    },
    {
      title: 'Live Chat',
      icon: '💬',
      value: 'Available Now',
      description: 'Get instant help',
      action: () => Alert.alert('Live Chat', 'Opening live chat...'),
    },
    {
      title: 'Visit Us',
      icon: '📍',
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
          'Message Sent Successfully! 📧',
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
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#f8fafc"
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backIcon}>← </Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Get in Touch</Text>
            <Text style={styles.welcomeDescription}>
              We're here to help! Reach out to us with any questions, feedback, or support needs.
            </Text>
          </View>

          {/* Quick Contact Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Contact</Text>
            <View style={styles.contactGrid}>
              {contactMethods.map((method, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.contactCard}
                  onPress={method.action}
                  activeOpacity={0.7}
                >
                  <Text style={styles.contactIcon}>{method.icon}</Text>
                  <Text style={styles.contactTitle}>{method.title}</Text>
                  <Text style={styles.contactValue}>{method.value}</Text>
                  <Text style={styles.contactDescription}>{method.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Send us a Message</Text>
            
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
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
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
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter message subject"
                  value={formData.subject}
                  onChangeText={(value) => handleInputChange('subject', value)}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Message *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChangeText={(value) => handleInputChange('message', value)}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  placeholderTextColor="#9ca3af"
                />
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
                    <Text style={styles.submitIcon}>📤</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <View style={styles.faqContainer}>
              {faqItems.map((item, index) => (
                <View key={index} style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Business Hours */}
          <View style={styles.section}>
            <View style={styles.hoursCard}>
              <View style={styles.hoursHeader}>
                <Text style={styles.hoursIcon}>🕐</Text>
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
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#10B981',
  },
  backText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerPlaceholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    margin: 20,
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 14,
    color: '#dcfce7',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contactCard: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  contactIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactValue: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactDescription: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  categoryList: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#f8fafc',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  submitIcon: {
    fontSize: 16,
  },
  faqContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  hoursCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  hoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hoursIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  hoursContent: {
    paddingLeft: 4,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hoursDay: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  hoursTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  bottomSpacing: {
    height: 20,
  },
});