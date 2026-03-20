import React, { useEffect } from "react";
import { View, StyleSheet, useColorScheme } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export function LoadingSpinner({ size = 24, color }: LoadingSpinnerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const spinnerColor = color ?? theme.tint;
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 800, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: size / 8,
            borderColor: `${spinnerColor}30`,
            borderTopColor: spinnerColor,
          },
          animStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  spinner: {},
});
