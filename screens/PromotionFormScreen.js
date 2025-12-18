import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import promotionService from '../services/promotionService';

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function PromotionFormScreen({ navigation, route }) {
  const modeInit = route.params?.mode || 'create';
  const promotionId = route.params?.promotionId;

  const [mode, setMode] = useState(modeInit);
  const [originalPromotion, setOriginalPromotion] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  /* ===== PREVIEW STATE (MỚI) ===== */
  const [previewAt, setPreviewAt] = useState('');
  const [previewResult, setPreviewResult] = useState(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    scope: 'bill',
    applyOrder: 100,
    discountValue: '',
    description: '',
    active: true,
    stackable: true,
    timeRule: {
      validFrom: null,
      validTo: null,
      daysOfWeek: [],
      timeRanges: [],
      minMinutes: 0,
    },
  });

  /* ================= LOAD DETAIL ================= */
  useEffect(() => {
    if (promotionId) loadDetail();
  }, [promotionId]);

  async function loadDetail() {
    const data = await promotionService.getPromotionById(promotionId);
    setOriginalPromotion(data);

    setForm({
      name: data.name,
      code: data.code,
      scope: data.scope,
      applyOrder: data.applyOrder,
      discountValue: String(data.discount.value),
      description: data.description || '',
      active: data.active,
      stackable: data.stackable,
      timeRule: data.timeRule || {
        validFrom: null,
        validTo: null,
        daysOfWeek: [],
        timeRanges: [],
        minMinutes: 0,
      },
    });
  }

  /* ================= VALIDATION ================= */
  function validateEditForm() {
    if (!form.name.trim()) return 'Tên khuyến mãi không được trống';

    const discountValue = Number(form.discountValue);
    if (Number.isNaN(discountValue) || discountValue < 0) {
      return 'Giá trị giảm không hợp lệ';
    }

    if (
      originalPromotion?.discount?.type === 'percent' &&
      discountValue > 100
    ) {
      return 'Giảm phần trăm không được vượt quá 100%';
    }

    if (originalPromotion?.scope === 'time') {
      const { validFrom, validTo } = form.timeRule;

      if (validFrom && validTo && new Date(validFrom) > new Date(validTo)) {
        return 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc';
      }

      if (form.timeRule.daysOfWeek.length === 0) {
        return 'Phải chọn ít nhất 1 ngày áp dụng';
      }

      for (const tr of form.timeRule.timeRanges) {
        if (!tr.from || !tr.to || tr.from >= tr.to) {
          return 'Khung giờ không hợp lệ (from < to)';
        }
      }
    }

    return null;
  }

  /* ================= PREVIEW EFFECTIVE ================= */
  function checkEffectiveAt(at) {
    if (!form.active) return false;
    const rule = form.timeRule || {};
    const now = new Date(at);

    if (rule.validFrom && now < new Date(rule.validFrom)) return false;
    if (rule.validTo) {
      const end = new Date(rule.validTo);
      end.setHours(23, 59, 59, 999);
      if (now > end) return false;
    }

    const dow = now.getDay();
    if (
      Array.isArray(rule.daysOfWeek) &&
      rule.daysOfWeek.length &&
      !rule.daysOfWeek.includes(dow)
    ) {
      return false;
    }

    if (Array.isArray(rule.timeRanges) && rule.timeRanges.length) {
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const cur = `${hh}:${mm}`;

      const ok = rule.timeRanges.some(
        (r) => r.from && r.to && r.from <= cur && cur <= r.to
      );
      if (!ok) return false;
    }

    return true;
  }

  /* ================= SAVE ================= */
  async function handleSave() {
    try {
      if (mode === 'edit') {
        const error = validateEditForm();
        if (error) {
          Alert.alert('Lỗi', error);
          return;
        }
      }

      let payload;

      if (mode === 'create') {
        payload = {
          name: form.name,
          code: form.code,
          scope: form.scope,
          applyOrder: Number(form.applyOrder),
          active: form.active,
          stackable: form.stackable,
          discount: {
            type: 'value',
            value: Number(form.discountValue),
          },
          billRule: { minSubtotal: 0 },
          description: form.description,
        };

        await promotionService.createPromotion(payload);
      } else {
        payload = {
          name: form.name,
          description: form.description,
          applyOrder: Number(form.applyOrder),
          active: form.active,
          stackable: form.stackable,
          discount: {
            type: originalPromotion.discount.type,
            applyTo: originalPromotion.discount.applyTo,
            value: Number(form.discountValue),
            maxAmount: originalPromotion.discount.maxAmount ?? null,
          },
        };

        if (originalPromotion.scope === 'time') {
          payload.timeRule = form.timeRule;
        }

        await promotionService.updatePromotion(promotionId, payload);
      }

      Alert.alert('Thành công');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu khuyến mãi');
    }
  }

  const readonly = mode === 'view';

  /* ================= UI ================= */
  return (
    <ScrollView style={styles.container}>
      {/* BASIC INFO */}
      <Input label="Tên khuyến mãi" value={form.name} editable={!readonly}
        onChange={(v) => { setForm({ ...form, name: v }); setIsDirty(true); }} />

      <Input label="Mã khuyến mãi" value={form.code} editable={mode === 'create'}
        onChange={(v) => { setForm({ ...form, code: v }); setIsDirty(true); }} />

      <Input label="Giá trị giảm" value={form.discountValue} editable={!readonly}
        keyboardType="numeric"
        onChange={(v) => { setForm({ ...form, discountValue: v }); setIsDirty(true); }} />

      <Input label="Thứ tự áp dụng" value={String(form.applyOrder)} editable={!readonly}
        keyboardType="numeric"
        onChange={(v) => { setForm({ ...form, applyOrder: v }); setIsDirty(true); }} />

      <Input label="Mô tả" value={form.description} editable={!readonly}
        onChange={(v) => { setForm({ ...form, description: v }); setIsDirty(true); }} />

      {/* STATUS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trạng thái</Text>
        <View style={styles.switchRow}>
          <Text>Kích hoạt</Text>
          <Switch value={form.active} disabled={readonly}
            onValueChange={(v) => { setForm({ ...form, active: v }); setIsDirty(true); }} />
        </View>
        <View style={styles.switchRow}>
          <Text>Cho phép cộng dồn</Text>
          <Switch value={form.stackable} disabled={readonly}
            onValueChange={(v) => { setForm({ ...form, stackable: v }); setIsDirty(true); }} />
        </View>
      </View>

      {/* TIME RULE */}
      {form.scope === 'time' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Điều kiện thời gian</Text>

          {/* DATE RANGE */}
          <Text style={styles.subLabel}>Thời gian hiệu lực</Text>
          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>Từ ngày</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                editable={!readonly}
                value={form.timeRule.validFrom ? form.timeRule.validFrom.slice(0, 10) : ''}
                onChangeText={(v) => {
                  setForm({
                    ...form,
                    timeRule: {
                      ...form.timeRule,
                      validFrom: v ? new Date(v).toISOString() : null,
                    },
                  });
                  setIsDirty(true);
                }}
              />
            </View>

            <View style={{ width: 12 }} />

            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>Đến ngày</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                editable={!readonly}
                value={form.timeRule.validTo ? form.timeRule.validTo.slice(0, 10) : ''}
                onChangeText={(v) => {
                  setForm({
                    ...form,
                    timeRule: {
                      ...form.timeRule,
                      validTo: v ? new Date(v).toISOString() : null,
                    },
                  });
                  setIsDirty(true);
                }}
              />
            </View>
          </View>

          {/* DAYS */}
          <Text style={styles.subLabel}>Ngày áp dụng</Text>
          <View style={styles.daysRow}>
            {DAYS.map((d, idx) => {
              const selected = form.timeRule.daysOfWeek.includes(idx);
              return (
                <TouchableOpacity key={idx} disabled={readonly}
                  onPress={() => {
                    const days = selected
                      ? form.timeRule.daysOfWeek.filter((x) => x !== idx)
                      : [...form.timeRule.daysOfWeek, idx];
                    setForm({ ...form, timeRule: { ...form.timeRule, daysOfWeek: days } });
                    setIsDirty(true);
                  }}
                  style={[styles.dayChip, selected && styles.dayChipActive]}>
                  <Text style={selected && { color: '#FFF' }}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* TIME RANGES */}
          <Text style={styles.subLabel}>Khung giờ</Text>

          {form.timeRule.timeRanges.map((tr, index) => (
            <View key={index} style={styles.timeRow}>
              <TextInput
                style={styles.timeInput}
                value={tr.from}
                editable={!readonly}
                placeholder="10:00"
                onChangeText={(v) => {
                  const ranges = [...form.timeRule.timeRanges];
                  ranges[index] = { ...ranges[index], from: v };
                  setForm({ ...form, timeRule: { ...form.timeRule, timeRanges: ranges } });
                  setIsDirty(true);
                }}
              />
              <Text style={{ marginHorizontal: 6 }}>–</Text>
              <TextInput
                style={styles.timeInput}
                value={tr.to}
                editable={!readonly}
                placeholder="17:00"
                onChangeText={(v) => {
                  const ranges = [...form.timeRule.timeRanges];
                  ranges[index] = { ...ranges[index], to: v };
                  setForm({ ...form, timeRule: { ...form.timeRule, timeRanges: ranges } });
                  setIsDirty(true);
                }}
              />
              {!readonly && (
                <TouchableOpacity
                  onPress={() => {
                    const ranges = form.timeRule.timeRanges.filter((_, i) => i !== index);
                    setForm({ ...form, timeRule: { ...form.timeRule, timeRanges: ranges } });
                    setIsDirty(true);
                  }}
                >
                  <Text style={{ color: '#E53935', marginLeft: 8 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {!readonly && (
            <TouchableOpacity
              onPress={() => {
                setForm({
                  ...form,
                  timeRule: {
                    ...form.timeRule,
                    timeRanges: [...form.timeRule.timeRanges, { from: '', to: '' }],
                  },
                });
                setIsDirty(true);
              }}
            >
              <Text style={styles.addText}>+ Thêm khung giờ</Text>
            </TouchableOpacity>
          )}

          <Input
            label="Phút chơi tối thiểu"
            value={String(form.timeRule.minMinutes)}
            editable={!readonly}
            keyboardType="numeric"
            onChange={(v) => {
              setForm({
                ...form,
                timeRule: { ...form.timeRule, minMinutes: Number(v) || 0 },
              });
              setIsDirty(true);
            }}
          />

          {/* PREVIEW */}
          <View style={{ marginTop: 12 }}>
            <Text style={styles.subLabel}>Kiểm tra hiệu lực</Text>
            <TextInput
              placeholder="YYYY-MM-DD HH:mm"
              value={previewAt}
              editable={!readonly}
              onChangeText={setPreviewAt}
              style={styles.previewInput}
            />
            <TouchableOpacity
              style={styles.previewBtn}
              onPress={() => {
                if (!previewAt) {
                  Alert.alert('Vui lòng nhập thời điểm kiểm tra');
                  return;
                }
                setPreviewResult(checkEffectiveAt(previewAt));
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '600' }}>
                Kiểm tra hiệu lực
              </Text>
            </TouchableOpacity>

            {previewResult !== null && (
              <Text
                style={{
                  marginTop: 8,
                  fontWeight: '600',
                  color: previewResult ? '#2E7D32' : '#C62828',
                }}
              >
                {previewResult
                  ? '✅ Khuyến mãi CÓ HIỆU LỰC tại thời điểm này'
                  : '❌ Khuyến mãi KHÔNG có hiệu lực tại thời điểm này'}
              </Text>
            )}
          </View>
        </View>
      )}

      {(mode === 'edit' || mode === 'create') && (
        <Button
          primary
          text={mode === 'create' ? 'Tạo khuyến mãi' : 'Lưu thay đổi'}
          onPress={handleSave}
          disabled={mode === 'edit' && !isDirty}
        />
      )}
    </ScrollView>
  );
}

/* ===== COMPONENTS ===== */

function Input({ label, value, onChange, editable, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.disabled]}
        value={value}
        editable={editable}
        onChangeText={onChange}
        {...props}
      />
    </View>
  );
}

function Button({ text, onPress, primary, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        primary && styles.primary,
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

/* ===== STYLES ===== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA', padding: 16 },

  field: { marginBottom: 12 },
  label: { color: '#555', marginBottom: 4 },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  disabled: { backgroundColor: '#EEE' },

  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },

  subLabel: { marginBottom: 6, fontWeight: '600' },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCC',
    marginRight: 8,
    marginBottom: 8,
  },
  dayChipActive: { backgroundColor: '#1E88E5', borderColor: '#1E88E5' },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeInput: {
    width: 70,
    borderBottomWidth: 1,
    borderColor: '#CCC',
    padding: 4,
    textAlign: 'center',
  },
  addText: { color: '#1E88E5', marginTop: 8 },

  dateRow: { flexDirection: 'row', marginBottom: 12 },
  dateLabel: { fontSize: 12, color: '#555', marginBottom: 4 },
  dateInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },

  previewInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 8,
  },
  previewBtn: {
    backgroundColor: '#455A64',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  button: {
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#CCC',
    alignItems: 'center',
  },
  primary: { backgroundColor: '#1E88E5' },
  buttonText: { color: '#FFF', fontWeight: '600' },
});
