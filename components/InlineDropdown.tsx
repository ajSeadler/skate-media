import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

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
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      {/* Dropdown Header */}
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.header}>
        <Text style={styles.headerText}>
          {selectedValue
            ? items.find((item) => item.value === selectedValue)?.label
            : "View Your Tricks"}
        </Text>
      </TouchableOpacity>

      {/* Dropdown List (renders inline, pushing content down) */}
      {open && (
        <View style={styles.listContainer}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={styles.listItem}
              onPress={() => {
                setSelectedValue(item.value);
                setOpen(false);
              }}
            >
              <Text style={styles.itemText}>{item.label}</Text>
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
    borderWidth: 1,
    borderColor: "#ddd", // Darker border color
    padding: 10,
    borderRadius: 8,
    // Removed backgroundColor for a transparent container
  },
  headerText: {
    fontSize: 16,
    color: "#f0f0f0", // Light text on a dark theme
  },
  listContainer: {
    borderWidth: 1,
    borderColor: "#555",
    borderTopWidth: 0,
    borderRadius: 5,
    // Removed backgroundColor for a transparent container
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#666", // Darker divider color
  },
  itemText: {
    fontSize: 16,
    color: "#f0f0f0", // Light text on a dark theme
  },
});

export default InlineDropdown;
