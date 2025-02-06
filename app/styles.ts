import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    marginBottom: 30,
    marginTop: 100,
  },
  subtitle: {
    color: "#b0b0b0",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
  },
  formContainer: {
    padding: 25,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    width: "100%",
    height: 45,
    marginVertical: 15,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#333333", // Dark input background
    color: "#FFFFFF",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 15,
    alignItems: "center",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    backgroundColor: "#399E5A", // Green color
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#999999", // Disabled button color
  },
  buttonText: {
    fontSize: 18,
    color: "#222",
    fontWeight: "600",
  },
  profileContainer: {
    marginTop: 30,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  profileText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  cards: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  card: {
    width: "45%",
    marginBottom: 15,
    padding: 20,
    backgroundColor: "#333",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  logoutButtonContainer: {
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: "#FF6663",
  },
  selectedCardContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  selectedCard: {
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCardIcon: {
    marginBottom: 12,
  },
  selectedCardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  selectedCardDetails: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
  },
});

export default styles;
