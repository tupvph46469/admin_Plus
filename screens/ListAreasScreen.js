import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const sample = [
  {
    _id: '691dc5890d00bb5b0e6b8383',
    name: 'Khu vực 1',
    code: 'KV1',
    color: '#4CAF50',
    orderIndex: 1,
    active: true,
    createdAt: '2025-11-19T10:00:00.000+00:00',
    updatedAt: '2025-11-19T10:00:00.000+00:00',
  },
  {
    _id: '691dc5890d00bb5b0e6b8384',
    name: 'Khu vực 2',
    code: 'KV2',
    color: '#FF9800',
    orderIndex: 2,
    active: true,
    createdAt: '2025-11-19T10:00:00.000+00:00',
    updatedAt: '2025-11-19T10:00:00.000+00:00',
  },
];

export default function ListAreasScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('Chi tiết khu vực', { area: item })}
    >
      <View style={[styles.colorBox, { backgroundColor: item.color }]} />
      <View style={styles.meta}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.small}>{item.code} • Thứ tự: {item.orderIndex}</Text>
      </View>
      <Text style={styles.price}>{item.active ? 'Hoạt động' : 'Tắt'}</Text>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerPlaceholder} />
      <FlatList
        data={sample}
        keyExtractor={(i) => i._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={() => (
          <View style={{ padding: 20 }}>
            <Text style={{ color: '#666' }}>Chưa có khu vực nào.</Text>
          </View>
        )}
      />

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
  price: { marginRight: 8, color: '#666', fontSize: 13 },
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
  },
});
