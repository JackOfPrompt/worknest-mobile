import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, Pressable, useColorScheme, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function AttendanceLogScreen() {
  const { orgUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (!orgUser) return;
    supabase.from("attendance").select("*").eq("user_id", orgUser.user_id)
      .order("date", { ascending: false })
      .then(({ data }) => { setRecords(data ?? []); setLoading(false); });
  }, [orgUser]);

  const formatDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const statusVariant: Record<string, any> = { present: "success", late: "warning", absent: "danger", half_day: "warning" };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Attendance Log</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={loading ? Array.from({ length: 10 }) : records}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }}
        renderItem={({ item }) =>
          loading ? <Skeleton height={70} borderRadius={14} style={{ marginBottom: 4 }} /> : (
            <View style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.date, { color: theme.text }]}>{formatDate(item.date)}</Text>
                <Text style={[styles.times, { color: theme.textSecondary }]}>
                  {formatTime(item.punch_in)} — {item.punch_out ? formatTime(item.punch_out) : "Active"}
                </Text>
              </View>
              <Badge label={item.status.charAt(0).toUpperCase() + item.status.slice(1)} variant={statusVariant[item.status]} size="sm" />
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}>
            <Feather name="clock" size={40} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No records found</Text>
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
  row: { borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: "row", alignItems: "center" },
  date: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  times: { fontSize: 13, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
