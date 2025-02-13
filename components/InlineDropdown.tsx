import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";
import { ThemedText } from "./ThemedText";
interface DropdownItem {
  label: string;
  value: string;
}

interface InlineDropdownProps {
  items: DropdownItem[];
  selectedValue: string;
  setSelectedValue: (value: string) => void;
}

const InlineDropdown: React.FC<InlineDropdownProps> = ({
  items,
  selectedValue,
  setSelectedValue,
}) => {
  const [open, setOpen] = useState(false); // Start closed
  const color = "#fff";

  return (
    <View style={styles.container}>
      {/* Dropdown Header */}
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.header}>
        <ThemedText style={styles.headerText} type="default">
          My Tricks
        </ThemedText>
        {/* Toggle arrow based on the open state */}
        <IconSymbol
          size={28}
          name={open ? "arrow-up" : "arrow-down"} // Change icon name based on open state
          color={color}
        />
      </TouchableOpacity>

      {/* Dropdown List (renders inline, pushing content down) */}
      {open && (
        <View style={styles.listContainer}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={item.value}
              style={styles.listItem}
              onPress={() => {
                setSelectedValue(item.value);
                setOpen(false);
              }}
            >
              <ThemedText style={styles.itemText} type="default">
                {item.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    marginHorizontal: 15,
  },
  header: {
    borderWidth: 2,
    display: "flex",
    flexDirection: "row",
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    alignItems: "center", // Ensure items are vertically aligned
    justifyContent: "space-between", // Distribute space between text and icon
  },
  headerText: {
    fontSize: 16,
  },
  listContainer: {
    borderWidth: 1,
    borderColor: "#555",
    borderTopWidth: 0,
    borderRadius: 5,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#666",
  },
  itemText: {
    fontSize: 16,
  },
});

export default InlineDropdown;
