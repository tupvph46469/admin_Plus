// TableDetailScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Modal, FlatList 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { tableService } from '../services/tableService';
import { listAreas } from '../services/areaService';

const STATUS_META = {
  available: { label: 'Trống', color: '#34C759' },
  playing: { label: 'Đang chơi', color: '#007AFF' },
  reserved: { label: 'Đã đặt', color: '#5856D6' },
  maintenance: { label: 'Bảo trì', color: '#FF9500' },
};

export default function TableDetailScreen({ route, navigation }) {
  const { tableId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [tableDetails, setTableDetails] = useState(null);

  const [areas, setAreas] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // editable fields
  const [name, setName] = useState('');
  const [ratePerHour, setRatePerHour] = useState(''); // keep as string for input
  const [areaId, setAreaId] = useState(null);

  const [areaPickerVisible, setAreaPickerVisible] = useState(false);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [areasRes, tableRes] = await Promise.all([
        listAreas().catch(() => ({ data: { data: [] } })),
        tableService.getById(tableId).catch(() => null),
      ]);

      const areasData = areasRes?.data?.data || [];
      setAreas(areasData);

      const data = tableRes?.data || tableRes;
      if (data) {
        setTableDetails(data);
        setName(data.name || '');
        setRatePerHour(data.ratePerHour != null ? String(data.ratePerHour) : '');
        const aid = data.areaId?.id || data.areaId?._id || data.areaId || null;
        // if areaId not in areasData, keep it (but we prefer selecting first area if null)
        if (aid) setAreaId(aid);
        else if (areasData.length) setAreaId(areasData[0].id || areasData[0]._id);
      } else {
        setTableDetails(null);
      }
    } catch (err) {
      console.error('loadAll error', err);
      Alert.alert('Lỗi', 'Không tải được dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEdit = () => {
    // initialize fields from current details when enter edit mode
    if (!isEditing && tableDetails) {
      setName(tableDetails.name || '');
      setRatePerHour(tableDetails.ratePerHour != null ? String(tableDetails.ratePerHour) : '');
      const aid = tableDetails.areaId?.id || tableDetails.areaId?._id || tableDetails.areaId || null;
      if (aid) setAreaId(aid);
      else if (areas.length) setAreaId(areas[0].id || areas[0]._id);
    }
    setIsEditing(v => !v);
  };

  const handleSave = async () => {
    // validation
    if (!name || !name.trim()) {
      Alert.alert('Lỗi', 'Tên bàn không được để trống.');
      return;
    }
    const rate = Number(ratePerHour);
    if (Number.isNaN(rate) || rate < 0) {
      Alert.alert('Lỗi', 'Giá/giờ phải là số hợp lệ.');
      return;
    }
    if (!areaId) {
      Alert.alert('Lỗi', 'Vui lòng chọn khu vực (không được để trống).');
      return;
    }

    const payload = {
      name: name.trim(),
      ratePerHour: rate,
      areaId: areaId,
    };

    setSaving(true);
    try {
      await tableService.update(tableId, payload);
      await loadAll(); // reload from server to ensure consistency
      setIsEditing(false);
      Alert.alert('Thành công', 'Cập nhật thông tin bàn thành công.');
    } catch (err) {
      console.error('Update error', err);
      const msg = err?.response?.data?.message || err.message || 'Lỗi khi cập nhật';
      Alert.alert('Lỗi', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa bàn này? Hành động không thể hoàn tác.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await tableService.remove(tableId);
            Alert.alert('Đã xóa', 'Bàn đã được xóa.');
            navigation.goBack();
          } catch (err) {
            console.error('Delete error', err);
            const msg = err?.response?.data?.message || err.message || 'Lỗi khi xóa';
            Alert.alert('Lỗi', msg);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const calculateTimeUsed = (startTime) => {
    if (!startTime) return '0m';
    const now = new Date();
    const start = new Date(startTime);
    const diffInMinutes = Math.floor((now - start) / (1000 * 60));
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8 }}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tableDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text>Không tìm thấy bàn.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { currentSession } = tableDetails;
  const sessionId = currentSession?.id;
  const itemsCount = currentSession?.itemsCount ?? 0;
  const timeUsed = currentSession?.startTime ? calculateTimeUsed(currentSession.startTime) : 'Chưa có';

  const statusKey = tableDetails.status;
  const statusMeta = STATUS_META[statusKey] || { label: statusKey, color: '#999' };

  // displayed rate formatting helper
  const formatRateDisplay = (r) => {
    if (r == null) return '-';
    const n = Number(r);
    if (Number.isNaN(n)) return r;
    return `${(n / 1000).toFixed(0)}k/h`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* header */}
        <View style={styles.headerRow}>
          <Text style={styles.titleText}>{tableDetails.name}</Text>
          <View style={[styles.badge, { backgroundColor: statusMeta.color }]}>
            <Text style={styles.badgeText}>{statusMeta.label}</Text>
          </View>
        </View>

        {/* Area (editable only when isEditing) */}
{/* Area (editable only when isEditing) - custom picker (modal) */}
<View style={styles.card}>
  <Text style={styles.label}>Khu vực</Text>

  {!isEditing ? (
    <Text style={styles.value}>{tableDetails.areaId?.name || ''}</Text>
  ) : (
    <>
      <TouchableOpacity
        style={styles.customPickerTouch}
        onPress={() => setAreaPickerVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.customPickerText, !areaId && { color: '#999' }]}>
          {(() => {
            // find display name
            const s = areas.find(a => (a.id || a._id || a).toString() === String(areaId));
            return s ? s.name : (areas.length ? 'Chọn khu vực' : 'Không có khu vực');
          })()}
        </Text>
        <Text style={styles.customPickerChevron}>▾</Text>
      </TouchableOpacity>

      {/* Modal listing areas */}
      <Modal
        visible={areaPickerVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setAreaPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Chọn khu vực</Text>
            <FlatList
              data={areas}
              keyExtractor={(a) => (a.id || a._id || a).toString()}
              renderItem={({ item }) => {
                const aid = (item.id || item._id || item).toString();
                const selected = String(aid) === String(areaId);
                return (
                  <TouchableOpacity
                    style={[styles.areaRow, selected && styles.areaRowSelected]}
                    onPress={() => {
                      setAreaId(aid);
                      setAreaPickerVisible(false);
                    }}
                  >
                    <Text style={[styles.areaRowText, selected && { color: '#fff' }]}>{item.name}</Text>
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setAreaPickerVisible(false)}>
              <Text style={styles.modalCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )}
</View>

        {/* Status (read-only) */}
        <View style={styles.card}>
          <Text style={styles.label}>Trạng thái</Text>
          <Text style={styles.value}>{statusMeta.label}</Text>
        </View>

        {/* Rate (editable) */}
        <View style={styles.card}>
          <Text style={styles.label}>Giá / giờ (VNĐ)</Text>
          {!isEditing ? (
            <Text style={styles.value}>{formatRateDisplay(tableDetails.ratePerHour)}</Text>
          ) : (
            <TextInput
              value={ratePerHour}
              onChangeText={(t) => setRatePerHour(t.replace(/[^0-9]/g, ''))} // only digits
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ví dụ: 80000"
            />
          )}
        </View>

        {/* Session info (read-only) */}
        <View style={styles.card}>
          <Text style={styles.label}>Phiên hiện tại</Text>
          {currentSession ? (
            <>
              <Text style={styles.value}>Session ID: {sessionId}</Text>
              <Text style={styles.value}>Thời gian: {timeUsed}</Text>
              <Text style={styles.value}>Số món: {itemsCount}</Text>
            </>
          ) : (
            <Text style={styles.value}>Không có phiên đang mở</Text>
          )}
        </View>

        {/* Name (editable) */}
        <View style={styles.card}>
          <Text style={styles.label}>Tên bàn</Text>
          {!isEditing ? (
            <Text style={[styles.value, { fontSize: 20 }]}>{tableDetails.name}</Text>
          ) : (
            <TextInput
              value={name}
              onChangeText={setName}
              style={[styles.input, { fontSize: 18 }]}
              placeholder="Tên bàn"
            />
          )}
        </View>

        {/* action buttons */}
        <View style={styles.actions}>
          {!isEditing ? (
            <TouchableOpacity style={[styles.btn, styles.btnEdit]} onPress={handleToggleEdit}>
              <Text style={styles.btnEditText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSaveText}>Lưu</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => {
                  // revert fields
                  setName(tableDetails.name || '');
                  setRatePerHour(tableDetails.ratePerHour != null ? String(tableDetails.ratePerHour) : '');
                  const aid = tableDetails.areaId?.id || tableDetails.areaId?._id || tableDetails.areaId || null;
                  setAreaId(aid);
                  setIsEditing(false);
                }}
                disabled={saving}
              >
                <Text style={styles.btnCancelText}>Hủy</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={[styles.btn, styles.btnDelete]} onPress={handleDelete} disabled={deleting}>
            {deleting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnDeleteText}>Xóa</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f5f8' },
  content: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  titleText: { fontSize: 28, fontWeight: '700', color: '#222' },
  badge: { position: 'absolute', right: 16, top: 0, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  badgeText: { color: '#fff', fontWeight: '700' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  label: { fontSize: 12, color: '#666', marginBottom: 6 },
  value: { fontSize: 16, color: '#222', fontWeight: '600' },

  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#e6e6ea',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },

  pickerContainer: {
  // keep the card padding outside; this container should be full-width and no inner padding
  width: '100%',
  borderRadius: 8,
  overflow: 'hidden',
  backgroundColor: '#fff',      // match card bg so it looks consistent
  borderWidth: 1,
  borderColor: '#e6e6ea',
},

picker: {
  height: 44,                   // important: fixed height
  width: '100%',                // ensures full width
  backgroundColor: 'transparent',
},

pickerItem: {
  // only applies to Android's item styling
  height: 44,
  color: '#222',
},

  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },

  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, minWidth: 100, alignItems: 'center', marginHorizontal: 6 },

  btnEdit: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#007AFF' },
  btnEditText: { color: '#007AFF', fontWeight: '700' },

  btnSave: { backgroundColor: '#007AFF' },
  btnSaveText: { color: '#fff', fontWeight: '700' },

  btnCancel: { backgroundColor: '#f2f2f2' },
  btnCancelText: { color: '#333', fontWeight: '700' },

  btnDelete: { backgroundColor: '#ff3b30' },
  btnDeleteText: { color: '#fff', fontWeight: '700' },
  customPickerTouch: {
  height: 44,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#e6e6ea',
  paddingHorizontal: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#fff',
},
customPickerText: {
  fontSize: 16,
  color: '#222',
},
customPickerChevron: {
  fontSize: 18,
  color: '#666',
  marginLeft: 8,
},

/* Modal styles */
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  paddingHorizontal: 20,
},
modalBox: {
  maxHeight: '70%',
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 12,
},
modalTitle: {
  fontSize: 16,
  fontWeight: '700',
  marginBottom: 8,
},
areaRow: {
  paddingVertical: 12,
  paddingHorizontal: 8,
  borderRadius: 8,
},
areaRowSelected: {
  backgroundColor: '#007AFF',
},
areaRowText: {
  fontSize: 16,
},
sep: { height: 8 },
modalCloseBtn: {
  marginTop: 10,
  alignSelf: 'flex-end',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
},
modalCloseText: { color: '#007AFF', fontWeight: '700' },

});

