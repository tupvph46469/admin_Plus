import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getEmployeeById } from "../services/userService";

export default function AccountScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      const str = await AsyncStorage.getItem("user");
      if (!str) {
        Alert.alert("Lỗi", "Chưa đăng nhập");
        return;
      }

      const localUser = JSON.parse(str);

      if (localUser?.id) {
        const freshUser = await getEmployeeById(localUser.id);
        setUser(freshUser);
        await AsyncStorage.setItem("user", JSON.stringify(freshUser));
      } else {
        setUser(localUser);
      }
    } catch (e) {
      console.log("❌ Load account error:", e);
      Alert.alert("Lỗi", "Không thể tải thông tin tài khoản");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loading}>
        <Text>Không có dữ liệu tài khoản</Text>
      </View>
    );
  }

  const initials = user.name
    ?.split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>
          {user.role === "admin" ? "Quản trị viên" : "Nhân viên"}
        </Text>
      </View>

      {/* INFO CARD */}
      <View style={styles.card}>
        <InfoItem
          icon="mail-outline"
          label="Email"
          value={user.email || "—"}
        />
        <InfoItem
          icon="shield-checkmark-outline"
          label="Vai trò"
          value={user.role === "admin" ? "Quản trị viên" : "Nhân viên"}
        />
        <InfoItem
          icon={user.active ? "checkmark-circle-outline" : "close-circle-outline"}
          label="Trạng thái"
          value={user.active ? "Đang hoạt động" : "Ngưng hoạt động"}
          valueStyle={{
            color: user.active ? "#16a34a" : "#dc2626",
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function InfoItem({ icon, label, value, valueStyle }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color="#64748b" />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    </View>
  );
}

/* ================= STYLE ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  /* HEADER */
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#E6EEF8",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#16457A",
  },
  name: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  role: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748b",
  },

  /* CARD */
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: "#475569",
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
});
