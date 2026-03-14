import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PackagePlus } from "lucide-react";

import {
  fetchProducts,
  fetchSupplies,
  createSupply,
} from "@/api/supply";

import { useToast } from "@/hooks/use-toast";

export default function Supply() {
  const { toast } = useToast();

  /* STATES */

  const [products, setProducts] = useState<any[]>([]);
  const [supplies, setSupplies] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
    supplier: "",
    party_id: "",
    e_waybill_number: "",
    challan_number: "",
    date_supplied: "",
    remarks: "",
  });

  /* LOAD PRODUCTS */

  const loadProducts = async () => {
    try {
      const res = await fetchProducts();
      setProducts(res.data.data.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    }
  };

  /* LOAD SUPPLIES WITH PAGINATION */

const loadSupplies = async (pageNumber = 1) => {
  try {
    const res = await fetchSupplies(pageNumber);

    const suppliesData = res.data?.data || [];
    const pagination = res.data?.pagination || {};

    setSupplies(Array.isArray(suppliesData) ? suppliesData : []);

    setPage(pagination.page || 1);
    setTotalPages(pagination.total_pages || 1);

    setHasNext(pagination.has_next || false);
    setHasPrev(pagination.has_prev || false);

  } catch (err) {
    console.error(err);
  }
};

  /* INITIAL LOAD */

  useEffect(() => {
    loadProducts();
    loadSupplies(page);
  }, []);

  /* CREATE SUPPLY */

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await createSupply(form);

      toast({
        title: "Supply Added",
        description: "Supply record created",
      });

      loadSupplies(page);
    } catch {
      toast({
        title: "Error",
        description: "Failed to create supply",
        variant: "destructive",
      });
    }
  };

  /* STATUS COLOR */

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ordered":
        return "bg-yellow-100 text-yellow-800";

      case "shipped":
        return "bg-blue-100 text-blue-800";

      case "received":
        return "bg-green-100 text-green-800";

      default:
        return "";
    }
  };

  return (
    <MainLayout title="Supply" subtitle="Add products to inventory">
      <div className="grid gap-6 lg:grid-cols-3">

        {/* SUPPLY FORM */}

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex gap-2">
              <PackagePlus className="h-5 w-5" />
              New Supply
            </CardTitle>

            <CardDescription>Add supply to inventory</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* PRODUCT */}

              <div>
                <Label>Product</Label>

                <Select
                  onValueChange={(value) =>
                    setForm({
                      ...form,
                      product_id: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>

                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* QUANTITY */}

              <div>
                <Label>Quantity</Label>

                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity: e.target.value,
                    })
                  }
                />
              </div>

              {/* EWAY BILL */}

              <div>
                <Label>E Waybill</Label>

                <Input
                  value={form.e_waybill_number}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      e_waybill_number: e.target.value,
                    })
                  }
                />
              </div>

              {/* CHALLAN */}

              <div>
                <Label>Challan Number</Label>

                <Input
                  value={form.challan_number}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      challan_number: e.target.value,
                    })
                  }
                />
              </div>

              {/* DATE */}

              <div>
                <Label>Date Supplied</Label>

                <Input
                  type="date"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date_supplied: e.target.value,
                    })
                  }
                />
              </div>

              {/* REMARKS */}

              <div>
                <Label>Remarks</Label>

                <Input
                  value={form.remarks}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      remarks: e.target.value,
                    })
                  }
                />
              </div>

              <Button className="w-full">
                <PackagePlus className="mr-2 h-4 w-4" />
                Create Supply
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* SUPPLY TABLE */}

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Supply History</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>

              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {supplies.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.product_name}</TableCell>
                    <TableCell>{s.quantity}</TableCell>
                    <TableCell>{s.supplier_name}</TableCell>
                    <TableCell>{s.date_supplied}</TableCell>

                    <TableCell>
                      <Badge className={getStatusColor(s.status)}>
                        {s.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

            </Table>

            {/* PAGINATION */}

            <div className="flex items-center justify-between mt-4">

              <Button
                variant="outline"
                disabled={!hasPrev}
                onClick={() => loadSupplies(page - 1)}
              >
                Previous
              </Button>

              <span className="text-sm font-medium">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={!hasNext}
                onClick={() => loadSupplies(page + 1)}
              >
                Next
              </Button>

            </div>

          </CardContent>
        </Card>

      </div>
    </MainLayout>
  );
}