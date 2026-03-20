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

export default function EditProfileScreen() {
  const { orgUser, refreshOrgUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [fullName, setFullName] = useState(orgUser?.full_name ?? "");
  const [phone, setPhone] = useState(orgUser?.phone ?? "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!orgUser || !fullName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("org_users")
      .update({ full_name: fullName.trim(), phone: phone.trim() || null })
      .eq("id", orgUser.id);
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      await refreshOrgUser();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }
  };

  const InputField = ({ label, value, onChange, placeholder, keyboardType = "default" }: any) => (
    <View style={{ gap: 6, marginBottom: 16 }}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: theme.backgroundSecondary, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>
        <Pressable onPress={handleSave} disabled={loading}>
          {loading ? <LoadingSpinner size={20} /> : (
            <Text style={[styles.saveText, { color: Colors.brand }]}>Save</Text>
          )}
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }} keyboardShouldPersistTaps="handled">
        <InputField label="Full Name" value={fullName} onChange={setFullName} placeholder="Your full name" />
        <InputField label="Phone" value={phone} onChange={setPhone} placeholder="e.g. +91 98765 43210" keyboardType="phone-pad" />

        <View style={[styles.readonlyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.readonlyLabel, { color: theme.textTertiary }]}>These fields are managed by HR</Text>
          {[
            { label: "Department", value: orgUser?.department ?? "—" },
            { label: "Position", value: orgUser?.position ?? "—" },
            { label: "Employee ID", value: orgUser?.employee_id ?? "—" },
            { label: "Role", value: orgUser?.role ?? "—" },
          ].map((f) => (
            <View key={f.label} style={styles.readonlyRow}>
              <Text style={[styles.readonlyKey, { color: theme.textSecondary }]}>{f.label}</Text>
              <Text style={[styles.readonlyValue, { color: theme.text }]}>{f.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  saveText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, height: 52, fontSize: 15, fontFamily: "Inter_400Regular" },
  readonlyCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12, marginTop: 8 },
  readonlyLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 4 },
  readonlyRow: { flexDirection: "row", justifyContent: "space-between" },
  readonlyKey: { fontSize: 14, fontFamily: "Inter_400Regular" },
  readonlyValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
