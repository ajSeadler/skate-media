import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Animated } from "react-native";

interface Trick {
  id: string;
  name: string;
  status: string;
  difficulty: string;
  description: string;
}

interface ProgressCardProps {
  tricks: Trick[];
}

const ProgressCard: React.FC<ProgressCardProps> = ({ tricks }) => {
  const [showProgress, setShowProgress] = useState(true); // Show progress by default

  // Count mastered and learned tricks
  const masteredCount = tricks.filter(
    (trick) => trick.status === "mastered"
  ).length;
  const totalTricks = tricks.length;

  // Animated value for the progress
  const progressAnimation = new Animated.Value(0);

  // Trigger progress animation
  const startAnimation = (progress: number) => {
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false, // We're animating the width, so we can't use native driver
    }).start();
  };

  // Trigger animation when progress is shown
  useEffect(() => {
    if (showProgress) {
      const progress = totalTricks > 0 ? masteredCount / totalTricks : 0;
      startAnimation(progress); // Start animation based on the progress
    }
  }, [showProgress, masteredCount, totalTricks]);

  // Function to get status color based on trick status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "mastered":
        return "#28a745"; // Green for mastered
      case "learning":
        return "#FFA500"; // Orange for learning
      default:
        return "#ccc"; // Default color for other statuses
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Trick Progress</Text>

      <View style={styles.progressContainer}>
        <Text style={styles.text}>Mastered: {masteredCount}</Text>

        {/* Animated progress bar */}
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"], // Adjust width based on progress
              }),
            },
          ]}
        />
      </View>

      {/* Progress details */}
      {showProgress && (
        <FlatList
          data={tricks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.trickItem}>
              <Text style={styles.trickName}>{item.name}</Text>
              <Text
                style={[
                  styles.trickStatus,
                  { color: getStatusColor(item.status) }, // Apply color based on status
                ]}
              >
                {item.status}
              </Text>
              <Text style={styles.trickDescription}>{item.description}</Text>
            </View>
          )}
        />
      )}

      {/* Motivational Text */}
      {showProgress && masteredCount > 0 && (
        <Text style={styles.motivationalText}>🎉 Keep going, pussy! 🎉</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: 0,
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: "#bbb",
    marginTop: 5,
  },
  progressContainer: {
    width: "100%",
    marginVertical: 10,
  },
  progressBar: {
    height: 8,
    marginTop: 10,
    backgroundColor: "#28a745",
    borderRadius: 4,
  },
  trickItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  trickName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  trickStatus: {
    fontSize: 14,
  },
  trickDescription: {
    fontSize: 14,
    color: "#ccc",
  },
  motivationalText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
    marginBottom: 8,
  },
});

export default ProgressCard;
