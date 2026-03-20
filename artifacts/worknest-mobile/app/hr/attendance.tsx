import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, Pressable, useColorScheme, Platform, RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function HRAttendanceScreen() {
  const { orgUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const load = async () => {
    if (!orgUser) return;
    const { data } = await supabase.from("attendance").select("*, org_users!attendance_user_id_fkey(full_name, department)")
      .eq("org_id", orgUser.org_id).eq("date", today).order("punch_in", { ascending: false });
    setRecords(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [orgUser]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const statusVariant: Record<string, any> = { present: "success", late: "warning", absent: "danger", half_day: "warning" };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Today's Attendance</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={loading ? Array.from({ length: 6 }) : records}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />}
        ListHeaderComponent={
          !loading ? (
            <View style={[styles.summaryRow]}>
              {[
                { label: "Present", count: records.filter(r => r.status === "present").length, color: Colors.success },
                { label: "Late", count: records.filter(r => r.status === "late").length, color: Colors.warning },
                { label: "Total", count: records.length, color: Colors.brand },
              ].map(s => (
                <View key={s.label} style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.summaryCount, { color: s.color }]}>{s.count}</Text>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{s.label}</Text>
                </View>
              ))}
            </View>
          ) : null
        }
        renderItem={({ item }) =>
          loading ? <Skeleton height={70} borderRadius={14} /> : (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.avatar, { backgroundColor: Colors.brand + "20" }]}>
                <Text style={[styles.avatarText, { color: Colors.brand }]}>{item.org_users?.full_name?.charAt(0) ?? "?"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.text }]}>{item.org_users?.full_name ?? "Unknown"}</Text>
                <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                  In: {new Date(item.punch_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {item.punch_out ? `  Out: ${new Date(item.punch_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "  Active"}
                </Text>
              </View>
              <Badge label={item.status.charAt(0).toUpperCase() + item.status.slice(1)} variant={statusVariant[item.status]} size="sm" />
            </View>
          )
        }
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}>
            <Feather name="clock" size={40} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No attendance records for today</Text>
          </View>
        ) : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  summaryCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", borderWidth: 1 },
  summaryCount: { fontSize: 24, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  card: { borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  timeText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
