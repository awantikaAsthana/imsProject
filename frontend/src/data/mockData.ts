export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  lastUpdated: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  status: "active" | "inactive";
  avatar?: string;
  joinDate: string;
}

export interface SalesData {
  month: string;
  sales: number;
  orders: number;
}

export interface CategoryData {
  name: string;
  value: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Wireless Keyboard",
    sku: "KB-001",
    category: "Electronics",
    quantity: 150,
    price: 79.99,
    status: "in-stock",
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    name: "USB-C Hub",
    sku: "HB-002",
    category: "Electronics",
    quantity: 8,
    price: 49.99,
    status: "low-stock",
    lastUpdated: "2024-01-14",
  },
  {
    id: "3",
    name: "Ergonomic Mouse",
    sku: "MS-003",
    category: "Electronics",
    quantity: 0,
    price: 59.99,
    status: "out-of-stock",
    lastUpdated: "2024-01-13",
  },
  {
    id: "4",
    name: "Monitor Stand",
    sku: "ST-004",
    category: "Furniture",
    quantity: 45,
    price: 129.99,
    status: "in-stock",
    lastUpdated: "2024-01-12",
  },
  {
    id: "5",
    name: "Webcam HD",
    sku: "WC-005",
    category: "Electronics",
    quantity: 12,
    price: 89.99,
    status: "low-stock",
    lastUpdated: "2024-01-11",
  },
  {
    id: "6",
    name: "Desk Lamp",
    sku: "LP-006",
    category: "Furniture",
    quantity: 200,
    price: 45.99,
    status: "in-stock",
    lastUpdated: "2024-01-10",
  },
  {
    id: "7",
    name: "Notebook Set",
    sku: "NB-007",
    category: "Office Supplies",
    quantity: 500,
    price: 12.99,
    status: "in-stock",
    lastUpdated: "2024-01-09",
  },
  {
    id: "8",
    name: "Pen Holder",
    sku: "PH-008",
    category: "Office Supplies",
    quantity: 3,
    price: 19.99,
    status: "low-stock",
    lastUpdated: "2024-01-08",
  },
];

export const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "admin",
    status: "active",
    joinDate: "2023-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "manager",
    status: "active",
    joinDate: "2023-03-22",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.j@company.com",
    role: "staff",
    status: "active",
    joinDate: "2023-06-10",
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah.w@company.com",
    role: "staff",
    status: "inactive",
    joinDate: "2023-08-05",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.b@company.com",
    role: "manager",
    status: "active",
    joinDate: "2023-09-18",
  },
];

export const salesData: SalesData[] = [
  { month: "Jan", sales: 4500, orders: 120 },
  { month: "Feb", sales: 5200, orders: 145 },
  { month: "Mar", sales: 4800, orders: 132 },
  { month: "Apr", sales: 6100, orders: 168 },
  { month: "May", sales: 5800, orders: 155 },
  { month: "Jun", sales: 7200, orders: 198 },
  { month: "Jul", sales: 6800, orders: 182 },
  { month: "Aug", sales: 7500, orders: 205 },
  { month: "Sep", sales: 6900, orders: 188 },
  { month: "Oct", sales: 8100, orders: 220 },
  { month: "Nov", sales: 9200, orders: 248 },
  { month: "Dec", sales: 8800, orders: 235 },
];

export const weeklySalesData: SalesData[] = [
  { month: "Mon", sales: 1200, orders: 32 },
  { month: "Tue", sales: 1450, orders: 38 },
  { month: "Wed", sales: 1100, orders: 28 },
  { month: "Thu", sales: 1680, orders: 45 },
  { month: "Fri", sales: 1950, orders: 52 },
  { month: "Sat", sales: 2200, orders: 58 },
  { month: "Sun", sales: 980, orders: 25 },
];

export const yearlySalesData: SalesData[] = [
  { month: "2019", sales: 52000, orders: 1400 },
  { month: "2020", sales: 48000, orders: 1280 },
  { month: "2021", sales: 61000, orders: 1650 },
  { month: "2022", sales: 75000, orders: 2020 },
  { month: "2023", sales: 89000, orders: 2400 },
  { month: "2024", sales: 78500, orders: 2096 },
];

export const categoryData: CategoryData[] = [
  { name: "Electronics", value: 45 },
  { name: "Furniture", value: 25 },
  { name: "Office Supplies", value: 20 },
  { name: "Other", value: 10 },
];

export const recentActivity = [
  { id: 1, action: "Product Added", item: "Wireless Keyboard", user: "John Doe", time: "2 hours ago" },
  { id: 2, action: "Stock Updated", item: "USB-C Hub", user: "Jane Smith", time: "4 hours ago" },
  { id: 3, action: "Order Shipped", item: "Order #1234", user: "System", time: "5 hours ago" },
  { id: 4, action: "Low Stock Alert", item: "Ergonomic Mouse", user: "System", time: "6 hours ago" },
  { id: 5, action: "User Added", item: "Mike Johnson", user: "John Doe", time: "1 day ago" },
];
