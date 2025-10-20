import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiConfig from "../config/api";

const { width, height } = Dimensions.get("window");

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const handleRegister = async () => {
    // Validation
    if (!fullName || !username || !email || !password || !phone) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${apiConfig.baseURL}/auth/register`, {
        full_name: fullName,
        username,
        email,
        password,
        phone,
      });
      
      // Auto login after successful registration
      const loginResponse = await axios.post(`${apiConfig.baseURL}/auth/login`, {
        email,
        password,
      });

      // Store token and user info
      await AsyncStorage.setItem("token", loginResponse.data.token);
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          full_name: fullName,
          role: loginResponse.data.role,
          email,
        })
      );

      Alert.alert(
        "Welcome to Farm2Fork!",
        "Your account has been created successfully.",
        [
          {
            text: "Get Started",
            onPress: () => navigation.navigate("MainTabs"),
          },
        ]
      );
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      
      if (error.response?.status === 409) {
        Alert.alert("Error", "An account with this email or username already exists.");
      } else if (error.response?.status >= 500) {
        Alert.alert("Error", "Server error. Please try again later.");
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setFullName("Demo User");
    setUsername("demouser");
    setEmail("demo@farm2fork.com");
    setPassword("demo123");
    setPhone("+1234567890");
  };

  const renderInput = (
    placeholder,
    value,
    onChangeText,
    iconName,
    fieldName,
    keyboardType = "default",
    isPassword = false
  ) => {
    const isFocused = focusedField === fieldName;
    
    return (
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        <Ionicons
          name={iconName}
          size={22}
          color={isFocused ? "#2E7D32" : "#666"}
          style={styles.inputIcon}
        />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#999"
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocusedField(fieldName)}
          onBlur={() => setFocusedField("")}
          keyboardType={keyboardType}
          autoCapitalize={fieldName === "email" || fieldName === "username" ? "none" : "words"}
          autoCorrect={false}
          secureTextEntry={isPassword && !showPassword}
          editable={!isLoading}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.passwordToggle}
            disabled={isLoading}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={["#2E7D32", "#4CAF50", "#81C784"]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <Image 
                source={{ uri: "https://i.postimg.cc/66Sb4wK0/image.png" }}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>Join Farm2Fork</Text>
            <Text style={styles.tagline}>
              Start your sustainable journey today
            </Text>
          </View>

          {/* Registration Form */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitleText}>
              Join our community tracking food from farm to fork
            </Text>

            {/* Form Inputs */}
            {renderInput(
              "Full Name",
              fullName,
              setFullName,
              "person-outline",
              "fullName"
            )}

            {renderInput(
              "Username",
              username,
              setUsername,
              "at-outline",
              "username"
            )}

            {renderInput(
              "Email Address",
              email,
              setEmail,
              "mail-outline",
              "email",
              "email-address"
            )}

            {renderInput(
              "Phone Number",
              phone,
              setPhone,
              "call-outline",
              "phone",
              "phone-pad"
            )}

            {renderInput(
              "Password",
              password,
              setPassword,
              "lock-closed-outline",
              "password",
              "default",
              true
            )}

            {/* Password Requirements */}
            <View style={styles.passwordRequirements}>
              <Text style={[
                styles.requirementText,
                password.length >= 6 && styles.requirementMet
              ]}>
                ✓ Password must be at least 6 characters long
              </Text>
            </View>

            {/* Quick Fill Button */}
            <TouchableOpacity
              style={styles.quickFillButton}
              onPress={handleQuickFill}
              disabled={isLoading}
            >
              <Text style={styles.quickFillText}>Fill Demo Data</Text>
            </TouchableOpacity>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#2E7D32", "#4CAF50"]}
                style={styles.registerButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.registerButtonText}>Create Account</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Already a member?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login Section */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                style={styles.loginButton}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features Banner */}
          <View style={styles.featuresBanner}>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={16} color="#fff" />
              <Text style={styles.featureText}>Secure</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trending-up" size={16} color="#fff" />
              <Text style={styles.featureText}>Traceable</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="earth" size={16} color="#fff" />
              <Text style={styles.featureText}>Sustainable</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people" size={16} color="#fff" />
              <Text style={styles.featureText}>Community</Text>
            </View>
          </View>

          {/* Additional Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Why Join Farm2Fork?</Text>
            <View style={styles.benefitsGrid}>
              <View style={styles.benefitCard}>
                <Ionicons name="analytics" size={24} color="#2E7D32" />
                <Text style={styles.benefitTitle}>Track Impact</Text>
                <Text style={styles.benefitDescription}>
                  Monitor your sustainable food choices and their environmental impact
                </Text>
              </View>
              <View style={styles.benefitCard}>
                <Ionicons name="storefront" size={24} color="#2E7D32" />
                <Text style={styles.benefitTitle}>Local Farms</Text>
                <Text style={styles.benefitDescription}>
                  Connect with local farmers and sustainable food producers
                </Text>
              </View>
              <View style={styles.benefitCard}>
                <Ionicons name="ribbon" size={24} color="#2E7D32" />
                <Text style={styles.benefitTitle}>Certifications</Text>
                <Text style={styles.benefitDescription}>
                  Access verified organic and sustainable product certifications
                </Text>
              </View>
              <View style={styles.benefitCard}>
                <Ionicons name="trending-up" size={24} color="#2E7D32" />
                <Text style={styles.benefitTitle}>Growth</Text>
                <Text style={styles.benefitDescription}>
                  Be part of a growing community dedicated to food sustainability
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Track your food's journey with complete transparency
            </Text>
            <Text style={styles.copyrightText}>
              © 2024 Farm2Fork. All rights reserved.
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 25,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: -10,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "500",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 12,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 15,
    paddingHorizontal: 18,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: "#2E7D32",
    backgroundColor: "#f0f8f0",
    shadowColor: "#2E7D32",
    shadowOpacity: 0.1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  passwordToggle: {
    padding: 5,
  },
  passwordRequirements: {
    marginBottom: 15,
  },
  requirementText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
  requirementMet: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  quickFillButton: {
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  quickFillText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
  termsLink: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  registerButton: {
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonGradient: {
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonIcon: {
    marginRight: 8,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e8e8e8",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#999",
    fontSize: 13,
    fontWeight: "500",
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  loginText: {
    color: "#666",
    fontSize: 15,
    marginRight: 5,
  },
  loginButton: {
    padding: 5,
  },
  loginButtonText: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "bold",
  },
  featuresBanner: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  benefitsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  benefitCard: {
    width: '48%',
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    lineHeight: 12,
  },
  footer: {
    alignItems: "center",
    marginBottom: 10,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 5,
  },
  copyrightText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 10,
    textAlign: "center",
  },
});