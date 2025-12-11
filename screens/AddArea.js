import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  // ✅ THÊM ActivityIndicator
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ IMPORT HÀM API THÊM MỚI
import { addArea } from '../services/areaService'; // Giả định đường dẫn và tên hàm

// This screen is used for both Add and Edit of an Area object.
// Fields supported: _id, name, code, color, orderIndex, active, createdAt, updatedAt

export default function AddArea({ navigation }) {
  const initial = {
    name: '',
    code: '',
    color: '#4CAF50',
    orderIndex: 1,
    active: true,
  };

  const [area, setArea] = useState(initial);
  // ✅ THÊM TRẠNG THÁI LOADING
  const [loading, setLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const COLORS = ['#4CAF50', '#FF9800', '#F44336', '#2196F3', '#9C27B0', '#FFC107', '#607D8B', '#E91E63', '#00BCD4'];

  useEffect(() => {
    navigation.setOptions({ title: 'Thêm khu vực' });
  }, []);

  const setField = (key, value) => setArea((s) => ({ ...s, [key]: value }));

  // --- HÀM GỌI API THÊM MỚI ---
  const onSave = async () => {
    // 1. Kiểm tra đầu vào
    if (!area.name.trim() || !area.code.trim()) {
      Alert.alert('Lỗi', 'Tên và Code không được để trống.');
      return;
    }

    setLoading(true);
    try {
      // 2. Chuẩn hóa dữ liệu
      const dataToCreate = {
        name: area.name.trim(),
        code: area.code.trim(),
        color: area.color,
        // Đảm bảo orderIndex là số
        orderIndex: Number(area.orderIndex || 0),
        // Đảm bảo active là boolean
        active: !!area.active,
      };

      // 3. Gọi API
      await addArea(dataToCreate);

      // 4. Thành công
      Alert.alert('Thành công', `Khu vực "${area.name}" đã được tạo.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Lỗi khi thêm khu vực:', error);
      Alert.alert('Lỗi', 'Không thể thêm khu vực. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.rowHeader}>
            {/* Commented header section remains unchanged */}
          </View>

          {/* create mode — no _id / createdAt / updatedAt fields */}
          <Text style={styles.label}>Tên</Text>
          <TextInput
            style={styles.input}
            value={area.name}
            onChangeText={(t) => setField('name', t)}
            placeholder="Khu vực 1"
          />

          <Text style={styles.label}>Code</Text>
          <TextInput
            style={styles.input}
            value={area.code}
            onChangeText={(t) => setField('code', t)}
            placeholder="KV1"
          />

          <Text style={styles.label}>Màu</Text>
          <View style={styles.colorRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              value={area.color}
              onChangeText={(t) => setField('color', t)}
              placeholder="#4CAF50"
            />
            <TouchableOpacity
              style={[styles.colorSwatch, { backgroundColor: area.color || '#fff' }]}
              onPress={() => setShowColorPicker((v) => !v)}
              accessibilityLabel="Chọn màu"
            >
              <Ionicons name="color-palette" size={18} color={area.color ? '#fff' : '#333'} />
            </TouchableOpacity>
          </View>

          {showColorPicker && (
            <View style={styles.palette}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorBtn, { backgroundColor: c }]}
                  onPress={() => {
                    setField('color', c);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </View>
          )}

          <Text style={styles.label}>Thứ tự (orderIndex)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(area.orderIndex ?? '')}
            onChangeText={(t) => setField('orderIndex', Number(t || 0))}
            placeholder="1"
          />

          <View style={styles.switchRow}>
            <Text style={styles.label}>Active</Text>
            <Switch value={!!area.active} onValueChange={(v) => setField('active', v)} />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.cancel]}
              onPress={() => navigation.goBack()}
              disabled={loading} // Vô hiệu hóa khi đang tải
            >
              <Text style={styles.btnText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.save]}
              onPress={onSave}
              disabled={loading} // Vô hiệu hóa khi đang tải
            >
              {loading ? (
                // ✅ HIỂN THỊ LOADING
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.btnText, { color: '#fff' }]}>Tạo</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' }, // Sửa màu nền để nhất quán
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
  label: { color: '#666', marginTop: 10, fontWeight: '600' }, // Thêm fontWeight
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: '#333',
    flex: 1, // Fix TextInput chiếm toàn bộ chiều rộng
  },
  readonly: { backgroundColor: '#fafafa', color: '#666' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  actions: { flexDirection: 'row', marginTop: 18, justifyContent: 'space-between' },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancel: { backgroundColor: '#f0f0f0', marginRight: 8 },
  save: { backgroundColor: '#007AFF', marginLeft: 8 },
  btnText: { color: '#333', fontWeight: '700' },
  colorRow: { flexDirection: 'row', alignItems: 'center' },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  palette: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 5,
  },
  colorBtn: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});