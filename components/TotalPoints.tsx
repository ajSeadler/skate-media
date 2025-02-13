import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";

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

interface TotalPointsProps {
  tricks: Trick[];
}

const TotalPoints: React.FC<TotalPointsProps> = ({ tricks }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await fetch("http://localhost:5001/challenges");
        const data = await response.json();
        setChallenges(data.challenges);
      } catch (err) {
        console.error("Error fetching challenges:", err);
      }
    };

    fetchChallenges();
  }, []);

  useEffect(() => {
    const masteredCount = tricks.filter(
      (trick) => trick.status === "mastered"
    ).length;

    const calculateTotalPoints = () => {
      let points = 0;
      challenges.forEach((challenge) => {
        const requiredCount =
          challenge.difficulty === "Easy"
            ? 5
            : challenge.difficulty === "Medium"
            ? 10
            : challenge.difficulty === "Hard"
            ? 20
            : Infinity;

        if (masteredCount >= requiredCount) {
          points += challenge.reward_points;
        }
      });
      setTotalPoints(points);
    };

    if (challenges.length > 0) {
      calculateTotalPoints();
    }
  }, [tricks, challenges]);

  return (
    <View style={styles.container}>
      <ThemedText>
        {" "}
        <Ionicons name="trophy" size={24} />
      </ThemedText>
      <ThemedText style={styles.points}>{totalPoints} Points</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 3,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: "flex-start",
  },
  points: {
    fontSize: 16,
    fontWeight: "600",
    // color: "#FFD700",
    marginLeft: 6,
  },
});

export default TotalPoints;
