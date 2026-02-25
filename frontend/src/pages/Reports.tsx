import MainLayout from "@/components/layout/MainLayout";
import { salesData, categoryData, products } from "@/data/mockData";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = ["hsl(234, 89%, 60%)", "hsl(160, 84%, 39%)", "hsl(38, 92%, 50%)", "hsl(220, 9%, 46%)"];

const Reports = () => {
  const totalSales = salesData.reduce((acc, item) => acc + item.sales, 0);
  const totalOrders = salesData.reduce((acc, item) => acc + item.orders, 0);
  const averageOrderValue = totalSales / totalOrders;

  const stockStatus = [
    { name: "In Stock", value: products.filter((p) => p.status === "in-stock").length },
    { name: "Low Stock", value: products.filter((p) => p.status === "low-stock").length },
    { name: "Out of Stock", value: products.filter((p) => p.status === "out-of-stock").length },
  ];

  return (
    <MainLayout title="Reports" subtitle="Analytics and insights">
      {/* Header Actions */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Jan 2024 - Dec 2024
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 card-shadow animate-fade-in">
          <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
          <p className="mt-2 text-3xl font-semibold text-card-foreground">
            ${totalSales.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 card-shadow animate-fade-in">
          <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
          <p className="mt-2 text-3xl font-semibold text-card-foreground">
            {totalOrders.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 card-shadow animate-fade-in">
          <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
          <p className="mt-2 text-3xl font-semibold text-card-foreground">
            ${averageOrderValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Trend */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow animate-fade-in">
          <h3 className="mb-6 text-lg font-semibold text-card-foreground">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorSalesReport" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(234, 89%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(234, 89%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 13%, 91%)",
                  borderRadius: "8px",
                }}
              />
              <Area type="monotone" dataKey="sales" stroke="hsl(234, 89%, 60%)" strokeWidth={2} fillOpacity={1} fill="url(#colorSalesReport)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Month */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow animate-fade-in">
          <h3 className="mb-6 text-lg font-semibold text-card-foreground">Orders by Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 13%, 91%)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="orders" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow animate-fade-in">
          <h3 className="mb-6 text-lg font-semibold text-card-foreground">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 13%, 91%)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Status */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow animate-fade-in">
          <h3 className="mb-6 text-lg font-semibold text-card-foreground">Stock Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                <Cell fill="hsl(160, 84%, 39%)" />
                <Cell fill="hsl(38, 92%, 50%)" />
                <Cell fill="hsl(0, 84%, 60%)" />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 13%, 91%)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MainLayout>
  );
};

export default Reports;
