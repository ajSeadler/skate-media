import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  containerMain: {
    flex: 1,
    height: "100%",
  },
  container: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    textAlign: "center",
    alignContent: "center",
    backgroundColor: "transparent",
  },
  gradientBackground: {
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    marginBottom: 30,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
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
    backgroundColor: "transparent",
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
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    backgroundColor: "transparent",
    shadowOpacity: 0.1,
    paddingBottom: 100,
    shadowRadius: 12,
    elevation: 4,
  },
  profileCard: {
    backgroundColor: "transparent", // White background for a clean look
    marginTop: 20,
    borderRadius: 12, // Rounded corners
    padding: 20, // Internal spacing
    borderBottomWidth: 2,
    borderBottomColor: "#666",
    width: "100%", // Adjust width as needed
    margin: "auto",
    alignSelf: "center", // Center horizontally
  },
  profileName: {
    fontSize: 24, // Larger font size for emphasis
    fontWeight: "bold",
    color: "#fff", // Dark text for contrast
    marginBottom: 8, // Spacing below the name
  },
  profileEmail: {
    fontSize: 16,
    color: "#ccc", // Lighter color for secondary text
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
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  card: {
    width: "45%",
    marginBottom: 15,
    padding: 20,
    backgroundColor: "#222",
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
  tricksContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#666",
  },
  trickCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5, // Android shadow
  },
  trickCardHover: {
    transform: [{ translateY: -5 }],
  },
  trickName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  trickTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 28,
    marginBottom: 20,
  },

  trickDifficulty: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  trickDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  trickDate: {
    fontSize: 14,
    color: "#999",
    marginTop: 10,
    textAlign: "right",
  },
  /** NEW STYLES FOR HORIZONTAL SCROLL **/
  trickList: {
    width: width, // Ensure each trick takes the full screen width
  },
  trickItem: {
    width: width - 60, // Slight padding to prevent cutoff
    padding: 20,
    backgroundColor: "#222",
    borderRadius: 10,
    marginRight: 20, // Space between items
  },
});

export default styles;
