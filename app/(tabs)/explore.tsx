import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  Button,
  Alert,
  View,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function TabTwoScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState(""); // For login
  const [loginPassword, setLoginPassword] = useState(""); // For login
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission for sign up
  const handleSignUp = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email.");
      return;
    }

    // Password length validation
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5001/addUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Success",
          `User ${data.user.username} created successfully!`
        );
        // Optionally reset form fields
        setUsername("");
        setEmail("");
        setPassword("");
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
        await AsyncStorage.setItem("token", data.token); // Assuming `data.token` contains the JWT

        Alert.alert("Success", "Login successful!");
        // Optionally navigate to the profile page or dashboard after login
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

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Sign Up</ThemedText>
      </ThemedView>

      <ThemedText>
        Create your account to get started with Skate Media.
      </ThemedText>

      {/* Sign Up Form */}
      <ThemedView style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.buttonContainer}>
          <Button
            title={isLoading ? "Submitting..." : "Sign Up"}
            onPress={handleSignUp}
            disabled={isLoading}
          />
          {isLoading && <ActivityIndicator size="small" color="#06BA63" />}
        </View>
      </ThemedView>

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
          <Button
            title={isLoading ? "Logging In..." : "Log In"}
            onPress={handleLogin}
            disabled={isLoading}
          />
          {isLoading && <ActivityIndicator size="small" color="#06BA63" />}
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  formContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: "center",
  },
  input: {
    width: "100%",
    color: "#222",
    height: 40,
    marginVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    fontSize: 16,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 15,
    alignItems: "center",
  },
});
