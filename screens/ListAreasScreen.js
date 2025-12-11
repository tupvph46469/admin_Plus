import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import Service 
import { listAreas } from '../services/areaService';

export default function ListAreasScreen({ navigation }) {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiResponse = await listAreas();

      // ✅ CẢI THIỆN XỬ LÝ DỮ LIỆU TRẢ VỀ TỪ API
      let listData = apiResponse;

      // Xử lý nếu API trả về { data: [...] } hoặc { data: { data: [...] } }
      if (apiResponse && apiResponse.data) {
        listData = apiResponse.data;
      }

      if (listData && listData.data) {
        listData = listData.data;
      }

      // Kiểm tra xem kết quả cuối cùng có phải là mảng không
      if (!Array.isArray(listData)) {
        // Log chi tiết nếu cần thiết để debug cấu trúc API
        console.error('Lỗi cấu trúc dữ liệu API:', apiResponse);
        throw new Error(`Dữ liệu trả về không phải mảng. Vui lòng kiểm tra API.`);
      }

      setAreas(listData);

    } catch (err) {
      console.error('❌ Lỗi chi tiết khi tải danh sách khu vực:', err.message);
      setAreas([]);
      setError('Lỗi kết nối hoặc API. Không thể tải danh sách khu vực.');

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAreas();
    const unsubscribe = navigation.addListener('focus', () => {
      // Tải lại dữ liệu khi màn hình được focus (quay lại từ Detail/Add)
      fetchAreas();
    });
    return unsubscribe;
  }, [navigation, fetchAreas]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      // ✅ ĐÃ SỬA: Bổ sung key prop vào renderItem (Mặc dù FlatList đã xử lý, nhưng đây là cách an toàn)
      key={item._id || item.id}
      style={styles.row}
      onPress={() => navigation.navigate('Chi tiết khu vực', { area: item })}
    >
      <View style={[styles.colorBox, { backgroundColor: item.color || '#ccc' }]} />
      <View style={styles.meta}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.small}>{item.code} • Thứ tự: {item.orderIndex}</Text>
      </View>
      <Text style={[styles.status, { color: item.active ? '#4CAF50' : '#F44336' }]}>
        {item.active ? 'Hoạt động' : 'Tắt'}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );

  let listContent;

  if (loading) {
    listContent = (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.statusText}>Đang tải danh sách khu vực...</Text>
      </View>
    );
  } else if (error || areas.length === 0) {
    listContent = (
      <View style={styles.center}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={styles.statusText}>Chưa có khu vực nào được tạo.</Text>
        )}

        <TouchableOpacity style={styles.retryButton} onPress={fetchAreas}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    listContent = (
      <FlatList
        data={areas}
        // ✅ ĐÃ SỬA: Đảm bảo keyExtractor sử dụng '_id' hoặc 'id'
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerPlaceholder} />

      {listContent}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Thêm khu vực')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerPlaceholder: { height: 18 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  colorBox: { width: 36, height: 36, borderRadius: 6, marginRight: 12 },
  meta: { flex: 1 },
  name: { fontSize: 16, color: '#333', fontWeight: '600' },
  small: { color: '#777', marginTop: 4 },
  status: { marginRight: 8, fontSize: 13, fontWeight: '600' },
  sep: { height: 1, backgroundColor: '#f6f6f6' },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    zIndex: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});