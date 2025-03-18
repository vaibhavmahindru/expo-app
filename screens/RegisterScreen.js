import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Device from "expo-device";
import { getDatabase, ref, set, get } from "firebase/database";
import { database } from "../firebaseConfig";

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleRegister = async () => {
    if (!name) {
      Alert.alert("Error", "Name is required!");
      return;
    }
  
    console.log("✅ Register button clicked!");
  
    try {
      // Get Device ID
      const id = Device.osBuildId || "UnknownDevice";
       //Replace invalid characters in deviceId as firebase doesn't allow special character.
      const deviceId = id.replace(/[^a-zA-Z0-9_-]/g, "_"); // Replaces ".", "#", "$", etc.

    console.log("Sanitized Device ID:", deviceId);
  
      // Get Location Permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log("✅ Location Permission Status:", status);
  
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        return;
      }
  
      // Get Initial Location
      let location = await Location.getCurrentPositionAsync({});
      console.log("✅ Initial Location:", location);
  
      const { latitude, longitude } = location.coords;
  
      // Store Locally
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify({ name, description, deviceId })
      );
      console.log("User Data Saved in AsyncStorage");
  
      // Check if user exists in Firebase
      const dbRef = ref(database, "users/" + deviceId);
      const snapshot = await get(dbRef);
      console.log("Firebase User Check:", snapshot.exists());
  
      if (!snapshot.exists()) {
        await set(dbRef, {
          name,
          description,
          deviceId,
          latitude,
          longitude,
          timestamp: Date.now(),
        });
        console.log("User Registered in Firebase!");
      }
  
      console.log("Navigating to Home screen...");
      // Navigate to Home
      navigation.replace("Home");
  
    } catch (error) {
      console.error("Error in handleRegister:", error);
    }
  };
  
  return (
    <View style={{ backgroundColor: "#ffffff", padding: 20, borderRadius: 10, elevation: 3 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
        User Registration
      </Text>
      <Text>Name:</Text>
      <TextInput style={{ borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, marginBottom: 10 }}
        placeholder="Enter Name" 
        value={name} 
        onChangeText={setName} 
      />
      <Text>Vehicle Number:</Text>
      <TextInput 
        style={{ borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, marginBottom: 15 }}
        placeholder="Enter your vehicle number"
        value={description} 
        onChangeText={setDescription} 
      />
      <TouchableOpacity
        onPress={handleRegister}
        style={{ backgroundColor: "#007BFF", padding: 12, borderRadius: 8, alignItems: "center" }}>
        <Text style={{ color: "#fff", fontSize: 16 }}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;
