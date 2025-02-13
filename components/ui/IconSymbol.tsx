// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import React from "react";
import { OpaqueColorValue, StyleProp, ViewStyle } from "react-native";

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  "house.fill": "home", // Already mapped
  "paperplane.fill": "send", // Already mapped
  "chevron.left.forwardslash.chevron.right": "code", // Already mapped
  "chevron.right": "chevron-right", // Already mapped
  "star.fill": "star", // Already mapped
  gear: "settings", // Already mapped
  "arrow.down": "arrow-drop-down",
  "arrow.up": "arrow-drop-up", // New arrow down
  // New arrow down
  search: "search", // New search icon
  info: "info", // New info icon
  user: "person", // New user icon
  logout: "exit-to-app", // New logout icon
  add: "add", // New add icon
  home: "home", // New home icon
} as Partial<
  Record<
    import("expo-symbols").SymbolViewProps["name"],
    React.ComponentProps<typeof MaterialIcons>["name"]
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
