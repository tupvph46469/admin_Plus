// services/reportService.js
import api from './api';

/**
 * Lấy top sản phẩm bán chạy
 */
export async function getTopProducts({
  from,
  to,
  limit = 10,
  by = 'qty',
  branchId = null,
  paidOnly = true,
} = {}) {
  try {
    const res = await api.get('/reports/top-products', {
      params: { from, to, limit, metric: by, branchId, paidOnly },
    });

    const payload = res?.data?.data ?? { metric: by, items: [] };
    return payload;
  } catch (err) {
    console.error('❌ [Report] getTopProducts error:', err?.response?.data || err);
    throw err;
  }
}

/**
 * Lấy báo cáo doanh thu theo bàn chơi
 * Backend endpoint: GET /reports/top-tables
 * @param {Object} options
 * @param {string} options.from - Từ ngày (ISO string hoặc Date)
 * @param {string} options.to - Đến ngày (ISO string hoặc Date)
 * @param {boolean} options.paidOnly - Chỉ tính bills đã thanh toán (default: true)
 * @param {string} options.branchId - Lọc theo chi nhánh (optional)
 * @param {number} options.limit - Giới hạn số bàn trả về (default: 100)
 * @param {string} options.metric - Sắp xếp theo 'amount' hoặc 'minutes' (default: 'amount')
 * @returns {Promise<Object>} { metric, items: [{ table, tableName, total, playAmount, serviceAmount, minutes }] }
 */
export async function getRevenueByTable({
  from,
  to,
  paidOnly = true,
  branchId = null,
  limit = 100,
  metric = 'amount',
} = {}) {
  try {
    console.log('📊 [ReportService] Fetching revenue by table:', { from, to, paidOnly, metric });

    // Convert Date to ISO string if needed
    const fromStr = from instanceof Date ? from.toISOString() : from;
    const toStr = to instanceof Date ? to.toISOString() : to;

    const res = await api.get('/reports/top-tables', {
      params: {
        from: fromStr,
        to: toStr,
        paidOnly,
        branchId,
        limit,
        metric, // 'amount' hoặc 'minutes'
      },
    });

    // Backend response: { status, message, data: { metric, items } }
    // items: [{ table, tableName, total, playAmount, serviceAmount, minutes }]
    const data = res?.data?.data ?? { metric: 'amount', items: [] };

    console.log('✅ [ReportService] Revenue by table loaded:', data);

    // Transform data để thêm thông tin tổng hợp
    const items = data.items || [];
    const summary = {
      totalRevenue: items.reduce((sum, item) => sum + (item.total || 0), 0),
      totalTables: items.length,
      totalPlayAmount: items.reduce((sum, item) => sum + (item.playAmount || 0), 0),
      totalServiceAmount: items.reduce((sum, item) => sum + (item.serviceAmount || 0), 0),
      totalMinutes: items.reduce((sum, item) => sum + (item.minutes || 0), 0),
    };

    return {
      metric: data.metric,
      items,
      summary,
      period: {
        from: fromStr,
        to: toStr,
      }
    };
  } catch (err) {
    console.error('❌ [Report] getRevenueByTable error:', err?.response?.data || err);
    throw err;
  }
}

export default {
  getTopProducts,
  getRevenueByTable,
};