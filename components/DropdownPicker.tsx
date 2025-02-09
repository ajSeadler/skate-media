import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { View, StyleSheet } from "react-native";

interface DropdownPickerProps {
  items: { label: string; value: string }[];
  selectedValue: string;
  setSelectedValue: (value: string) => void;
}

const DropdownPickerComponent: React.FC<DropdownPickerProps> = ({
  items,
  selectedValue,
  setSelectedValue,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <DropDownPicker
        open={open}
        value={selectedValue}
        items={items}
        setOpen={setOpen}
        setValue={(callback) => {
          const newValue =
            typeof callback === "function" ? callback(selectedValue) : callback;
          setSelectedValue(newValue);
        }}
        style={styles.dropdown}
        placeholder="Select an option"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  dropdown: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default DropdownPickerComponent;
