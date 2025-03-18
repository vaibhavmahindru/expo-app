import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import axios from "axios";
import { startLocationTracking } from "../LocationService.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzkYT5S9vAKz8_uxifIPsqnpq0lBiYvHnbEeOkF9NVK0DnXgkB4WzwKhlFfRsmU0kW1/exec";

const HomeScreen = () => {
  const [info, setInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null) // holds user data from async storage
  const navigation = useNavigation(); // Initialize navigation
  const [isCheckingUser, setIsCheckingUser] = useState(true);//to check if the user data exists locally

  // Function to check and load user data
  const checkUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem("userData");
      if (storedData) {
        setUserData(JSON.parse(storedData));
        console.log("User data loaded:", storedData);
      } else {
        console.log("No user data found. Redirecting to Register.");
        navigation.replace("Register"); // Navigate to Register if no data
      }
    }catch (error) {
      console.error("Failed to load user data:", error);
    }finally {
      setIsCheckingUser(false); // Done checking user
    }
  };
  //fetch information from google sheet
  const fetchInformation = async () => {
    setLoading(true);
    try {
      const response = await axios.get(GOOGLE_SHEET_API_URL);
      setInfo(response.data);
    } catch (error) {
      console.error("Failed to fetch information:", error);
      Alert.alert("Error", "Failed to load notices. Please try again.");
    } finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserData();
    startLocationTracking();
    fetchInformation(); // Fetch data when screen loads
  }, []);


  //loading screen till checking of user dat in local storage
  if (isCheckingUser) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#28A745" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Notice Board Section */}
      <Text style={styles.noticeTitle}>Notice Board :</Text>

      {/*to refresh the notice board  */}
      <TouchableOpacity onPress={fetchInformation} style={styles.refreshButton}>
        <Text style={styles.refreshText}>{loading ? "Refreshing..." : "Refresh Data"}</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#28A745" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.noticeContainer}>
          {info.length > 0 ? (
            info.map((item, index) => (
              <View key={index} style={styles.noticeItem}>
                <Text style={styles.noticeHeading}>{item.title || "Notice"}</Text>
                <Text style={styles.noticeDetails}>{item.description || "No details available"}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No data available.</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  noticeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: "#28A745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  refreshText: {
    color: "#fff",
    fontSize: 16,
  },
  noticeContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  noticeItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  noticeHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  noticeDetails: {
    fontSize: 14,
    color: "#555",
    marginTop: 3,
  },
  noDataText: {
    textAlign: "center",
    color: "#999",
  },
});

export default HomeScreen;
