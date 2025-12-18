import api from './api';

/**
 * Lấy danh sách khuyến mãi
 */
export async function getPromotions(params = {}) {
  try {
    const res = await api.get('/promotions', { params });
    return res?.data?.data ?? { items: [], total: 0 };
  } catch (err) {
    console.error('❌ [Promotion] getPromotions error:', err?.response?.data || err);
    throw err;
  }
}

/**
 * Lấy chi tiết 1 khuyến mãi
 */
export async function getPromotionById(id) {
  try {
    const res = await api.get(`/promotions/${id}`);
    return res?.data?.data;
  } catch (err) {
    console.error('❌ [Promotion] getPromotionById error:', err?.response?.data || err);
    throw err;
  }
}

/**
 * Tạo mới
 */
export async function createPromotion(payload) {
  try {
    const res = await api.post('/promotions', payload);
    return res?.data?.data;
  } catch (err) {
    console.error('❌ [Promotion] createPromotion error:', err?.response?.data || err);
    throw err;
  }
}

/**
 * Cập nhật
 */
export async function updatePromotion(id, payload) {
  try {
    const res = await api.put(`/promotions/${id}`, payload);
    return res?.data?.data;
  } catch (err) {
    console.error('❌ [Promotion] updatePromotion error:', err?.response?.data || err);
    throw err;
  }
}

/**
 * Xóa
 */
export async function deletePromotion(id) {
  try {
    await api.delete(`/promotions/${id}`);
    return true;
  } catch (err) {
    console.error('❌ [Promotion] deletePromotion error:', err?.response?.data || err);
    throw err;
  }
}

export default {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
};
