import api from "./api";

// ---------- DISPATCH REPORT ----------
export const getDispatchReport = async (
  startDate?: string,
  endDate?: string
) => {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const response = await api.get("/report/dispatch", { params });
  // backend returns { status_code, message, data: [ ... ] }
  return response.data.data;
};

// ---------- SUPPLY REPORT ----------
export const getSupplyReport = async (
  startDate?: string,
  endDate?: string
) => {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const response = await api.get("/report/supply", { params });
  return response.data.data;
};

// ---------- STOCK WISE PRODUCTS ----------
export const getStockProducts = async () => {
  const response = await api.get("/report/stock-wise-products");
  return response.data.data;
};

// ---------- MAX SOLD PRODUCT ----------
export const getMaxSoldProduct = async () => {
  const response = await api.get("/report/max-sold-product");
  return response.data.data;
};

// ---------- MOST FREQUENT PARTY ----------
export const getFrequentParty = async () => {
  const response = await api.get("/report/frequent-party");
  return response.data.data;
};