import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const reportData = [
  {
    title: 'BÁO CÁO DOANH THU',
    icon: 'bar-chart',
    color: '#007AFF',
    children: [
      { label: 'Báo cáo doanh thu tổng quan', route: 'Tổng quan' },
      { label: 'Báo cáo doanh thu theo bàn chơi', route: 'ReportByTable' },
    ],
  },
  {
    title: 'BÁO CÁO MẶT HÀNG',
    icon: 'cube',
    color: '#FF6B35',
    children: [
    
      { label: 'Mặt hàng bán chạy', route: 'TopProducts' },
    
    ],
  },

  {
    title: 'BÁO CÁO KHUYẾN MẠI',
    icon: 'gift',
    color: '#FF1744',
    children: [
      { label: 'Chương trình khuyến mãi',route: 'Khuyến mãi' },
    ],
  }
];

export default function ReportScreen({ navigation }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const handlePressChild = (child) => {
    if (child.route) {
      navigation.navigate(child.route);
    } else {
      console.log('Chưa gắn route cho:', child.label);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {reportData.map((section, index) => (
        <View key={index} style={styles.card}>
          {/* Header */}
          <TouchableOpacity 
            style={styles.header} 
            onPress={() => toggleExpand(index)}
            activeOpacity={0.7}
          >
            <View style={styles.headerLeft}>
              <View style={[styles.iconCircle, { backgroundColor: section.color + '20' }]}>
                <Ionicons name={section.icon} size={22} color={section.color} />
              </View>
              <Text style={styles.headerText}>{section.title}</Text>
            </View>
            <Ionicons
              name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
              size={22}
              color="#666"
            />
          </TouchableOpacity>

          {/* Sub List */}
          {expandedIndex === index && (
            <View style={styles.subList}>
              {section.children.map((child, subIndex) => (
                <TouchableOpacity
                  key={subIndex}
                  style={styles.subItem}
                  onPress={() => handlePressChild(child)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.subText}>{child.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
      
      {/* Bottom spacing */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  
  // CARD
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  
  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  
  // SUB LIST
  subList: {
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 8,
  },
  subItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,   // ✔ padding vừa đủ
    marginHorizontal: 12,
    marginVertical: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  

  subItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
});