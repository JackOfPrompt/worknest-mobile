import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";

export default function PunchScreen() {
  const { orgUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const pulse = useSharedValue(1);
  const scale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.3);

  const today = new Date().toISOString().split("T")[0];
  const isClockedIn = todayRecord && !todayRecord.punch_out;
  const isDayComplete = todayRecord && todayRecord.punch_out;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isClockedIn) {
      pulse.value = withRepeat(
        withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      ringOpacity.value = withRepeat(
        withTiming(0.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulse.value = 1;
      ringOpacity.value = 0.3;
    }
  }, [isClockedIn]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: ringOpacity.value }));

  const loadToday = async () => {
    if (!orgUser) return;
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", orgUser.user_id)
      .eq("date", today)
      .maybeSingle();
    setTodayRecord(data);
    setLoading(false);
  };

  useEffect(() => { loadToday(); }, [orgUser]);

  const handlePunch = async () => {
    if (!orgUser || processing || isDayComplete) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    scale.value = withSpring(0.93, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 12 });
    });
    setProcessing(true);
    try {
      const now = new Date().toISOString();
      if (!todayRecord) {
        const { data, error } = await supabase.from("attendance").insert({
          user_id: orgUser.user_id,
          org_id: orgUser.org_id,
          punch_in: now,
          date: today,
          status: "present",
        }).select().single();
        if (!error) setTodayRecord(data);
      } else {
        const { data, error } = await supabase
          .from("attendance")
          .update({ punch_out: now })
          .eq("id", todayRecord.id)
          .select()
          .single();
        if (!error) setTodayRecord(data);
      }
    } catch {
      Alert.alert("Error", "Failed to record attendance. Try again.");
    }
    setProcessing(false);
  };

  const btnScale = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDuration = (start: string) => {
    const diff = Date.now() - new Date(start).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const btnColor = isDayComplete ? Colors.success : isClockedIn ? Colors.danger : Colors.brand;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={isDark ? ["#0A1628", "#162035", theme.background] : ["#0A1628", "#1A3A6E", theme.background]}
        style={[styles.gradient, { height: "55%" }]}
      />

      {/* Nav */}
      <View style={[styles.nav, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.navTitle}>Punch Clock</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Clock */}
      <View style={styles.clockSection}>
        <Text style={styles.clockTime}>
          {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
        <Text style={styles.clockDate}>
          {currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        </Text>

        {isClockedIn && (
          <View style={[styles.durationPill, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
            <Feather name="clock" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.durationText}>{formatDuration(todayRecord.punch_in)}</Text>
          </View>
        )}
      </View>

      {/* Punch button */}
      <View style={styles.btnSection}>
        <Animated.View style={pulseStyle}>
          <Animated.View
            style={[
              styles.punchRing,
              { borderColor: btnColor },
              ringStyle,
            ]}
          />
          <Animated.View style={btnScale}>
            <Pressable
              style={[styles.punchBtn, { backgroundColor: btnColor }]}
              onPress={handlePunch}
              disabled={loading || isDayComplete}
            >
              <Feather
                name={isDayComplete ? "check" : isClockedIn ? "square" : "clock"}
                size={40}
                color="#fff"
              />
            </Pressable>
          </Animated.View>
        </Animated.View>

        <Text style={[styles.punchLabel, { color: isDark ? "#fff" : theme.text }]}>
          {isDayComplete ? "Day Complete" : isClockedIn ? "Tap to Punch Out" : "Tap to Punch In"}
        </Text>
      </View>

      {/* Record */}
      {todayRecord && (
        <View style={[styles.recordCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.recordRow}>
            <View style={styles.recordItem}>
              <Text style={[styles.recordLabel, { color: theme.textSecondary }]}>Punch In</Text>
              <Text style={[styles.recordValue, { color: Colors.success }]}>
                {formatTime(todayRecord.punch_in)}
              </Text>
            </View>
            <View style={[styles.recordDivider, { backgroundColor: theme.border }]} />
            <View style={styles.recordItem}>
              <Text style={[styles.recordLabel, { color: theme.textSecondary }]}>Punch Out</Text>
              <Text style={[styles.recordValue, { color: todayRecord.punch_out ? Colors.danger : theme.textTertiary }]}>
                {todayRecord.punch_out ? formatTime(todayRecord.punch_out) : "—"}
              </Text>
            </View>
            {todayRecord.punch_out && (
              <>
                <View style={[styles.recordDivider, { backgroundColor: theme.border }]} />
                <View style={styles.recordItem}>
                  <Text style={[styles.recordLabel, { color: theme.textSecondary }]}>Duration</Text>
                  <Text style={[styles.recordValue, { color: Colors.brand }]}>
                    {(() => {
                      const diff = new Date(todayRecord.punch_out).getTime() - new Date(todayRecord.punch_in).getTime();
                      const h = Math.floor(diff / 3600000);
                      const m = Math.floor((diff % 3600000) / 60000);
                      return `${h}h ${m}m`;
                    })()}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { position: "absolute", top: 0, left: 0, right: 0 },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: "#fff" },
  clockSection: { alignItems: "center", paddingTop: 40, paddingBottom: 20 },
  clockTime: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -2,
  },
  clockDate: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
    marginBottom: 12,
  },
  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  durationText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.8)" },
  btnSection: { alignItems: "center", paddingTop: 20, paddingBottom: 32 },
  punchRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    top: -16,
    left: -16,
  },
  punchBtn: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
  punchLabel: {
    marginTop: 24,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  recordCard: {
    marginHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  recordRow: { flexDirection: "row", alignItems: "center" },
  recordItem: { flex: 1, alignItems: "center" },
  recordLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
  recordValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  recordDivider: { width: 1, height: 40 },
});
