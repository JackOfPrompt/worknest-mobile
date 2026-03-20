import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, Pressable, useColorScheme, Platform, TextInput, Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const leaveTypes = [
  { id: "annual", label: "Annual Leave", icon: "sun" as const, color: Colors.brand },
  { id: "sick", label: "Sick Leave", icon: "thermometer" as const, color: Colors.danger },
  { id: "personal", label: "Personal Leave", icon: "user" as const, color: "#8B5CF6" },
  { id: "unpaid", label: "Unpaid Leave", icon: "dollar-sign" as const, color: Colors.warning },
];

export default function ApplyLeaveScreen() {
  const { orgUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [leaveType, setLeaveType] = useState("annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const calcDays = () => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason.trim()) {
      Alert.alert("Missing Fields", "Please fill in all fields");
      return;
    }
    if (!orgUser) return;
    setLoading(true);
    const { error } = await supabase.from("leave_requests").insert({
      user_id: orgUser.user_id,
      org_id: orgUser.org_id,
      type: leaveType,
      start_date: startDate,
      end_date: endDate,
      days: calcDays(),
      reason: reason.trim(),
      status: "pending",
    });
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Submitted", "Your leave request has been submitted.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Apply for Leave</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Leave type */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Leave Type</Text>
        <View style={styles.typeGrid}>
          {leaveTypes.map((t) => (
            <Pressable
              key={t.id}
              style={[
                styles.typeCard,
                {
                  backgroundColor: leaveType === t.id ? t.color + "15" : theme.card,
                  borderColor: leaveType === t.id ? t.color : theme.border,
                  borderWidth: leaveType === t.id ? 1.5 : 1,
                },
              ]}
              onPress={() => { setLeaveType(t.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <Feather name={t.icon} size={20} color={leaveType === t.id ? t.color : theme.textSecondary} />
              <Text style={[styles.typeLabel, { color: leaveType === t.id ? t.color : theme.text }]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Dates */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Start Date</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.textTertiary}
          value={startDate}
          onChangeText={setStartDate}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>End Date</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.textTertiary}
          value={endDate}
          onChangeText={setEndDate}
        />

        {calcDays() > 0 && (
          <View style={[styles.daysBadge, { backgroundColor: Colors.brandLight }]}>
            <Feather name="info" size={14} color={Colors.brand} />
            <Text style={[styles.daysText, { color: Colors.brand }]}>{calcDays()} day{calcDays() > 1 ? "s" : ""} selected</Text>
          </View>
        )}

        {/* Reason */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Reason</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          placeholder="Explain the reason for your leave..."
          placeholderTextColor={theme.textTertiary}
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </ScrollView>

      {/* Submit */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: theme.backgroundSecondary, borderTopColor: theme.border }]}>
        <Pressable
          style={({ pressed }) => [styles.submitBtn, { backgroundColor: Colors.brand, opacity: pressed || loading ? 0.85 : 1 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <LoadingSpinner size={20} color="#fff" /> : (
            <>
              <Feather name="send" size={16} color="#fff" />
              <Text style={styles.submitText}>Submit Request</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  scroll: { padding: 20 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 8, marginTop: 16 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  typeCard: { width: "47%", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  typeLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, height: 52, fontSize: 15, fontFamily: "Inter_400Regular" },
  textArea: { borderRadius: 14, borderWidth: 1, padding: 16, fontSize: 15, fontFamily: "Inter_400Regular", minHeight: 100 },
  daysBadge: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10, marginTop: 8 },
  daysText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  footer: { padding: 16, borderTopWidth: 1 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 16 },
  submitText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
