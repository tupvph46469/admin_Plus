import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { getBills } from "../services/billService";
import { Ionicons } from "@expo/vector-icons";

const tabs = [
  { label: "Tất cả", value: "all" },
  { label: "Đã thanh toán", value: "paid" },
  { label: "Chưa thanh toán", value: "unpaid" },
];

const QLHoaDonScreen = ({ navigation }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const data = await getBills();
      console.log("📌 API trả về:", data);

      if (Array.isArray(data)) {
        setBills(data);
      } else {
        setBills([]);
      }
    } catch (error) {
      console.log("❌ Lỗi tải hóa đơn:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentStatus = (paid, paidAt) => {
    if (paid) {
      return (
        <Text style={styles.paid}>
          Đã thanh toán {paidAt ? `• ${new Date(paidAt).toLocaleString()}` : ""}
        </Text>
      );
    }
    return <Text style={styles.unpaid}>Chưa thanh toán</Text>;
  };

  const renderItem = ({ item }) => {
    const id = item.id || item._id;
    const tableName = item.table?.name || item.tableName || "Không rõ";
    const paymentMethod = item.paymentMethod || "Không rõ";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("InvoiceDetail", { billId: id })}
      >
        <Text style={styles.title}>Mã HD: {item.code || id}</Text>
        <Text>Bàn: {tableName}</Text>

        <Text>
          Ngày:{" "}
          {item.createdAt
            ? new Date(item.createdAt).toLocaleString()
            : "Không rõ"}
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Phương thức: </Text>
          <Text>{String(paymentMethod).toUpperCase()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Trạng thái: </Text>
          {renderPaymentStatus(item.paid, item.paidAt)}
        </View>

        <Text style={styles.total}>
          Tổng tiền: {item.total ? item.total.toLocaleString() : 0} đ
        </Text>
      </TouchableOpacity>
    );
  };

  // 🔥 Lọc theo tab
  const filteredBills = bills.filter((bill) => {
    if (activeTab === "all") return true;
    if (activeTab === "paid") return bill.paid === true;
    if (activeTab === "unpaid") return bill.paid === false;
    return true;
  });

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity> */}

        <Text style={styles.headerTitle}>Quản lý hóa đơn</Text>

        <View style={{ width: 26 }} />
      </View>

      {/* 🔥 TAB FILTER */}
      <View style={styles.tabContainer}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[
              styles.tab,
              activeTab === t.value && styles.activeTab,
            ]}
            onPress={() => setActiveTab(t.value)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === t.value && styles.activeTabText,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      {filteredBills.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text>Không có hóa đơn nào.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBills}
          keyExtractor={(item) => String(item.id || item._id)}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingVertical: 16,
            paddingHorizontal: 12,
            paddingBottom: 80,
          }}
        />
      )}
    </View>
  );
};

export default QLHoaDonScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
     justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  /* TABS */
  tabContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#e5e5e5",
    borderRadius: 20,
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    color: "#333",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },

  /* LIST CARD */
  card: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
  },

  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  label: {
    fontWeight: "600",
  },

  paid: {
    color: "#28a745",
    fontWeight: "600",
    marginLeft: 4,
  },
  unpaid: {
    color: "#d9534f",
    fontWeight: "600",
    marginLeft: 4,
  },

  total: {
    color: "#d9534f",
    fontWeight: "bold",
    marginTop: 8,
  },

  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
