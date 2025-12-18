import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import promotionService from '../services/promotionService';

const SCOPE_LABEL = {
  time: 'Theo thời gian',
  product: 'Theo sản phẩm',
  bill: 'Theo hóa đơn',
};

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function PromotionDetailScreen({ navigation, route }) {
  const { promotionId } = route.params;
  const [loading, setLoading] = useState(true);
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    loadDetail();
  }, []);

  async function loadDetail() {
    try {
      const data = await promotionService.getPromotionById(promotionId);
      setPromo(data);
    } catch (e) {
      Alert.alert('Lỗi', 'Không tải được chi tiết khuyến mãi');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    Alert.alert('Xóa khuyến mãi?', 'Hành động này không thể hoàn tác', [
      { text: 'Hủy' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await promotionService.deletePromotion(promotionId);
          navigation.goBack();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!promo) return null;

  return (
    <ScrollView style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Text style={styles.name}>{promo.name}</Text>
        <View
          style={[
            styles.badge,
            promo.active ? styles.active : styles.inactive,
          ]}
        >
          <Text style={styles.badgeText}>
            {promo.active ? 'Đang bật' : 'Đang tắt'}
          </Text>
        </View>
      </View>

      <Detail label="Mã khuyến mãi" value={promo.code} />
      <Detail label="Phạm vi" value={SCOPE_LABEL[promo.scope]} />
      <Detail label="Thứ tự áp dụng" value={String(promo.applyOrder)} />

      {/* ===== DISCOUNT ===== */}
      <Section title="Mức giảm">
        <Detail
          label="Loại"
          value={promo.discount.type === 'percent' ? 'Phần trăm' : 'Số tiền'}
        />
        <Detail
          label="Giá trị"
          value={
            promo.discount.type === 'percent'
              ? `${promo.discount.value}%`
              : `${promo.discount.value.toLocaleString()}đ`
          }
        />
        <Detail label="Áp dụng cho" value={promo.discount.applyTo} />
        {promo.discount.maxAmount && (
          <Detail
            label="Giảm tối đa"
            value={`${promo.discount.maxAmount.toLocaleString()}đ`}
          />
        )}
      </Section>

      {/* ===== TIME RULE ===== */}
      {promo.scope === 'time' && (
        <Section title="Điều kiện thời gian">
          <Detail label="Từ ngày" value={formatDate(promo.timeRule.validFrom)} />
          <Detail label="Đến ngày" value={formatDate(promo.timeRule.validTo)} />
          <Detail
            label="Ngày áp dụng"
            value={
              promo.timeRule.daysOfWeek.length
                ? promo.timeRule.daysOfWeek.map((d) => DAYS[d]).join(', ')
                : '—'
            }
          />
          <Detail
            label="Khung giờ"
            value={
              promo.timeRule.timeRanges.length
                ? promo.timeRule.timeRanges
                    .map((t) => `${t.from}–${t.to}`)
                    .join(', ')
                : '—'
            }
          />
          <Detail
            label="Tối thiểu phút chơi"
            value={`${promo.timeRule.minMinutes} phút`}
          />
        </Section>
      )}

      {/* ===== BILL RULE (MỚI) ===== */}
      {promo.scope === 'bill' && promo.billRule && (
        <Section title="Điều kiện hóa đơn">
          <Detail
            label="Hóa đơn tối thiểu"
            value={`${promo.billRule.minSubtotal.toLocaleString()}đ`}
          />

          {promo.billRule.minServiceAmount > 0 && (
            <Detail
              label="Dịch vụ tối thiểu"
              value={`${promo.billRule.minServiceAmount.toLocaleString()}đ`}
            />
          )}

          {promo.billRule.minPlayMinutes > 0 && (
            <Detail
              label="Phút chơi tối thiểu"
              value={`${promo.billRule.minPlayMinutes} phút`}
            />
          )}
        </Section>
      )}

      {/* ===== DESCRIPTION ===== */}
      {promo.description ? (
        <Section title="Mô tả">
          <Text style={styles.desc}>{promo.description}</Text>
        </Section>
      ) : null}

      {/* ===== ACTIONS ===== */}
      <View style={styles.row}>
        <Button
          text="Sửa"
          primary
          onPress={() =>
            navigation.navigate('PromotionForm', {
              mode: 'edit',
              promotionId,
            })
          }
        />
        <Button text="Xóa" danger onPress={handleDelete} />
      </View>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Detail({ label, value }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Button({ text, onPress, primary, danger }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        primary && styles.primary,
        danger && styles.danger,
      ]}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

function formatDate(v) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('vi-VN');
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 20, fontWeight: '700' },

  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  active: { backgroundColor: '#E8F5E9' },
  inactive: { backgroundColor: '#FCE4EC' },
  badgeText: { fontWeight: '600' },

  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },

  detail: { marginBottom: 8 },
  label: { color: '#777', fontSize: 13 },
  value: { fontSize: 15, fontWeight: '500' },

  desc: { fontSize: 14, lineHeight: 20 },

  row: { flexDirection: 'row', gap: 12, marginTop: 20 },

  button: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#CCC',
    alignItems: 'center',
  },
  primary: { backgroundColor: '#1E88E5' },
  danger: { backgroundColor: '#E53935' },
  buttonText: { color: '#FFF', fontWeight: '600' },
});
