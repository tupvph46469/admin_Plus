import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAllProducts } from '../services/ProductService';
import { API_URL } from '../constants/config';

const FILE_BASE_URL = API_URL.replace('/api/v1', '');

export default function ItemListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getAllProducts();
      setItems(list);
    } catch (e) {
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
          <Text style={{ color: '#fff' }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const imageUrl = item.images?.length
      ? `${FILE_BASE_URL}${item.images[0]}`
      : 'https://via.placeholder.com/60';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Chi tiết mặt hàng', { item })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: imageUrl }} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          {item.category?.name && (
            <Text style={styles.category}>{item.category.name}</Text>
          )}
        </View>

        <View style={styles.priceBox}>
          <Text style={styles.price}>{item.price} đ</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item, index) =>
          item?.id
            ? String(item.id)
            : item?._id
            ? String(item._id)
            : String(index)
        }
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Thêm mặt hàng')}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#eee',
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },

  category: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },

  priceBox: {
    backgroundColor: '#EAF3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  retryBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
