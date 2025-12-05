import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const reportData = [
  {
    title: 'BÁO CÁO DOANH THU',
    icon: 'bar-chart',
    children: [
      { label: 'Báo cáo doanh thu tổng quan' },
      { label: 'Báo cáo doanh thu theo phương thức thanh toán' },
      { label: 'Báo cáo doanh thu theo bàn chơi', route: 'ReportByTable' },
      { label: 'Hủy đơn chưa thanh toán' },
      { label: 'Hủy hoá đơn đã thanh toán' },
    ],
  },
  {
    title: 'BÁO CÁO MẶT HÀNG',
    icon: 'cube',
    children: [
      { label: 'Danh mục mặt hàng' },
      { label: 'Mặt hàng bán chạy', route: 'TopProducts' }, // 👈 gắn route
      { label: 'Combo bán chạy' },
      { label: 'Mặt hàng đã hủy' },
      { label: 'Combo đã hủy' },
    ],
  },

  {
    title: 'BÁO CÁO KHUYẾN MẠI',
    icon: 'gift',
    children: [
      { label: 'Chương trình khuyến mãi' },
    ],
  }
];

export default function ReportScreen({ navigation }) { // 👈 nhận navigation
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const handlePressChild = (child) => {
    if (child.route) {
      navigation.navigate(child.route);
    } else {
      // nếu sau này muốn làm gì khác cho các item chưa có route thì xử lý ở đây
      console.log('Chưa gắn route cho:', child.label);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {reportData.map((section, index) => (
        <View key={index}>
          <TouchableOpacity style={styles.header} onPress={() => toggleExpand(index)}>
            <Ionicons name={section.icon} size={22} color="#007AFF" style={styles.icon} />
            <Text style={styles.headerText}>{section.title}</Text>
            <Ionicons
              name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#007AFF"
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>

          {expandedIndex === index && (
            <View style={styles.subList}>
              {section.children.map((child, subIndex) => (
                <TouchableOpacity
                  key={subIndex}
                  style={styles.subItem}
                  onPress={() => handlePressChild(child)}
                >
                  <Text style={styles.subText}>{child.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  icon: {
    marginRight: 12,
  },
  headerText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  subList: {
    paddingLeft: 40,
    paddingVertical: 5,
  },
  subItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  subText: {
    fontSize: 15,
    color: '#555',
  },
});
