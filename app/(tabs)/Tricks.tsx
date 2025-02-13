import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TricksPage = () => {
  const [tricks, setTricks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchTricks = async () => {
      try {
        const response = await fetch("http://localhost:5001/tricks"); // API to get available tricks
        if (!response.ok) {
          throw new Error("Failed to fetch tricks");
        }
        const data = await response.json();
        setTricks(data.tricks);
      } catch (err) {
        setError("Failed to fetch tricks");
      } finally {
        setLoading(false);
      }
    };

    fetchTricks();
  }, []);

  const addTrickToUser = async (trickId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setIsModalVisible(true); // Show the modal if the user is not signed in
        return;
      }

      const response = await fetch("http://localhost:5001/addTrick", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trick_id: trickId }), // Ensure correct data format
      });

      const responseData = await response.json();
      console.log("Response Data:", responseData); // Log the server response

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to add trick");
      }

      Alert.alert("Success", "Trick added to your account!");
    } catch (err) {
      console.error("Error adding trick:", err);
      Alert.alert("Error", err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFD700" />
        <ThemedText style={styles.loadingText}>Loading tricks...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tricks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <ThemedText type="title" style={styles.cardTitle}>
              {item.name}
            </ThemedText>
            <ThemedText type="default" style={styles.cardDescription}>
              {item.description}
            </ThemedText>
            {/* Custom Button */}
            <TouchableOpacity
              style={styles.customButton}
              onPress={() => addTrickToUser(item.id)}
            >
              <ThemedText
                type="defaultSemiBold"
                style={styles.customButtonText}
              >
                Add Trick
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal for not signed in */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="title" style={styles.modalText}>
              You need to sign in or create an account to add tricks to your
              profile.
            </ThemedText>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsModalVisible(false)}
              >
                <ThemedText type="link" style={styles.modalButtonText}>
                  Close
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 5,
  },
  loadingText: {
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  customButton: {
    backgroundColor: "#392F5A", // Norton 360 yellow color
    padding: 5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  customButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: "#333",
    width: "80%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    color: "#fff",
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
  },
});

export default TricksPage;
