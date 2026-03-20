import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  useColorScheme,
  RefreshControl,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/SkeletonLoader";

interface AttendanceRecord {
  id: string;
  date: string;
  punch_in: string;
  punch_out: string | null;
  status: string;
}

function AttendanceRow({ record, theme }: { record: AttendanceRecord; theme: any }) {
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  };

  const duration = () => {
    if (!record.punch_out) return "—";
    const diff = new Date(record.punch_out).getTime() - new Date(record.punch_in).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const statusVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
    present: "success",
    late: "warning",
    absent: "danger",
    half_day: "warning",
  };

  return (
    <View style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.rowDate}>
        <Text style={[styles.rowDateText, { color: theme.text }]}>{formatDate(record.date)}</Text>
      </View>
      <View style={styles.rowTimes}>
        <Text style={[styles.timeText, { color: theme.textSecondary }]}>
          {formatTime(record.punch_in)} — {record.punch_out ? formatTime(record.punch_out) : "Active"}
        </Text>
        <Text style={[styles.durationText, { color: theme.textTertiary }]}>{duration()}</Text>
      </View>
      <Badge label={record.status.charAt(0).toUpperCase() + record.status.slice(1)} variant={statusVariant[record.status] ?? "default"} size="sm" />
    </View>
  );
}

export default function AttendanceTab() {
  const { orgUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const loadRecords = async () => {
    if (!orgUser) return;
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", orgUser.user_id)
      .order("date", { ascending: false })
      .limit(30);
    const allRecords = data ?? [];
    setRecords(allRecords);
    setTodayRecord(allRecords.find((r) => r.date === today) ?? null);
    setLoading(false);
  };

  useEffect(() => { loadRecords(); }, [orgUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecords();
    setRefreshing(false);
  };

  const presentDays = records.filter((r) => r.status === "present").length;
  const lateDays = records.filter((r) => r.status === "late").length;
  const absentDays = records.filter((r) => r.status === "absent").length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Attendance</Text>
        <Pressable
          style={({ pressed }) => [styles.logBtn, { backgroundColor: Colors.brand, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/attendance/punch");
          }}
        >
          <Feather name="clock" size={16} color="#fff" />
          <Text style={styles.logBtnText}>Punch</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: "Present", value: presentDays, color: Colors.success },
          { label: "Late", value: lateDays, color: Colors.warning },
          { label: "Absent", value: absentDays, color: Colors.danger },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.statValue, { color: s.color }]}>{loading ? "—" : s.value}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Today's status */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Today</Text>
      </View>

      <Pressable
        style={[styles.todayCard, { backgroundColor: theme.card, borderColor: Colors.brand + "40" }]}
        onPress={() => router.push("/attendance/punch")}
      >
        {loading ? (
          <View style={{ gap: 8 }}>
            <Skeleton height={14} width={100} />
            <Skeleton height={20} width={180} />
          </View>
        ) : todayRecord ? (
          <View style={styles.todayInfo}>
            <View style={[styles.todayDot, { backgroundColor: todayRecord.punch_out ? Colors.success : Colors.warning }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.todayStatus, { color: theme.text }]}>
                {todayRecord.punch_out ? "Day complete" : "Currently clocked in"}
              </Text>
              <Text style={[styles.todayTime, { color: theme.textSecondary }]}>
                In: {new Date(todayRecord.punch_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {todayRecord.punch_out
                  ? `  •  Out: ${new Date(todayRecord.punch_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : ""}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.todayInfo}>
            <View style={[styles.todayDot, { backgroundColor: Colors.danger }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.todayStatus, { color: theme.text }]}>Not clocked in yet</Text>
              <Text style={[styles.todayTime, { color: theme.textSecondary }]}>Tap to punch in</Text>
            </View>
            <Feather name="chevron-right" size={18} color={theme.textTertiary} />
          </View>
        )}
      </Pressable>

      {/* History */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>History</Text>
        <Pressable onPress={() => router.push("/attendance/log" as any)}>
          <Text style={[styles.seeAll, { color: theme.tint }]}>Full log</Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={64} borderRadius={14} />
            ))
          : records.slice(0, 10).map((r) => (
              <AttendanceRow key={r.id} record={r} theme={theme} />
            ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  logBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  logBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 2 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 14, fontFamily: "Inter_500Medium" },
  todayCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.brand + "40",
  },
  todayInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  todayDot: { width: 10, height: 10, borderRadius: 5 },
  todayStatus: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  todayTime: { fontSize: 13, fontFamily: "Inter_400Regular" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  rowDate: { width: 90 },
  rowDateText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  rowTimes: { flex: 1 },
  timeText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  durationText: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
});
