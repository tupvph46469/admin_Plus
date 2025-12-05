import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  RefreshControl,
   Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tableService } from "../services/tableService";
import { listAreas } from "../services/areaService";

export default function TableManageScreen({ navigation }) {
  const [tables, setTables] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

    // --- New state for Add Table modal / form ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRatePerHour, setNewRatePerHour] = useState('');
  const [newAreaId, setNewAreaId] = useState(null);
  const [creating, setCreating] = useState(false);
  // Fetch areas từ API
  const loadAreas = useCallback(async () => {
    try {
      console.log('🔄 Loading areas...');
      const response = await listAreas();
      
      if (response?.data?.data) {
        const areasData = response.data.data;
        console.log('📋 Areas data:', areasData);
        setAreas(areasData);
        
        // ✅ SỬA: Dùng id thay vì _id
        if (areasData.length > 0) {
          const firstAreaId = areasData[0].id || areasData[0]._id;
          setSelectedArea(firstAreaId);
          console.log('🎯 Selected default area:', firstAreaId, areasData[0].name);
        }
      }
    } catch (error) {
      console.error('❌ Error loading areas:', error);
      setAreas([]);
    }
  }, []);

  // Fetch tables từ API với session info
  const loadTables = useCallback(async () => {
    try {
      const res = await tableService.list({ 
        limit: 100, 
        sort: "orderIndex",
        active: true
      });
      console.log('📋 Tables response:', res);
      
      if (res?.data?.items) {
        console.log('📋 Tables data:', res.data.items);
        setTables(res.data.items);
      }
    } catch (error) {
      console.error('❌ Error loading tables:', error);
      setTables([]);
    }
  }, []);

  // Load data lần đầu
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadAreas(), loadTables()]);
    } finally {
      setLoading(false);
    }
  }, [loadAreas, loadTables]);

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTables();
    } finally {
      setRefreshing(false);
    }
  }, [loadTables]);

  useEffect(() => {
    loadData();
    
    // Auto refresh mỗi 30s để cập nhật thời gian chơi
    const interval = setInterval(loadTables, 30000);
    return () => clearInterval(interval);
  }, [loadData, loadTables]);

  // Tính thời gian đã chơi từ currentSession
  const calculateTimeUsed = (table) => {
    if (!table.currentSession?.startTime) return '';

    const now = new Date();
    const start = new Date(table.currentSession.startTime);
    const diffInMinutes = Math.floor((now - start) / (1000 * 60));
    
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }
    return `${minutes}m`;
  };

  // ✅ SỬA: Lọc bàn theo area được chọn - Fix ID mapping + SORT theo orderIndex
const filteredTables = tables
  .filter(table => {
    if (!selectedArea) {
      console.log('⚠️ No area selected, showing all tables');
      return true;
    }
    const tableAreaId = table.areaId?._id || table.areaId?.id || table.areaId;
    const isMatch = String(tableAreaId) === String(selectedArea);
    console.log(`🔍 Table ${table.name}: areaId=${tableAreaId}, selectedArea=${selectedArea}, match=${isMatch}`);
    return isMatch;
  })
  .sort((a, b) => {
    const ai = Number.isFinite(a.orderIndex) ? a.orderIndex : (a.orderIndex ? Number(a.orderIndex) : 0);
    const bi = Number.isFinite(b.orderIndex) ? b.orderIndex : (b.orderIndex ? Number(b.orderIndex) : 0);
    if (ai !== bi) return ai - bi;
    // fallback stable: compare name numeric-aware
    return (a.name || '').toString().localeCompare((b.name || '').toString(), undefined, { numeric: true, sensitivity: 'base' });
  });


