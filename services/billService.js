import api from "./api";
import { ENDPOINTS } from "../constants/config";

// ============= BILLS CRUD (Giữ nguyên) =============

// Lấy danh sách hóa đơn
export const getBills = async () => {
  try {
    const res = await api.get(ENDPOINTS.bills);
    console.log("📌 RAW RES:", res.data);
    return res.data.data?.items;
  } catch (err) {
    console.log("❌ Lỗi getBills:", err.response?.data || err.message);
    throw err;
  }
};

// Lấy chi tiết hóa đơn
export const getBillDetail = async (billId) => {
  try {
    const res = await api.get(ENDPOINTS.billDetail(billId));
    return res.data.data;
  } catch (err) {
    console.log("❌ Lỗi getBillDetail:", err.response?.data || err.message);
    throw err;
  }
};

// Tạo bill mới từ session  
export const createBillFromSession = async (sessionData, paymentData) => {
  try {
    console.log('💳 Creating bill from session:', sessionData._id);
    console.log('💳 Session data:', sessionData);
    console.log('💳 Payment data:', paymentData);
    
    const billData = {
      session: sessionData._id,
      table: sessionData.table._id || sessionData.table,
      tableName: sessionData.table.name || paymentData.tableName,
      areaId: sessionData.table.area || null,
      items: [],
      paymentMethod: paymentData.paymentMethod || 'cash',
      paid: true,
      paidAt: new Date().toISOString(),
      staff: paymentData.staffId || sessionData.staff || null,
      note: paymentData.note || ''
    };

    if (sessionData.startTime) {
      const startTime = new Date(sessionData.startTime);
      const endTime = new Date();
      const totalMinutes = Math.floor((endTime - startTime) / (1000 * 60));
      const ratePerHour = sessionData.pricingSnapshot?.ratePerHour || paymentData.ratePerHour || 40000;
      const playAmount = Math.ceil(totalMinutes / 60) * ratePerHour;

      billData.items.push({
        type: 'play',
        minutes: totalMinutes,
        ratePerHour: ratePerHour,
        amount: playAmount,
        note: `Chơi bida ${Math.floor(totalMinutes / 60)}h${totalMinutes % 60}m`
      });
    }

    if (sessionData.items && sessionData.items.length > 0) {
      sessionData.items.forEach(item => {
        billData.items.push({
          type: 'product',
          productId: item.product,
          nameSnapshot: item.nameSnapshot || 'Sản phẩm',
          priceSnapshot: item.priceSnapshot || 0,
          qty: item.qty || 0,
          amount: (item.priceSnapshot || 0) * (item.qty || 0),
          note: item.note || ''
        });
      });
    }

    console.log('📝 Bill data to send:', billData);

    const response = await api.post(ENDPOINTS.bills, billData);
    console.log('✅ Bill created successfully:', response.data);
    return response.data.data || response.data;

  } catch (err) {
    console.error('❌ Lỗi createBillFromSession:', err.response?.data || err.message);
    console.error('❌ Full error:', err);
    throw err;
  }
};

// Đánh dấu bill đã thanh toán
export const markBillAsPaid = async (billId, paymentData) => {
  try {
    const response = await api.patch(`${ENDPOINTS.bills}/${billId}/pay`, {
      paymentMethod: paymentData.paymentMethod || 'cash',
      paidAt: new Date().toISOString()
    });
    
    return response.data.data || response.data;
  } catch (err) {
    console.error('❌ Lỗi markBillAsPaid:', err.response?.data || err.message);
    throw err;
  }
};

// ============= 🔥 MỚI: STATISTICS FUNCTIONS =============

/**
 * Lấy bills theo khoảng thời gian
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {Promise<Array>} Danh sách bills
 */
