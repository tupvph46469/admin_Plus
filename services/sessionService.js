import api from './api';


export const sessionService = {
  // Danh sách sessions
  list: async (params = {}) => {
    try {
      console.log('📋 [Session] Fetching sessions with params:', params);
      const response = await api.get('/sessions', { params });
      console.log('✅ [Session] List success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Session] List error:', error);
      throw error;
    }
  },

  // Chi tiết session
  getById: async (sessionId) => {
    try {
      console.log('📋 [Session] Fetching session:', sessionId);
      const response = await api.get(`/sessions/${sessionId}`);
      console.log('✅ [Session] Get success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Session] Get error:', error);
      throw error;
    }
  },

  // Mở phiên (check-in) - SỬA LẠI THEO BACKEND
  open: async (data) => {
    try {
      console.log('🔓 [Session] Opening session with data:', data);
      
      // Format lại data theo backend yêu cầu
      const payload = {
        tableId: data.tableId,
        startAt: data.startTime || data.startAt,  // Backend dùng 'startAt'
        note: data.note || ''
      };
      
      console.log('📤 [Session] Sending payload:', payload);
      
      // Endpoint đúng là '/sessions'
      const response = await api.post('/sessions', payload);
      console.log('✅ [Session] Open success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Session] Open error:', error);
      throw error;
    }
  },

  // Xem trước bill (preview close)
  previewClose: async (sessionId, endAt = null) => {
    try {
      console.log('👁️ [Session] Preview close for session:', sessionId);
      const params = {};
      if (endAt) {
        params.endAt = endAt instanceof Date ? endAt.toISOString() : endAt;
      }
      
      const response = await api.get(`/sessions/${sessionId}/preview-close`, { params });
      console.log('✅ [Session] Preview success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Session] Preview error:', error);
      throw error;
    }
  },

  // Checkout phiên
  checkout: async (sessionId, data) => {
    try {
      console.log('💰 [Session] Checkout session:', sessionId, 'with data:', data);
      const response = await api.post(`/sessions/${sessionId}/checkout`, data);
      console.log('✅ [Session] Checkout success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Session] Checkout error:', error);
      throw error;
    }
  },

  // Thêm sản phẩm/dịch vụ vào session
  addItem: async (sessionId, itemData) => {
    try {
      console.log('➕ [Session] Adding item to session:', sessionId, itemData);
      const response = await api.post(`/sessions/${sessionId}/items`, itemData);
      console.log('✅ [Session] Add item success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Session] Add item error:', error);
      throw error;
    }
  },

  // Cập nhật số lượng item - SỬA LẠI VỀ PATCH
  updateItemQty: async (sessionId, itemId, data) => {
    try {
      console.log('✏️ [Session] Updating item qty:', sessionId, itemId, data);
      // Đổi lại từ 'put' về 'patch' theo backend
      const response = await api.patch(`/sessions/${sessionId}/items/${itemId}`, data);
      console.log('✅ [Session] Update item success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Session] Update item error:', error);
      throw error;
    }
  },

  // Xóa item khỏi session
  removeItem: async (sessionId, itemId) => {
    try {
      console.log('🗑️ [Session] Removing item:', sessionId, itemId);
      const response = await api.delete(`/sessions/${sessionId}/items/${itemId}`);
      console.log('✅ [Session] Remove item success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Session] Remove item error:', error);
      throw error;
    }
  },

  // Hủy phiên (void)
  void: async (sessionId, reason = '') => {
    try {
      console.log('❌ [Session] Voiding session:', sessionId, 'reason:', reason);
      const response = await api.patch(`/sessions/${sessionId}/void`, { reason });
      console.log('✅ [Session] Void success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [Session] Void error:', error);
      throw error;
    }
  },

  // Helper: Tính toán thời gian từ startTime
  calculateDuration: (startTime, endTime = null) => {
    if (!startTime) return { hours: 0, minutes: 0, totalMinutes: 0 };

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const totalMinutes = Math.floor((end - start) / (1000 * 60));
    
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
      totalMinutes,
      formatted: totalMinutes >= 60 
        ? `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60 > 0 ? ` ${totalMinutes % 60}m` : ''}`
        : `${totalMinutes}m`
    };
  },

  // Helper: Format thời gian hiển thị
  formatDuration: (startTime, endTime = null) => {
    const duration = sessionService.calculateDuration(startTime, endTime);
    return duration.formatted;
  }
};