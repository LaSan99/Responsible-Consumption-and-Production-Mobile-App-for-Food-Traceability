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
  Animated,
} from 'react-native';
import axios from 'axios';
import apiConfig from '../config/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export default function ContactScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [selectedCategory, setSelectedCategory] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const categories = [
    { id: 'general', title: 'General Inquiry', icon: 'chatbubble-outline', color: '#10B981' },
    { id: 'technical', title: 'Technical Support', icon: 'build-outline', color: '#3B82F6' },
    { id: 'feedback', title: 'Feedback', icon: 'document-text-outline', color: '#8B5CF6' },
    { id: 'report', title: 'Report Issue', icon: 'warning-outline', color: '#EF4444' },
  ];

  const contactMethods = [
    {
      title: 'Phone Support',
      icon: 'call',
      value: '+94 76 057 9866',
      description: 'Mon-Fri, 9AM-6PM EST',
      action: () => Linking.openURL('tel:+94760579866'),
      gradient: ['#667eea', '#764ba2'],
    },
    {
      title: 'Email Support',
      icon: 'mail',
      value: 'support@foodtrace.com',
      description: 'We respond within 24 hours',
      action: () => Linking.openURL('mailto:support@foodtrace.com'),
      gradient: ['#f093fb', '#f5576c'],
    },
    {
      title: 'Live Chat',
      icon: 'chatbubble-ellipses',
      value: 'Available Now',
      description: 'Get instant help',
      action: () => Alert.alert('Live Chat', 'Opening live chat...'),
      gradient: ['#4facfe', '#00f2fe'],
    },
    {
      title: 'Visit Us',
      icon: 'location',
      value: '123 Green Street, Eco City',
      description: 'Mon-Fri, 10AM-5PM',
      action: () => Alert.alert('Location', 'Opening maps...'),
      gradient: ['#43e97b', '#38f9d7'],
    },
  ];

  const faqItems = [
    {
      question: 'How do I trace a product?',
      answer: 'Simply scan the QR code on the product packaging using our built-in scanner.',
      icon: 'qr-code-outline',
    },
    {
      question: 'What information can I see about products?',
      answer: 'You can view farm origin, certifications, transportation details, and sustainability metrics.',
      icon: 'information-circle-outline',
    },
    {
      question: 'How do I report incorrect product information?',
      answer: 'Use the "Report Issue" category in the contact form or email us directly.',
      icon: 'flag-outline',
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
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
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
    navigation.goBack();
  };

  const GradientBackground = ({ colors, children, style }) => (
    <View style={[styles.gradientContainer, style]}>
      <View style={[styles.gradient, { backgroundColor: colors[0] }]} />
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={false}
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Enhanced Header with App Theme */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#2F855A" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Contact Us</Text>
            <Text style={styles.headerSubtitle}>We're here to help</Text>
          </View>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={24} color="#2F855A" />
          </TouchableOpacity>
        </View>

        <Animated.ScrollView 
          style={[styles.scrollView, { opacity: fadeAnim }]} 
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section with App Theme */}
          <View style={styles.heroSection}>
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <Ionicons name="leaf" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.heroTitle}>Get in Touch</Text>
              <Text style={styles.heroDescription}>
                Have questions about food traceability? Our sustainable support team is here to assist you.
              </Text>
            </View>
            <View style={styles.heroPattern}>
              <Ionicons name="leaf-outline" size={60} color="rgba(255,255,255,0.1)" />
              <Ionicons name="restaurant-outline" size={40} color="rgba(255,255,255,0.1)" style={styles.patternIcon} />
            </View>
          </View>

          {/* Quick Contact Methods with Enhanced Cards */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="flash" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.sectionTitle}>Quick Contact</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.contactScrollContent}
            >
              {contactMethods.map((method, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.contactCard}
                  onPress={method.action}
                  activeOpacity={0.8}
                >
                  <GradientBackground colors={method.gradient} style={styles.contactCardBackground}>
                    <View style={styles.contactCardContent}>
                      <View style={styles.contactIconContainer}>
                        <Ionicons name={method.icon} size={28} color="#FFFFFF" />
                      </View>
                      <Text style={styles.contactTitle}>{method.title}</Text>
                      <Text style={styles.contactValue}>{method.value}</Text>
                      <Text style={styles.contactDescription}>{method.description}</Text>
                      <View style={styles.contactAction}>
                        <Text style={styles.contactActionText}>Tap to Connect</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                      </View>
                    </View>
                  </GradientBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Contact Form with Enhanced Design */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="mail" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.sectionTitle}>Send us a Message</Text>
            </View>
            
            {/* Enhanced Category Selection */}
            <View style={styles.categoryContainer}>
              <Text style={styles.inputLabel}>What can we help you with?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryList}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        selectedCategory === category.id && [
                          styles.categoryChipSelected,
                          { borderColor: category.color }
                        ],
                      ]}
                      onPress={() => setSelectedCategory(category.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={category.icon} 
                        size={18} 
                        color={selectedCategory === category.id ? '#FFFFFF' : category.color} 
                      />
                      <Text
                        style={[
                          styles.categoryText,
                          selectedCategory === category.id && [
                            styles.categoryTextSelected,
                            { color: '#FFFFFF' }
                          ],
                        ]}
                      >
                        {category.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Enhanced Form Fields */}
            <View style={styles.formContainer}>
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 12 }]}>
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

                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Email Address *</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChangeText={(value) => handleInputChange('email', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#A0AEC0"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Subject</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="document-text-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="What is this regarding?"
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
                    placeholder="Tell us how we can help you... Please include any product codes or details for faster assistance."
                    value={formData.message}
                    onChangeText={(value) => handleInputChange('message', value)}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    placeholderTextColor="#A0AEC0"
                  />
                  <View style={styles.textAreaIcon}>
                    <Ionicons name="create-outline" size={20} color="#A0AEC0" />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                <View style={styles.submitButtonContent}>
                  {isLoading ? (
                    <>
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text style={styles.submitButtonText}>Sending Message...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Send Message</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Enhanced FAQ Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="help-circle" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            </View>
            <View style={styles.faqContainer}>
              {faqItems.map((item, index) => (
                <View key={index} style={styles.faqItem}>
                  <View style={styles.faqHeader}>
                    <View style={styles.faqIconContainer}>
                      <Ionicons name={item.icon} size={20} color="#2F855A" />
                    </View>
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                    <Ionicons name="chevron-down" size={20} color="#A0AEC0" />
                  </View>
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Enhanced Business Hours */}
          <View style={styles.section}>
            <View style={styles.hoursCard}>
              <View style={styles.hoursHeader}>
                <View style={styles.hoursIconContainer}>
                  <Ionicons name="time" size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.hoursTitle}>Business Hours</Text>
                  <Text style={styles.hoursSubtitle}>We're here when you need us</Text>
                </View>
              </View>
              <View style={styles.hoursContent}>
                <View style={styles.hoursRow}>
                  <View style={styles.hoursDayContainer}>
                    <Text style={styles.hoursDay}>Monday - Friday</Text>
                    <Text style={styles.hoursNote}>Main Support Hours</Text>
                  </View>
                  <Text style={styles.hoursTime}>9:00 AM - 6:00 PM EST</Text>
                </View>
                <View style={styles.hoursRow}>
                  <View style={styles.hoursDayContainer}>
                    <Text style={styles.hoursDay}>Saturday</Text>
                    <Text style={styles.hoursNote}>Limited Support</Text>
                  </View>
                  <Text style={styles.hoursTime}>10:00 AM - 4:00 PM EST</Text>
                </View>
                <View style={styles.hoursRow}>
                  <View style={styles.hoursDayContainer}>
                    <Text style={styles.hoursDay}>Sunday</Text>
                    <Text style={styles.hoursNote}>Emergency Only</Text>
                  </View>
                  <Text style={[styles.hoursTime, styles.hoursClosed]}>Closed</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </Animated.ScrollView>
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FFF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FFF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    margin: 20,
    backgroundColor: '#2F855A',
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#2F855A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  heroIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  heroPattern: {
    position: 'absolute',
    right: 20,
    top: 20,
    opacity: 0.3,
  },
  patternIcon: {
    position: 'absolute',
    right: -10,
    top: 40,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2F855A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  contactScrollContent: {
    paddingRight: 20,
  },
  contactCard: {
    width: width * 0.75,
    height: 180,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  gradientContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  contactCardBackground: {
    flex: 1,
    padding: 20,
  },
  contactCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  contactAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactActionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  categoryContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  categoryList: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  categoryChipSelected: {
    backgroundColor: '#2F855A',
  },
  categoryText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '600',
    marginLeft: 8,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 1,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#EDF2F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2D3748',
    backgroundColor: '#F7FAFC',
    paddingLeft: 48,
    fontWeight: '500',
  },
  textArea: {
    height: 140,
    textAlignVertical: 'top',
    paddingLeft: 16,
    paddingTop: 16,
  },
  textAreaIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  submitButton: {
    backgroundColor: '#2F855A',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#2F855A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  submitButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A0AEC0',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
  faqContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  faqItem: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  faqIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FFF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
  },
  faqAnswerContainer: {
    paddingLeft: 48,
  },
  faqAnswer: {
    fontSize: 15,
    color: '#718096',
    lineHeight: 22,
  },
  hoursCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  hoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  hoursIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2F855A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  hoursTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  hoursSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
  hoursContent: {
    paddingLeft: 4,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  hoursDayContainer: {
    flex: 1,
  },
  hoursDay: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '600',
  },
  hoursNote: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  hoursTime: {
    fontSize: 15,
    color: '#4A6572',
    fontWeight: '600',
  },
  hoursClosed: {
    color: '#E53E3E',
  },
  bottomSpacing: {
    height: 40,
  },
});