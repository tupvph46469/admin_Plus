// src/screens/TopProductsScreen.js
import React, { useEffect, useState } from "react";
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
import { getTopProducts } from "../services/reportService"; // ✅ ĐỔI LẠI

const screenWidth = Dimensions.get("window").width - 32;

export default function TopProductsScreen() {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);

  const [from, setFrom] = useState(new Date());
  const [to, setTo] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [filterBy, setFilterBy] = useState("qty"); // qty | amount

  useEffect(() => {
    loadData();
  }, [from, to, filterBy]);

  const formatDate = (d) => d.toISOString().substring(0, 10);

  // BE đang coi `to` là 00:00 → +1 ngày để bao trọn ngày
  const formatDatePlusOneDay = (d) => {
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    return next.toISOString().substring(0, 10);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const fromStr = formatDate(from);
      const toStr = formatDatePlusOneDay(to);

      const { items } = await getTopProducts({
        from: fromStr,
        to: toStr,
        limit: 10,
        by: filterBy,
        paidOnly: true,
      });

      setList(items || []);
    } catch (err) {
      console.log("Lỗi load top products:", err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const labels = list.map((i) => i.name || "N/A");
  const values = list.map((i) =>
    filterBy === "amount" ? i.amount || 0 : i.qty || 0
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Top Sản Phẩm Bán Chạy</Text>

      {/* Bộ lọc */}
      <View style={styles.filterBox}>
        {/* FROM DATE */}
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowFromPicker(true)}
        >
          <Text>Từ: {formatDate(from)}</Text>
        </TouchableOpacity>

        {showFromPicker && (
          <DateTimePicker
            value={from}
            mode="date"
            onChange={(e, d) => {
              setShowFromPicker(false);
              if (d) setFrom(d);
            }}
          />
        )}

        {/* TO DATE */}
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowToPicker(true)}
        >
          <Text>Đến: {formatDate(to)}</Text>
        </TouchableOpacity>

        {showToPicker && (
          <DateTimePicker
            value={to}
            mode="date"
            onChange={(e, d) => {
              setShowToPicker(false);
              if (d) setTo(d);
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
      </View>

      {loading ? (
        <View style={{ padding: 20, alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <>
          {/* BIỂU ĐỒ */}
          {list.length > 0 ? (
            <BarChart
              data={{
                labels,
                datasets: [{ data: values }],
              }}
              width={screenWidth}
              height={300}
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: () => "#3b82f6",
                labelColor: () => "#333",
              }}
              style={styles.chart}
              verticalLabelRotation={45}
            />
          ) : (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              Không có dữ liệu
            </Text>
          )}

          {/* LIST */}
          <View style={styles.listBox}>
            {list.map((item, idx) => (
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
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
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
  chart: {
    borderRadius: 10,
    marginVertical: 16,
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
    borderColor: "#ccc",
  },
  valueText: {
    fontWeight: "700",
    width: 100,
    textAlign: "right",
  },
});
