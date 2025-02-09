import { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  Button,
  Alert,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import DropdownPickerComponent from "@/components/DropdownPicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import styles from "../styles"; // Import your styles
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { LinearGradient } from "expo-linear-gradient";
import { IconSymbol } from "@/components/ui/IconSymbol";
import React from "react";
import InlineDropdown from "@/components/InlineDropdown";

export default function ProfilePage() {
  const [loginEmail, setLoginEmail] = useState(""); // For login
  const [loginPassword, setLoginPassword] = useState(""); // For login
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null); // For profile data
  const [tricks, setTricks] = useState([]); // For user's tricks
  const [isAuthenticated, setIsAuthenticated] = useState(false); // For managing authentication state
  const [selectedCard, setSelectedCard] = useState(null); // For tracking selected card
  // Tricks data and selection state
  const [selectedTrick, setSelectedTrick] = useState("");

  // Define Quick Access Cards
  const quickAccessCards = [
    {
      Icon: Ionicons,
      title: "Progress",
      iconName: "bar-chart",
      onPress: () =>
        setSelectedCard({
          Icon: Ionicons,
          title: "Progress",
          iconName: "bar-chart",
          details: "Track your trick progress here with detailed stats.",
          iconColor: "#28a745", // Green color for Progress
        }),
      iconColor: "#28a745", // Green color for Progress
    },
    {
      Icon: Ionicons,
      title: "Challenges",
      iconName: "trophy",
      onPress: () =>
        setSelectedCard({
          Icon: Ionicons,
          title: "Challenges",
          iconName: "trophy",
          details: "Participate in skateboarding challenges to push yourself.",
          iconColor: "#FFB400", // Same yellow for Challenges
        }),
      iconColor: "#FFB400", // Same yellow for Challenges
    },
    {
      Icon: Ionicons,
      title: "Recovery",
      iconName: "medkit",
      onPress: () =>
        setSelectedCard({
          Icon: Ionicons,
          title: "Recovery",
          iconName: "medkit",
          details: "View your recovery plans and progress.",
          iconColor: "#FF0000", // Red color for Recovery
        }),
      iconColor: "#FF0000", // Red color for Recovery
    },
    {
      Icon: Ionicons,
      title: "Statistics",
      iconName: "analytics",
      onPress: () =>
        setSelectedCard({
          Icon: Ionicons,
          title: "Statistics",
          iconName: "analytics",
          details: "Analyze your overall fitness statistics.",
          iconColor: "#1E90FF", // Blue color for Statistics
        }),
      iconColor: "#1E90FF", // Blue color for Statistics
    },
  ];

  // Handle form submission for login
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      Alert.alert("Error", "Both fields are required.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token in AsyncStorage
        await AsyncStorage.setItem("token", data.token);

        Alert.alert("Success", "Login successful!");
        setIsAuthenticated(true); // Mark user as authenticated
        fetchProfile(data.token);
        fetchUserTricks(data.token); // Fetch profile after successful login
      } else {
        Alert.alert("Error", data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile data after login
  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5001/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfileData(data.user); // Assuming the profile data is inside `user`
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Unable to fetch profile data.");
    }
  };

  // Fetch user's tricks after login
  const fetchUserTricks = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5001/myTricks", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tricks");
      }

      const data = await response.json();
      setTricks(data.tricks); // Assuming the tricks are in the `tricks` key
    } catch (error) {
      console.error("Error fetching tricks:", error);
      Alert.alert("Error", "Unable to fetch tricks.");
    }
  };

  // Handle logout by clearing AsyncStorage and updating state
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setIsAuthenticated(false);
      setProfileData(null); // Clear profile data after logout
      Alert.alert("Logged out", "You have successfully logged out.");
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Unable to log out.");
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        fetchProfile(token); // Fetch profile data
        fetchUserTricks(token); // Fetch fresh trick data
      }
    };

    checkAuthStatus();
  }, []);

  const trickOptions = tricks.map((trick) => ({
    label: trick.name,
    value: trick.id,
  }));

  const selectedTrickInfo = tricks.find((trick) => trick.id === selectedTrick);

  return (
    <ScrollView style={styles.containerMain}>
      <ThemedView style={styles.container}>
        {/* Conditionally render the title, message, and login form based on isAuthenticated */}
        {!isAuthenticated && (
          <>
            <ThemedView style={styles.titleContainer}>
              <ThemedText type="title">Welcome to SkateMedia!</ThemedText>
            </ThemedView>

            <ThemedText style={styles.subtitle}>
              Please log in to access your profile.
            </ThemedText>

            {/* Login Form */}
            <ThemedView style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={loginEmail}
                onChangeText={setLoginEmail}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Logging In..." : "Log In"}
                  </Text>
                </TouchableOpacity>
                {isLoading && (
                  <ActivityIndicator size="small" color="#FFB400" />
                )}
              </View>
            </ThemedView>
          </>
        )}

        {/* Profile Display */}
        {isAuthenticated && profileData && (
          <ThemedView style={styles.profileContainer}>
            <View style={styles.profileCard}>
              <Text style={styles.profileName}>@{profileData.username}</Text>
              <Text style={styles.profileEmail}>{profileData.email}</Text>
            </View>
            {/* Display Tricks */}
            {/* Inline Dropdown for Trick Selection */}
            <InlineDropdown
              items={trickOptions}
              selectedValue={selectedTrick}
              setSelectedValue={setSelectedTrick}
            />
            {/* Trick Details (if one is selected) */}
            {selectedTrickInfo && (
              <View style={localStyles.trickDetails}>
                <Text style={localStyles.trickTitle}>
                  {selectedTrickInfo.name}
                </Text>
                <Text style={localStyles.trickDifficulty}>
                  Difficulty: {selectedTrickInfo.difficulty}
                </Text>
                <Text style={localStyles.trickDescription}>
                  {selectedTrickInfo.description}
                </Text>
              </View>
            )}
            ;{/* Quick Access Cards */}
            <View style={styles.cards}>
              {quickAccessCards.map((card, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.card}
                  onPress={card.onPress} // Update to call the onPress for the card
                >
                  <card.Icon
                    name={card.iconName}
                    size={40}
                    color={card.iconColor}
                    style={styles.cardIcon}
                  />
                  <Text style={styles.cardTitle}>{card.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {selectedCard && (
              <View style={styles.selectedCardContainer}>
                <View style={styles.selectedCard}>
                  <selectedCard.Icon
                    name={selectedCard.iconName}
                    size={60}
                    color={selectedCard.iconColor} // Set the icon color dynamically
                    style={styles.selectedCardIcon}
                  />
                  <Text style={styles.selectedCardTitle}>
                    {selectedCard.title}
                  </Text>
                  <Text style={styles.selectedCardDetails}>
                    {selectedCard.details}
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.logoutButtonContainer}>
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogout}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Logging Out..." : "Log Out"}
                </Text>
              </TouchableOpacity>
              {isLoading && <ActivityIndicator size="small" color="#FFB400" />}
            </View>
            {/* Logout Button */}
          </ThemedView>
        )}

        {/* Full View of Selected Card */}
      </ThemedView>
    </ScrollView>
  );
}

// Local styles for trick details display
const localStyles = StyleSheet.create({
  trickDetails: {
    marginVertical: 15,
    marginHorizontal: 15,
    padding: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  trickTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  trickDifficulty: {
    fontSize: 16,
    marginBottom: 5,
    color: "#ccc",
  },
  trickDescription: {
    fontSize: 14,
    color: "#ddd",
  },
});
