import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import Services
// ✅ BỔ SUNG addArea (hoặc createArea, tùy theo cách bạn định nghĩa)
import { updateArea, deleteArea, addArea } from '../services/areaService';
import { hasTablesInArea } from '../services/tableService';


// Detail / Edit screen for an Area. Expects route.params.area for editing.
export default function DetailArea({ navigation, route }) {
  const initialData = route?.params?.area || {
    _id: null,
    name: '',
    code: '',
    color: '#2196F3',
    orderIndex: 0,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Kiểm tra cả '_id' và 'id'
  const isEditing = !!initialData._id || !!initialData.id;

  const [area, setArea] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    // Chuẩn hóa ID
    const currentAreaId = initialData._id || initialData.id;
    setArea(s => ({ ...s, _id: currentAreaId || null }));

    navigation.setOptions({ title: isEditing ? 'Chi tiết khu vực' : 'Thêm khu vực' });
  }, [isEditing, navigation]);

  const setField = (key, value) => setArea((s) => ({ ...s, [key]: value }));

  const COLORS = ['#4CAF50', '#FF9800', '#F44336', '#2196F3', '#9C27B0', '#FFC107', '#607D8B', '#E91E63', '#00BCD4'];

  // --- HÀM GỌI API CẬP NHẬT/THÊM MỚI ---
  const onUpdate = async () => {
    // 1. KIỂM TRA DỮ LIỆU ĐẦU VÀO
    if (!area.name.trim() || !area.code.trim()) {
      Alert.alert('Lỗi', 'Tên và Code không được để trống.');
      return;
    }

    setLoading(true);
    try {
      // 2. CHUẨN HÓA DỮ LIỆU
      const dataToUpdate = {
        name: area.name,
        code: area.code,
        color: area.color,
        orderIndex: Number(area.orderIndex || 0),
        active: !!area.active,
      };

      if (isEditing) {
        // LOGIC CẬP NHẬT
        const areaIdToUse = area._id || area.id;
        await updateArea(areaIdToUse, dataToUpdate);
        Alert.alert('Thành công', `Khu vực "${area.name}" đã được cập nhật.`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        // LOGIC THÊM MỚI
        await addArea(dataToUpdate);
        Alert.alert('Thành công', `Khu vực "${area.name}" đã được tạo thành công.`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }

    } catch (error) {
      // ❌ THAY THẾ: Sử dụng console.warn để ngăn toast
      console.warn('Lỗi khi thao tác với khu vực:', error);

      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || '';

      let alertMessage = 'Lỗi không xác định. Vui lòng thử lại.';

      // ✅ TĂNG CƯỜNG ƯU TIÊN CHO LỖI TRÙNG LẶP (400, 409, 500)

      if (status === 409 || status === 400 || status === 500) {

        // Nếu Server gửi message có từ khóa trùng lặp HOẶC nếu mã là 409
        if (status === 409 ||
          errorMessage.toLowerCase().includes('duplicate') ||
          errorMessage.toLowerCase().includes('exists') ||
          errorMessage.includes('trùng')) {
          // 🥇 LỖI TRÙNG LẶP ƯU TIÊN
          alertMessage = 'Tên hoặc Code Khu vực này đã tồn tại. Vui lòng chọn tên/code khác.';
        } else if (status === 400) {
          // Lỗi 400 nhưng không phải trùng lặp (ví dụ: dữ liệu không hợp lệ)
          alertMessage = 'Dữ liệu không hợp lệ (Mã 400). Vui lòng kiểm tra lại thông tin nhập.';
        } else if (status === 500) {
          // Lỗi 500 Server
          alertMessage = 'Lỗi Server (Mã 500). Đã xảy ra lỗi nội bộ khi thao tác dữ liệu. Vui lòng thử lại sau.';
        }

      } else if (status === 401 || status === 403) {
        // Lỗi 401/403 (Quyền hạn)
        alertMessage = 'Bạn không có quyền thực hiện thao tác này.';
      } else if (status) {
        // Các lỗi khác có mã trạng thái
        alertMessage = `Lỗi ${status}. Vui lòng kiểm tra kết nối hoặc quyền hạn.`;
      }

      Alert.alert('Lỗi', alertMessage);

    } finally {
      setLoading(false);
    }
  };

  // DetailArea.js - Chỉ thay đổi khối catch

  // DetailArea.js - Chỉ thay đổi khối catch

  const onDelete = () => {
    const areaIdToUse = area._id || area.id;
    if (!isEditing || !areaIdToUse) return;

    Alert.alert('Xác nhận Xóa', `Bạn có chắc muốn xóa khu vực "${area.name}"? `, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            // 1. Kiểm tra Frontend (Đã đúng)
            const hasTables = await hasTablesInArea(areaIdToUse);

            if (hasTables) {
              // THÔNG BÁO LỖI KHI CÓ BÀN (Frontend check)
              Alert.alert('Không thể xóa', `Khu vực "${area.name}" hiện đang có bàn và không thể bị xóa.`);
              return;
            }

            // 2. Nếu không có bàn, gọi API xóa
            await deleteArea(areaIdToUse);

            Alert.alert('Đã xóa', `Khu vực "${area.name}" đã được xóa thành công.`);
            navigation.goBack();

          } catch (error) {
            console.log('Lỗi khi xóa khu vực (Đã xử lý Alert):', error); 

const status = error.response?.status;

            if (status === 400) {
              // Nếu Server trả về 400 (Bad Request), đây thường là do ràng buộc dữ liệu
              // (chẳng hạn như có bàn hoặc dữ liệu liên kết khác).
              Alert.alert('Không thể xóa', `Khu vực "${area.name}" hiện đang có bàn hoặc có dữ liệu liên kết khác và không thể bị xóa.`);
            } else {
              // Các lỗi API khác (500 Server Error, 401 Unauthorized,...)
              Alert.alert('Lỗi API', 'Không thể xóa khu vực do lỗi kết nối hoặc quyền hạn.');
            }

          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // --- UI RENDER ---
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>

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
            // ✅ Đảm bảo TextInput nhận giá trị chuỗi
            value={String(area.orderIndex ?? '')}
            // ✅ Chuyển sang Number khi set state
            onChangeText={(t) => setField('orderIndex', Number(t || 0))}
            placeholder="1"
          />

          <View style={styles.switchRow}>
            <Text style={styles.label}>Active</Text>
            <Switch value={!!area.active} onValueChange={(v) => setField('active', v)} />
          </View>

          {isEditing && (
            <>
              <Text style={styles.label}>createdAt</Text>
              <TextInput style={[styles.input, styles.readonly]} editable={false} value={area.createdAt} />

              <Text style={styles.label}>updatedAt</Text>
              <TextInput style={[styles.input, styles.readonly]} editable={false} value={area.updatedAt} />
            </>
          )}

          {/* Nút Cập nhật và Xóa */}
          <View style={styles.actions}>
            {isEditing && (
              <TouchableOpacity
                style={[styles.btn, styles.delete]}
                onPress={onDelete}
                disabled={loading}
              >
                <Text style={[styles.btnText, { color: '#fff' }]}>Xóa</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              // Khi thêm mới, nút sẽ chiếm toàn bộ chiều rộng
              style={[styles.btn, styles.save, isEditing ? {} : { flex: 1, marginLeft: 0 }]}
              onPress={onUpdate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.btnText, { color: '#fff' }]}>{isEditing ? 'Cập nhật' : 'Thêm mới'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
  label: { color: '#666', marginTop: 10, fontWeight: '600' },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: '#333',
  },
  readonly: { backgroundColor: '#fafafa', color: '#666' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  actions: { flexDirection: 'row', marginTop: 24, justifyContent: 'space-between' },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  delete: { backgroundColor: '#ff3b30', marginRight: 8, flex: 0.5 },
  save: { backgroundColor: '#007AFF', marginLeft: 8, flex: 0.5 },
  btnText: { color: '#fff', fontWeight: '700' },
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