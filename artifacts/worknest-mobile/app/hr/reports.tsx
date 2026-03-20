import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, Pressable, useColorScheme, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";
import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function HRReportsScreen() {
  const { orgUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    const load = async () => {
      if (!orgUser) return;
      const [empRes, leaveRes, attRes] = await Promise.all([
        supabase.from("org_users").select("role").eq("org_id", orgUser.org_id),
        supabase.from("leave_requests").select("status").eq("org_id", orgUser.org_id),
        supabase.from("attendance").select("status").eq("org_id", orgUser.org_id)
          .gte("date", new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]),
      ]);
      setStats({
        totalEmployees: empRes.data?.length ?? 0,
        managers: empRes.data?.filter(e => e.role === "manager").length ?? 0,
        pendingLeaves: leaveRes.data?.filter(l => l.status === "pending").length ?? 0,
        approvedLeaves: leaveRes.data?.filter(l => l.status === "approved").length ?? 0,
        presentThisWeek: attRes.data?.filter(a => a.status === "present").length ?? 0,
        lateThisWeek: attRes.data?.filter(a => a.status === "late").length ?? 0,
      });
      setLoading(false);
    };
    load();
  }, [orgUser]);

  const StatCard = ({ label, value, color, icon }: any) => (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{loading ? "—" : value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>HR Reports</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 32 }}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Workforce Overview</Text>
        {loading ? (
          <>
            <View style={styles.grid}><Skeleton height={100} borderRadius={16} style={{ flex: 1 }} /><Skeleton height={100} borderRadius={16} style={{ flex: 1 }} /></View>
            <View style={styles.grid}><Skeleton height={100} borderRadius={16} style={{ flex: 1 }} /><Skeleton height={100} borderRadius={16} style={{ flex: 1 }} /></View>
          </>
        ) : (
          <>
            <View style={styles.grid}>
              <StatCard label="Total Employees" value={stats?.totalEmployees} color={Colors.brand} icon="users" />
              <StatCard label="Managers" value={stats?.managers} color={Colors.success} icon="user-check" />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Leave Summary</Text>
            <View style={styles.grid}>
              <StatCard label="Pending" value={stats?.pendingLeaves} color={Colors.warning} icon="clock" />
              <StatCard label="Approved" value={stats?.approvedLeaves} color={Colors.success} icon="check-circle" />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>This Week (Attendance)</Text>
            <View style={styles.grid}>
              <StatCard label="Present" value={stats?.presentThisWeek} color={Colors.success} icon="check" />
              <StatCard label="Late" value={stats?.lateThisWeek} color={Colors.warning} icon="alert-circle" />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 8 },
  grid: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, borderWidth: 1, gap: 8 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 28, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
