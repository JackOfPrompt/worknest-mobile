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

const priorityVariant: Record<string, any> = { high: "danger", medium: "warning", low: "default" };

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    supabase.from("announcements").select("*").eq("id", id).single()
      .then(({ data }) => { setRecord(data); setLoading(false); });
  }, [id]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Announcement</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 32 }}>
        {loading ? (
          <>
            <Skeleton height={28} width="70%" borderRadius={8} />
            <Skeleton height={200} borderRadius={16} />
          </>
        ) : record ? (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <Text style={[styles.annTitle, { color: theme.text }]}>{record.title}</Text>
              <Badge label={record.priority.charAt(0).toUpperCase() + record.priority.slice(1)} variant={priorityVariant[record.priority]} />
            </View>
            <Text style={[styles.date, { color: theme.textTertiary }]}>
              {new Date(record.created_at).toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </Text>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <Text style={[styles.content, { color: theme.text }]}>{record.content}</Text>
          </>
        ) : (
          <Text style={[styles.content, { color: theme.textSecondary }]}>Not found</Text>
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
  annTitle: { fontSize: 22, fontFamily: "Inter_700Bold", flex: 1, lineHeight: 28 },
  date: { fontSize: 13, fontFamily: "Inter_400Regular" },
  divider: { height: 1 },
  content: { fontSize: 16, fontFamily: "Inter_400Regular", lineHeight: 26 },
});
