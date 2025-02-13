import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";

interface Trick {
  id: string;
  name: string;
  status: string;
  difficulty: string;
  description: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  reward_points: number;
}

interface ChallengeCardProps {
  tricks: Trick[];
  videoUploaded: boolean; // Track whether the video has been uploaded
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  tricks,
  videoUploaded,
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]); // State to hold challenges

  // Fetch challenges from the backend
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await fetch("http://localhost:5001/challenges");
        const data = await response.json();
        console.log("Fetched data:", data); // Log the data to inspect the format
        setChallenges(data.challenges); // Set challenges data correctly
      } catch (err) {
        console.error("Error fetching challenges:", err);
      }
    };

    fetchChallenges();
  }, []);

  // Count mastered tricks
  const masteredCount = tricks.filter(
    (trick) => trick.status === "mastered"
  ).length;

  // Determine progress for a single challenge based on difficulty and mastered tricks
  const getChallengeProgress = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return Math.min(masteredCount / 5, 1); // Example: 5 easy tricks to complete the challenge
      case "Medium":
        return Math.min(masteredCount / 10, 1); // Example: 10 medium tricks
      case "Hard":
        return Math.min(masteredCount / 20, 1); // Example: 20 hard tricks
      default:
        return 0;
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Challenges</Text>
      {challenges.map((challenge) => {
        const progress = getChallengeProgress(challenge.difficulty);

        return (
          <View key={challenge.id} style={styles.challengeContainer}>
            <Text style={styles.challengeTitle}>{challenge.name}</Text>
            <Text style={styles.challengeDescription}>
              {challenge.description}
            </Text>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: `${progress * 100}%`, // Animate width based on progress
                  },
                ]}
              />
            </View>
            <Text style={styles.rewardText}>
              {challenge.reward_points} points
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const { width } = Dimensions.get("window"); // Get the device width

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    padding: 0,
    borderRadius: 16,

    width: "100%", // Ensures the card spans full width of the screen
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  challengeContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,

    width: width * 0.9, // Set the width to 90% of the device width
    alignSelf: "center", // Centers the container horizontally
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 5,
  },
  progressBarContainer: {
    width: "100%",
    height: 10,
    backgroundColor: "#444",
    borderRadius: 5,
    marginTop: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#28a745", // Blue color for progress
    borderRadius: 5,
  },
  rewardText: {
    fontSize: 16,
    color: "#fff",
    marginTop: 12,
    fontWeight: "bold",
    textAlign: "left",
  },
});

export default ChallengeCard;
