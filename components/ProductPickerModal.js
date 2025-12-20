// import React, { useEffect, useState } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
//   StyleSheet,
//   ActivityIndicator,
// } from 'react-native';

// import { getAllProducts } from '../services/ProductService';

// export default function ProductPickerModal({
//   visible,
//   onClose,
//   onSelect,
//   selectedIds = [],
// }) {
//   const [loading, setLoading] = useState(false);
//   const [q, setQ] = useState('');
//   const [items, setItems] = useState([]);

//   /* ================= LOAD PRODUCTS ================= */
//   useEffect(() => {
//     if (!visible) return;

//     const t = setTimeout(() => {
//       loadProducts();
//     }, 300); // debounce 300ms

//     return () => clearTimeout(t);
//   }, [visible, q]);

//   async function loadProducts() {
//     setLoading(true);
//     try {
//       const data = await getAllProducts({ q });
//       setItems(data);
//     } catch (e) {
//       console.error('❌ Load products error:', e);
//     } finally {
//       setLoading(false);
//     }
//   }

//   /* ================= RENDER ITEM ================= */
//   function renderItem({ item }) {
//     const selected = selectedIds.includes(item.id);

//     return (
//       <TouchableOpacity
//         disabled={selected}
//         onPress={() => onSelect(item)}
//         style={[styles.item, selected && styles.selected]}
//       >
//         <Text style={styles.name}>{item.name}</Text>
//         {selected && <Text style={styles.tag}>Đã chọn</Text>}
//       </TouchableOpacity>
//     );
//   }

//   return (
//     <Modal visible={visible} animationType="slide">
//       <View style={styles.container}>
//         {/* HEADER */}
//         <Text style={styles.title}>Chọn sản phẩm</Text>

//         {/* SEARCH */}
//         <TextInput
//           placeholder="Tìm theo tên sản phẩm..."
//           value={q}
//           onChangeText={setQ}
//           style={styles.search}
//         />

//         {/* LIST */}
//         {loading ? (
//           <ActivityIndicator size="large" style={{ marginTop: 20 }} />
//         ) : (
//           <FlatList
//             data={items}
//             keyExtractor={(item) => item.id}
//             renderItem={renderItem}
//             keyboardShouldPersistTaps="handled"
//           />
//         )}

//         {/* CLOSE */}
//         <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
//           <Text style={styles.closeText}>Đóng</Text>
//         </TouchableOpacity>
//       </View>
//     </Modal>
//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#FFF',
//   },

//   title: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 12,
//   },

//   search: {
//     borderWidth: 1,
//     borderColor: '#DDD',
//     borderRadius: 8,
//     padding: 8,
//     marginBottom: 12,
//   },

//   item: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderColor: '#EEE',
//   },

//   selected: {
//     backgroundColor: '#F1F8E9',
//   },

//   name: {
//     fontSize: 15,
//     fontWeight: '500',
//   },

//   tag: {
//     marginTop: 4,
//     fontSize: 12,
//     color: '#2E7D32',
//   },

//   closeBtn: {
//     backgroundColor: '#1E88E5',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 12,
//   },

//   closeText: {
//     color: '#FFF',
//     fontWeight: '600',
//   },
// });
