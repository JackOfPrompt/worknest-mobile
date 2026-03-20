import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, Pressable, useColorScheme, Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function LeaveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    supabase.from("leave_requests").select("*").eq("id", id).single()
      .then(({ data }) => { setRecord(data); setLoading(false); });
  }, [id]);

  const statusVariant: Record<string, any> = { approved: "success", pending: "warning", rejected: "danger" };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Leave Details</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 32 }}>
        {loading ? (
          <>
            <Skeleton height={80} borderRadius={16} />
            <Skeleton height={120} borderRadius={16} />
          </>
        ) : record ? (
          <>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.rowBetween}>
                <Text style={[styles.leaveType, { color: theme.text }]}>
                  {record.type.charAt(0).toUpperCase() + record.type.slice(1)} Leave
                </Text>
                <Badge label={record.status.charAt(0).toUpperCase() + record.status.slice(1)} variant={statusVariant[record.status]} />
              </View>
              <Text style={[styles.dates, { color: theme.textSecondary }]}>
                {new Date(record.start_date + "T00:00:00").toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })} —{" "}
                {new Date(record.end_date + "T00:00:00").toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}
              </Text>
              <Text style={[styles.days, { color: Colors.brand }]}>{record.days} day{record.days > 1 ? "s" : ""}</Text>
            </View>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>Reason</Text>
              <Text style={[styles.reason, { color: theme.text }]}>{record.reason}</Text>
            </View>
            {record.approver_notes && (
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>Approver Notes</Text>
                <Text style={[styles.reason, { color: theme.text }]}>{record.approver_notes}</Text>
              </View>
            )}
            <Text style={[styles.submitted, { color: theme.textTertiary }]}>
              Submitted {new Date(record.created_at).toLocaleDateString()}
            </Text>
          </>
        ) : (
          <Text style={[styles.reason, { color: theme.textSecondary }]}>Not found</Text>
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
  card: { borderRadius: 16, padding: 18, borderWidth: 1, gap: 8 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  leaveType: { fontSize: 18, fontFamily: "Inter_700Bold" },
  dates: { fontSize: 14, fontFamily: "Inter_400Regular" },
  days: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  reason: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  submitted: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
});
