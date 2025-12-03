import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getRevenueByTable } from '../services/reportService';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function ReportByTableScreen({ navigation }) {
  // State quản lý ngày tháng
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // 7 ngày trước
    return date;
  });
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // State dữ liệu và metric
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [metric, setMetric] = useState('amount'); // 'amount' hoặc 'minutes'

  // Load dữ liệu khi vào màn hình
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!fromDate || !toDate) {
      Alert.alert('Lỗi', 'Vui lòng chọn khoảng thời gian');
      return;
    }

    if (fromDate > toDate) {
      Alert.alert('Lỗi', 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
      return;
    }

    try {
      setLoading(true);
      const result = await getRevenueByTable({
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        paidOnly: true,
        limit: 100,
        metric: metric,
      });

      setData(result);
      console.log('✅ Loaded data:', result);
    } catch (error) {
      console.error('❌ Load error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatMoney = (amount) => {
    if (!amount) return '0₫';
    return Math.round(amount).toLocaleString('vi-VN') + '₫';
  };

  const formatMinutes = (minutes) => {
    if (!minutes) return '0 phút';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
    }
    return `${mins} phút`;
  };

  // 🔥 FIX: Rút gọn tên bàn cho biểu đồ
  const getShortTableName = (tableName) => {
    if (!tableName) return 'N/A';
    // Bỏ "Bàn số" hoặc "Bàn" để chỉ hiển thị số
    const match = tableName.match(/\d+/);
    if (match) return `B${match[0]}`;
    
    // Nếu không có số, rút gọn về 6 ký tự
    if (tableName.length <= 6) return tableName;
    return tableName.substring(0, 5) + '…';
  };

  const handleFromDateChange = (event, selectedDate) => {
    setShowFromPicker(false);
    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const handleToDateChange = (event, selectedDate) => {
    setShowToPicker(false);
    if (selectedDate) {
      setToDate(selectedDate);
    }
  };

  const handleMetricChange = (newMetric) => {
    setMetric(newMetric);
  };

  // 🔥 FIX: Chuẩn bị dữ liệu cho biểu đồ - đơn giản hóa
  const getChartData = () => {
    if (!data || !data.items || data.items.length === 0) {
      return null;
    }

    // Lấy top 10 bàn
    const topTables = data.items.slice(0, 10);

    return {
      labels: topTables.map(item => getShortTableName(item.tableName)),
      datasets: [
        {
          data: topTables.map(item => {
            const value = metric === 'minutes' 
              ? (item.minutes || 0) / 60  // Convert to hours
              : (item.total || 0) / 1000000; // Convert to millions
            return Math.max(0.01, value); // Đảm bảo giá trị > 0 để hiển thị
          }),
        },
      ],
    };
  };

  const chartData = getChartData();

  return (
    <ScrollView style={styles.container}>
      {/* Date Picker Section */}
      <View style={styles.dateSection}>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Từ ngày:</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowFromPicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(fromDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Đến ngày:</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowToPicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(toDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Metric Selector */}
        <View style={styles.metricSelector}>
          <TouchableOpacity
            style={[styles.metricButton, metric === 'amount' && styles.metricButtonActive]}
            onPress={() => handleMetricChange('amount')}
          >
            <Text style={[styles.metricText, metric === 'amount' && styles.metricTextActive]}>
              Theo doanh thu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.metricButton, metric === 'minutes' && styles.metricButtonActive]}
            onPress={() => handleMetricChange('minutes')}
          >
            <Text style={[styles.metricText, metric === 'minutes' && styles.metricTextActive]}>
              Theo thời gian
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={loadData}>
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.searchButtonText}>Xem báo cáo</Text>
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={handleFromDateChange}
        />
      )}
      {showToPicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display="default"
          onChange={handleToDateChange}
        />
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      )}

      {/* 🔥 FIX: Chart - Đơn giản hóa với màu gradient đẹp */}
      {!loading && chartData && (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>
            Top 10 bàn {metric === 'minutes' ? '(giờ)' : '(triệu đồng)'}
          </Text>
          <BarChart
            data={chartData}
            width={screenWidth - 40}
            height={280}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#f8f9fa',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: metric === 'minutes' ? 1 : 2,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(52, 58, 64, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForLabels: {
                fontSize: 11,
                fontWeight: '600',
              },
              propsForBackgroundLines: {
                strokeDasharray: '', // solid background lines
                stroke: '#e9ecef',
                strokeWidth: 1,
              },
            }}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix={metric === 'minutes' ? 'h' : 'M'}
            fromZero
            showValuesOnTopOfBars={false}
            withInnerLines={true}
            segments={4}
          />
        </View>
      )}

      {/* 🔥 FIX: Table List - Sử dụng item.tableName thay vì item.name */}
      {!loading && data && data.items && data.items.length > 0 && (
        <View style={styles.tableSection}>
          <Text style={styles.sectionTitle}>
            Danh sách bàn ({data.items.length})
          </Text>
          {data.items.map((item, index) => (
            <View key={index} style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <View style={[
                  styles.tableRank,
                  index === 0 && styles.rankGold,
                  index === 1 && styles.rankSilver,
                  index === 2 && styles.rankBronze,
                ]}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <Text style={styles.tableName}>
                  {item.tableName || 'Bàn không xác định'}
                </Text>
                <Text style={styles.tableRevenue}>
                  {metric === 'minutes' 
                    ? formatMinutes(item.minutes)
                    : formatMoney(item.total)
                  }
                </Text>
              </View>
              <View style={styles.tableDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="cash-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Tổng: {formatMoney(item.total)}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="game-controller-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Chơi: {formatMoney(item.playAmount)}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="cafe-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    DV: {formatMoney(item.serviceAmount)}
                  </Text>
                </View>
                {item.minutes > 0 && (
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {formatMinutes(item.minutes)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Empty State */}
      {!loading && data && data.items && data.items.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Không có dữ liệu</Text>
          <Text style={styles.emptySubtext}>
            Vui lòng chọn khoảng thời gian khác
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  dateSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 15,
    color: '#333',
    width: 80,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateText: {
    fontSize: 15,
    color: '#333',
  },
  metricSelector: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  metricButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  metricButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  metricText: {
    fontSize: 14,
    color: '#666',
  },
  metricTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
  },
  chartSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  tableSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  tableCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tableRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankGold: {
    backgroundColor: '#FFD700',
  },
  rankSilver: {
    backgroundColor: '#C0C0C0',
  },
  rankBronze: {
    backgroundColor: '#CD7F32',
  },
  rankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tableName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tableRevenue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  tableDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
  },
});