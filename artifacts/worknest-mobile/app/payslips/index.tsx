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

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function PayslipsScreen() {
  const { orgUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (!orgUser) return;
    supabase.from("payslips").select("*").eq("user_id", orgUser.user_id)
      .order("year", { ascending: false }).order("month", { ascending: false })
      .then(({ data }) => { setPayslips(data ?? []); setLoading(false); });
  }, [orgUser]);

  const formatCurrency = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Payslips</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={loading ? Array.from({ length: 6 }) : payslips}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) =>
          loading ? <Skeleton height={90} borderRadius={16} /> : (
            <Pressable
              style={({ pressed }) => [styles.card, { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.push({ pathname: "/payslips/[id]", params: { id: item.id } })}
            >
              <View style={[styles.iconBox, { backgroundColor: "#8B5CF620" }]}>
                <Feather name="file-text" size={22} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.monthYear, { color: theme.text }]}>
                  {months[Number(item.month) - 1]} {item.year}
                </Text>
                <Text style={[styles.net, { color: Colors.success }]}>{formatCurrency(item.net_salary)}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Badge label={item.status.charAt(0).toUpperCase() + item.status.slice(1)} variant={item.status === "published" ? "success" : "default"} size="sm" />
                <Feather name="chevron-right" size={16} color={theme.textTertiary} />
              </View>
            </Pressable>
          )
        }
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}>
            <Feather name="file-text" size={40} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No payslips yet</Text>
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
  card: { borderRadius: 16, padding: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  monthYear: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  net: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
