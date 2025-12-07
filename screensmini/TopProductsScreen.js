// src/screensmini/TopProductsScreen.js
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { getTopProducts } from "../services/reportService";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width - 32;

export default function TopProductsScreen() {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);

  const [from, setFrom] = useState(new Date());
  const [to, setTo] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [filterBy, setFilterBy] = useState("qty"); // qty | amount

  // Top 5 / Top 20
  const [limit, setLimit] = useState(5);
  const [showAll, setShowAll] = useState(false);

  // 🔥 trạng thái lỗi
  const [error, setError] = useState(null); // null | "fetch"

  // 🔥 quick range: today | 7days | month | custom
  const [rangeType, setRangeType] = useState("today");

  useEffect(() => {
    // khi mở màn hình lần đầu → set Today cho from/to
    applyQuickRange("today", { triggerLoad: false });
  }, []);

  useEffect(() => {
    loadData();
  }, [from, to, filterBy, limit]);

  const formatDate = (d) => d.toISOString().substring(0, 10);

  const formatDatePlusOneDay = (d) => {
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    return next.toISOString().substring(0, 10);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const fromStr = formatDate(from);
      const toStr = formatDatePlusOneDay(to);

      const { items } = await getTopProducts({
        from: fromStr,
        to: toStr,
        limit,
        by: filterBy,
        paidOnly: true,
      });

      setList(items || []);
    } catch (err) {
      console.log("Lỗi load top products:", err);
      setList([]);
      setError("fetch");
    } finally {
      setLoading(false);
    }
  };

  // sort theo filterBy
  const sortedList = useMemo(() => {
    const clone = [...list];

    if (filterBy === "amount") {
      clone.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    } else {
      clone.sort((a, b) => (b.qty || 0) - (a.qty || 0));
    }

    return clone;
  }, [list, filterBy]);

  // label ngắn cho trục X
  const shortName = (name = "") => {
    if (name.length <= 8) return name;
    return name.slice(0, 7) + "…";
  };

  const labels = sortedList.map((i) => shortName(i.name || "N/A"));
  const values = sortedList.map((i) =>
    filterBy === "amount" ? i.amount || 0 : i.qty || 0
  );

  // tổng metric để show tóm tắt
  const totalMetric = useMemo(
    () =>
      sortedList.reduce(
        (sum, item) =>
          sum +
          (filterBy === "amount" ? item.amount || 0 : item.qty || 0),
        0
      ),
    [sortedList, filterBy]
  );

  const metricLabel = filterBy === "amount" ? "Doanh thu" : "Số lượng bán";
  const formattedTotalMetric =
    filterBy === "amount"
      ? totalMetric.toLocaleString() + " đ"
      : totalMetric.toLocaleString() + " lượt";

  const handleToggleShowAll = () => {
    if (showAll) {
      setShowAll(false);
      setLimit(5);
    } else {
      setShowAll(true);
      setLimit(20);
    }
  };

  // 🔥 Quick range helpers
  const applyQuickRange = (type, { triggerLoad = true } = {}) => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    if (type === "today") {
      // đã là hôm nay: giữ nguyên
    } else if (type === "7days") {
      start.setDate(start.getDate() - 6); // 7 ngày gồm hôm nay
    } else if (type === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    setRangeType(type);
    setFrom(start);
    setTo(end);

    if (triggerLoad) {
      // useEffect sẽ tự load lại vì from/to thay đổi,
      // nên không cần gọi loadData() ở đây.
    }
  };

  const isCustom = rangeType === "custom";

  return (
    <ScrollView style={styles.container}>

      {/* 🔹 Box tóm tắt */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLine}>
          Đang xem:{" "}
          <Text style={styles.summaryStrong}>{metricLabel}</Text> – Top{" "}
          <Text style={styles.summaryStrong}>
            {sortedList.length || 0}
          </Text>{" "}
          sản phẩm
        </Text>
        <Text style={styles.summaryLine}>
          Tổng {metricLabel.toLowerCase()} Top{" "}
          {sortedList.length || 0}:{" "}
          <Text style={styles.summaryStrong}>{formattedTotalMetric}</Text>
        </Text>
      </View>

      {/* 🔥 Quick range buttons */}
      <View style={styles.quickRangeRow}>
        <TouchableOpacity
          style={[
            styles.quickRangeBtn,
            rangeType === "today" && styles.quickRangeActive,
          ]}
          onPress={() => applyQuickRange("today")}
        >
          <Text
            style={
              rangeType === "today" ? styles.quickRangeActiveText : styles.quickRangeText
            }
          >
            Hôm nay
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickRangeBtn,
            rangeType === "7days" && styles.quickRangeActive,
          ]}
          onPress={() => applyQuickRange("7days")}
        >
          <Text
            style={
              rangeType === "7days" ? styles.quickRangeActiveText : styles.quickRangeText
            }
          >
            7 ngày qua
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickRangeBtn,
            rangeType === "month" && styles.quickRangeActive,
          ]}
          onPress={() => applyQuickRange("month")}
        >
          <Text
            style={
              rangeType === "month" ? styles.quickRangeActiveText : styles.quickRangeText
            }
          >
            Tháng này
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickRangeBtn,
            rangeType === "custom" && styles.quickRangeActive,
          ]}
          onPress={() => setRangeType("custom")}
        >
          <Text
            style={
              rangeType === "custom"
                ? styles.quickRangeActiveText
                : styles.quickRangeText
            }
          >
            Tuỳ chọn
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bộ lọc ngày (vẫn giữ, dùng cho Tuỳ chọn) */}
      <View style={styles.filterBox}>
        <TouchableOpacity
  style={[styles.dateButton, !isCustom && styles.dateButtonDisabled]}
  onPress={() => isCustom && setShowFromPicker(true)}
  activeOpacity={isCustom ? 0.7 : 1}
