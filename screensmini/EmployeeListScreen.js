import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator
} from "react-native";
import { getEmployees } from "../services/userService";

// Lấy 2 chữ cái đầu
const getInitials = (name) => {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/);
  return parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : name[0];
};

export default function EmployeeListScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      // Backend trả: { items, page, limit, total, sort }
      const res = await getEmployees();

      // Normalize id field for UI and avoid mixing _id/id
      const items = (res.items || []).map(it => ({ ...it, id: it.id || it._id }));

      console.log("📥 Employees response:", res);

      setEmployees(items);
    } catch (err) {
      console.log("❌ Load employees error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách tài khoản</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("Form nhân viên", {
                  mode: "edit",
                  employee: item,
                })
              }
            >
              {/* Avatar */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(item.name).toUpperCase()}
                </Text>
              </View>

              {/* Info */}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name || item.username}</Text>
                <Text style={styles.role}>
                  {item.role === "staff" ? "Lễ tân" : "Quản trị"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#777" }}>
              Không có nhân viên nào
            </Text>
          }
        />
      )}

      {/* Nút tạo mới */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("Form nhân viên", { mode: "add" })}
      >
        <Text style={styles.createText}>+ Tạo tài khoản</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center", alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  name: { fontSize: 16, fontWeight: "500", color: "#333" },
  role: { fontSize: 14, color: "#777" },
  createButton: {
    marginTop: 20, backgroundColor: "#007AFF",
    padding: 12, borderRadius: 8, alignItems: "center",
  },
  createText: { color: "#fff", fontSize: 16 },
});
