import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const user = {
  name: 'Kiều Khánh Duy',
  role: 'Chủ Quán',
  phone: '0388612918',
  email: 'kkduy24@gmail.com',
};

const getInitials = (name) => {
  const parts = name.split(' ');
  return parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : name[0];
};

export default function AccountScreen() {
  return (
    <View style={styles.container}>

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user.name).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.role}>{user.role}</Text>
        </View>
      </View>

      <Text style={styles.section}>Thông tin tài khoản</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Họ và tên:</Text>
        <Text style={styles.value}>{user.name}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Số điện thoại:</Text>
        <Text style={styles.value}>{user.phone}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email || '(Chưa có)'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  name: { fontSize: 18, fontWeight: '600', color: '#333' },
  role: { fontSize: 14, color: '#777' },
  section: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#007AFF' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: { fontSize: 15, color: '#555' },
  value: { fontSize: 15, color: '#333', fontWeight: '500' },
});