import api from "./api";

export interface DashboardStats {
  total_products: number;
  product_change: number;
  low_stock_items: number;
  active_users: number;
  new_users_this_week: number;
  inventory_value: number;
  value_change: number;
  sales_trend: number;
}

export interface SalesDataPoint {
  month: string;
  sales: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  item: string;
  user: string;
  time: string;
  timestamp: string | null;
  type: "dispatch" | "supply";
}

// ---------- STATS ----------
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get("/dashboard/stats");
  return response.data.data;
};

// ---------- SALES CHART ----------
export const getSalesData = async (
  range: "weekly" | "monthly" | "yearly"
): Promise<SalesDataPoint[]> => {
  const response = await api.get("/dashboard/sales", {
    params: { range },
  });
  return response.data.data;
};

// ---------- RECENT ACTIVITY ----------
export const getRecentActivity = async (): Promise<ActivityItem[]> => {
  const response = await api.get("/dashboard/recent-activity");
  return response.data.data;
};