import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import {
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

import {
  getDashboardStats,
  getSalesData,
  getRecentActivity,
  DashboardStats,
  SalesDataPoint,
  ActivityItem,
} from "@/api/dashboard";

type TimeRange = "weekly" | "monthly" | "yearly";

const Dashboard = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");

  const [userName] = useState(() => {
    try {
      const user = localStorage.getItem("auth_user");
      if (user) {
        const { name } = JSON.parse(user);
        return name;
      }
    } catch {
      return "User";
    }
    return "User";
  });

  // ── load stats + activity on mount ─────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsData, activityData] = await Promise.all([
          getDashboardStats(),
          getRecentActivity(),
        ]);
        setStats(statsData);
        setActivity(activityData);
      } catch (error) {
        console.error("Dashboard load failed:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── load sales chart when time range changes ───────
  useEffect(() => {
    const loadSales = async () => {
      setSalesLoading(true);
      try {
        const data = await getSalesData(timeRange);
        setSalesData(data);
      } catch (error) {
        console.error("Sales data load failed:", error);
        toast({
          title: "Error",
          description: "Failed to load sales chart.",
          variant: "destructive",
        });
      } finally {
        setSalesLoading(false);
      }
    };
    loadSales();
  }, [timeRange]);

  // ── loading state ──────────────────────────────────
  if (loading) {
    return (
      <MainLayout title="Dashboard" subtitle="Loading...">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toLocaleString()}`;
  };

  return (
    <MainLayout
      title="Dashboard"
      subtitle={`Welcome ${userName}! Here's what's happening.`}
    >
      {/* ── Metrics Grid ──────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Products"
          value={stats?.total_products ?? 0}
          change={`${(stats?.product_change ?? 0) >= 0 ? "+" : ""}${stats?.product_change ?? 0}% from last month`}
          changeType={
            (stats?.product_change ?? 0) >= 0 ? "positive" : "negative"
          }
          icon={Package}
          iconColor="primary"
        />

        <MetricCard
          title="Low Stock Items"
          value={stats?.low_stock_items ?? 0}
          change={
            (stats?.low_stock_items ?? 0) > 0
              ? "Needs attention"
              : "All stocked up"
          }
          changeType={
            (stats?.low_stock_items ?? 0) > 0 ? "negative" : "positive"
          }
          icon={AlertTriangle}
          iconColor="warning"
        />

        <MetricCard
          title="Active Users"
          value={stats?.active_users ?? 0}
          change={`+${stats?.new_users_this_week ?? 0} this week`}
          changeType="positive"
          icon={Users}
          iconColor="success"
        />

        <MetricCard
          title="Inventory Value"
          value={formatCurrency(stats?.inventory_value ?? 0)}
          change={`${(stats?.value_change ?? 0) >= 0 ? "+" : ""}${stats?.value_change ?? 0}% from last month`}
          changeType={
            (stats?.value_change ?? 0) >= 0 ? "positive" : "negative"
          }
          icon={DollarSign}
          iconColor="primary"
        />
      </div>

      {/* ── Charts and Activity ───────────────────────── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">

        {/* ── Sales Chart ─────────────────────────────── */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 card-shadow animate-fade-in">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="flex items-center gap-3 flex-wrap">
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
              <div
                className={`flex items-center gap-2 text-sm font-medium ${
                  (stats?.sales_trend ?? 0) >= 0
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {(stats?.sales_trend ?? 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {(stats?.sales_trend ?? 0) >= 0 ? "+" : ""}
                {stats?.sales_trend ?? 0}%
              </div>
            </div>
          </div>

          {salesLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
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
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `₹${value.toLocaleString()}`,
                    "Sales",
                  ]}
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
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No sales data available
            </div>
          )}
        </div>

        {/* ── Recent Activity ─────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow animate-fade-in">
          <h3 className="mb-4 text-lg font-semibold text-card-foreground">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {activity.length > 0 ? (
              activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div
                    className={`h-2 w-2 mt-2 rounded-full ${
                      item.type === "dispatch"
                        ? "bg-primary"
                        : "bg-green-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground">
                      {item.action}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.item}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.user} • {item.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;