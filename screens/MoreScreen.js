import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/authService";

const menuData = [
  {
    title: "Quản lý mặt hàng",
    icon: "cube-outline",
    color: "#FF6B35",
    children: ["Mặt hàng"],
  },
  {
    title: "Quản lý nhân viên",
    icon: "people-outline",
    color: "#007AFF",
    children: ["Nhân viên"],
  },
  {
    title: "Quản lý bàn chơi",
    icon: "grid-outline",
    color: "#9C27B0",
    children: ["Khu vực", "Bàn chơi"],
  },
  {
    title: "Đăng xuất",
    icon: "log-out-outline",
    color: "#ff3b30",
    children: [],
  },
];

export default function MoreScreen({ navigation }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();

    // reload khi quay lại màn
    const unsubscribe = navigation.addListener("focus", loadUser);
    return unsubscribe;
  }, [navigation]);

  const loadUser = async () => {
    const str = await AsyncStorage.getItem("user");
    if (str) {
      setUser(JSON.parse(str));
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const confirmLogout = () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn đăng xuất?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: handleLogout,
      },
    ]);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const handleSubItemPress = (subItem) => {
    const routeMap = {
      "Mặt hàng": "Mặt hàng",
      "Nhân viên": "Nhân viên",
      "Khu vực": "Khu vực",
      "Bàn chơi": "Bàn chơi",
    };

    const route = routeMap[subItem];
    if (route) navigation.navigate(route);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* PROFILE */}
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => navigation.navigate("Tài khoản")}
      >
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={32} color="#007AFF" />
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.name}>
            {user?.name || user?.username || "—"}
          </Text>
          <Text style={styles.role}>
            {user?.role === "admin" ? "Quản trị viên" : "Nhân viên"}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      {/* MENU */}
      {menuData.map((item, index) => (
        <View key={index} style={styles.card}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              if (item.title === "Đăng xuất") {
                confirmLogout();
                return;
              }
              toggleExpand(index);
            }}
          >
            <View style={styles.itemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: item.color + "20" }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.itemText}>{item.title}</Text>
            </View>

            {item.children.length > 0 ? (
              <Ionicons
                name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                size={22}
                color="#666"
              />
            ) : (
              <Ionicons name="chevron-forward" size={22} color="#666" />
            )}
          </TouchableOpacity>

          {expandedIndex === index && item.children.length > 0 && (
            <View style={styles.subList}>
              {item.children.map((sub, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.subItem}
                  onPress={() => handleSubItemPress(sub)}
                >
                  <Text style={styles.subText}>{sub}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

/* ================= STYLE ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  contentContainer: { padding: 16 },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: { flex: 1, marginLeft: 16 },
  name: { fontSize: 18, fontWeight: "600", color: "#333" },
  role: { fontSize: 14, color: "#666" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  itemLeft: { flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemText: { fontSize: 16, fontWeight: "500" },

  subList: { paddingVertical: 8 },
  subItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  subText: { fontSize: 15 },
});
