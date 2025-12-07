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

  // ⭐ Tính giờ chơi fallback nếu không có start/end
  const getPlayTime = (bill) => {
    if (bill.startTime && bill.endTime) {
      const s = new Date(bill.startTime);
      const e = new Date(bill.endTime);
      const minutes = Math.round((e - s) / 60000);
      return `${s.getHours()}:${String(s.getMinutes()).padStart(2, "0")} → ${e.getHours()}:${String(e.getMinutes()).padStart(2, "0")} (${minutes} phút)`;
    }

    // fallback từ item type play
    const playItem = bill.items?.find((i) => i.type === "play");
    if (playItem) {
      const minutes = playItem.minutes || 0;
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}h${m}m (${minutes} phút)`;
    }

    return "Không có dữ liệu";
  };

  const getItemName = (i) => {
    return (
      i.nameSnapshot ||
      i.name ||
      i.product?.name ||
      (i.type === "play" ? "Tiền giờ chơi" : null) ||
      "Không rõ"
    );
  };

  const getStaffName = (staff) => {
    if (!staff) return "Không rõ";
    if (typeof staff === "string") return staff;
    return staff.name || staff.username || "Không rõ";
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải chi tiết hóa đơn...</Text>
      </View>
    );
  }

  if (!bill) {
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="receipt-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Không tìm thấy hóa đơn!</Text>
      </View>
    );
  }

  const tableName =
    bill.table?.name ||
    bill.tableName ||
    "Không rõ";

  const totalDiscount = Array.isArray(bill.discounts)
    ? bill.discounts.reduce((sum, d) => sum + (d.amount || 0), 0)
    : 0;

  const products = bill.items?.filter((i) => i.type === "product") || [];
  const playItem = bill.items?.find((i) => i.type === "play");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* THÔNG TIN CƠ BẢN - CARD ĐẶC BIỆT */}
      <View style={styles.primaryCard}>
        <View style={styles.codeRow}>
          <View style={styles.codeLeft}>
            <Ionicons name="receipt" size={24} color="#007AFF" />
            <View style={styles.codeInfo}>
              <Text style={styles.codeLabel}>Mã hóa đơn</Text>
              <Text style={styles.codeValue}>{bill.code}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, bill.paid ? styles.statusPaid : styles.statusUnpaid]}>
            <Ionicons 
              name={bill.paid ? "checkmark-circle" : "time"} 
              size={16} 
              color="#fff" 
            />
            <Text style={styles.statusText}>
              {bill.paid ? "Đã thanh toán" : "Chưa thanh toán"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="square-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Bàn</Text>
              <Text style={styles.infoValue}>{tableName}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="time" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Giờ chơi</Text>
              <Text style={styles.infoValue}>{getPlayTime(bill)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* SẢN PHẨM / DỊCH VỤ */}
      {products.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Sản phẩm / Dịch vụ</Text>
          </View>

          <View style={styles.productList}>
            {products.map((p, index) => (
              <View key={index} style={styles.productRow}>
                <View style={styles.productLeft}>
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyText}>{p.qty || p.quantity || 1}</Text>
                  </View>
                  <Text style={styles.productName}>{getItemName(p)}</Text>
                </View>
                <Text style={styles.productPrice}>
                  {(p.amount || 0).toLocaleString()}đ
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* CHI TIẾT THANH TOÁN */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calculator" size={20} color="#007AFF" />
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
        </View>

        <View style={styles.paymentList}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tiền giờ chơi</Text>
            <Text style={styles.paymentValue}>
              {(playItem?.amount || bill.playAmount || 0).toLocaleString()}đ
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tiền dịch vụ</Text>
            <Text style={styles.paymentValue}>
              {(bill.serviceAmount || 0).toLocaleString()}đ
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tạm tính</Text>
            <Text style={styles.paymentValue}>
              {(bill.subTotal || 0).toLocaleString()}đ
            </Text>
          </View>

          {bill.surcharge > 0 && (
            <View style={styles.paymentRow}>
              <View style={styles.paymentLabelWithIcon}>
                <Ionicons name="add-circle-outline" size={16} color="#FFA500" />
                <Text style={[styles.paymentLabel, { color: '#FFA500' }]}>Phụ thu</Text>
              </View>
              <Text style={[styles.paymentValue, { color: '#FFA500' }]}>
                +{(bill.surcharge || 0).toLocaleString()}đ
              </Text>
            </View>
          )}

          {totalDiscount > 0 && (
            <View style={styles.paymentRow}>
              <View style={styles.paymentLabelWithIcon}>
                <Ionicons name="pricetag" size={16} color="#28a745" />
                <Text style={[styles.paymentLabel, { color: '#28a745' }]}>Giảm giá</Text>
              </View>
              <Text style={[styles.paymentValue, { color: '#28a745' }]}>
                -{totalDiscount.toLocaleString()}đ
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng tiền</Text>
            <Text style={styles.totalValue}>
              {(bill.total || 0).toLocaleString()}đ
            </Text>
          </View>
        </View>
      </View>

      {/* PHƯƠNG THỨC THANH TOÁN */}
      {bill.paid && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>

          <View style={styles.paymentMethodCard}>
            <View style={styles.paymentMethodRow}>
              <Ionicons 
                name={bill.paymentMethod === 'cash' ? 'cash' : 'card'} 
                size={24} 
                color="#007AFF" 
              />
              <Text style={styles.paymentMethodText}>
                {bill.paymentMethod?.toUpperCase() || "KHÔNG RÕ"}
              </Text>
            </View>
            {bill.paidAt && (
              <Text style={styles.paymentTime}>
                {new Date(bill.paidAt).toLocaleString('vi-VN')}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* THÔNG TIN KHÁC */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.sectionTitle}>Thông tin khác</Text>
        </View>

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={18} color="#666" />
            <View style={styles.infoTextBlock}>
              <Text style={styles.infoRowLabel}>Nhân viên xử lý</Text>
              <Text style={styles.infoRowValue}>{getStaffName(bill.staff)}</Text>
            </View>
          </View>

          {bill.note && (
            <View style={styles.infoRow}>
              <Ionicons name="chatbox" size={18} color="#666" />
              <View style={styles.infoTextBlock}>
                <Text style={styles.infoRowLabel}>Ghi chú</Text>
                <Text style={styles.infoRowValue}>{bill.note}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={18} color="#666" />
            <View style={styles.infoTextBlock}>
              <Text style={styles.infoRowLabel}>Ngày tạo</Text>
              <Text style={styles.infoRowValue}>
                {bill.createdAt
                  ? new Date(bill.createdAt).toLocaleString('vi-VN')
                  : "Không rõ"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time" size={18} color="#666" />
            <View style={styles.infoTextBlock}>
              <Text style={styles.infoRowLabel}>Cập nhật cuối</Text>
              <Text style={styles.infoRowValue}>
                {bill.updatedAt
                  ? new Date(bill.updatedAt).toLocaleString('vi-VN')
                  : "Không rõ"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Khoảng trống cuối */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

export default InvoiceDetailScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  contentContainer: {
    padding: 16,
  },
  loadingBox: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#fff"
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666"
  },
  emptyBox: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#fff"
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999"
  },

  // PRIMARY CARD
  primaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  codeLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  codeInfo: {
    marginLeft: 12,
  },
  codeLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  codeValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusPaid: {
    backgroundColor: "#28a745",
  },
  statusUnpaid: {
    backgroundColor: "#ff3b30",
  },
  statusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  // SECTION
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },

  // PRODUCT LIST
  productList: {
    gap: 12,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  productLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  qtyBadge: {
    backgroundColor: "#E3F2FD",
    borderRadius: 6,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  productName: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  // PAYMENT LIST
  paymentList: {
    gap: 12,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  paymentLabel: {
    fontSize: 15,
    color: "#666",
  },
  paymentLabelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#007AFF",
  },

  // PAYMENT METHOD
  paymentMethodCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 16,
  },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  paymentTime: {
    fontSize: 13,
    color: "#666",
    marginTop: 8,
    marginLeft: 36,
  },

  // INFO LIST
  infoList: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoTextBlock: {
    marginLeft: 12,
    flex: 1,
  },
  infoRowLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  infoRowValue: {
    fontSize: 15,
    color: "#333",
  },
});