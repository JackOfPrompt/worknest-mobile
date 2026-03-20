import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  useColorScheme,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/colors";

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  sublabel?: string;
  onPress: () => void;
  color?: string;
  theme: any;
  showBadge?: boolean;
}

function MenuItem({ icon, label, sublabel, onPress, color, theme, showBadge }: MenuItemProps) {
  const iconColor = color ?? theme.tint;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={[styles.menuIcon, { backgroundColor: iconColor + "15" }]}>
        <Feather name={icon} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
        {sublabel && <Text style={[styles.menuSublabel, { color: theme.textSecondary }]}>{sublabel}</Text>}
      </View>
      <Feather name="chevron-right" size={18} color={theme.textTertiary} />
    </Pressable>
  );
}

export default function ProfileTab() {
  const { orgUser, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  const roleLabel: Record<string, string> = {
    employee: "Employee",
    manager: "Manager",
    hr: "HR Manager",
    admin: "Administrator",
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }}
    >
      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#0A1628", "#162035"] : ["#0A1628", "#1A3A6E"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.profileAvatar}>
          <Text style={styles.avatarText}>
            {orgUser?.full_name?.charAt(0).toUpperCase() ?? "U"}
          </Text>
        </View>
        <Text style={styles.profileName}>{orgUser?.full_name ?? "User"}</Text>
        <Text style={styles.profileRole}>{roleLabel[orgUser?.role ?? "employee"] ?? "Employee"}</Text>
        {orgUser?.department && (
          <View style={styles.departmentTag}>
            <Feather name="briefcase" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.departmentText}>{orgUser.department}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Info cards */}
      <View style={styles.infoRow}>
        {[
          { label: "Employee ID", value: orgUser?.employee_id ?? "—", icon: "hash" as const },
          { label: "Position", value: orgUser?.position ?? "—", icon: "award" as const },
          { label: "Phone", value: orgUser?.phone ?? "—", icon: "phone" as const },
        ].map((info) => (
          <View key={info.label} style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Feather name={info.icon} size={14} color={theme.tint} />
            <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>{info.label}</Text>
            <Text style={[styles.infoValue, { color: theme.text }]} numberOfLines={1}>{info.value}</Text>
          </View>
        ))}
      </View>

      {/* Menu sections */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>Account</Text>
        <View style={{ gap: 8 }}>
          <MenuItem icon="user" label="Edit Profile" onPress={() => router.push("/profile/edit")} theme={theme} />
          <MenuItem icon="bell" label="Notifications" onPress={() => router.push("/profile/notifications" as any)} theme={theme} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>Workspace</Text>
        <View style={{ gap: 8 }}>
          <MenuItem icon="file-text" label="My Payslips" onPress={() => router.push("/payslips" as any)} theme={theme} color="#8B5CF6" />
          <MenuItem icon="calendar" label="Leave Requests" onPress={() => router.push("/(tabs)/leave")} theme={theme} color={Colors.success} />
          <MenuItem icon="clock" label="Attendance Log" onPress={() => router.push("/attendance/log" as any)} theme={theme} color={Colors.warning} />
        </View>
      </View>

      <View style={styles.section}>
        <Pressable
          style={({ pressed }) => [
            styles.signOutBtn,
            { backgroundColor: Colors.dangerLight, borderColor: "#FECACA", opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleSignOut}
        >
          <Feather name="log-out" size={18} color={Colors.danger} />
          <Text style={[styles.signOutText, { color: Colors.danger }]}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "center",
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#fff" },
  profileName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 4 },
  profileRole: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", marginBottom: 10 },
  departmentTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  departmentText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.8)" },
  infoRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
  },
  infoCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 4,
  },
  infoLabel: { fontSize: 10, fontFamily: "Inter_500Medium", marginTop: 2 },
  infoValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  section: { paddingHorizontal: 20, paddingTop: 24, gap: 10 },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  menuSublabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  signOutText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
