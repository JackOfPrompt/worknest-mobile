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

interface LeaveRequest {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

const leaveTypeIcons: Record<string, keyof typeof Feather.glyphMap> = {
  annual: "sun",
  sick: "thermometer",
  personal: "user",
  maternity: "heart",
  paternity: "heart",
  unpaid: "dollar-sign",
};

const leaveTypeColors: Record<string, string> = {
  annual: Colors.brand,
  sick: Colors.danger,
  personal: "#8B5CF6",
  maternity: "#EC4899",
  paternity: "#06B6D4",
  unpaid: Colors.warning,
};

export default function LeaveTab() {
  const { orgUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const loadLeaves = async () => {
    if (!orgUser) return;
    const { data } = await supabase
      .from("leave_requests")
      .select("*")
      .eq("user_id", orgUser.user_id)
      .order("created_at", { ascending: false });
    setRequests(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadLeaves(); }, [orgUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaves();
    setRefreshing(false);
  };

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const formatDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString([], { month: "short", day: "numeric" });

  const statusVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
    approved: "success",
    pending: "warning",
    rejected: "danger",
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Leave</Text>
        <Pressable
          style={({ pressed }) => [styles.applyBtn, { backgroundColor: Colors.brand, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/leave/apply");
          }}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.applyBtnText}>Apply</Text>
        </Pressable>
      </View>

      {/* Balance cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.balanceRow}>
        {[
          { label: "Annual", days: 20, used: 5, color: Colors.brand },
          { label: "Sick", days: 12, used: 2, color: Colors.danger },
          { label: "Personal", days: 5, used: 1, color: "#8B5CF6" },
        ].map((b) => (
          <View key={b.label} style={[styles.balanceCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.balanceType, { color: theme.textSecondary }]}>{b.label}</Text>
            <Text style={[styles.balanceDays, { color: b.color }]}>{b.days - b.used}</Text>
            <Text style={[styles.balanceLabel, { color: theme.textTertiary }]}>days left</Text>
            <View style={[styles.balanceBar, { backgroundColor: theme.border }]}>
              <View style={[styles.balanceBarFill, { width: `${((b.days - b.used) / b.days) * 100}%`, backgroundColor: b.color }]} />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <Pressable
            key={f}
            style={[
              styles.filterTab,
              {
                backgroundColor: filter === f ? Colors.brand : theme.card,
                borderColor: filter === f ? Colors.brand : theme.border,
              },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, { color: filter === f ? "#fff" : theme.textSecondary }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Requests */}
      <View style={{ paddingHorizontal: 20, gap: 10, paddingTop: 4 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={90} borderRadius={16} />)
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={36} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No leave requests</Text>
          </View>
        ) : (
          filtered.map((req) => {
            const iconColor = leaveTypeColors[req.type] ?? Colors.brand;
            const icon = leaveTypeIcons[req.type] ?? "calendar";
            return (
              <Pressable
                key={req.id}
                style={({ pressed }) => [
                  styles.reqCard,
                  { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => router.push({ pathname: "/leave/[id]", params: { id: req.id } })}
              >
                <View style={[styles.reqIcon, { backgroundColor: iconColor + "15" }]}>
                  <Feather name={icon} size={20} color={iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={[styles.reqType, { color: theme.text }]}>
                      {req.type.charAt(0).toUpperCase() + req.type.slice(1)} Leave
                    </Text>
                    <Badge label={req.status.charAt(0).toUpperCase() + req.status.slice(1)} variant={statusVariant[req.status]} size="sm" />
                  </View>
                  <Text style={[styles.reqDates, { color: theme.textSecondary }]}>
                    {formatDate(req.start_date)} — {formatDate(req.end_date)} • {req.days} day{req.days > 1 ? "s" : ""}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}
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
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  applyBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  balanceRow: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4, gap: 10 },
  balanceCard: {
    width: 120,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  balanceType: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
  balanceDays: { fontSize: 28, fontFamily: "Inter_700Bold" },
  balanceLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 10 },
  balanceBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  balanceBarFill: { height: 4, borderRadius: 2 },
  filterRow: { paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  reqCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reqIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  reqType: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  reqDates: { fontSize: 13, fontFamily: "Inter_400Regular" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
