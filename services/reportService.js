
// services/report.service.js
import api from './api';

// Lấy top sản phẩm bán chạy
export async function getTopProducts({
  from,
  to,
  limit = 10,
  by = 'qty',        // 'qty' | 'amount'
  branchId = null,
  paidOnly = true,
} = {}) {
  try {
    const res = await api.get('/reports/top-products', {
      params: { from, to, limit, by, branchId, paidOnly },
    });

    // Backend: { status, message, data: { metric, items: [...] } }
    const payload = res?.data?.data ?? { metric: by, items: [] };

    return payload; // { metric, items }
  } catch (err) {
    console.error('❌ [Report] getTopProducts error:', err?.response?.data || err);
    throw err;
  }
}
