import api from './api';

export const tableService = {
  // Danh sách bàn với thông tin session
  list: async (params = {}) => {
    try {
      console.log('📋 [Table] Fetching tables with params:', params);
      const response = await api.get('/tables', { params });
      console.log('✅ [Table] List success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Table] List error:', error);
      throw error;
    }
  },

  // Chi tiết bàn với session info
  getById: async (tableId) => {
    try {
      console.log('📋 [Table] Fetching table:', tableId);
      const response = await api.get(`/tables/${tableId}`);
      console.log('✅ [Table] Get success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Table] Get error:', error);
      throw error;
    }
  },

  // Tạo bàn mới (Admin only)
  create: async (data) => {
    try {
      console.log('➕ [Table] Creating table:', data);
      const response = await api.post('/tables', data);
      console.log('✅ [Table] Create success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Table] Create error:', error);
      throw error;
    }
  },

  // Cập nhật bàn (Admin only)
  update: async (tableId, data) => {
    try {
      console.log('✏️ [Table] Updating table:', tableId, data);
      const response = await api.put(`/tables/${tableId}`, data);
      console.log('✅ [Table] Update success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Table] Update error:', error);
      throw error;
    }
  },

  // Thay đổi trạng thái bàn (Admin only)
  changeStatus: async (tableId, status) => {
    try {
      console.log('🔄 [Table] Changing status:', tableId, status);
      const response = await api.patch(`/tables/${tableId}/status`, { status });
      console.log('✅ [Table] Status change success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Table] Status change error:', error);
      throw error;
    }
  },

  // Bật/tắt bàn (Admin only)
  setActive: async (tableId, active) => {
    try {
      console.log('🔄 [Table] Setting active:', tableId, active);
      const response = await api.patch(`/tables/${tableId}/active`, { active });
      console.log('✅ [Table] Active change success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Table] Active change error:', error);
      throw error;
    }
  },

  // Cập nhật giá/giờ (Admin only)
  setRate: async (tableId, ratePerHour) => {
    try {
      console.log('💰 [Table] Setting rate:', tableId, ratePerHour);
      const response = await api.patch(`/tables/${tableId}/rate`, { ratePerHour });
      console.log('✅ [Table] Rate change success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Table] Rate change error:', error);
      throw error;
    }
  },

  // Sắp xếp lại thứ tự bàn (Admin only)
  reorder: async (items) => {
    try {
      console.log('🔄 [Table] Reordering tables:', items);
      const response = await api.patch('/tables/reorder', { items });
      console.log('✅ [Table] Reorder success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Table] Reorder error:', error);
      throw error;
    }
  },

  // Xóa bàn (Admin only)
  remove: async (tableId) => {
    try {
      console.log('🗑️ [Table] Removing table:', tableId);
      const response = await api.delete(`/tables/${tableId}`);
      console.log('✅ [Table] Remove success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Table] Remove error:', error);
      throw error;
    }
  },
};

// Backward compatibility với code cũ
export const listTables = tableService.list;
export const getTable = tableService.getById;