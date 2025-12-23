import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../constants/config';
import {
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '../services/ProductService';

const FILE_BASE_URL = API_URL.replace('/api/v1', '');

export default function ItemDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const productId = item.id || item._id;

  const [name, setName] = useState(item.name ?? '');
  const [price, setPrice] = useState(
    typeof item.price === 'number' ? String(item.price) : item.price ?? ''
  );
  const [note, setNote] = useState(item.note ?? '');
  const [loading, setLoading] = useState(false);

  const categoryName = item.category?.name || 'Không có danh mục';

  const initialImageUri =
    item.image ||
    (Array.isArray(item.images) && item.images.length > 0
      ? `${FILE_BASE_URL}${item.images[0]}`
      : null);

  const [imageUri, setImageUri] = useState(initialImageUri);
  const [newLocalImage, setNewLocalImage] = useState(null);

  const handlePickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setNewLocalImage(uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);

      let imagesPayload;
      if (newLocalImage) {
        const uploadedPath = await uploadProductImage(newLocalImage);
        imagesPayload = [uploadedPath];
      }

      await updateProduct(productId, {
        name: name.trim(),
        price: Number(price),
        note: note.trim(),
        ...(imagesPayload && { images: imagesPayload }),
      });

      Alert.alert('Thành công', 'Mặt hàng đã được cập nhật', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert(
        'Lỗi',
        err?.response?.data?.message || 'Không thể cập nhật mặt hàng'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa mặt hàng',
      `Bạn có chắc muốn xóa "${name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteProduct(productId);
              navigation.goBack();
            } catch (err) {
              Alert.alert(
                'Lỗi',
                err?.response?.data?.message || 'Không thể xóa mặt hàng'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* IMAGE */}
      <TouchableOpacity
        style={styles.imageWrapper}
        onPress={handlePickImage}
        disabled={loading}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={32} color="#888" />
          </View>
        )}
        <View style={styles.cameraBadge}>
          <Ionicons name="camera" size={16} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* CATEGORY */}
      <Text style={styles.label}>Danh mục</Text>
      <View style={styles.readOnlyBox}>
        <Text style={styles.readOnlyText}>{categoryName}</Text>
      </View>

      {/* NAME */}
      <Text style={styles.label}>Tên mặt hàng</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      {/* PRICE */}
      <Text style={styles.label}>Giá bán</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      {/* NOTE */}
      <Text style={styles.label}>Ghi chú</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={note}
        onChangeText={setNote}
        multiline
      />

      {/* SAVE */}
      <TouchableOpacity
        style={[styles.saveButton, loading && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Lưu thay đổi</Text>
        )}
      </TouchableOpacity>

      {/* DELETE */}
      <TouchableOpacity
        style={[styles.deleteButton, loading && { opacity: 0.5 }]}
        onPress={handleDelete}
        disabled={loading}
      >
        <Text style={styles.deleteText}>Xóa mặt hàng</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },

  imageWrapper: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  imagePlaceholder: {
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 4,
  },

  label: { fontSize: 15, marginBottom: 6, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },

  readOnlyBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  readOnlyText: { fontSize: 16, color: '#333' },

  saveButton: {
    backgroundColor: '#34C759',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
