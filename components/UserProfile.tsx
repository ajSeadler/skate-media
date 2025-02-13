import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "./ThemedText";

const UserProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          setError("No token found, please log in.");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5001/userProfile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setProfile(data.profile);
      } catch (err) {
        setError(
          "Your profile is incomplete. Please update your profile in settings."
        );
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error)
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );

  return (
    <View style={styles.card}>
      {profile.profile_picture && (
        <Image source={{ uri: profile.profile_picture }} style={styles.image} />
      )}
      <ThemedText type="title" style={styles.name}>
        {profile.first_name} {profile.last_name}
      </ThemedText>
      <ThemedText style={styles.info} type="default">
        Age: {profile.age}
      </ThemedText>
      <ThemedText style={styles.info} type="default">
        Location: {profile.location}
      </ThemedText>
      {profile.bio && (
        <ThemedText style={styles.bio} type="default">
          {profile.bio}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignSelf: "flex-start",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  info: {
    fontSize: 16,
  },
  bio: {
    fontSize: 14,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f7f7f7", // Light gray background for a professional look
    borderRadius: 8,
    margin: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#555", // A darker shade for a more refined look
    textAlign: "center",
  },
});

export default UserProfile;
