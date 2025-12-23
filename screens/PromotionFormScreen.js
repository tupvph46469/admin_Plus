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
import ProductPickerModal from '../components/ProductPickerModal';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7','CN' ];
const ACTION_BAR_HEIGHT = 80;
export default function PromotionFormScreen({ navigation, route }) {
  const modeInit = route.params?.mode || 'create';
  const promotionId = route.params?.promotionId;

  const [mode, setMode] = useState(modeInit);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [timePicker, setTimePicker] = useState({
  visible: false,
  index: null,
  field: null, // 'from' | 'to'
});

  const [originalPromotion, setOriginalPromotion] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const SCOPE_OPTIONS = [
  { value: 'bill', label: 'Theo hóa đơn' },
  { value: 'time', label: 'Theo thời gian' },
  { value: 'product', label: 'Theo sản phẩm' },
];

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
      billRule: {
    minSubtotal: 0,
   
  },
    timeRule: {
      validFrom: null,
      validTo: null,
      daysOfWeek: [],
      timeRanges: [],
      minMinutes: 0,
    },
      productRule: {
    categories: [],
    products: [],
    combo: [],
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
        billRule: data.billRule || {
    minSubtotal: 0,
  },
      timeRule: data.timeRule || {
        validFrom: null,
        validTo: null,
        daysOfWeek: [],
        timeRanges: [],
        minMinutes: 0,
      },
       productRule: data.productRule || {
    categories: [],
    products: [],
    combo: [],
  },
    });
  }

function formatTime(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}


  /* ================= VALIDATION ================= */
  function validateForm(isCreate = false) {
  const scope = isCreate ? form.scope : originalPromotion?.scope;

  /* ===== BASIC ===== */
  if (!form.name || !form.name.trim()) {
    return 'Tên khuyến mãi không được để trống';
  }

  if (form.discountValue === '' || Number.isNaN(Number(form.discountValue))) {
    return 'Giá trị giảm không hợp lệ';
  }

  if (Number(form.discountValue) < 0) {
    return 'Giá trị giảm phải lớn hơn hoặc bằng 0';
  }

  /* ===== BILL ===== */
  if (scope === 'bill') {
    if (form.billRule?.minSubtotal === '' ||
        Number.isNaN(Number(form.billRule.minSubtotal))) {
      return 'Hóa đơn tối thiểu không hợp lệ';
    }

    if (Number(form.billRule.minSubtotal) < 0) {
      return 'Hóa đơn tối thiểu phải ≥ 0';
    }
  }

  /* ===== TIME ===== */
  if (scope === 'time') {
    const { validFrom, validTo, daysOfWeek, timeRanges } = form.timeRule;

    if (validFrom && validTo && new Date(validFrom) > new Date(validTo)) {
      return 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc';
    }

    if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      return 'Vui lòng chọn ít nhất 1 ngày áp dụng';
    }

    if (Array.isArray(timeRanges)) {
      for (const tr of timeRanges) {
        if (!tr.from || !tr.to) {
          return 'Khung giờ không được để trống';
        }
        if (tr.from >= tr.to) {
          return 'Khung giờ không hợp lệ (from < to)';
        }
      }
    }
  }

  /* ===== PRODUCT ===== */
  if (scope === 'product') {
    const { products, categories, combo } = form.productRule;

    if (
      (!products || products.length === 0) &&
      (!categories || categories.length === 0) &&
      (!combo || combo.length === 0)
    ) {
      return 'Phải chọn ít nhất 1 sản phẩm / danh mục / combo';
    }

    if (Array.isArray(combo)) {
      for (const c of combo) {
        if (!c.product || c.qty < 1) {
          return 'Combo không hợp lệ';
        }
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
    /* ===== VALIDATE ===== */
    const error = validateForm(mode === 'create');
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Dữ liệu không hợp lệ',
        text2: error,
        position: 'bottom',
         bottomOffset: 90,
        visibilityTime: 3000,
      });
      return;
    }

    let payload;

    /* ===== CREATE ===== */
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
        description: form.description,
      };

      if (form.scope === 'bill') {
        payload.billRule = {
          minSubtotal: Number(form.billRule.minSubtotal) || 0,
        };
      }

      if (form.scope === 'time') {
        payload.timeRule = form.timeRule;
      }

      if (form.scope === 'product') {
        payload.productRule = form.productRule;
      }

      await promotionService.createPromotion(payload);

      Toast.show({
        type: 'success',
        text1: 'Tạo thành công',
        text2: 'Khuyến mãi đã được tạo',
        position: 'bottom',
        visibilityTime: 2500,
      });
    }

    /* ===== EDIT ===== */
    else {
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

      if (originalPromotion.scope === 'bill') {
        payload.billRule = form.billRule;
      }

      if (originalPromotion.scope === 'product') {
        payload.productRule = form.productRule;
      }

      await promotionService.updatePromotion(promotionId, payload);

      Toast.show({
        type: 'success',
        text1: 'Đã lưu khuyến mãi',
        position: 'bottom',
         bottomOffset: 90,
        visibilityTime: 2500,
      });
    }

    navigation.goBack();
  } catch (e) {
    Toast.show({
      type: 'error',
      text1: 'Thao tác thất bại',
  text2: 'Vui lòng thử lại',
      position: 'bottom',
       bottomOffset: 90,
      visibilityTime: 3000,
    });
  }
}


  const readonly = mode === 'view';

  /* ================= UI ================= */
