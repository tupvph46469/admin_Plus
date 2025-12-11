import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../services/authService";

const menuData = [
  {
    title: "Quản lý mặt hàng",
    icon: "cube-outline",
    color: "#FF6B35",
    children: ["Giá giờ chơi", "Mặt hàng", "Danh mục", "Combo"],
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

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const confirmLogout = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn đăng xuất?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: handleLogout,
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn("Logout error (ignored):", e);
    } finally {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  };

  const handleSubItemPress = (subItem) => {
    const routeMap = {
      "Mặt hàng": "Mặt hàng",
      "Vai trò": "Vai trò",
      "Nhân viên": "Nhân viên",
      "Thông tin nhà hàng": "Thông tin nhà hàng",
      "Thiết lập ngôn ngữ": "Thiết lập ngôn ngữ",
      "Giá giờ chơi": "List giờ chơi",
      "Khu vực": "Khu vực",
      "Bàn chơi": "Bàn chơi",
      "Tài khoản người dùng": "Tài khoản",
      "Thông tin câu lạc bộ": "Thông tin nhà hàng",
    };

    const route = routeMap[subItem];
    if (route) {
      navigation.navigate(route);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Card */}
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => navigation.navigate("Tài khoản")}
        activeOpacity={0.7}
      >
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={32} color="#007AFF" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>Kiều Khánh Duy</Text>
          <Text style={styles.role}>Chủ Quán</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      {/* Menu Items */}
      {menuData.map((item, index) => (
        <View key={index} style={styles.card}>
          {/* Header */}
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              if (item.title === "Đăng xuất") {
                confirmLogout();
                return;
              }
              toggleExpand(index);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: item.color + "20" }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.itemText}>{item.title}</Text>
            </View>
            {item.children.length > 0 && (
              <Ionicons
                name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                size={22}
                color="#666"
              />
            )}
            {item.children.length === 0 && (
              <Ionicons name="chevron-forward" size={22} color="#666" />
            )}
          </TouchableOpacity>

          {/* Sub List */}
          {expandedIndex === index && item.children.length > 0 && (
            <View style={styles.subList}>
              {item.children.map((subItem, subIndex) => (
                <TouchableOpacity
                  key={subIndex}
                  style={styles.subItem}
                  onPress={() => handleSubItemPress(subItem)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.subText}>{subItem}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}

      {/* Bottom spacing */}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 16,
  },

  // PROFILE CARD
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "#666",
  },

  // CARD
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },

  // ITEM
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },

  // SUB LIST
  subList: {
    backgroundColor: "#fff",
    paddingTop: 8,
    paddingBottom: 8,
  },
  subItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  subText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
});