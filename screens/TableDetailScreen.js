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
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { tableService } from '../services/tableService';
import { listAreas } from '../services/areaService';
import { CONFIG } from '../constants/config';

const STATUS_META = {
  available: { label: 'Trống', color: '#10b981' },
  playing: { label: 'Đang chơi', color: '#0284c7' },
  reserved: { label: 'Đã đặt', color: '#7c3aed' },
  maintenance: { label: 'Bảo trì', color: '#f59e0b' },
};

export default function TableDetailScreen({ route, navigation }) {
  const { tableId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [tableDetails, setTableDetails] = useState(null);
  const [areas, setAreas] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [areaPickerVisible, setAreaPickerVisible] = useState(false);

  // editable fields
  const [name, setName] = useState('');
  const [ratePerHour, setRatePerHour] = useState('');
  const [areaId, setAreaId] = useState(null);

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
      Alert.alert('Lỗi', 'Vui lòng chọn khu vực.');
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
      await loadAll();
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

  const getAreaName = () => {
    const area = areas.find(a => (a.id || a._id || a).toString() === String(areaId));
    return area ? area.name : (areas.length ? 'Chọn khu vực' : 'Không có khu vực');
  };

  const formatRateDisplay = (r) => {
    if (r == null) return 'N/A';
    const n = Number(r);
    if (Number.isNaN(n)) return r;
    return `${n.toLocaleString('vi-VN')} đ`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tableDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Không tìm thấy bàn.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { currentSession } = tableDetails;
  const timeUsed = currentSession?.startTime ? calculateTimeUsed(currentSession.startTime) : 'Chưa có phiên';
  const statusKey = tableDetails.status;
  const statusMeta = STATUS_META[statusKey] || { label: statusKey, color: '#999' };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <Text style={styles.titleText}>{tableDetails.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusMeta.color }]}>
              <View style={styles.statusDot} />
              <Text style={styles.statusBadgeText}>{statusMeta.label}</Text>
            </View>
          </View>
        </View>

        {/* Area Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.label}>📍 Khu vực</Text>
          </View>
          {!isEditing ? (
            <Text style={styles.value}>{tableDetails.areaId?.name || 'N/A'}</Text>
          ) : (
            <TouchableOpacity
              style={styles.customPicker}
              onPress={() => setAreaPickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pickerText, !areaId && styles.placeholderText]}>
                {getAreaName()}
              </Text>
              <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Area Modal */}
        <Modal
          visible={areaPickerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setAreaPickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn khu vực</Text>
                <TouchableOpacity onPress={() => setAreaPickerVisible(false)}>
                  <Text style={styles.modalCloseIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={areas}
                keyExtractor={(a) => (a.id || a._id || a).toString()}
                scrollEnabled={areas.length > 5}
                renderItem={({ item }) => {
                  const aid = (item.id || item._id || item).toString();
                  const selected = String(aid) === String(areaId);
                  return (
                    <TouchableOpacity
                      style={[styles.areaOption, selected && styles.areaOptionSelected]}
                      onPress={() => {
                        setAreaId(aid);
                        setAreaPickerVisible(false);
                      }}
                    >
                      <Text style={[styles.areaOptionText, selected && styles.areaOptionTextSelected]}>
                        {item.name}
                      </Text>
                      {selected && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </Modal>

        {/* Table Name Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.label}>🎱 Tên bàn</Text>
          </View>
          {!isEditing ? (
            <Text style={styles.value}>{tableDetails.name}</Text>
          ) : (
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Ví dụ: Bàn 1"
              placeholderTextColor="#999"
            />
          )}
        </View>

        {/* Rate Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.label}>💰 Giá/giờ</Text>
          </View>
          {!isEditing ? (
            <Text style={styles.value}>{formatRateDisplay(tableDetails.ratePerHour)}</Text>
          ) : (
            <TextInput
              value={ratePerHour}
              onChangeText={(t) => setRatePerHour(t.replace(/[^0-9]/g, ''))}
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ví dụ: 80000"
              placeholderTextColor="#999"
            />
          )}
        </View>

        {/* Current Session Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.label}>⏱️ Phiên hiện tại</Text>
          </View>
          {currentSession ? (
            <>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTime}>Thời gian: {timeUsed}</Text>
              </View>

              {currentSession.items?.length > 0 ? (
                <FlatList
                  data={currentSession.items}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                  renderItem={({ item }) => {
                    const imagePath =
                      item.imageSnapshot ||
                      (item.product?.images?.length ? item.product.images[0] : null);
                    const imageUri = imagePath ? `${CONFIG.baseURL}${imagePath}` : null;

                    return (
                      <View style={styles.itemRow}>
                        <View style={styles.itemImageContainer}>
                          {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.itemImage} />
                          ) : (
                            <View style={styles.itemImagePlaceholder} />
                          )}
                        </View>
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemName}>{item.nameSnapshot}</Text>
                          <View style={styles.itemMetaRow}>
                            <Text style={styles.itemMeta}>SL: {item.qty}</Text>
                            <Text style={styles.itemMetaDivider}>•</Text>
                            <Text style={styles.itemMeta}>
                              {item.priceSnapshot.toLocaleString('vi-VN')} đ
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  }}
                />
              ) : (
                <Text style={styles.emptyText}>Không có sản phẩm</Text>
              )}
            </>
          ) : (
            <Text style={styles.value}>Không có phiên đang mở</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {!isEditing ? (
            <TouchableOpacity
              style={[styles.btn, styles.btnEdit]}
              onPress={handleToggleEdit}
            >
              <Text style={styles.btnEditText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.btnSave]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnSaveText}>Lưu</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => {
                  setName(tableDetails.name || '');
                  setRatePerHour(
                    tableDetails.ratePerHour != null ? String(tableDetails.ratePerHour) : ''
                  );
                  const aid =
                    tableDetails.areaId?.id ||
                    tableDetails.areaId?._id ||
                    tableDetails.areaId ||
                    null;
                  setAreaId(aid);
                  setIsEditing(false);
                }}
                disabled={saving}
              >
                <Text style={styles.btnCancelText}>Hủy</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.btn, styles.btnDelete]}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnDeleteText}>Xóa bàn</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Header
  headerSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleText: {
    paddingLeft: 100,
    textAlign:'center',
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    opacity: 0.9,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 6,
  },

  // Inputs
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
    marginTop: 8,
  },

  // Custom Picker
  customPicker: {
    height: 44,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginTop: 8,
  },
  pickerText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  placeholderText: {
    color: '#999',
  },
  chevron: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingTop: 16,
    paddingBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalCloseIcon: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '600',
  },
  areaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  areaOptionSelected: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#0284c7',
    paddingLeft: 13,
  },
  areaOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  areaOptionTextSelected: {
    color: '#0284c7',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#0284c7',
    fontWeight: '700',
  },

  // Session
  sessionInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  sessionTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemImageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  itemImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemMeta: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  itemMetaDivider: {
    color: '#d1d5db',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 12,
  },

  // Actions
  actionsSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  btn: {
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
  },
  btnEdit: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0284c7',
  },
  btnEditText: {
    color: '#0284c7',
    fontWeight: '700',
    fontSize: 15,
  },
  btnSave: {
    flex: 1,
    backgroundColor: '#10b981',
  },
  btnSaveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  btnCancel: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  btnCancelText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 15,
  },
  btnDelete: {
    height: 44,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDeleteText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});