import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Trick } from "./types";
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [tricks, setTricks] = useState<Trick[]>([]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("token", data.token);
        setIsAuthenticated(true);
        fetchProfile(data.token);
        fetchUserTricks(data.token);
      } else {
        throw new Error(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      throw new Error("Unable to connect to the server.");
    }
  };

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5001/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setProfileData(data.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw new Error("Unable to fetch profile data.");
    }
  };

  const fetchUserTricks = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5001/myTricks", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTricks(data.tricks);
    } catch (error) {
      console.error("Error fetching tricks:", error);
      throw new Error("Unable to fetch tricks.");
    }
  };

  return {
    isAuthenticated,
    profileData,
    tricks,
    login,
    fetchProfile,
    fetchUserTricks,
  };
};
