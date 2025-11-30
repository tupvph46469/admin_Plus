import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AddPlayScreen({ navigation, route }) {
  // If route.params?.item passed, we are editing; otherwise create new
  const item = route?.params?.item || null;

  const [name, setName] = useState(item?.name || "Sáng");
  const [timeRange, setTimeRange] = useState(item?.timeRange || "12:00 - 12:30");
  const [price, setPrice] = useState(item?.price || "50000");
  const daysLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const [selectedDays, setSelectedDays] = useState(item?.days || ["T2", "T3", "T4", "T5", "T6"]);

  const toggleDay = (d) => {
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const onDelete = () => {
    Alert.alert("Xóa", "Bạn có muốn xóa mục này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          // For demo reset and go back
          setName("");
          setTimeRange("");
          setPrice("");
          setSelectedDays([]);
          navigation.goBack();
        },
      },
    ]);
  };

  const onSave = () => {
    // For now we just show alert and go back; in real app you'd persist
    Alert.alert("Lưu", `Đã lưu: ${name} - ${timeRange} - ${price}đ/h`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Tên</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Tên khung giờ"
          />

          <Text style={styles.label}>Khung giờ</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => Alert.alert("Chọn giờ", "Demo: chọn giờ 12:00 - 12:30")}
          >
            <Text style={styles.timeText}>{timeRange || "Chọn khung giờ"}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Ngày trong tuần</Text>
          <View style={styles.daysRow}>
            {daysLabels.map((d) => {
              const active = selectedDays.includes(d);
              return (
                <TouchableOpacity
                  key={d}
                  onPress={() => toggleDay(d)}
                  style={[styles.dayItem, active && styles.dayItemActive]}
                >
                  <Text style={[styles.dayText, active && styles.dayTextActive]}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Giá bán (đ/h)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            placeholder="50000"
          />

          <TouchableOpacity style={styles.saveButton} onPress={onSave}>
            <Text style={styles.saveText}>Lưu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  content: { padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 8, padding: 12 },
  label: { marginTop: 12, color: "#666", fontSize: 14 },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: "#333",
  },
  timeButton: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 6,
    padding: 10,
    justifyContent: "center",
  },
  timeText: { color: "#333" },
  daysRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  dayItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 8,
    marginBottom: 8,
  },
  dayItemActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  dayText: { color: "#333" },
  dayTextActive: { color: "#fff" },
  saveButton: {
    marginTop: 16,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "600" },
});
