import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const sampleData = [
  {
    id: "1",
    name: "Sáng",
    timeRange: "12:00 - 12:30",
    days: ["T2", "T3", "T4", "T5", "T6"],
    price: "50000",
  }, 
   {
    id: "2",
    name: "Chiều",
    timeRange: "15:00 - 15:30",
    days: ["T2", "T3", "T4", "T5", "T6"],
    price: "50000",
  },

  // thêm  dòng mẫu ở đây
];

export default function ListPlayPriceScreen({ navigation }) {
  const renderRow = ({ item }) => (
    <View style={styles.row}>
      <View style={[styles.cell, { flex: 2 }]}> 
        <Text style={styles.cellText}>{item.name}</Text>
      </View>
      <View style={[styles.cell, { flex: 3 }]}> 
        <Text style={styles.cellText}>{item.timeRange}</Text>
      </View>
      <View style={[styles.cell, { flex: 3 }]}> 
        <Text style={styles.cellText}>{item.days.join(", ")}</Text>
      </View>
      <View style={[styles.cell, { flex: 2, alignItems: "flex-end" }]}> 
        <Text style={styles.cellText}>{item.price} đ/h</Text>
      </View>
      <View style={[styles.cell, { width: 44, alignItems: "center" }]}> 
        <TouchableOpacity onPress={() => onDelete(item)}>
          <Ionicons name="trash-outline" size={20} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const onDelete = (item) => {
    Alert.alert("Xóa", `Xóa khung giờ ${item.name}?`, [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: () => {} },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerPlaceholder} />

      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, { flex: 2 }]}>Tên</Text>
        <Text style={[styles.headerText, { flex: 3 }]}>Khung giờ</Text>
        <Text style={[styles.headerText, { flex: 3 }]}>Ngày</Text>
        <Text style={[styles.headerText, { flex: 2, textAlign: 'right' }]}>Giá</Text>
        <Text style={[styles.headerText, { width: 44, textAlign: 'center' }]}></Text>
      </View>

      <FlatList
        data={sampleData}
        keyExtractor={(i) => i.id}
        renderItem={renderRow}
        contentContainerStyle={{ padding: 12 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("Add giờ chơi")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "600", color: "#333" },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    alignItems: "center",
  },
  headerText: { fontSize: 13, color: "#666", fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  cell: { paddingHorizontal: 6 },
  cellText: { fontSize: 15, color: "#333" },
  separator: { height: 1, backgroundColor: "#f6f6f6" },
  headerPlaceholder: { height: 18 },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});