export const getBillsByDateRange = async (startDate, endDate) => {
  try {
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    
    console.log(`📅 Fetching bills from ${start} to ${end}`);
    
    // 🔥 Backend dùng 'from' & 'to', giới hạn max 500
    const res = await api.get(ENDPOINTS.bills, {
      params: {
        from: start,
        to: end,
        limit: 500, // Max limit theo backend validation
      }
    });

    const bills = res.data.data?.items || [];
    console.log(`✅ Loaded ${bills.length} bills`);
    
    return bills;
  } catch (err) {
    console.error("❌ Lỗi getBillsByDateRange:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Tính toán thống kê từ danh sách bills
 * @param {Array} bills 
 * @returns {Object} Statistics object
 */
export const calculateStatistics = (bills) => {
  if (!Array.isArray(bills) || bills.length === 0) {
    return {
      totalRevenue: 0,
      totalBills: 0,
      paidBills: 0,
      unpaidBills: 0,
      cashRevenue: 0,
      momoRevenue: 0,
      playAmount: 0,
      serviceAmount: 0,
      averagePerBill: 0,
      totalSurcharge: 0,
      totalDiscount: 0,
    };
  }

  const stats = bills.reduce((acc, bill) => {
    // Tổng doanh thu
    acc.totalRevenue += bill.total || 0;
    
    // Số lượng hóa đơn
    acc.totalBills += 1;
    
    // Phân loại thanh toán
    if (bill.paid) {
      acc.paidBills += 1;
      
      // Doanh thu theo phương thức (chỉ tính bills đã thanh toán)
      const method = (bill.paymentMethod || 'cash').toLowerCase();
      if (method === 'cash') {
        acc.cashRevenue += bill.total || 0;
      } else if (method === 'momo') {
        acc.momoRevenue += bill.total || 0;
      } else {
        // Các phương thức khác
        acc.otherRevenue += bill.total || 0;
      }
    } else {
      acc.unpaidBills += 1;
    }
    
    // Phụ thu và giảm giá
    acc.totalSurcharge += bill.surcharge || 0;
    
    if (bill.discounts && Array.isArray(bill.discounts)) {
      bill.discounts.forEach(d => {
        acc.totalDiscount += d.amount || 0;
      });
    }
    
    // Phân tích items (play vs service/product)
    if (bill.items && Array.isArray(bill.items)) {
      bill.items.forEach(item => {
        // Nếu có playAmount/serviceAmount (format cũ)
        if (item.playAmount) {
          acc.playAmount += item.playAmount;
        }
        if (item.serviceAmount) {
          acc.serviceAmount += item.serviceAmount;
        }
        
        // Nếu dùng type (format mới)
        if (item.type === 'play') {
          acc.playAmount += item.amount || 0;
        } else if (item.type === 'product') {
          acc.serviceAmount += item.amount || 0;
        }
      });
    }
    
    return acc;
  }, {
    totalRevenue: 0,
    totalBills: 0,
    paidBills: 0,
    unpaidBills: 0,
    cashRevenue: 0,
    momoRevenue: 0,
    otherRevenue: 0,
    playAmount: 0,
    serviceAmount: 0,
    totalSurcharge: 0,
    totalDiscount: 0,
  });

  // Trung bình doanh thu mỗi hóa đơn
  stats.averagePerBill = stats.totalBills > 0 
    ? Math.round(stats.totalRevenue / stats.totalBills) 
    : 0;

  return stats;
};

/**
 * Nhóm doanh thu theo ngày (để vẽ biểu đồ)
 * @param {Array} bills 
 * @returns {Array} Grouped data by date
 */
export const groupByDate = (bills) => {
  if (!Array.isArray(bills) || bills.length === 0) {
    return [];
  }

  const grouped = {};
  
  bills.forEach(bill => {
    if (!bill.createdAt) return;
    
    const date = new Date(bill.createdAt);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        revenue: 0,
        count: 0,
        paidCount: 0,
        unpaidCount: 0,
      };
    }
    
    grouped[dateKey].revenue += bill.total || 0;
    grouped[dateKey].count += 1;
    
    if (bill.paid) {
      grouped[dateKey].paidCount += 1;
    } else {
      grouped[dateKey].unpaidCount += 1;
    }
  });
  
  // Chuyển thành mảng và sắp xếp theo ngày
  return Object.values(grouped).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
};

/**
 * Nhóm theo bàn (Top bàn có doanh thu cao)
 * @param {Array} bills 
 * @returns {Array} Top tables
 */
export const groupByTable = (bills) => {
  if (!Array.isArray(bills) || bills.length === 0) {
    return [];
  }

  const grouped = {};
  
  bills.forEach(bill => {
    const tableId = bill.table?._id || bill.table;
    const tableName = bill.table?.name || bill.tableName || 'Không rõ';
    
    if (!grouped[tableId]) {
      grouped[tableId] = {
        tableId,
        tableName,
        revenue: 0,
        count: 0,
      };
    }
    
    grouped[tableId].revenue += bill.total || 0;
    grouped[tableId].count += 1;
  });
  
  // Sắp xếp theo doanh thu giảm dần
  return Object.values(grouped).sort((a, b) => b.revenue - a.revenue);
};

/**
 * Lấy thống kê tổng quan (có thể cache kết quả)
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {Promise<Object>}
 */
export const getStatistics = async (startDate, endDate) => {
  try {
    const bills = await getBillsByDateRange(startDate, endDate);
    const stats = calculateStatistics(bills);
    const chartData = groupByDate(bills);
    const topTables = groupByTable(bills);
    
    return {
      ...stats,
      chartData,
      topTables: topTables.slice(0, 5), // Top 5 bàn
      rawBills: bills, // Trả về bills để FE có thể xử lý thêm
    };
  } catch (err) {
    console.error("❌ Lỗi getStatistics:", err);
    throw err;
  }
};

// ============= EXPORT =============

export default {
  // CRUD
  getBills,
  getBillDetail,
  createBillFromSession,
  markBillAsPaid,
  
  // Statistics (NEW)
  getBillsByDateRange,
  calculateStatistics,
  groupByDate,
  groupByTable,
  getStatistics,
};