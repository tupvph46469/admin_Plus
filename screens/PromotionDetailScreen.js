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
import Toast from 'react-native-toast-message';

const SCOPE_LABEL = {
  time: 'Theo thời gian',
  product: 'Theo sản phẩm',
  bill: 'Theo hóa đơn',
};

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/* ================= NORMALIZER ================= */
function normalizeTimeRule(promo) {
  const r = promo?.conditions?.timeRules?.[0];
  if (!r) return null;

  return {
    validFrom: null,
    validTo: null,
    daysOfWeek: r.daysOfWeek || [],
    timeRanges: [{ from: r.startTime, to: r.endTime }],
    minMinutes: r.minMinutes || 0,
  };
}

export default function PromotionDetailScreen({ navigation, route }) {
  const { promotionId } = route.params;
  const [loading, setLoading] = useState(true);
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDetail();
    });
    return unsubscribe;
  }, [navigation, promotionId]);

  async function loadDetail() {
    try {
      setLoading(true);
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
    Alert.alert(
      'Xóa khuyến mãi?',
      'Hành động này không thể hoàn tác',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await promotionService.deletePromotion(promotionId);
              Toast.show({
                type: 'success',
                text1: 'Đã xóa khuyến mãi',
                position: 'bottom',
                bottomOffset: 90,
                visibilityTime: 2200,
              });
              navigation.goBack();
            } catch (e) {
              Toast.show({
                type: 'error',
                text1: 'Xóa thất bại',
                text2: 'Không thể xóa khuyến mãi',
                position: 'bottom',
                bottomOffset: 90,
                visibilityTime: 3000,
              });
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!promo) return null;

  const timeRule = normalizeTimeRule(promo);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
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
            value={promo.discount.type === 'percentage' ? 'Phần trăm' : 'Số tiền'}
          />
          <Detail
            label="Giá trị"
            value={
              promo.discount.type === 'percentage'
                ? `${promo.discount.value}%`
                : `${promo.discount.value.toLocaleString()}đ`
            }
          />
          <Detail label="Áp dụng cho" value={promo.discount.applyTo} />
        </Section>

        {/* ===== TIME RULE ===== */}
        {promo.scope === 'time' && (
          <Section title="Điều kiện thời gian">
            <Detail label="Từ ngày" value="—" />
            <Detail label="Đến ngày" value="—" />
            <Detail
              label="Ngày áp dụng"
              value={
                timeRule?.daysOfWeek?.length
                  ? timeRule.daysOfWeek.map(d => DAYS[d]).join(', ')
                  : '—'
              }
            />
            <Detail
              label="Khung giờ"
              value={
                timeRule?.timeRanges?.length
                  ? timeRule.timeRanges
                      .map(t => `${t.from}–${t.to}`)
                      .join(', ')
                  : '—'
              }
            />
            <Detail
              label="Tối thiểu phút chơi"
              value={`${timeRule?.minMinutes ?? 0} phút`}
            />
          </Section>
        )}

        {/* ===== BILL RULE ===== */}
        {promo.scope === 'bill' && promo.billRule && (
          <Section title="Điều kiện hóa đơn">
            <Detail
              label="Hóa đơn tối thiểu"
              value={`${promo.billRule.minSubtotal.toLocaleString()}đ`}
            />
          </Section>
        )}

        {/* ===== DESCRIPTION ===== */}
        {promo.description && (
          <Section title="Mô tả">
            <Text style={styles.desc}>{promo.description}</Text>
          </Section>
        )}
      </ScrollView>

      {/* ===== ACTION BAR ===== */}
      <View style={styles.actionBar}>
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
    </View>
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

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F6FA' },
  container: { flex: 1, padding: 16 },
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
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },

  detail: { marginBottom: 8 },
  label: { color: '#777', fontSize: 13 },
  value: { fontSize: 15, fontWeight: '500' },

  desc: { fontSize: 14, lineHeight: 20 },

  actionBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },

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
