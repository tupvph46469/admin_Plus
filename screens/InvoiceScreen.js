import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity, // Import TouchableOpacity
  ScrollView,
  FlatList,
  Alert, // Thêm Alert để mô phỏng hành động
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const tabs = [
  "Tất cả",
  "Đã thanh toán",
  "Hoàn tiền một phần",
  "Hoàn tiền",
  "Đã huỷ",
  "Ghi nợ",
];

const invoices = [
  {
    id: "100000001",
    time: "21:41:22",
    date: "09/11/2025",
    area: "Khu vực 1 - 1",
    amount: "35,000 ₫",
    method: "Tiền mặt",
  },
  {
    id: "100000002",
    time: "18:22:10",
    date: "08/11/2025",
    area: "Khu vực 2 - 3",
    amount: "120,000 ₫",
    method: "Chuyển khoản",
  },
];

export default function InvoiceScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("Tất cả");

  const today = new Date();
  const todayStr = today.toLocaleDateString("vi-VN");

  // Hàm xử lý sự kiện khi nhấn vào hóa đơn
  const handleInvoicePress = (invoice) => {
    // Điều hướng sang màn Chi tiết hoá đơn, truyền toàn bộ object invoice
    console.log(`Đã nhấn vào hóa đơn có ID: ${invoice.id}`);
    navigation.navigate("Chi tiết hoá đơn", { invoice });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hoá đơn</Text>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
      >
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Date */}
      <Text style={styles.dateLabel}>HÔM NAY ({todayStr})</Text>

      {/* Invoice List */}
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // Thay thế View bằng TouchableOpacity
          <TouchableOpacity
            style={styles.invoiceItem}
            onPress={() => handleInvoicePress(item)} // Truyền cả object invoice
          >
            <View style={styles.row}>
              <Text style={styles.time}>{item.time}</Text>
              <Text style={styles.id}>{item.id}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.area}>{item.area}</Text>
              <Text style={styles.amount}>{item.amount}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.method}>{item.method}</Text>
            </View>
          </TouchableOpacity>
          // Kết thúc TouchableOpacity
        )}
        contentContainerStyle={{ paddingBottom: 340 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    color: "#555",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },
  dateLabel: {
    fontSize: 14,
    color: "#777",
    marginBottom: 10,
  },
  invoiceItem: {
    // Style này áp dụng cho TouchableOpacity mới
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  invoiceText: {
    fontSize: 15,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  time: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  id: {
    fontSize: 15,
    color: "#555",
  },
  area: {
    fontSize: 14,
    color: "#666",
  },
  amount: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  method: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
  },
});