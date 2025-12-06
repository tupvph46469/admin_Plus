import Constants from "expo-constants";

const EXTRA =
  Constants.expoConfig?.extra || // Dev mode (Expo Go)
  Constants.manifest?.extra ||   // Older Expo versions
  {};
export const CONFIG = {
  baseURL: EXTRA.API_BASE_URL || "http://103.179.189.32:3000", // Đã có apiPrefix ở đây
  apiPrefix: "/api/v1",
  appName: "Billiard POS",
};
export const API_URL = CONFIG.baseURL + CONFIG.apiPrefix;

// Sửa ENDPOINTS chỉ cần path sau prefix
export const ENDPOINTS = {
  bills: "/bills",
  billDetail: (id) => `/bills/${id}`,
};