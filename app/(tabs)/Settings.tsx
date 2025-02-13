import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/ThemedText";
import { useNavigation } from "@react-navigation/native"; // Import the navigation hook

const Settings: React.FC = () => {
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    age: "",
    bio: "",
    location: "",
  });

  const [saving, setSaving] = useState(false);
  const navigation = useNavigation(); // Initialize the navigation hook

  const handleChange = (key: string, value: string) => {
    setProfile({ ...profile, [key]: value });
  };

  const handleSubmit = async () => {
    setSaving(true);

    try {
      const token = await AsyncStorage.getItem("token");
      console.log("Token being sent:", token);

      if (!token) {
        Alert.alert("Error", "No token found. Please log in.");
        return;
      }

      const response = await fetch("http://localhost:5001/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        Alert.alert("Success", "Profile updated successfully!");
      } else {
        Alert.alert("Error", data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token"); // Remove the token from AsyncStorage
      Alert.alert("Logged Out", "You have been logged out.");
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Failed to log out.");
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.header}>Profile Settings</ThemedText>

      <ThemedText style={styles.label}>First Name:</ThemedText>
      <TextInput
        style={styles.input}
        value={profile.first_name}
        onChangeText={(text) => handleChange("first_name", text)}
      />

      <ThemedText style={styles.label}>Last Name:</ThemedText>
      <TextInput
        style={styles.input}
        value={profile.last_name}
        onChangeText={(text) => handleChange("last_name", text)}
      />

      <ThemedText style={styles.label}>Age:</ThemedText>
      <TextInput
        style={styles.input}
        value={profile.age}
        keyboardType="numeric"
        onChangeText={(text) => handleChange("age", text)}
      />

      <ThemedText style={styles.label}>Bio:</ThemedText>
      <TextInput
        style={styles.textArea}
        value={profile.bio}
        onChangeText={(text) => handleChange("bio", text)}
        multiline
      />

      <ThemedText style={styles.label}>Location:</ThemedText>
      <TextInput
        style={styles.input}
        value={profile.location}
        onChangeText={(text) => handleChange("location", text)}
      />

      <Button title="Save" onPress={handleSubmit} disabled={saving} />
      {saving && <ActivityIndicator size="large" color="#0000ff" />}

      <Button title="Log Out" onPress={handleLogout} color="#ff6347" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#666",
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    height: 80,
  },
});

export default Settings;