console.log(`📊 Total tables: ${tables.length}, Filtered tables: ${filteredTables.length}, Selected area: ${selectedArea}`);


  // Map data từ API về format hiển thị
  const mappedTables = filteredTables.map(table => ({
    id: table._id || table.id,
    name: table.name,
    status: table.status,
    timeUsed: calculateTimeUsed(table),
    areaId: table.areaId?._id || table.areaId?.id || table.areaId,
    areaName: table.areaId?.name || 'Chưa phân vùng',
    sessionId: table.currentSession?.id || null,
    ratePerHour: table.ratePerHour || 0,
    itemsCount: table.currentSession?.itemsCount || 0,
    active: table.active
  }));

  // Tính toán thống kê dựa trên tables đã lọc
  const totalTables = mappedTables.length;
  const playingTables = mappedTables.filter(table => table.status === 'playing').length;
  const availableTables = mappedTables.filter(table => table.status === 'available').length;
  const reservedTables = mappedTables.filter(table => table.status === 'reserved').length;
  const maintenanceTables = mappedTables.filter(table => table.status === 'maintenance').length;

const handleTablePress = async (table) => {
  if (table.status === 'available') {
    console.log(`Bàn ${table.name} được chọn để đặt`);
    navigation.navigate('TableDetailScreen', { 
      tableId: table.id,
      tableName: table.name,
      ratePerHour: table.ratePerHour
    });
  } else if (table.status === 'playing') {
    console.log(`Bàn ${table.name} đang chơi - xem chi tiết`);
    try {
      // Fetch details of the table
      const tableDetails = await tableService.getById(table.id); // Lấy chi tiết bàn
      navigation.navigate('TableDetailScreen', { 
        tableId: table.id,
        tableName: table.name,
        sessionId: tableDetails.currentSession?.id || null,
        timeUsed: calculateTimeUsed(table),
        itemsCount: tableDetails.currentSession?.itemsCount || 0
      });
    } catch (error) {
      console.error('❌ Error fetching table details:', error);
    }
  } else if (table.status === 'maintenance') {
    console.log(`Bàn ${table.name} đang bảo trì`);
    Alert.alert('Thông báo', 'Bàn này hiện đang trong trạng thái bảo trì.');
  } else if (table.status === 'reserved') {
    console.log(`Bàn ${table.name} đã được đặt`);
    Alert.alert('Thông báo', 'Bàn này đã được đặt trước.');
  }
};


  // ✅ SỬA: Handle area selection - Fix ID mapping
  const handleAreaPress = (area) => {
    const areaId = area.id || area._id;
    console.log('🎯 Area selected:', areaId);
    console.log('📍 Selected area data:', area);
    setSelectedArea(areaId);
  };

  const renderAreaItem = ({ item }) => {
    const itemId = item.id || item._id;
    const isSelected = selectedArea === itemId;
    
    return (
      <TouchableOpacity 
        style={[
          styles.areaButton,
          isSelected && styles.selectedAreaButton,
          isSelected && { backgroundColor: item.color || '#fff' }
        ]}
        onPress={() => handleAreaPress(item)}
      >
        <Text style={[
          styles.areaText,
          isSelected && styles.selectedAreaText
        ]}>
          {item.name}
        </Text>
        {/* Debug indicator */}
        {isSelected && <View style={styles.selectedIndicator} />}
      </TouchableOpacity>
    );
  };

  const getTableCardStyle = (status) => {
    switch (status) {
      case 'playing':
        return styles.playingCard;
      case 'reserved':
        return styles.reservedCard;
      case 'maintenance':
        return styles.maintenanceCard;
      default:
        return styles.availableCard;
    }
  };

  const getTableTextStyle = (status) => {
    switch (status) {
      case 'playing':
      case 'reserved':
      case 'maintenance':
        return styles.whiteText;
      default:
        return styles.darkText;
    }
  };

  const getStatusText = (table) => {
    switch (table.status) {
      case 'playing':
        return table.timeUsed || '0m';
      case 'reserved':
        return 'Đã đặt';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return 'Trống';
    }
  };

  const renderTableItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.tableCard, getTableCardStyle(item.status)]}
      onPress={() => handleTablePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.tableContent}>
        <Text style={[styles.tableNumber, getTableTextStyle(item.status)]}>
          {item.name.replace('Bàn ', '').replace('VIP ', '')}
        </Text>
        
        <Text style={[styles.tableRate, getTableTextStyle(item.status)]}>
          {(item.ratePerHour / 1000).toFixed(0)}k/h
        </Text>
        
        <Text style={[styles.statusText, getTableTextStyle(item.status)]}>
          {getStatusText(item)}
        </Text>

        {item.itemsCount > 0 && (
          <View style={styles.itemsBadge}>
            <Text style={styles.itemsBadgeText}>{item.itemsCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
    // --- Add Table: handlers ---
  const openAddModal = () => {
    // reset form
    setNewName('');
    setNewRatePerHour('');
    setNewAreaId(selectedArea || (areas[0] ? (areas[0].id || areas[0]._id) : null));
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const handleCreateTable = async () => {
    // Validation cơ bản
    if (!newName || !newName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên bàn.');
      return;
    }
    const rate = Number(newRatePerHour);
    if (isNaN(rate) || rate < 0) {
      Alert.alert('Lỗi', 'Giá/giờ không hợp lệ.');
      return;
    }

  if (!newName || !newName.trim()) { Alert.alert('Lỗi', 'Vui lòng nhập tên bàn.'); return; }
  if (isNaN(rate) || rate < 0) { Alert.alert('Lỗi', 'Giá/giờ không hợp lệ.'); return; }

  // --- TÍNH nextOrderIndex theo khu vực đã chọn (trên FE)
  const areaIdForNew = newAreaId || null;
  // Lấy bảng hiện tại cùng khu vực (từ `tables` state)
  const sameAreaTables = tables.filter(t => {
    const ta = t.areaId?._id || t.areaId?.id || t.areaId;
    return String(ta) === String(areaIdForNew);
  });

  // Lấy max orderIndex trong cùng khu vực; nếu không có -> -1; next = max + 1
  const maxIndex = sameAreaTables.reduce((mx, t) => {
    const oi = (typeof t.orderIndex === 'number') ? t.orderIndex : (t.orderIndex ? Number(t.orderIndex) : NaN);
    return Number.isFinite(oi) ? Math.max(mx, oi) : mx;
  }, -1);
  const nextOrderIndex = maxIndex + 1;

  const payload = {
    name: newName.trim(),
    ratePerHour: rate,
    areaId: areaIdForNew,
    orderIndex: nextOrderIndex, // GÁN RÕ RÀNG
  };

  try {
    setCreating(true);
    console.log('➕ Creating table payload:', payload);
    const res = await tableService.create(payload);
    console.log('✅ Table create response:', res);

    // Option A (khuyến nghị): reload từ server (an toàn nhất)
    await loadTables();

    // Option B (tốc độ): append returned item then sort (nếu backend trả doc)
    // const created = res?.data; // hoặc res?.data?.data tuỳ structure
    // if (created) {
    //   setTables(prev => [...prev, created]);
    //   // hoặc setTables(prev => prev.concat(created));
    // }

    Alert.alert('Thành công', 'Tạo bàn mới thành công.');
    setShowAddModal(false);
  } catch (err) {
    console.error('❌ Create table error:', err);
    const message = err?.response?.data?.message || err.message || 'Lỗi khi tạo bàn';
    Alert.alert('Lỗi', message);
  } finally {
    setCreating(false);
  }
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.loadingContainer}>
          <Text>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* Phần thống kê - Hiển thị cho area được chọn */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Đang chơi: </Text>
          <Text style={[styles.statValue, { color: '#007AFF' }]}>{playingTables}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Trống: </Text>
          <Text style={[styles.statValue, { color: '#34C759' }]}>{availableTables}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Đặt: </Text>
          <Text style={[styles.statValue, { color: '#5856D6' }]}>{reservedTables}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Bảo trì: </Text>
          <Text style={[styles.statValue, { color: '#FF9500' }]}>{maintenanceTables}</Text>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Sidebar areas */}
        <View style={styles.sidebar}>
          {areas.length > 0 ? (
            <FlatList
              data={areas}
              keyExtractor={(area) => area.id || area._id}
              renderItem={renderAreaItem}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noAreasContainer}>
              <Text style={styles.noAreasText}>Không có khu vực</Text>
            </View>
          )}
        </View>

        {/* Tables grid - Chỉ hiển thị bàn của area được chọn */}
        <View style={styles.tableArea}>
          {mappedTables.length > 0 ? (
            <FlatList
              data={mappedTables}
              renderItem={renderTableItem}
              keyExtractor={(item) => item.id?.toString()}
              numColumns={3}
              contentContainerStyle={styles.tableGrid}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#007AFF']}
                />
              }
            />
          ) : selectedArea ? (
            <View style={styles.noTablesContainer}>
              <Text style={styles.noTablesText}>
                Khu vực này chưa có bàn nào
              </Text>
            </View>
          ) : (
            <View style={styles.noTablesContainer}>
              <Text style={styles.noTablesText}>
                Chọn khu vực để xem bàn
              </Text>
            </View>
          )}
        </View>
      </View>
       {/* ------------------ FAB ------------------ */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openAddModal}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>

      {/* ------------------ Add Table Modal ------------------ */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeAddModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Tạo bàn mới</Text>

            <Text style={styles.label}>Tên bàn</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Bàn 21"
              value={newName}
              onChangeText={setNewName}
              editable={!creating}
              returnKeyType="done"
            />

            <Text style={styles.label}>Giá/giờ (VNĐ)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: 80000"
              value={String(newRatePerHour)}
              onChangeText={setNewRatePerHour}
              keyboardType="numeric"
              editable={!creating}
            />

            <Text style={styles.label}>Khu vực</Text>
            <View style={styles.areaPickerContainer}>
              <FlatList
                horizontal
                data={areas}
                keyExtractor={a => a.id || a._id}
                renderItem={({ item }) => {
                  const aid = item.id || item._id;
                  const selected = String(aid) === String(newAreaId);
                  return (
                    <TouchableOpacity
                      style={[styles.areaChip, selected && styles.areaChipSelected]}
                      onPress={() => setNewAreaId(aid)}
                    >
                      <Text style={[styles.areaChipText, selected && { color: '#fff' }]}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                }}
                showsHorizontalScrollIndicator={false}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#ccc' }]} onPress={closeAddModal} disabled={creating}>
                <Text>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, { backgroundColor: '#007AFF' }]} onPress={handleCreateTable} disabled={creating}>
                {creating ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Tạo</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8e6f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 80,
    backgroundColor: '#d8d6e8',
    paddingVertical: 10,
  },
  areaButton: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginVertical: 5,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  selectedAreaButton: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  areaText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedAreaText: {
    color: '#333',
    fontWeight: 'bold',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  noAreasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  noAreasText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  tableArea: {
    flex: 1,
    backgroundColor: '#e8e6f0',
  },
  noTablesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTablesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  tableGrid: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  tableCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: 5,
  },
  availableCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  playingCard: {
    backgroundColor: '#007AFF',
  },
  reservedCard: {
    backgroundColor: '#5856D6',
  },
  maintenanceCard: {
    backgroundColor: '#FF9500',
  },
  tableContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    position: 'relative',
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tableRate: {
    fontSize: 11,
    marginBottom: 4,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  darkText: {
    color: '#333',
  },
  whiteText: {
    color: '#fff',
  },
  itemsBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 40 : 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: { color: '#fff', fontSize: 32, lineHeight: 34 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 8 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { height: 44, borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 12 },
  areaPickerContainer: { marginBottom: 12 },
  areaChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#f0f0f5', marginRight: 8 },
  areaChipSelected: { backgroundColor: '#007AFF' },
  areaChipText: { color: '#333' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
});