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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import styles from "../styles"; // Import your styles
import React from "react";
import InlineDropdown from "@/components/InlineDropdown";
import ProgressCard from "@/components/ProgressCard";
import ChallengesCard from "@/components/ChallengesCard";
import TotalPoints from "@/components/TotalPoints";
import UserProfile from "@/components/UserProfile";

export default function ProfilePage() {
  const [loginEmail, setLoginEmail] = useState(""); // For login
  const [loginPassword, setLoginPassword] = useState(""); // For login
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null); // For profile data
  const [tricks, setTricks] = useState<Trick[]>([]); // Explicitly set the type of tricks
  const [isAuthenticated, setIsAuthenticated] = useState(false); // For managing authentication state
  interface Card {
    Icon: React.ComponentType<any>;
    title: string;
    iconName: string;
    iconColor: string;
    details?: string;
    component?: React.ReactNode;
  }

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Tricks data and selection state
  const [selectedTrick, setSelectedTrick] = useState("");

  interface Trick {
    id: string;
    name: string;
    status: string;
    difficulty: string;
    description: string;
  }

  // Define Quick Access Cards
  const quickAccessCards = [
    {
      Icon: Ionicons,
      title: "Progress",
      iconName: "bar-chart",
      iconColor: "#28a745", // Green color for Progress
      onPress: () => {
        setSelectedCard((prevSelectedCard) =>
          prevSelectedCard?.title === "Progress"
            ? null // Close the card if it's already open
            : {
                Icon: Ionicons,
                title: "Progress",
                iconName: "bar-chart",
                details: "Track your trick progress here with detailed stats.",
                iconColor: "#28a745", // Green color for Progress
                component: <ProgressCard tricks={tricks} />,
              }
        );
      },
    },
    {
      Icon: Ionicons,
      title: "Challenges",
      iconName: "trophy",
      iconColor: "#FFB400", // Yellow for Challenges
      onPress: () => {
        setSelectedCard((prevSelectedCard) =>
          prevSelectedCard?.title === "Challenges"
            ? null // Close the card if it's already open
            : {
                Icon: Ionicons,
                title: "Challenges",
                iconName: "trophy",
                iconColor: "#FFB400", // Yellow for Challenges
                component: (
                  <ChallengesCard tricks={tricks} videoUploaded={false} />
                ),
              }
        );
      },
    },
    {
      Icon: Ionicons,
      title: "Recovery",
      iconName: "medkit",
      iconColor: "#FF0000", // Red for Recovery
      onPress: () => {
        setSelectedCard((prevSelectedCard) =>
          prevSelectedCard?.title === "Recovery"
            ? null // Close the card if it's already open
            : {
                Icon: Ionicons,
                title: "Recovery",
                iconName: "medkit",
                details: "View your recovery plans and progress.",
                iconColor: "#FF0000", // Red for Recovery
              }
        );
      },
    },
    {
      Icon: Ionicons,
      title: "Statistics",
      iconName: "analytics",
      iconColor: "#1E90FF", // Blue for Statistics
      onPress: () => {
        setSelectedCard((prevSelectedCard) =>
          prevSelectedCard?.title === "Statistics"
            ? null // Close the card if it's already open
            : {
                Icon: Ionicons,
                title: "Statistics",
                iconName: "analytics",
                details: "Analyze your overall fitness statistics.",
                iconColor: "#1E90FF", // Blue for Statistics
              }
        );
      },
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
      console.log(
        "Login Request:",
        JSON.stringify({ email: loginEmail, password: loginPassword })
      );

      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();
      console.log("Response Status:", response.status);
      console.log("Response Data:", data);

      if (response.ok) {
        await AsyncStorage.setItem("token", data.token);
        Alert.alert("Success", "Login successful!");
        setIsAuthenticated(true);
        fetchProfile(data.token);
        fetchUserTricks(data.token);
      } else {
        Alert.alert("Error", data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Login Error:", error);
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

  const updateTrickStatus = async (trick_id: string, status: string) => {
    if (!trick_id || !status) {
      Alert.alert("Error", "Invalid trick or status");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://localhost:5001/updateTrickStatus", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trick_id, status }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the tricks array with the new status
        setTricks((prevTricks) =>
          prevTricks.map((trick) =>
            trick.id === trick_id
              ? { ...trick, status: data.updatedTrick.status }
              : trick
          )
        );
        Alert.alert("Success", "Trick status updated successfully!");
      } else {
        Alert.alert("Error", data.error || "Failed to update trick status");
      }
    } catch (error) {
      console.error("Error updating trick status:", error);
      Alert.alert("Error", "Unable to update trick status");
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
              <UserProfile />

              <TotalPoints tricks={tricks} />
              <View style={styles.logoutButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.logoutButton,
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleLogout}
                  disabled={isLoading}
                >
                  <ThemedText style={styles.logoutButtonText} type="link">
                    {isLoading ? "Logging Out..." : "Log Out"}
                  </ThemedText>
                </TouchableOpacity>
                {isLoading && (
                  <ActivityIndicator size="small" color="#FFB400" />
                )}
              </View>
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
                <ThemedText style={localStyles.trickTitle} type="title">
                  {selectedTrickInfo.name}
                </ThemedText>
                <ThemedText style={localStyles.trickDifficulty} type="default">
                  Status: {selectedTrickInfo.status}
                </ThemedText>
                <Text style={localStyles.trickDifficulty}>
                  Difficulty: {selectedTrickInfo.difficulty}
                </Text>
                <ThemedText style={localStyles.trickDescription} type="default">
                  {selectedTrickInfo.description}
                </ThemedText>

                {/* Button to update trick status */}
                <TouchableOpacity
                  style={[
                    localStyles.actionButton,
                    isLoading && localStyles.actionButtonDisabled,
                    selectedTrickInfo.status === "mastered"
                      ? localStyles.actionButtonMastered // Green button for mastered status
                      : localStyles.actionButtonUnmastered, // Regular button for unmastered
                  ]}
                  onPress={() =>
                    updateTrickStatus(selectedTrickInfo.id, "mastered")
                  }
                  disabled={
                    isLoading || selectedTrickInfo.status === "mastered"
                  } // Disable if already mastered
                >
                  <Text
                    style={[
                      localStyles.actionButtonText,
                      isLoading && localStyles.actionButtonTextDisabled,
                      selectedTrickInfo.status === "mastered"
                        ? localStyles.actionButtonTextMastered // Green text for mastered
                        : localStyles.actionButtonTextUnmastered, // Regular text for unmastered
                    ]}
                  >
                    {isLoading
                      ? "Updating..."
                      : selectedTrickInfo.status === "mastered"
                      ? "Mastered"
                      : "Mark as Mastered"}
                  </Text>
                </TouchableOpacity>

                {isLoading && (
                  <ActivityIndicator size="small" color="#FFB400" />
                )}
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
                  {/* <Text style={styles.selectedCardTitle}>
                    {selectedCard.title}
                  </Text> */}

                  <div>{selectedCard.component}</div>
                </View>
              </View>
            )}
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
    borderColor: "#fff",
    borderRadius: 8,
  },
  trickTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  trickDifficulty: {
    fontSize: 13,
    marginBottom: 2,
  },
  trickDescription: {
    fontSize: 16,
  },
  // Regular button styles
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#FFB400", // Neutral button color for unmastered
  },
  actionButtonDisabled: {
    backgroundColor: "#D3D3D3", // Disabled button color
  },

  // Green (celebratory) button for mastered
  actionButtonMastered: {
    backgroundColor: "#28a745", // Green color for mastered status

    marginTop: 10,
  },

  // Regular button for unmastered
  actionButtonUnmastered: {
    backgroundColor: "#FFB400", // Neutral button color for unmastered
    marginTop: 10,
  },

  // Text styles
  actionButtonText: {
    color: "#FFFFFF", // Default text color
    fontSize: 16,
    textAlign: "center",
  },
  actionButtonTextDisabled: {
    color: "#A9A9A9", // Disabled text color
  },

  // Green text for mastered
  actionButtonTextMastered: {
    color: "#FFFFFF", // White text on green
  },

  // Regular text for unmastered
  actionButtonTextUnmastered: {
    color: "#FFFFFF", // Regular white text
  },
});
