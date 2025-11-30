import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const menuData = [
  {
    title: "Quản lý mặt hàng",
    icon: "cube-outline",
    children: ["Giá giờ chơi","Mặt hàng", "Thực đơn", "Danh mục", "Combo"],
  },
  {
    title: "Quản lý nhân viên",
    icon: "people-outline",
    children: ["Nhân viên", "Vai trò"],
  },
  {
    title: "Quản lý bàn chơi",
    icon: "hardware-chip-outline",
    children: ["Khu vực", "Bàn chơi"],
  },
 
  {
    title: "Thiết lập nhà hàng",
    icon: "settings-outline",
    children: [
      "Thông tin nhà hàng",
      "Tài khoản nhà hàng",
      "Thiết lập ngôn ngữ",
    ],
  },

  {
    title: "Đăng xuất",
    icon: "swap-horizontal-outline",
    children: [],
  },
];

export default function MoreScreen({ navigation }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.profile} onPress={() => navigation.navigate("Tài khoản")}>
        <Ionicons name="person-circle-outline" size={50} color="#007AFF" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.name}>Văn Tu</Text>
          <Text style={styles.role}>Chủ nhà hàng</Text>
        </View>
      </TouchableOpacity>

      {menuData.map((item, index) => (
        <View key={index}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => toggleExpand(index)}
          >
            <View style={styles.itemLeft}>
              <Ionicons
                name={item.icon}
                size={22}
                color="#007AFF"
                style={styles.icon}
              />
              <Text style={styles.itemText}>{item.title}</Text>
            </View>
            {item.children.length > 0 && (
              <Ionicons
                name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                size={18}
                color="#007AFF"
              />
            )}
            {item.children.length === 0 && (
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            )}
          </TouchableOpacity>

          {expandedIndex === index && item.children.length > 0 && (
            <View style={styles.subList}>
              {item.children.map((subItem, subIndex) => (
                <TouchableOpacity
                  key={subIndex}
                  style={styles.subItem}
                  onPress={() => {
                    if (subItem === "Mặt hàng") {
                      navigation.navigate("Mặt hàng");
                    } else if (subItem === "Vai trò") {
                      navigation.navigate("Vai trò");
                    } else if (subItem === "Nhân viên") {
                      navigation.navigate("Nhân viên");
                    } else if (subItem === "Thông tin nhà hàng") {
                      navigation.navigate("Thông tin nhà hàng");
                    } else if (subItem === "Thiết lập ngôn ngữ") {
                      navigation.navigate("Thiết lập ngôn ngữ");
                    } else if (subItem === "Giá giờ chơi") {
                      navigation.navigate("List giờ chơi");
                    } else if (subItem === "Khu vực") {
                      navigation.navigate("Khu vực");
                    } else if (subItem === "Bàn chơi") {
                      navigation.navigate("Bàn chơi");
                    }
                    // sau này thêm các điều hướng khác tại đây
                  }}
                >
                  <Text style={styles.subText}>{subItem}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  role: {
    fontSize: 14,
    color: "#777",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  subList: {
    paddingLeft: 40,
    paddingVertical: 5,
  },
  subItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  subText: {
    fontSize: 15,
    color: "#555",
  },
});
