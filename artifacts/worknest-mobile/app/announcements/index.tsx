import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, Pressable, useColorScheme, Platform, RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/SkeletonLoader";

const priorityVariant: Record<string, any> = { high: "danger", medium: "warning", low: "default" };
const priorityColor: Record<string, string> = { high: Colors.danger, medium: Colors.warning, low: Colors.brand };

export default function AnnouncementsScreen() {
  const { orgUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const load = async () => {
    if (!orgUser) return;
    const { data } = await supabase.from("announcements").select("*")
      .eq("org_id", orgUser.org_id).order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [orgUser]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Announcements</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={loading ? Array.from({ length: 5 }) : items}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />}
        renderItem={({ item }) =>
          loading ? <Skeleton height={90} borderRadius={16} /> : (
            <Pressable
              style={({ pressed }) => [styles.card, { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1, borderLeftColor: priorityColor[item.priority] }]}
              onPress={() => router.push({ pathname: "/announcements/[id]", params: { id: item.id } })}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={[styles.annTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                  <Badge label={item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} variant={priorityVariant[item.priority]} size="sm" />
                </View>
                <Text style={[styles.annBody, { color: theme.textSecondary }]} numberOfLines={2}>{item.content}</Text>
                <Text style={[styles.annDate, { color: theme.textTertiary }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.textTertiary} style={{ marginLeft: 8 }} />
            </Pressable>
          )
        }
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}>
            <Feather name="bell" size={40} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No announcements</Text>
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
  card: { borderRadius: 16, padding: 14, borderWidth: 1, borderLeftWidth: 4, flexDirection: "row", alignItems: "center" },
  annTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1, marginRight: 8 },
  annBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  annDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
