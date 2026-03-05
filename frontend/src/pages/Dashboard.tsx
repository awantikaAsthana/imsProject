import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import {
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  products,
  users,
  salesData,
  weeklySalesData,
  yearlySalesData,
  recentActivity,
} from "@/data/mockData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TimeRange = "weekly" | "monthly" | "yearly";

const salesDataMap: Record<TimeRange, typeof salesData> = {
  weekly: weeklySalesData,
  monthly: salesData,
  yearly: yearlySalesData,
};

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const currentSalesData = salesDataMap[timeRange];
  const totalProducts = products.length;
  const lowStockItems = products.filter((p) => p.status === "low-stock").length;
  const totalUsers = users.length;
  const totalValue = products.reduce((acc, p) => acc + p.quantity * p.price, 0);
  const [user, setUser] = useState(() => {
    try {
      const user = localStorage.getItem("auth_user");
      if (user) {
        const { name } = JSON.parse(user);
        return {
          name: name,
          initial: name
            .split(" ")
            .map((n: string) => n[0])
            .join(""),
        };
      }
      return { name: "John Doe", initial: "!" };
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return { name: "John Doe", initial: "!" };
    }
  });

  return (
    <MainLayout
      title="Dashboard"
      subtitle={`Welcome ${user.name}! Here's what's happening.`}
      initial={user.initial}
    >
      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Products"
          value={totalProducts}
          change="+12% from last month"
          changeType="positive"
          icon={Package}
          iconColor="primary"
        />
        <MetricCard
          title="Low Stock Items"
          value={lowStockItems}
          change="Needs attention"
          changeType="negative"
          icon={AlertTriangle}
          iconColor="warning"
        />
        <MetricCard
          title="Active Users"
          value={totalUsers}
          change="+2 this week"
          changeType="positive"
          icon={Users}
          iconColor="success"
        />
        <MetricCard
          title="Inventory Value"
          value={`$${totalValue.toLocaleString()}`}
          change="+8.5% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="primary"
        />
      </div>

      {/* Charts and Activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Sales Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 card-shadow animate-fade-in">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Sales Overview
              </h3>
              <p className="text-sm text-muted-foreground">
                {timeRange === "weekly"
                  ? "This week's"
                  : timeRange === "monthly"
                    ? "Monthly"
                    : "Yearly"}{" "}
                sales performance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Tabs
                value={timeRange}
                onValueChange={(v) => setTimeRange(v as TimeRange)}
              >
                <TabsList>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2 text-sm font-medium text-success">
                <TrendingUp className="h-4 w-4" />
                +23.5%
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={currentSalesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(234, 89%, 60%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(234, 89%, 60%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(220, 13%, 91%)"
              />
              <XAxis
                dataKey="month"
                stroke="hsl(220, 9%, 46%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(220, 9%, 46%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 13%, 91%)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(234, 89%, 60%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow animate-fade-in">
          <h3 className="mb-4 text-lg font-semibold text-card-foreground">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground">
                    {activity.action}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.item}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
