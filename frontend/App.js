import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import Contact from './screens/Contact';
import Profile from './screens/Profile';
import FindFarmerScreen from './screens/FindFarmerScreen'
import ProductListingScreen from './screens/ProductListingScreen';
import Scanner from './screens/Scanner';
import ProductDetailScreen from './screens/ProductDetailScreen';
import ProductCertificationsScreen from './screens/ProductCertificationsScreen';
import ProducerProfile from './screens/ProducerProfile';
import AddProductScreen from './screens/AddProductScreen';

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Check user role to determine initial route
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.role === 'producer') {
            setInitialRoute('ProducerProfile');
          } else {
            setInitialRoute('Home');
          }
        } else {
          setInitialRoute('Home');
        }
      } else {
        setInitialRoute('Login');
      }
    };
    checkLogin();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Contact" component={Contact} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="FindFarmerScreen" component={FindFarmerScreen} />
        <Stack.Screen name="Products" component={ProductListingScreen} />
        <Stack.Screen name="Scanner" component={Scanner} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="ProductCertifications" component={ProductCertificationsScreen} />
        <Stack.Screen name="ProducerProfile" component={ProducerProfile} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
