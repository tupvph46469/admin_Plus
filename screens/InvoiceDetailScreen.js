import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getBillDetail } from "../services/billService";


const InvoiceDetailScreen = ({ route, navigation }) => {
  const { billId } = route.params;

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, []);

  const loadDetail = async () => {
    try {
      const data = await getBillDetail(billId);

      console.log("📌 Chi tiết hóa đơn:", data);
      setBill(data);
    } catch (error) {
      console.log("❌ Lỗi tải chi tiết hóa đơn:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPlayTime = (start, end, duration) => {
    if (!start || !end) return "Không rõ";

    const s = new Date(start);
    const e = new Date(end);

    const sTime = `${String(s.getHours()).padStart(2, "0")}:${String(
      s.getMinutes()
    ).padStart(2, "0")}`;
    const eTime = `${String(e.getHours()).padStart(2, "0")}:${String(
      e.getMinutes()
    ).padStart(2, "0")}`;

    const diff = duration || Math.round((e - s) / 60000);

    return `${sTime} → ${eTime} (${diff} phút)`;
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Đang tải chi tiết hóa đơn...</Text>
      </View>
    );
  }

  if (!bill) {
    return (
      <View style={styles.emptyBox}>
        <Text>Không tìm thấy hóa đơn!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={26}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Chi tiết hóa đơn</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* INFO */}
      <View style={styles.box}>
        <Text style={styles.title}>Mã hóa đơn</Text>
        <Text style={styles.value}>{bill.code}</Text>

        <Text style={styles.title}>Bàn</Text>
        <Text style={styles.value}>{bill.tableName}</Text>

        <Text style={styles.title}>Giờ chơi</Text>
        <Text style={styles.value}>
          {formatPlayTime(bill.startTime, bill.endTime, bill.durationMinutes)}
        </Text>
      </View>

      {/* ITEMS */}
      <View style={styles.box}>
        <Text style={styles.boxTitle}>Sản phẩm đã dùng</Text>

        {bill.items?.length > 0 ? (
          bill.items.map((p, index) => (
            <View key={index} style={styles.productRow}>
              <Text style={styles.productName}>
                {p.name} x{p.quantity}
              </Text>
              <Text style={styles.productPrice}>
                {p.amount.toLocaleString()} đ
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.value}>Không có sản phẩm</Text>
        )}
      </View>

      {/* MONEY */}
      <View style={styles.box}>
        <Text style={styles.title}>Tiền giờ chơi</Text>
        <Text style={styles.value}>
          {bill.playAmount.toLocaleString()} đ
        </Text>

        <Text style={styles.title}>Tiền dịch vụ</Text>
        <Text style={styles.value}>
          {bill.serviceAmount.toLocaleString()} đ
        </Text>

        <Text style={styles.title}>Tạm tính</Text>
        <Text style={styles.value}>{bill.subTotal.toLocaleString()} đ</Text>

        <Text style={styles.title}>Phụ thu</Text>
        <Text style={styles.value}>{bill.surcharge} đ</Text>

        <Text style={styles.title}>Giảm giá</Text>
        <Text style={styles.value}>
          {bill.discounts?.length > 0 ? bill.discounts : 0} đ
        </Text>

        <Text style={styles.totalLabel}>Tổng tiền</Text>
        <Text style={styles.totalValue}>
          {bill.total.toLocaleString()} đ
        </Text>
      </View>

      {/* PAYMENT */}
      <View style={styles.box}>
        <Text style={styles.title}>Trạng thái thanh toán</Text>
        {bill.paid ? (
          <Text style={[styles.value, { color: "#28a745" }]}>
            Đã thanh toán •{" "}
            {bill.paidAt ? new Date(bill.paidAt).toLocaleString() : ""}
          </Text>
        ) : (
          <Text style={[styles.value, { color: "#d9534f" }]}>
            Chưa thanh toán
          </Text>
        )}

        <Text style={styles.title}>Phương thức thanh toán</Text>
        <Text style={styles.value}>{bill.paymentMethod?.toUpperCase()}</Text>
      </View>

      {/* OTHER INFO */}
      <View style={styles.box}>
        <Text style={styles.title}>Nhân viên xử lý</Text>
        <Text style={styles.value}>{bill.staff}</Text>

        <Text style={styles.title}>Ghi chú</Text>
        <Text style={styles.value}>{bill.note || "—"}</Text>

        <Text style={styles.title}>Ngày tạo</Text>
        <Text style={styles.value}>
          {new Date(bill.createdAt).toLocaleString()}
        </Text>

        <Text style={styles.title}>Ngày cập nhật</Text>
        <Text style={styles.value}>
          {new Date(bill.updatedAt).toLocaleString()}
        </Text>
      </View>
    </ScrollView>
  );
};

export default InvoiceDetailScreen;

/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  box: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 2,
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  value: {
    fontSize: 14,
    marginTop: 2,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  productName: {
    fontSize: 14,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalLabel: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#d9534f",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#d9534f",
    marginTop: 4,
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
