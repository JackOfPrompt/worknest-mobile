import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  size?: "sm" | "md";
}

const variantColors: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: { bg: "#F1F5F9", text: "#64748B", border: "#E2E8F0" },
  success: { bg: Colors.successLight, text: "#16A34A", border: "#BBF7D0" },
  warning: { bg: Colors.warningLight, text: "#B45309", border: "#FDE68A" },
  danger: { bg: Colors.dangerLight, text: "#DC2626", border: "#FECACA" },
  info: { bg: Colors.brandLight, text: Colors.brand, border: "#BFDBFE" },
};

export function Badge({ label, variant = "default", style, size = "md" }: BadgeProps) {
  const colors = variantColors[variant];
  const isSmall = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingHorizontal: isSmall ? 6 : 10,
          paddingVertical: isSmall ? 2 : 4,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: colors.text,
            fontSize: isSmall ? 10 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
  },
});
