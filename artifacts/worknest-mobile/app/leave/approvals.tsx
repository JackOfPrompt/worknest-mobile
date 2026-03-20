import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, Pressable, useColorScheme, Platform, Alert,
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

export default function ApprovalsScreen() {
  const { orgUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const loadRequests = async () => {
    if (!orgUser) return;
    const { data } = await supabase
      .from("leave_requests")
      .select("*, org_users!leave_requests_user_id_fkey(full_name, department)")
      .eq("org_id", orgUser.org_id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setRequests(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadRequests(); }, [orgUser]);

  const handleDecision = async (id: string, status: "approved" | "rejected") => {
    if (processing) return;
    setProcessing(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { error } = await supabase.from("leave_requests")
      .update({ status, approver_id: orgUser?.user_id })
      .eq("id", id);
    if (!error) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setProcessing(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Leave Approvals</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={loading ? Array.from({ length: 3 }) : requests}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) =>
          loading ? <Skeleton height={120} borderRadius={16} /> : (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.nameSection}>
                  <View style={[styles.avatar, { backgroundColor: Colors.brand + "20" }]}>
                    <Text style={[styles.avatarText, { color: Colors.brand }]}>
                      {item.org_users?.full_name?.charAt(0) ?? "?"}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.name, { color: theme.text }]}>{item.org_users?.full_name ?? "Employee"}</Text>
                    <Text style={[styles.dept, { color: theme.textSecondary }]}>{item.org_users?.department ?? ""}</Text>
                  </View>
                </View>
                <Badge label={`${item.days}d`} variant="info" size="sm" />
              </View>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Text style={[styles.leaveType, { color: theme.textSecondary }]}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Leave
              </Text>
              <Text style={[styles.dates, { color: theme.text }]}>
                {item.start_date} — {item.end_date}
              </Text>
              <Text style={[styles.reason, { color: theme.textSecondary }]} numberOfLines={2}>{item.reason}</Text>
              <View style={styles.actions}>
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: Colors.dangerLight, borderColor: "#FECACA" }]}
                  onPress={() => handleDecision(item.id, "rejected")}
                  disabled={processing === item.id}
                >
                  <Feather name="x" size={16} color={Colors.danger} />
                  <Text style={[styles.actionText, { color: Colors.danger }]}>Reject</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: Colors.successLight, borderColor: "#BBF7D0", flex: 1 }]}
                  onPress={() => handleDecision(item.id, "approved")}
                  disabled={processing === item.id}
                >
                  <Feather name="check" size={16} color={Colors.success} />
                  <Text style={[styles.actionText, { color: Colors.success }]}>Approve</Text>
                </Pressable>
              </View>
            </View>
          )
        }
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}>
            <Feather name="check-circle" size={40} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No pending approvals</Text>
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
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 8 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  nameSection: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  dept: { fontSize: 12, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginVertical: 4 },
  leaveType: { fontSize: 12, fontFamily: "Inter_500Medium" },
  dates: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reason: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, borderWidth: 1, paddingVertical: 9, paddingHorizontal: 16 },
  actionText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