return (
  <View style={styles.screen}>
    {/* ===== FORM CONTENT ===== */}
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingBottom: ACTION_BAR_HEIGHT + 120,flexGrow: 1, }}
      showsVerticalScrollIndicator={false}
    >
      {/* BASIC INFO */}
      <Input
        label="Tên khuyến mãi"
        value={form.name}
        editable={!readonly}
        onChange={(v) => {
          setForm({ ...form, name: v });
          setIsDirty(true);
        }}
      />

      <Input
        label="Mã khuyến mãi"
        value={form.code}
        editable={mode === 'create'}
        onChange={(v) => {
          setForm({ ...form, code: v });
          setIsDirty(true);
        }}
      />

      <Input
        label="Giá trị giảm"
        value={form.discountValue}
        editable={!readonly}
        keyboardType="numeric"
        onChange={(v) => {
          setForm({ ...form, discountValue: v });
          setIsDirty(true);
        }}
      />

      <Input
        label="Thứ tự áp dụng"
        value={String(form.applyOrder)}
        editable={!readonly}
        keyboardType="numeric"
        onChange={(v) => {
          setForm({ ...form, applyOrder: v });
          setIsDirty(true);
        }}
      />

      <Input
        label="Mô tả"
        value={form.description}
        editable={!readonly}
        onChange={(v) => {
          setForm({ ...form, description: v });
          setIsDirty(true);
        }}
      />

      {/* SCOPE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phạm vi áp dụng</Text>

        {SCOPE_OPTIONS.map((opt) => {
          const selected = form.scope === opt.value;

          return (
            <TouchableOpacity
              key={opt.value}
              disabled={mode !== 'create'}
              onPress={() => {
                setForm({ ...form, scope: opt.value });
                setIsDirty(true);
              }}
              style={[
                styles.scopeItem,
                selected && styles.scopeItemActive,
                mode !== 'create' && { opacity: 0.6 },
              ]}
            >
              <View style={styles.radio}>
                {selected && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.scopeLabel}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* STATUS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trạng thái</Text>

        <View style={styles.switchRow}>
          <Text>Kích hoạt</Text>
          <Switch
            value={form.active}
            disabled={readonly}
            onValueChange={(v) => {
              setForm({ ...form, active: v });
              setIsDirty(true);
            }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text>Cho phép cộng dồn</Text>
          <Switch
            value={form.stackable}
            disabled={readonly}
            onValueChange={(v) => {
              setForm({ ...form, stackable: v });
              setIsDirty(true);
            }}
          />
        </View>
      </View>

      {/* BILL RULE */}
      {form.scope === 'bill' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Điều kiện hóa đơn</Text>
          <Input
            label="Hóa đơn tối thiểu (đ)"
            value={String(form.billRule.minSubtotal)}
            editable={!readonly}
            keyboardType="numeric"
            onChange={(v) => {
              setForm({
                ...form,
                billRule: {
                  ...form.billRule,
                  minSubtotal: Number(v) || 0,
                },
              });
              setIsDirty(true);
            }}
          />
        </View>
      )}

     {/* ===== TIME RULE ===== */}
{form.scope === 'time' && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Điều kiện thời gian</Text>

    {/* ===== DATE RANGE ===== */}
    <Text style={styles.subLabel}>Thời gian hiệu lực</Text>
    <View style={styles.dateRow}>
      <View style={{ flex: 1 }}>
 <Text style={styles.dateLabel}>Từ ngày</Text>

<TouchableOpacity
  style={styles.dateInput}
  onPress={() => setShowFromPicker(true)}
>
  <Text>
    {form.timeRule.validFrom
      ? new Date(form.timeRule.validFrom).toLocaleDateString('vi-VN')
      : 'Chọn ngày'}
  </Text>
</TouchableOpacity>

{showFromPicker && (
  <DateTimePicker
    value={
      form.timeRule.validFrom
        ? new Date(form.timeRule.validFrom)
        : new Date()
    }
    mode="date"
    display="calendar"
    onChange={(event, selectedDate) => {
      setShowFromPicker(false);
      if (!selectedDate) return;

      setForm({
        ...form,
        timeRule: {
          ...form.timeRule,
          validFrom: selectedDate.toISOString(),
        },
      });
      setIsDirty(true);
    }}
  />
)}
      </View>

      <View style={{ width: 12 }} />

      <View style={{ flex: 1 }}>
       <Text style={styles.dateLabel}>Đến ngày</Text>

<TouchableOpacity
  style={styles.dateInput}
  onPress={() => setShowToPicker(true)}
>
  <Text>
    {form.timeRule.validTo
      ? new Date(form.timeRule.validTo).toLocaleDateString('vi-VN')
      : 'Chọn ngày'}
  </Text>
</TouchableOpacity>

{showToPicker && (
  <DateTimePicker
    value={
      form.timeRule.validTo
        ? new Date(form.timeRule.validTo)
        : new Date()
    }
    mode="date"
    display="calendar"
    onChange={(event, selectedDate) => {
      setShowToPicker(false);
      if (!selectedDate) return;

      setForm({
        ...form,
        timeRule: {
          ...form.timeRule,
          validTo: selectedDate.toISOString(),
        },
      });
      setIsDirty(true);
    }}
  />
)}

      </View>
    </View>

    {/* ===== DAYS OF WEEK ===== */}
    <Text style={styles.subLabel}>Ngày áp dụng</Text>
    <View style={styles.daysRow}>
      {DAYS.map((d, idx) => {
        const selected = form.timeRule.daysOfWeek.includes(idx);
        return (
          <TouchableOpacity
            key={idx}
            style={[styles.dayChip, selected && styles.dayChipActive]}
            onPress={() => {
              const days = selected
                ? form.timeRule.daysOfWeek.filter((x) => x !== idx)
                : [...form.timeRule.daysOfWeek, idx];

              setForm({
                ...form,
                timeRule: {
                  ...form.timeRule,
                  daysOfWeek: days,
                },
              });
              setIsDirty(true);
            }}
          >
            <Text style={selected && { color: '#FFF', fontWeight: '500' }}>
              {d}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>

    {/* ===== TIME RANGES ===== */}
<Text style={styles.subLabel}>Khung giờ</Text>

{form.timeRule.timeRanges.map((tr, index) => (
  <View key={index} style={styles.timeRow}>
    {/* FROM */}
    <TouchableOpacity
      style={styles.timePickerBox}
      onPress={() =>
        setTimePicker({ visible: true, index, field: 'from' })
      }
    >
      <Text>{tr.from || 'Chọn giờ'}</Text>
    </TouchableOpacity>

    <Text style={{ marginHorizontal: 6 }}>–</Text>

    {/* TO */}
    <TouchableOpacity
      style={styles.timePickerBox}
      onPress={() =>
        setTimePicker({ visible: true, index, field: 'to' })
      }
    >
      <Text>{tr.to || 'Chọn giờ'}</Text>
    </TouchableOpacity>

    {/* REMOVE */}
    <TouchableOpacity
      onPress={() => {
        const ranges = form.timeRule.timeRanges.filter((_, i) => i !== index);
        setForm({
          ...form,
          timeRule: { ...form.timeRule, timeRanges: ranges },
        });
        setIsDirty(true);
      }}
    >
      <Text style={{ color: '#E53935', marginLeft: 8 }}>✕</Text>
    </TouchableOpacity>
  </View>
))}

{/* ADD RANGE */}
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


    {/* ===== MIN MINUTES ===== */}
    <Input
      label="Phút chơi tối thiểu"
      value={String(form.timeRule.minMinutes)}
      keyboardType="numeric"
      onChange={(v) => {
        setForm({
          ...form,
          timeRule: { ...form.timeRule, minMinutes: Number(v) || 0 },
        });
        setIsDirty(true);
      }}
    />

    {/* ===== PREVIEW ===== */}
    <View style={{ marginTop: 12 }}>
      <Text style={styles.subLabel}>Kiểm tra hiệu lực</Text>
      <TextInput
        placeholder="YYYY-MM-DD HH:mm"
        value={previewAt}
        onChangeText={setPreviewAt}
        style={styles.previewInput}
      />
      <TouchableOpacity
        style={styles.previewBtn}
        onPress={() => {
          if (!previewAt) {
            Toast.show({
              type: 'error',
              text1: 'Vui lòng nhập thời điểm kiểm tra',
              bottomOffset: 90,
            });
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
            ? '✅ Khuyến mãi CÓ HIỆU LỰC'
            : '❌ Khuyến mãi KHÔNG có hiệu lực'}
        </Text>
      )}
    </View>
  </View>
)}
{timePicker.visible && (
  <DateTimePicker
    mode="time"
    value={new Date()}
    onChange={(event, selectedDate) => {
      if (!selectedDate) {
        setTimePicker({ visible: false, index: null, field: null });
        return;
      }

      const time = formatTime(selectedDate);
      const ranges = [...form.timeRule.timeRanges];
      ranges[timePicker.index] = {
        ...ranges[timePicker.index],
        [timePicker.field]: time,
      };

      setForm({
        ...form,
        timeRule: { ...form.timeRule, timeRanges: ranges },
      });
      setIsDirty(true);
      setTimePicker({ visible: false, index: null, field: null });
    }}
  />
)}

    </ScrollView>

    {/* ===== ACTION BAR CỐ ĐỊNH ===== */}
    {(mode === 'edit' || mode === 'create') && (
      <View style={styles.actionBar}>
        <Button
          primary
          text={mode === 'create' ? 'Tạo khuyến mãi' : 'Lưu thay đổi'}
          onPress={handleSave}
          disabled={mode === 'edit' && !isDirty}
        />
      </View>
    )}
  </View>
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
  daysRow: { flexDirection: 'row', marginBottom: 12 },
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
  borderWidth: 1,
  borderColor: '#DDD',
  borderRadius: 8,
  padding: 12,
  marginTop: 4,
  justifyContent: 'center',
}
,

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
  scopeItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 10,
},

scopeItemActive: {
  backgroundColor: '#F1F8FF',
  borderRadius: 8,
  paddingHorizontal: 8,
},

radio: {
  width: 18,
  height: 18,
  borderRadius: 9,
  borderWidth: 2,
  borderColor: '#1E88E5',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 10,
},

radioDot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#1E88E5',
},

scopeLabel: {
  fontSize: 15,
},
screen: {
  flex: 1,
  backgroundColor: '#F5F6FA',
},

container: {
  flex: 1,
  padding: 16,
},

actionBar: {
  padding: 16,
  backgroundColor: '#FFF',
  borderTopWidth: 1,
  borderTopColor: '#EEE',
},
timePickerBox: {
  minWidth: 80,
  paddingVertical: 8,
  paddingHorizontal: 10,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: '#DDD',
  alignItems: 'center',
},

});
