import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import {
  createProduct,
  getMenuCategories,
  uploadProductImage,
} from '../services/ProductService';

export default function AddItemScreen({ navigation }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const list = await getMenuCategories();
        setCategories(list);
        if (list.length > 0) {
          setSelectedCategory(list[0]);
        }
      } catch (err) {
        Alert.alert('Lỗi', 'Không tải được danh mục');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

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
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim() || !selectedCategory) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);

      let imagePath = null;
      if (imageUri) {
        imagePath = await uploadProductImage(imageUri);
      }

      await createProduct({
        name: name.trim(),
        price: price.trim(),
        note: note.trim(),
        categoryId: selectedCategory.id || selectedCategory._id,
        imagePath,
      });

      Alert.alert('Thành công', 'Đã thêm mặt hàng', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lưu mặt hàng');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Đang tải danh mục...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* IMAGE */}
      <View style={styles.imageBox}>
        <TouchableOpacity onPress={handlePickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={32} color="#888" />
              <Text style={styles.imageText}>Chọn ảnh</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* CATEGORY */}
      <Text style={styles.label}>Danh mục</Text>
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => setShowCategoryModal(true)}
      >
        <Text style={styles.selectText}>
          {selectedCategory?.name || 'Chọn danh mục'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#555" />
      </TouchableOpacity>

      {/* NAME */}
      <Text style={styles.label}>Tên mặt hàng</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="VD: Bánh mì"
      />

      {/* PRICE */}
      <Text style={styles.label}>Giá bán</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="VD: 20000"
        keyboardType="numeric"
      />

      {/* NOTE */}
      <Text style={styles.label}>Ghi chú</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={note}
        onChangeText={setNote}
        placeholder="VD: Hàng mới 330ml"
        multiline
      />

      {/* SAVE */}
      <TouchableOpacity
        style={[styles.saveButton, loading && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveText}>
          {loading ? 'Đang lưu...' : 'Lưu'}
        </Text>
      </TouchableOpacity>

      {/* CATEGORY MODAL */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn danh mục</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id || item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCategory(item);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  imageBox: { alignItems: 'center', marginBottom: 20 },
  image: { width: 120, height: 120, borderRadius: 10 },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: { marginTop: 6, color: '#666' },

  label: { fontSize: 15, marginBottom: 6, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },

  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  selectText: { fontSize: 16, color: '#333' },

  saveButton: {
    backgroundColor: '#34C759',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: { fontSize: 16 },
});
