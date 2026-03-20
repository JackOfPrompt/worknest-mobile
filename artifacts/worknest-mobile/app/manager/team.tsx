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

export default function TeamScreen() {
  const { orgUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const load = async () => {
    if (!orgUser) return;
    const { data } = await supabase.from("org_users").select("*")
      .eq("org_id", orgUser.org_id)
      .neq("user_id", orgUser.user_id)
      .order("full_name");
    setMembers(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [orgUser]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const roleColors: Record<string, string> = {
    employee: Colors.brand, manager: Colors.success, hr: "#8B5CF6", admin: Colors.danger,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Team</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={loading ? Array.from({ length: 5 }) : members}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />}
        renderItem={({ item }) =>
          loading ? <Skeleton height={80} borderRadius={16} /> : (
            <Pressable
              style={({ pressed }) => [styles.card, { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.push({ pathname: "/manager/member/[id]", params: { id: item.id } })}
            >
              <View style={[styles.avatar, { backgroundColor: (roleColors[item.role] ?? Colors.brand) + "20" }]}>
                <Text style={[styles.avatarText, { color: roleColors[item.role] ?? Colors.brand }]}>
                  {item.full_name?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.text }]}>{item.full_name}</Text>
                <Text style={[styles.position, { color: theme.textSecondary }]}>{item.position ?? item.department ?? "—"}</Text>
              </View>
              <Badge label={item.role.charAt(0).toUpperCase() + item.role.slice(1)} variant="default" size="sm" />
              <Feather name="chevron-right" size={16} color={theme.textTertiary} />
            </Pressable>
          )
        }
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}>
            <Feather name="users" size={40} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No team members</Text>
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
  card: { borderRadius: 16, padding: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  position: { fontSize: 13, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
