import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
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
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import {
  getDispatchReport,
  getSupplyReport,
  getStockProducts,
  getMaxSoldProduct,
  getFrequentParty,
} from "@/api/reports";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

interface DispatchItem {
  id: number;
  product_id: number;
  quantity: number;
  recipient: string;
  party_id: number;
  e_waybill_number: string;
  challan_number: string;
  dispatched_address: string;
  date_dispatched: string | null;
}

interface SupplyItem {
  id: number;
  product_id: number;
  quantity: number;
  supplier: string;
  party_id: number;
  e_waybill_number_s: string;
  challan_number: string;
  date_supplied: string | null;
  remarks: string;
}

interface StockItem {
  product_id: number;
  product_name: string;
  stock: number;
  unit: string;
  status: "Low Stock" | "Normal";
}

interface MaxProduct {
  product_id: number;
  product_name: string;
  total_sold: number;
}

interface FrequentParty {
  party_id: number;
  party_name: string;
  dispatch_count: number;
}

const Reports = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dispatch, setDispatch] = useState<DispatchItem[]>([]);
  const [supply, setSupply] = useState<SupplyItem[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [maxProduct, setMaxProduct] = useState<MaxProduct | null>(null);
  const [frequentParty, setFrequentParty] = useState<FrequentParty | null>(
    null
  );

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [dispatchData, supplyData, stockData, maxSold, party] =
        await Promise.all([
          getDispatchReport(),
          getSupplyReport(),
          getStockProducts(),
          getMaxSoldProduct().catch(() => null),
          getFrequentParty().catch(() => null),
        ]);

      setDispatch(dispatchData ?? []);
      setSupply(supplyData ?? []);
      setStock(stockData ?? []);
      setMaxProduct(maxSold);
      setFrequentParty(party);
    } catch (error) {
      console.error("Failed to load reports:", error);
      toast({
        title: "Error",
        description: "Failed to load report data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------- DISPATCH monthly aggregation ----------
  const dispatchByMonth: Record<string, number> = {};
  dispatch.forEach((d) => {
    const month = d.date_dispatched?.slice(0, 7);
    if (month) {
      dispatchByMonth[month] =
        (dispatchByMonth[month] || 0) + Number(d.quantity);
    }
  });
  const dispatchChart = Object.keys(dispatchByMonth)
    .sort()
    .map((m) => ({
      month: m,
      quantity: dispatchByMonth[m],
    }));

  // ---------- SUPPLY monthly aggregation ----------
  const supplyByMonth: Record<string, number> = {};
  supply.forEach((s) => {
    const month = s.date_supplied?.slice(0, 7);
    if (month) {
      supplyByMonth[month] =
        (supplyByMonth[month] || 0) + Number(s.quantity);
    }
  });
  const supplyChart = Object.keys(supplyByMonth)
    .sort()
    .map((m) => ({
      month: m,
      quantity: supplyByMonth[m],
    }));

  // ---------- STOCK pie ----------
  const stockStatus = [
    {
      name: "Low Stock",
      value: stock.filter((s) => s.status === "Low Stock").length,
    },
    {
      name: "Normal",
      value: stock.filter((s) => s.status === "Normal").length,
    },
  ];

  // ---------- LOADING STATE ----------
  if (loading) {
    return (
      <MainLayout
        title="Reports"
        subtitle="Dispatch, Supply and Inventory Analytics"
      >
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Reports"
      subtitle="Dispatch, Supply and Inventory Analytics"
    >
      {/* HEADER */}
      <div className="mb-6 flex justify-end">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 mb-6 md:grid-cols-3">
        <div className="p-6 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">Total Dispatches</p>
          <p className="text-3xl font-semibold">{dispatch.length}</p>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">Total Supplies</p>
          <p className="text-3xl font-semibold">{supply.length}</p>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">Max Sold Product</p>
          <p className="text-lg font-semibold">
            {maxProduct?.product_name || "N/A"}
          </p>
          <p className="text-sm text-muted-foreground">
            {maxProduct ? `${maxProduct.total_sold} units` : "—"}
          </p>
        </div>
      </div>

      {/* SECOND ROW */}
      <div className="grid gap-4 mb-6 md:grid-cols-2">
        <div className="p-6 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">
            Most Frequent Party
          </p>
          <p className="text-lg font-semibold">
            {frequentParty?.party_name || "N/A"}
          </p>
          <p className="text-sm text-muted-foreground">
            {frequentParty
              ? `${frequentParty.dispatch_count} dispatches`
              : "—"}
          </p>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">Low Stock Items</p>
          <p className="text-3xl font-semibold text-red-500">
            {stock.filter((s) => s.status === "Low Stock").length}
          </p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* DISPATCH TREND */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-6 font-semibold">Dispatch Trend</h3>
          {dispatchChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dispatchChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="quantity"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-[300px] items-center justify-center text-muted-foreground">
              No dispatch data available
            </p>
          )}
        </div>

        {/* SUPPLY TREND */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-6 font-semibold">Supply Trend</h3>
          {supplyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplyChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-[300px] items-center justify-center text-muted-foreground">
              No supply data available
            </p>
          )}
        </div>

        {/* STOCK STATUS */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-6 font-semibold">Stock Status</h3>
          {stock.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockStatus}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  label
                >
                  {stockStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-[300px] items-center justify-center text-muted-foreground">
              No stock data available
            </p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Reports;