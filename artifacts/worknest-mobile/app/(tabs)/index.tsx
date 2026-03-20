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
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/SkeletonLoader";

interface QuickAction {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  route: string;
}

const quickActions: QuickAction[] = [
  { id: "punch", label: "Punch In/Out", icon: "clock", color: Colors.brand, route: "/attendance/punch" },
  { id: "leave", label: "Apply Leave", icon: "calendar", color: Colors.success, route: "/leave/apply" },
  { id: "payslips", label: "Payslips", icon: "file-text", color: "#8B5CF6", route: "/payslips" },
  { id: "announcements", label: "Announcements", icon: "bell", color: Colors.warning, route: "/announcements" },
];

const managerActions: QuickAction[] = [
  { id: "team", label: "My Team", icon: "users", color: Colors.brand, route: "/manager/team" },
  { id: "approvals", label: "Approvals", icon: "check-square", color: Colors.success, route: "/leave/approvals" },
  { id: "attendance_hr", label: "Attendance", icon: "clock", color: "#8B5CF6", route: "/hr/attendance" },
  { id: "reports", label: "Reports", icon: "bar-chart-2", color: Colors.warning, route: "/hr/reports" },
];

export default function HomeScreen() {
  const { orgUser, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isManager = orgUser?.role === "manager" || orgUser?.role === "hr" || orgUser?.role === "admin";
  const today = new Date().toISOString().split("T")[0];

  const loadData = async () => {
    if (!orgUser) return;
    try {
      const [attendanceRes, leavesRes, announcementsRes] = await Promise.all([
        supabase.from("attendance").select("*").eq("user_id", orgUser.user_id).eq("date", today).maybeSingle(),
        supabase.from("leave_requests").select("id").eq("user_id", orgUser.user_id).eq("status", "pending"),
        supabase.from("announcements").select("*").eq("org_id", orgUser.org_id).order("created_at", { ascending: false }).limit(3),
      ]);
      setTodayAttendance(attendanceRes.data);
      setPendingLeaves(leavesRes.data?.length ?? 0);
      setAnnouncements(announcementsRes.data ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [orgUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const actions = isManager ? [...quickActions, ...managerActions.slice(0, 0)] : quickActions;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />}
    >
      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#0A1628", "#162035"] : ["#0A1628", "#1A3A6E"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{greetingTime()}</Text>
            <Text style={styles.userName}>
              {loading ? "..." : orgUser?.full_name?.split(" ")[0] ?? "User"}
            </Text>
          </View>
          <Pressable
            style={styles.avatarCircle}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.avatarText}>
              {orgUser?.full_name?.charAt(0).toUpperCase() ?? "U"}
            </Text>
          </Pressable>
        </View>

        {/* Attendance card */}
        <Pressable
          style={styles.attendanceCard}
          onPress={() => router.push("/attendance/punch")}
        >
          {loading ? (
            <View style={{ gap: 8 }}>
              <Skeleton height={14} width={120} borderRadius={6} />
              <Skeleton height={20} width={200} borderRadius={6} />
            </View>
          ) : todayAttendance ? (
            <View style={styles.attendanceInfo}>
              <View>
                <Text style={styles.attendanceLabel}>Today's Status</Text>
                <Text style={styles.attendanceTime}>
                  In: {formatTime(todayAttendance.punch_in)}
                  {todayAttendance.punch_out ? `  •  Out: ${formatTime(todayAttendance.punch_out)}` : ""}
                </Text>
              </View>
              <Badge
                label={todayAttendance.punch_out ? "Complete" : "Clocked In"}
                variant={todayAttendance.punch_out ? "success" : "info"}
              />
            </View>
          ) : (
            <View style={styles.attendanceInfo}>
              <View>
                <Text style={styles.attendanceLabel}>Not yet clocked in</Text>
                <Text style={styles.attendanceTime}>Tap to punch in</Text>
              </View>
              <View style={styles.punchInBtn}>
                <Feather name="clock" size={18} color="#fff" />
              </View>
            </View>
          )}
        </Pressable>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.id}
              style={({ pressed }) => [
                styles.actionCard,
                { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(action.route as any);
              }}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                <Feather name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.text }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Manager Section */}
      {isManager && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Management</Text>
          <View style={styles.actionsGrid}>
            {managerActions.map((action) => (
              <Pressable
                key={action.id}
                style={({ pressed }) => [
                  styles.actionCard,
                  { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(action.route as any);
                }}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                  <Feather name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.text }]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Pending Leaves Banner */}
      {pendingLeaves > 0 && (
        <Pressable
          style={[styles.bannerCard, { backgroundColor: `${Colors.warning}18`, borderColor: `${Colors.warning}40` }]}
          onPress={() => router.push("/leave" as any)}
        >
          <Feather name="calendar" size={18} color={Colors.warning} />
          <Text style={[styles.bannerText, { color: Colors.warning }]}>
            {pendingLeaves} pending leave request{pendingLeaves > 1 ? "s" : ""}
          </Text>
          <Feather name="chevron-right" size={16} color={Colors.warning} />
        </Pressable>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Announcements</Text>
            <Pressable onPress={() => router.push("/announcements" as any)}>
              <Text style={[styles.seeAll, { color: theme.tint }]}>See all</Text>
            </Pressable>
          </View>
          <View style={{ gap: 10 }}>
            {announcements.map((ann) => (
              <Pressable
                key={ann.id}
                style={[styles.announcementCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => router.push({ pathname: "/announcements/[id]", params: { id: ann.id } })}
              >
                <View style={styles.announcementDot} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.announcementTitle, { color: theme.text }]} numberOfLines={1}>
                    {ann.title}
                  </Text>
                  <Text style={[styles.announcementDate, { color: theme.textSecondary }]}>
                    {new Date(ann.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color={theme.textTertiary} />
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 2,
  },
  userName: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  attendanceCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  attendanceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attendanceLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 4,
  },
  attendanceTime: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  punchInBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "47%",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  bannerCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  announcementCard: {
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  announcementDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand,
  },
  announcementTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  announcementDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
