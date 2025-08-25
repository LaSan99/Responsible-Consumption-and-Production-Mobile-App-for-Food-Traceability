import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiConfig from "../config/api";
import { CommonActions } from "@react-navigation/native";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  try {
    const response = await axios.post(`${apiConfig.baseURL}/auth/login`, {
      email,
      password,
    });

    // store token and user info
    await AsyncStorage.setItem("token", response.data.token);
    await AsyncStorage.setItem("user", JSON.stringify({
      full_name: response.data.full_name,
      role: response.data.role,
      email
    }));

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  } catch (error) {
    Alert.alert("Error", "Invalid credentials");
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Go to Register"
        onPress={() => navigation.navigate("Register")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { borderWidth: 1, marginBottom: 15, padding: 10, borderRadius: 5 },
});