>
  <View style={styles.dateRow}>
    <Text>Từ: {formatDate(from)}</Text>
    {!isCustom && (
      <Ionicons
        name="lock-closed-outline"
        size={14}
        color="#9ca3af"
        style={{ marginLeft: 4 }}
      />
    )}
  </View>
</TouchableOpacity>


        {showFromPicker && (
          <DateTimePicker
            value={from}
            mode="date"
            onChange={(e, d) => {
              setShowFromPicker(false);
              if (d) {
                setFrom(d);
                setRangeType("custom");
              }
            }}
          />
        )}

       <TouchableOpacity
  style={[styles.dateButton, !isCustom && styles.dateButtonDisabled]}
  onPress={() => isCustom && setShowToPicker(true)}
  activeOpacity={isCustom ? 0.7 : 1}
>
  <View style={styles.dateRow}>
    <Text>Đến: {formatDate(to)}</Text>
    {!isCustom && (
      <Ionicons
        name="lock-closed-outline"
        size={14}
        color="#9ca3af"
        style={{ marginLeft: 4 }}
      />
    )}
  </View>
</TouchableOpacity>


        {showToPicker && (
          <DateTimePicker
            value={to}
            mode="date"
            onChange={(e, d) => {
              setShowToPicker(false);
              if (d) {
                setTo(d);
                setRangeType("custom");
              }
            }}
          />
        )}

        {/* BY FILTER */}
        <View style={styles.filterTypeContainer}>
          <TouchableOpacity
            style={[
              styles.filterTypeButton,
              filterBy === "qty" && styles.activeFilter,
            ]}
            onPress={() => setFilterBy("qty")}
          >
            <Text style={filterBy === "qty" ? styles.activeText : undefined}>
              Số lượng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTypeButton,
              filterBy === "amount" && styles.activeFilter,
            ]}
            onPress={() => setFilterBy("amount")}
          >
            <Text
              style={filterBy === "amount" ? styles.activeText : undefined}
            >
              Doanh thu
            </Text>
          </TouchableOpacity>
        </View>

        {/* 👀 Gắn rõ metric đang xem */}
        <Text style={styles.metricHint}>
          Xếp hạng theo:{" "}
          <Text style={styles.metricHintStrong}>{metricLabel}</Text>
        </Text>
      </View>

      {/* Nút Top 5 / Top 20 */}
      <View style={{ marginBottom: 8, alignItems: "flex-end" }}>
        <TouchableOpacity
          onPress={handleToggleShowAll}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleButtonText}>
            {showAll ? "Thu gọn (Top 5)" : "Xem tất cả (Top 20)"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================== BODY ================== */}
      {loading ? (
        <View style={{ padding: 20, alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      ) : error === "fetch" ? (
        // 🔴 Lỗi API
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>Không tải được báo cáo</Text>
          <Text style={styles.emptyText}>
            Đã xảy ra lỗi khi lấy dữ liệu. Vui lòng kiểm tra kết nối hoặc thử
            lại sau.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : sortedList.length === 0 ? (
        // 🟡 Không có dữ liệu
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📉</Text>
          <Text style={styles.emptyTitle}>Không có dữ liệu</Text>
          <Text style={styles.emptyText}>
            Không có dữ liệu trong khoảng thời gian này.{"\n"}
            Hãy thử chọn khoảng ngày rộng hơn.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => applyQuickRange("7days")}
          >
            <Text style={styles.retryText}>Xem 7 ngày qua</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* BIỂU ĐỒ: chỉ hiển thị khi KHÔNG xem all */}
          {!showAll && sortedList.length > 0 && (
            <BarChart
              data={{
                labels,
                datasets: [{ data: values }],
              }}
              width={screenWidth}
              height={280}
              fromZero
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: () => "#3b82f6",
                labelColor: () => "#333",
              }}
              style={styles.chart}
              verticalLabelRotation={0}
            />
          )}

          {/* LIST */}
          <View style={styles.listBox}>
            {sortedList.map((item, idx) => (
              <View key={idx} style={styles.row}>
                <Text style={{ flex: 1, fontSize: 15 }}>
                  {idx + 1}. {item.name}
                </Text>

                <Text style={styles.valueText}>
                  {filterBy === "amount"
                    ? (item.amount || 0).toLocaleString() + " đ"
                    : (item.qty || 0) + " lượt"}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },

  summaryBox: {
    backgroundColor: "#eef2ff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  summaryLine: {
    fontSize: 13,
    color: "#4b5563",
  },
  summaryStrong: {
    fontWeight: "700",
    color: "#111827",
  },

  quickRangeRow: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 6,
  },
  quickRangeBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  quickRangeText: {
    fontSize: 12,
    color: "#4b5563",
  },
  quickRangeActive: {
    backgroundColor: "#1d4ed8",
    borderColor: "#1d4ed8",
  },
  quickRangeActiveText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },

  filterBox: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  dateButton: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
  },
  dateButtonDisabled: {
    opacity: 0.6,
  },
  filterTypeContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  filterTypeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    marginRight: 6,
  },
  activeFilter: {
    backgroundColor: "#3b82f6",
  },
  activeText: {
    color: "#fff",
    fontWeight: "700",
  },
  metricHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },
  metricHintStrong: {
    fontWeight: "600",
    color: "#111827",
  },

  chart: {
    borderRadius: 10,
    marginVertical: 10,
  },
  listBox: {
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    marginBottom: 40,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#e5e7eb",
  },
  valueText: {
    fontWeight: "700",
    width: 110,
    textAlign: "right",
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e5edff",
  },
  toggleButtonText: {
    fontSize: 13,
    color: "#1d4ed8",
    fontWeight: "600",
  },

  emptyBox: {
    marginTop: 24,
    marginBottom: 40,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827",
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#1d4ed8",
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  dateRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

});
