import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, Pressable, useColorScheme, Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";
import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function TeamMemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [member, setMember] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    const load = async () => {
      const { data: m } = await supabase.from("org_users").select("*").eq("id", id).single();
      setMember(m);
      if (m) {
        const { data: a } = await supabase.from("attendance").select("*")
          .eq("user_id", m.user_id).order("date", { ascending: false }).limit(7);
        setAttendance(a ?? []);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Team Member</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {loading ? (
          <View style={{ padding: 20, gap: 12 }}>
            <Skeleton height={140} borderRadius={20} />
            <Skeleton height={180} borderRadius={20} />
          </View>
        ) : member ? (
          <>
            <LinearGradient colors={["#0A1628", "#1A3A6E"]} style={styles.profile}>
              <View style={styles.profileAvatar}>
                <Text style={styles.avatarText}>{member.full_name?.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.memberName}>{member.full_name}</Text>
              <Text style={styles.memberRole}>{member.position ?? member.role}</Text>
              {member.department && (
                <Text style={styles.memberDept}>{member.department}</Text>
              )}
            </LinearGradient>

            <View style={{ padding: 16, gap: 12 }}>
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {[
                  { label: "Employee ID", value: member.employee_id ?? "—" },
                  { label: "Phone", value: member.phone ?? "—" },
                  { label: "Join Date", value: member.join_date ? new Date(member.join_date).toLocaleDateString() : "—" },
                ].map((f) => (
                  <View key={f.label} style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{f.label}</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{f.value}</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Attendance</Text>
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {attendance.length === 0 ? (
                  <Text style={[styles.infoValue, { color: theme.textTertiary }]}>No recent records</Text>
                ) : attendance.map((rec) => (
                  <View key={rec.id} style={styles.attRow}>
                    <Text style={[styles.attDate, { color: theme.textSecondary }]}>
                      {new Date(rec.date + "T00:00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                    </Text>
                    <Text style={[styles.attStatus, {
                      color: rec.status === "present" ? Colors.success : rec.status === "absent" ? Colors.danger : Colors.warning
                    }]}>
                      {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  profile: { padding: 28, alignItems: "center" },
  profileAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.brand, alignItems: "center", justifyContent: "center", marginBottom: 12, borderWidth: 3, borderColor: "rgba(255,255,255,0.3)" },
  avatarText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  memberName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 4 },
  memberRole: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", marginBottom: 2 },
  memberDept: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.5)" },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  attRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  attDate: { fontSize: 13, fontFamily: "Inter_400Regular" },
  attStatus: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
