import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';


import billService from '../services/billService';

const screenWidth = Dimensions.get('window').width;

export default function OverviewScreen() {
  const [showPicker, setShowPicker] = useState(null);
  const [activeFilter, setActiveFilter] = useState('month'); // 'today' | 'week' | 'month' | 'year'
  
  // Mặc định: Tháng hiện tại
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0);
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);

  // Load dữ liệu khi thay đổi khoảng thời gian
  useEffect(() => {
    loadStatistics();
  }, [startDate, endDate]);

  const loadStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Loading statistics...');
      
      // 🔥 GỌI API TỪ BILLSERVICE
      const bills = await billService.getBillsByDateRange(startDate, endDate);
      
      console.log(`✅ Loaded ${bills?.length || 0} bills`);
      
      // Tính toán thống kê
      const stats = billService.calculateStatistics(bills);
      setStatistics(stats);
      
      // Nhóm theo ngày để vẽ biểu đồ
      const grouped = billService.groupByDate(bills);
      prepareChartData(grouped);
      
    } catch (err) {
      console.error('❌ Lỗi tải thống kê:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Xử lý pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadStatistics();
  };

  // Chuẩn bị dữ liệu cho biểu đồ
  const prepareChartData = (groupedData) => {
    if (!groupedData || groupedData.length === 0) {
      setChartData(null);
      return;
    }

    // Lấy tối đa 7 điểm dữ liệu gần nhất
    const recentData = groupedData.slice(-7);
    
    setChartData({
      labels: recentData.map(d => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [{
        data: recentData.map(d => d.revenue),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
      }],
    });
  };

  // ========== NÚT NHANH ==========
  const handleToday = () => {
    const today = new Date();
    setStartDate(today);
    setEndDate(today);
    setActiveFilter('today');
  };

  const handleThisWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const first = new Date(today);
    first.setDate(today.getDate() + diffToMonday);
    const last = new Date(first);
    last.setDate(first.getDate() + 6);
    setStartDate(first);
    setEndDate(last);
    setActiveFilter('week');
  };

  const handleThisMonth = () => {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setStartDate(first);
    setEndDate(last);
    setActiveFilter('month');
  };

  const handleThisYear = () => {
    const year = new Date().getFullYear();
    const first = new Date(year, 0, 1);
    const last = new Date(year, 11, 31);
    setStartDate(first);
    setEndDate(last);
    setActiveFilter('year');
  };

  // ========== RENDER LOADING ==========
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  // ========== RENDER ERROR ==========
  if (error && !statistics) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff3b30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStatistics}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}></Text>

      {/* Bộ lọc thời gian */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowPicker('start')}
        >
          <Ionicons name="calendar-outline" size={18} color="#007AFF" />
          <Text style={styles.dateText}>Từ: {formattedStart}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowPicker('end')}
        >
          <Ionicons name="calendar-outline" size={18} color="#007AFF" />
          <Text style={styles.dateText}>Đến: {formattedEnd}</Text>
        </TouchableOpacity>
      </View>

      {/* Nút nhanh */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickButtonsContainer}
      >
        <TouchableOpacity 
          style={[
            styles.quickBtn, 
            activeFilter === 'today' ? styles.quickBtnPrimary : styles.quickBtnSecondary
          ]} 
          onPress={handleToday}
        >
          <Ionicons 
            name="today" 
            size={18} 
            color={activeFilter === 'today' ? '#fff' : '#007AFF'} 
            style={styles.quickBtnIcon} 
          />
          <Text style={[
            styles.quickBtnText,
            activeFilter === 'today' ? null : styles.quickBtnTextSecondary
          ]}>
            Ngày
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.quickBtn, 
            activeFilter === 'week' ? styles.quickBtnPrimary : styles.quickBtnSecondary
          ]} 
          onPress={handleThisWeek}
        >
          <Ionicons 
            name="calendar" 
            size={18} 
            color={activeFilter === 'week' ? '#fff' : '#007AFF'} 
            style={styles.quickBtnIcon} 
          />
          <Text style={[
            styles.quickBtnText,
            activeFilter === 'week' ? null : styles.quickBtnTextSecondary
          ]}>
            Tuần
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.quickBtn, 
            activeFilter === 'month' ? styles.quickBtnPrimary : styles.quickBtnSecondary
          ]} 
          onPress={handleThisMonth}
        >
          <Ionicons 
            name="calendar-outline" 
            size={18} 
            color={activeFilter === 'month' ? '#fff' : '#007AFF'} 
            style={styles.quickBtnIcon} 
          />
          <Text style={[
            styles.quickBtnText,
            activeFilter === 'month' ? null : styles.quickBtnTextSecondary
          ]}>
            Tháng 
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.quickBtn, 
            activeFilter === 'year' ? styles.quickBtnPrimary : styles.quickBtnSecondary
          ]} 
          onPress={handleThisYear}
        >
          <Ionicons 
            name="time" 
            size={18} 
            color={activeFilter === 'year' ? '#fff' : '#007AFF'} 
            style={styles.quickBtnIcon} 
          />
          <Text style={[
            styles.quickBtnText,
            activeFilter === 'year' ? null : styles.quickBtnTextSecondary
          ]}>
            Năm 
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={showPicker === 'start' ? startDate : endDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowPicker(null);
            if (date) {
              if (showPicker === 'start') setStartDate(date);
              else setEndDate(date);
            }
          }}
        />
      )}

      {/* Nội dung thống kê */}
      {statistics && statistics.totalBills > 0 ? (
        <>
          {/* Cards thống kê tổng quan */}
          <View style={styles.statsGrid}>
            {/* Tổng doanh thu - Card lớn */}
            <View style={[styles.statCard, styles.primaryCard]}>
              <View style={styles.iconCircle}>
                <Ionicons name="wallet" size={32} color="#fff" />
              </View>
              <Text style={styles.statValue}>
                {statistics.totalRevenue.toLocaleString('vi-VN')}đ
              </Text>
              <Text style={styles.statLabel}>Tổng doanh thu</Text>
            </View>

            {/* Tổng hóa đơn */}
            <View style={[styles.statCard, styles.secondaryCard]}>
              <View style={[styles.iconCircleMini, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="receipt" size={20} color="#007AFF" />
              </View>
              <Text style={[styles.statValue, styles.statValueSecondary]}>
                {statistics.totalBills}
              </Text>
              <Text style={styles.statLabelSecondary}>Tổng hóa đơn</Text>
            </View>

            {/* Đã thanh toán */}
            <View style={[styles.statCard, styles.secondaryCard]}>
              <View style={[styles.iconCircleMini, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              </View>
              <Text style={[styles.statValue, styles.statValueSuccess]}>
                {statistics.paidBills}
              </Text>
              <Text style={styles.statLabelSecondary}>Đã thanh toán</Text>
            </View>

            {/* Chưa thanh toán */}
            <View style={[styles.statCard, styles.secondaryCard]}>
              <View style={[styles.iconCircleMini, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="time" size={20} color="#ff3b30" />
              </View>
              <Text style={[styles.statValue, styles.statValueDanger]}>
                {statistics.unpaidBills}
              </Text>
              <Text style={styles.statLabelSecondary}>Chưa thanh toán</Text>
            </View>
          </View>

          {/* Chi tiết doanh thu */}
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Chi tiết doanh thu</Text>
            
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="cash" size={20} color="#28a745" />
                <Text style={styles.detailLabel}>Tiền mặt</Text>
              </View>
              <Text style={styles.detailValue}>
                {statistics.cashRevenue.toLocaleString('vi-VN')}đ
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="card" size={20} color="#007AFF" />
                <Text style={styles.detailLabel}>Chuyển khoản</Text>
              </View>
              <Text style={styles.detailValue}>
                {statistics.momoRevenue.toLocaleString('vi-VN')}đ
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="game-controller" size={20} color="#007AFF" />
                <Text style={styles.detailLabel}>Tiền chơi</Text>
              </View>
              <Text style={styles.detailValue}>
                {statistics.playAmount.toLocaleString('vi-VN')}đ
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="restaurant" size={20} color="#FF6B35" />
                <Text style={styles.detailLabel}>Dịch vụ</Text>
              </View>
              <Text style={styles.detailValue}>
                {statistics.serviceAmount.toLocaleString('vi-VN')}đ
              </Text>
            </View>

            {statistics.totalSurcharge > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="add-circle" size={20} color="#FFA500" />
                  <Text style={styles.detailLabel}>Phụ thu</Text>
                </View>
                <Text style={styles.detailValue}>
                  {statistics.totalSurcharge.toLocaleString('vi-VN')}đ
                </Text>
              </View>
            )}

            {statistics.totalDiscount > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="pricetag" size={20} color="#ff3b30" />
                  <Text style={styles.detailLabel}>Giảm giá</Text>
                </View>
                <Text style={[styles.detailValue, { color: '#ff3b30' }]}>
                  -{statistics.totalDiscount.toLocaleString('vi-VN')}đ
                </Text>
              </View>
            )}

            <View style={[styles.detailRow, styles.detailRowHighlight]}>
              <View style={styles.detailLeft}>
                <Ionicons name="trending-up" size={20} color="#007AFF" />
                <Text style={styles.detailLabelBold}>Trung bình/HĐ</Text>
              </View>
              <Text style={styles.detailValueBold}>
                {statistics.averagePerBill.toLocaleString('vi-VN')}đ
              </Text>
            </View>
          </View>

          {/* Biểu đồ xu hướng */}
          {chartData && chartData.labels.length > 0 && (
            <View style={styles.chartSection}>
              <Text style={styles.sectionTitle}>Xu hướng doanh thu</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={chartData}
                  width={Math.max(screenWidth - 60, chartData.labels.length * 60)}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: '#007AFF',
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              </ScrollView>
              <Text style={styles.chartNote}>
                💡 Dữ liệu {chartData.labels.length} ngày gần nhất
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="bar-chart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            Không có dữ liệu cho khoảng thời gian này
          </Text>
          <Text style={styles.emptySubtext}>
            Thử chọn khoảng thời gian khác hoặc thêm hóa đơn mới
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 13,
    fontWeight: '500',
  },
  quickButtonsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    minWidth: 110,
    justifyContent: 'center',
  },
  quickBtnPrimary: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  quickBtnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#007AFF',
  },
  quickBtnIcon: {
    marginRight: 6,
  },
  quickBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  quickBtnTextSecondary: {
    color: '#007AFF',
  },
  statsGrid: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryCard: {
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconCircleMini: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  statValueSecondary: {
    color: '#007AFF',
    fontSize: 26,
  },
  statValueSuccess: {
    color: '#28a745',
    fontSize: 26,
  },
  statValueDanger: {
    color: '#ff3b30',
    fontSize: 26,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 6,
    opacity: 0.95,
    fontWeight: '500',
  },
  statLabelSecondary: {
    fontSize: 13,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  detailSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailRowHighlight: {
    borderBottomWidth: 0,
    backgroundColor: '#f8f9fa',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  detailLabelBold: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    marginLeft: 8,
  },
  detailValueBold: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '700',
  },
  chartSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});