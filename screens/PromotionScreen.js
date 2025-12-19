import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import promotionService from '../services/promotionService';

const SCOPE_LABEL = {
  time: 'Theo thời gian',
  product: 'Theo sản phẩm',
  bill: 'Theo hóa đơn',
};

export default function PromotionScreen({ navigation }) {
  const [promotions, setPromotions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const data = await promotionService.getPromotions({ sort: 'applyOrder' });
    setPromotions(data.items || []);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function renderItem({ item }) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('PromotionDetail', {
            promotionId: item.id || item._id,
          })
        }
      >
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <View
              style={[
                styles.badge,
                item.active ? styles.active : styles.inactive,
              ]}
            >
              <Text style={styles.badgeText}>
                {item.active ? 'Đang bật' : 'Tắt'}
              </Text>
            </View>
          </View>

          <Text style={styles.code}>Mã: {item.code}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              Phạm vi: {SCOPE_LABEL[item.scope]}
            </Text>
            <Text style={styles.meta}>
              Thứ tự: {item.applyOrder}
            </Text>
          </View>

          <Text style={styles.discount}>
            Giảm:{' '}
            {item.discount?.type === 'percent'
              ? `${item.discount.value}%`
              : `${item.discount.value.toLocaleString()}đ`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id || item._id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* ===== FLOATING ACTION BUTTON ===== */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.fab}
        onPress={() =>
          navigation.navigate('PromotionForm', { mode: 'create' })
        }
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    padding: 12,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
  },

  code: {
    marginTop: 4,
    color: '#666',
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  meta: {
    fontSize: 13,
    color: '#555',
  },

  discount: {
    marginTop: 6,
    fontWeight: '500',
    color: '#1E88E5',
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  active: {
    backgroundColor: '#E8F5E9',
  },

  inactive: {
    backgroundColor: '#FCE4EC',
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  /* ===== FAB ===== */
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E88E5',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});
