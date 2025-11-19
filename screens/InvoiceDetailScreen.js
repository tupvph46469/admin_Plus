import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InvoiceDetailScreen({ route, navigation }) {
  const { invoice } = route.params || {};

  return (
    <View style={styles.container}>

      <ScrollView contentContainerStyle={styles.content}>
        {!invoice ? (
          <Text style={styles.empty}>Không có dữ liệu hóa đơn.</Text>
        ) : (
          <View style={styles.card}>
            <DetailRow label="ID" value={invoice.id} />
            <DetailRow label="Thời gian" value={invoice.time} />
            <DetailRow label="Ngày" value={invoice.date} />
            <DetailRow label="Khu vực" value={invoice.area} />
            <DetailRow label="Số tiền" value={invoice.amount} />
            <DetailRow label="Phương thức" value={invoice.method} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
  content: { padding: 16 },
  empty: { textAlign: "center", marginTop: 40, color: "#666" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  label: { color: "#666", fontSize: 15 },
  value: { color: "#333", fontSize: 15, fontWeight: "600" },
});
