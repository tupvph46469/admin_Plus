import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function RestaurantInfoScreen() {
  const [restaurantId] = useState('89118');
  const [name, setName] = useState('Billiard Plus Club');
  const [phone, setPhone] = useState('0388612918');
  const [currency, setCurrency] = useState('Việt Nam đồng (VND)');
  const [businessType, setBusinessType] = useState('');
  const [city, setCity] = useState('Thành phố Hà Nội');
  const [district, setDistrict] = useState('Nam Từ Liêm');
  const [ward, setWard] = useState('Phường Mễ Trì');
  const [address, setAddress] = useState('');

  const handleSave = () => {
    if (!name || !currency || !businessType || !city || !district || !ward || !address) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường bắt buộc (*)');
      return;
    }

    Alert.alert('Đã lưu', `Thông tin  "${name}" đã được cập nhật.`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thông tin câu lac bộ</Text>

      <Text style={styles.label}>Mã câu lạc bộ</Text>
      <Text style={styles.readOnly}>{restaurantId}</Text>

      <Text style={styles.label}>Tên câu lạc bộ (*)</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Số điện thoại câu lạc bộ (tùy chọn)</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <Text style={styles.note}>Nhập 1 hoặc nhiều số điện thoại, tối đa 100 ký tự</Text>

      <Text style={styles.label}>Đơn vị tiền tệ (*)</Text>
      <TextInput style={styles.input} value={currency} onChangeText={setCurrency} />

      <Text style={styles.label}>Loại hình kinh doanh (*)</Text>
      <TextInput style={styles.input} value={businessType} onChangeText={setBusinessType} />

      <Text style={styles.label}>Tỉnh / Thành phố (*)</Text>
      <TextInput style={styles.input} value={city} onChangeText={setCity} />

      <Text style={styles.label}>Quận / Huyện (*)</Text>
      <TextInput style={styles.input} value={district} onChangeText={setDistrict} />

      <Text style={styles.label}>Phường / Xã (*)</Text>
      <TextInput style={styles.input} value={ward} onChangeText={setWard} />

      <Text style={styles.label}>Địa chỉ cụ thể (*)</Text>
      <TextInput
        style={[styles.input, { height: 60 }]}
        value={address}
        onChangeText={setAddress}
        multiline
        maxLength={255}
      />
      <Text style={styles.note}>Tối đa 255 ký tự</Text>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Lưu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, color: '#333', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  readOnly: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
    paddingVertical: 6,
  },
  note: { fontSize: 12, color: '#777', marginBottom: 12 },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 50,
  },
  saveText: { color: '#fff', fontSize: 16 },
});