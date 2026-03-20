import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, Pressable, useColorScheme, Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { LinearGradient } from "expo-linear-gradient";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function PayslipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    supabase.from("payslips").select("*").eq("id", id).single()
      .then(({ data }) => { setRecord(data); setLoading(false); });
  }, [id]);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Payslip</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {loading ? (
          <View style={{ padding: 20, gap: 12 }}>
            <Skeleton height={120} borderRadius={20} />
            <Skeleton height={200} borderRadius={20} />
          </View>
        ) : record ? (
          <>
            <LinearGradient colors={["#0A1628", "#1A3A6E"]} style={styles.topCard}>
              <Text style={styles.payPeriod}>Pay Period</Text>
              <Text style={styles.monthYear}>{months[Number(record.month) - 1]} {record.year}</Text>
              <View style={styles.netRow}>
                <View>
                  <Text style={styles.netLabel}>Net Salary</Text>
                  <Text style={styles.netAmount}>{fmt(record.net_salary)}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                  <Text style={styles.statusText}>{record.status.charAt(0).toUpperCase() + record.status.slice(1)}</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={{ padding: 20, gap: 12 }}>
              <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Earnings</Text>
                <View style={styles.lineItem}>
                  <Text style={[styles.lineLabel, { color: theme.text }]}>Basic Salary</Text>
                  <Text style={[styles.lineValue, { color: Colors.success }]}>{fmt(record.basic_salary)}</Text>
                </View>
                <View style={styles.lineItem}>
                  <Text style={[styles.lineLabel, { color: theme.text }]}>Allowances</Text>
                  <Text style={[styles.lineValue, { color: Colors.success }]}>{fmt(record.allowances)}</Text>
                </View>
                <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
                  <Text style={[styles.totalLabel, { color: theme.text }]}>Gross</Text>
                  <Text style={[styles.totalValue, { color: Colors.success }]}>
                    {fmt(record.basic_salary + record.allowances)}
                  </Text>
                </View>
              </View>

              <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Deductions</Text>
                <View style={styles.lineItem}>
                  <Text style={[styles.lineLabel, { color: theme.text }]}>Total Deductions</Text>
                  <Text style={[styles.lineValue, { color: Colors.danger }]}>-{fmt(record.deductions)}</Text>
                </View>
              </View>

              <View style={[styles.netCard, { backgroundColor: Colors.brand + "12", borderColor: Colors.brand + "30" }]}>
                <Text style={[styles.netCardLabel, { color: Colors.brand }]}>Net Pay</Text>
                <Text style={[styles.netCardValue, { color: Colors.brand }]}>{fmt(record.net_salary)}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Payslip not found</Text>
          </View>
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
  topCard: { padding: 24, gap: 4 },
  payPeriod: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.8 },
  monthYear: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 16 },
  netRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  netLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.5)", marginBottom: 4 },
  netAmount: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#fff" },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  section: { borderRadius: 16, padding: 18, borderWidth: 1, gap: 12 },
  sectionTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  lineItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lineLabel: { fontSize: 15, fontFamily: "Inter_400Regular" },
  lineValue: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: 1 },
  totalLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  totalValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  netCard: { borderRadius: 16, padding: 18, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  netCardLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  netCardValue: { fontSize: 24, fontFamily: "Inter_700Bold" },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
