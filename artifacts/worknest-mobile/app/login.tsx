import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Colors } from "@/constants/colors";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      setError(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : "#0A1628" }]}>
      <LinearGradient
        colors={isDark ? ["#0A1628", "#0F1E3C", "#0A1628"] : ["#0A1628", "#1A3A6E", "#0D2254"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="briefcase-check" size={36} color="#fff" />
            </View>
            <Text style={styles.appName}>WorkNest</Text>
            <Text style={styles.tagline}>Your workplace, unified</Text>
          </View>

          <View style={[styles.card, { backgroundColor: isDark ? Colors.dark.card : "rgba(255,255,255,0.06)", borderColor: isDark ? Colors.dark.border : "rgba(255,255,255,0.12)" }]}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Sign in to continue</Text>

            <View style={styles.fields}>
              <View style={[
                styles.inputWrapper,
                {
                  borderColor: focused === "email"
                    ? Colors.brand
                    : error
                    ? Colors.danger
                    : "rgba(255,255,255,0.15)",
                  backgroundColor: "rgba(255,255,255,0.06)",
                },
              ]}>
                <Feather name="mail" size={18} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Work email"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={[
                styles.inputWrapper,
                {
                  borderColor: focused === "password"
                    ? Colors.brand
                    : error
                    ? Colors.danger
                    : "rgba(255,255,255,0.15)",
                  backgroundColor: "rgba(255,255,255,0.06)",
                },
              ]}>
                <Feather name="lock" size={18} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={18}
                    color="rgba(255,255,255,0.5)"
                  />
                </Pressable>
              </View>

              {error && (
                <View style={styles.errorRow}>
                  <Feather name="alert-circle" size={14} color={Colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.loginBtn,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={[Colors.brand, Colors.brandDark]}
                style={styles.loginBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <LoadingSpinner size={22} color="#fff" />
                ) : (
                  <Text style={styles.loginBtnText}>Sign In</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          <Text style={styles.footerText}>
            Contact your HR team if you need access
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  appName: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
    marginTop: 4,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
    marginBottom: 28,
  },
  fields: { gap: 12, marginBottom: 24 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#fff",
  },
  eyeBtn: { padding: 4 },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.danger,
  },
  loginBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  loginBtnGradient: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  footerText: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.35)",
  },
});
