import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

// Import service API
import { createEmployee, updateEmployee } from '../services/userService';

const USERNAME_RE = /^[a-z0-9._-]{3,64}$/; // theo validator backend

export default function EmployeeFormScreen({ route, navigation }) {
  const { mode, employee, selectedRole } = route.params || {};
  const isAddMode = mode === 'add';

  // Các field khớp backend
  const [fullName, setFullName] = useState(employee?.name || '');
  const [username, setUsername] = useState(employee?.username || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [phone, setPhone] = useState(employee?.phone || '');
  const [role, setRole] = useState(selectedRole || employee?.role || 'staff');
  const [active, setActive] = useState(employee?.active ?? true);

  // Password chỉ dùng khi tạo mới (hoặc khi muốn đổi)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  // Client-side validation helpers
  function validateEmail(e) {
    if (!e) return true;
    // simple email check
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  function validateForm() {
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống');
      return false;
    }

    if (!username.trim()) {
      Alert.alert('Lỗi', 'Tên đăng nhập không được để trống');
      return false;
    }

    if (!USERNAME_RE.test(username.trim())) {
      Alert.alert('Lỗi', 'Username không hợp lệ. Chỉ gồm a-z, 0-9, ., _, - và dài 3–64 ký tự');
      return false;
    }

    if (isAddMode) {
      if (!password) {
        Alert.alert('Lỗi', 'Mật khẩu không được để trống');
        return false;
      }
      if (password.length < 6) {
        Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
        return false;
      }
      if (password !== confirmPassword) {
        Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
        return false;
      }
    } else {
      // edit mode: nếu nhập password (thay đổi), validate
      if (password) {
        if (password.length < 6) {
          Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
          return false;
        }
        if (password !== confirmPassword) {
          Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
          return false;
        }
      }
    }

    if (email && !validateEmail(email.trim())) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return false;
    }

    // phone optional, can add pattern if required

    return true;
  }

  // Build payload: omit empty fields
  function buildCreatePayload() {
    const body = {
      username: username.trim(),
      password,
      name: fullName.trim(),
      role: role || 'staff',
      active: !!active,
    };

    if (email && email.trim() !== '') body.email = email.trim();
    if (phone && phone.trim() !== '') body.phone = phone.trim();
    // branchId, avatar omitted unless provided
    return body;
  }

  function buildUpdatePayload() {
    const body = {
      name: fullName.trim(),
      role: role || 'staff',
      active: !!active,
    };
    if (email && email.trim() !== '') body.email = email.trim();
    if (phone && phone.trim() !== '') body.phone = phone.trim();
    // Do not include username (backend disallows), do not include password via PUT
    return body;
  }

  // =============================
  // Submit (create or update)
  // =============================
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isAddMode) {
        const payload = buildCreatePayload();
        await createEmployee(payload);
        Alert.alert('Thành công', `Tạo tài khoản nhân viên "${fullName}" thành công`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const id = employee?.id || employee?._id;
        if (!id) {
          Alert.alert('Lỗi', 'Không xác định nhân viên để cập nhật');
          return;
        }
        const payload = buildUpdatePayload();
        await updateEmployee(id, payload);
        Alert.alert('Thành công', `Cập nhật nhân viên "${fullName}" thành công`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);

        // If user wants to change password in edit mode, recommend using reset-password endpoint.
        if (password) {
          Alert.alert('Lưu ý', 'Đổi mật khẩu không gửi qua form. Sử dụng chức năng "Đặt lại mật khẩu" để thay đổi mật khẩu.');
        }
      }
    } catch (err) {
      console.log('❌ Employee submit error:', err?.response?.data || err);
      // Prefer backend message if available (could be {message} or {errors: [...]})
      const resp = err?.response?.data;
      const msg = resp?.message || (resp?.errors && resp.errors[0]?.message) || err?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>
        {isAddMode ? 'Tạo tài khoản' : 'Chi tiết tài khoản'}
      </Text>

      {/* Họ tên */}
      <Text style={styles.label}>Họ và tên (*)</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        editable={!loading}
      />

      {/* Username */}
      <Text style={styles.label}>Tên đăng nhập (*)</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        editable={isAddMode && !loading}
        autoCapitalize="none"
      />

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        editable={!loading}
        autoCapitalize="none"
      />

      {/* Phone */}
      <Text style={styles.label}>Số điện thoại</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!loading}
      />

      {/* Password khi tạo / đổi */}
      <Text style={styles.label}>{isAddMode ? 'Mật khẩu (*)' : 'Mật khẩu (để trống nếu không đổi)'}</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      <Text style={styles.label}>{isAddMode ? 'Xác nhận mật khẩu (*)' : 'Xác nhận mật khẩu'}</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        editable={!loading}
      />

    {/* Vai trò */}
<Text style={styles.label}>Vai trò</Text>
<TouchableOpacity
  style={styles.rolePicker}
  onPress={() => setRole(role === 'staff' ? 'admin' : 'staff')}
  disabled={loading}
>
  <Text style={styles.roleText}>
    {role === 'staff' ? 'Lễ tân' : 'Quản trị'}
  </Text>
</TouchableOpacity>


      {/* Trạng thái */}
      <Text style={styles.label}>Trạng thái</Text>
      <TouchableOpacity
        style={styles.rolePicker}
        onPress={() => setActive((s) => !s)}
        disabled={loading}
      >
        <Text style={styles.roleText}>{active ? 'Đang hoạt động' : 'Không hoạt động'}</Text>
      </TouchableOpacity>

      {/* Thông tin hệ thống (chỉ edit) */}
      {!isAddMode && employee && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.systemLabel}>Ngày tạo: {employee.createdAt ? new Date(employee.createdAt).toLocaleString() : '-'}</Text>
          <Text style={styles.systemLabel}>Cập nhật lần cuối: {employee.updatedAt ? new Date(employee.updatedAt).toLocaleString() : '-'}</Text>
          <Text style={styles.systemLabel}>Lần đăng nhập cuối: {employee.lastLoginAt ? new Date(employee.lastLoginAt).toLocaleString() : 'Chưa đăng nhập'}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitButton, loading && { opacity: 0.8 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>{isAddMode ? 'Tạo tài khoản' : 'Cập nhật'}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, color: '#333', marginBottom: 6 },
  systemLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  rolePicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    marginBottom: 16,
  },
  roleText: { fontSize: 16, color: '#333' },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: { color: '#fff', fontSize: 16 },
});
