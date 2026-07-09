import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ICONS = {
  home: "home-outline",
  booking: "calendar-outline",
  coupons: "pricetag-outline",
  profile: "person-outline",
  wallet: "wallet-outline",
  settings: "settings-outline",
  help: "help-circle-outline",
  logout: "log-out-outline",
  bell: "notifications-outline",
  menu: "menu-outline",
  chevron: "chevron-back-outline",
  chevron_right: "chevron-forward-outline",
  check: "checkmark-circle-outline",
  trash: "trash-outline",
  chart: "bar-chart-outline",
  income: "cash-outline",
  balance: "stats-chart-outline",
  edit: "create-outline",
  plus: "add-outline",
  minus: "remove-outline",
  clock: "time-outline",
  food: "fast-food-outline",
  phone: "call-outline",
  expenditure: "trending-down-outline",
  income_chart: "trending-up-outline",
  scales: "scale-outline",
  exit: "exit-outline",
};

export function CustomIcon({ name, size = 20, color = "#6B7280", style }) {
  const iconName = ICONS[name] || "ellipse-outline";
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={iconName} size={size} color={color} />
    </View>
  );
}

export function ColoredIcon({ name, colorTheme = "green", size = 18 }) {
  const themes = {
    green: { bg: "#E8F5E9", fg: "#168A3A" },
    blue: { bg: "#E8F1FF", fg: "#1D4ED8" },
    orange: { bg: "#FFF3E0", fg: "#D97706" },
    purple: { bg: "#F3E8FF", fg: "#7C3AED" },
    grey: { bg: "#F3F4F6", fg: "#374151" },
    red: { bg: "#FEE2E2", fg: "#DC2626" },
    amber: { bg: "#FEF3C7", fg: "#B45309" },
  };
  const selectedTheme = themes[colorTheme] || themes.grey;

  return (
    <View style={[styles.coloredBg, { backgroundColor: selectedTheme.bg }]}>
      <CustomIcon name={name} size={size} color={selectedTheme.fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  coloredBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

