import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { getDatabase, ref, update } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { database } from "./firebaseConfig";
import { Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";

const LOCATION_TASK_NAME = "background-location-task";

// Define Background Task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("TaskManager Error:", error);
    return;
  }

  console.log("Background task executed!");
  if (data?.locations?.length > 0) {
    const { latitude, longitude } = data.locations[0].coords;
    console.log("New Location:", latitude, longitude);
    // Get Device ID from local storage
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) return;

    const { deviceId } = JSON.parse(userData);

    // Check if Firebase is initialized
    if (!database) {
      console.error("Firebase database not initialized.");
      return;
    }

    // Update Firebase with new location
    try {
      const dbRef = ref(database, "users/" + deviceId);
      await update(dbRef, { latitude, longitude, timestamp: Date.now() });
      console.log("Firebase updated successfully!");
    } catch (err) {
      console.error("Firebase update failed:", err);
    }
    console.log(`Updated Location: ${latitude}, ${longitude}`);
  }
});

// Start location tracking
export const startLocationTracking = async () => {
  console.log("Requesting location permissions...");

  // Request notification permission
  const { status : notificationStatus } = await Notifications.requestPermissionsAsync();
  if (notificationStatus !== "granted") {
    Alert.alert("Notification Permission", "Please enable notifications for tracking alerts.");
    return;
  }
  // Request foreground location permission
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== "granted") {
    Alert.alert("Permission Denied", "Please enable location to track your device.");
    return;
  }

  // Request background location permission
  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== "granted") {
    Alert.alert(
      "Background Location Needed",
      "Please enable background location for continuous tracking."
    );
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  console.log("Is task already registered?", isRegistered);
  if (!isRegistered) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 50,//to update when the device moves 50 m
      // timeInterval: 15 * 60 * 1000,
      timeInterval: 2 * 60 * 1000, // for testing interval is 2 minutes, remove this and uncomment the above line for 15 minutes
      showsBackgroundLocationIndicator: true,//background tracking notif indicator
      //mandatory foreground running notif
      foregroundService: {
        notificationTitle: "Tracking Active",
        notificationBody: "Your location is being tracked.",
        notificationColor: "#FF5733",
      },
    });
    console.log("Background location tracking started!");
  } else {
    console.log("Background location tracking is already active.");
  }
};
