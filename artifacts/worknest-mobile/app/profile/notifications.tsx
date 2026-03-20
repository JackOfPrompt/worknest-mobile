import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, Pressable, useColorScheme, Platform, Switch,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

const notifSettings = [
  { id: "leave", label: "Leave Updates", desc: "Status changes on your leave requests", icon: "calendar" as const },
  { id: "attendance", label: "Attendance Reminders", desc: "Remind me to punch in/out", icon: "clock" as const },
  { id: "payslip", label: "Payslip Published", desc: "When a new payslip is available", icon: "file-text" as const },
  { id: "announcements", label: "Announcements", desc: "New company announcements", icon: "bell" as const },
  { id: "approvals", label: "Approval Requests", desc: "Leave requests needing your approval", icon: "check-square" as const },
];

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    leave: true, attendance: true, payslip: true, announcements: true, approvals: false,
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: insets.bottom + 32 }}>
        {notifSettings.map((s) => (
          <View key={s.id} style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.icon, { backgroundColor: Colors.brand + "15" }]}>
              <Feather name={s.icon} size={20} color={Colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.text }]}>{s.label}</Text>
              <Text style={[styles.desc, { color: theme.textSecondary }]}>{s.desc}</Text>
            </View>
            <Switch
              value={enabled[s.id]}
              onValueChange={(v) => setEnabled((prev) => ({ ...prev, [s.id]: v }))}
              trackColor={{ false: theme.border, true: Colors.brand + "60" }}
              thumbColor={enabled[s.id] ? Colors.brand : theme.textTertiary}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  row: { borderRadius: 16, padding: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  icon: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  desc: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
