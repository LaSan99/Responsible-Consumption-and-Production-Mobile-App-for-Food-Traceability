import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// Consumer Screens
import HomeScreen from './screens/HomeScreen';
import ProductListingScreen from './screens/ProductListingScreen';
import Scanner from './screens/Scanner';
import Contact from './screens/Contact';
import Profile from './screens/Profile';

// Producer Screens
import ProducerProfile from './screens/ProducerProfile';
import AddProductScreen from './screens/AddProductScreen';

// Shared Screens
import ProductDetailScreen from './screens/ProductDetailScreen';
import ProductCertificationsScreen from './screens/ProductCertificationsScreen';
import FindFarmerScreen from './screens/FindFarmerScreen';
import BlockchainStagesScreen from './screens/BlockchainStagesScreen';
import AddStageScreen from './screens/AddStageScreen';
import ProductCertificationManagementScreen from './screens/ProductCertificationManagementScreen';
import AddCertificationScreen from './screens/AddCertificationScreen';
import SupplyChainMapScreen from './screens/SupplyChainMap';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Consumer Tab Navigator
function ConsumerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Scanner') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Contact') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductListingScreen}
        options={{
          tabBarLabel: 'Products',
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={Scanner}
        options={{
          tabBarLabel: 'Scan',
        }}
      />
      <Tab.Screen
        name="Contact"
        component={Contact}
        options={{
          tabBarLabel: 'Contact',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

// Producer Tab Navigator
function ProducerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Scanner') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Contact') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={ProducerProfile}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductListingScreen}
        options={{
          tabBarLabel: 'Products',
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={Scanner}
        options={{
          tabBarLabel: 'Scan',
        }}
      />
      <Tab.Screen
        name="Contact"
        component={Contact}
        options={{
          tabBarLabel: 'Contact',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const checkAuthAndRole = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserRole(user.role);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthAndRole();
  }, []);

  // Listen for app state changes to check auth when app becomes active
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        checkAuthAndRole();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Also check periodically but less frequently
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuthAndRole();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            {/* Main App Tabs */}
            <Stack.Screen
              name="MainTabs"
              component={userRole === 'producer' ? ProducerTabs : ConsumerTabs}
            />

            {/* Modal/Detail Screens */}
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="ProductCertifications"
              component={ProductCertificationsScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="FindFarmerScreen"
              component={FindFarmerScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="SupplyChainMap"
              component={SupplyChainMapScreen}
              options={{ presentation: 'modal' }}
            />

            {/* Producer-specific screens */}
            <Stack.Screen
              name="AddProduct"
              component={AddProductScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="BlockchainStages"
              component={BlockchainStagesScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="AddStage"
              component={AddStageScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="ProductCertificationManagement"
              component={ProductCertificationManagementScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="AddCertification"
              component={AddCertificationScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        ) : (
          <>
            {/* Auth Screens */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}