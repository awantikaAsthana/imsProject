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
import { PackagePlus, Truck } from "lucide-react";

import {
  fetchProducts,
  fetchSuppliers,
  fetchSupplies,
  createSupply,
} from "@/api/supply";

import AddSupplierDialog from "@/components/supplier/AddSupplierDialog";
import { useToast } from "@/hooks/use-toast";

export default function Supply() {
  const { toast } = useToast();

  /* STATES */

  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplies, setSupplies] = useState<any[]>([]);

  const [supplierPage, setSupplierPage] = useState(1);
  const [supplyPage, setSupplyPage] = useState(1);

  const [supplierDialog, setSupplierDialog] = useState(false);

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

  /* LOADERS */

  const loadProducts = async () => {
    const res = await fetchProducts();
    setProducts(res.data.data.data);
  };

  const loadSuppliers = async () => {
    const res = await fetchSuppliers(supplierPage);
    setSuppliers(res.data.data.data);
  };

  const loadSupplies = async () => {
    const res = await fetchSupplies(supplyPage);
    setSupplies(res.data.data.data);
  };

  /* INITIAL LOAD */

  useEffect(() => {
    loadProducts();
    loadSuppliers();
    loadSupplies();
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

      loadSupplies();
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
                  onValueChange={(value) => {
                    const product = products.find(
                      (p) => p.id.toString() === value,
                    );

                    setForm({
                      ...form,
                      product_id: value,
                    });
                  }}
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

              {/* SUPPLIER */}

              <div>
                <Label>Supplier</Label>

                <Select
                  onValueChange={(v) => setForm({ ...form, party_id: v, supplier: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>

                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => setSupplierDialog(true)}
                >
                  Add Supplier
                </Button>
              </div>

              {/* QUANTITY */}

              <div>
                <Label>Quantity</Label>

                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                />
              </div>

              {/* EWAY BILL */}

              <div>
                <Label>E Waybill</Label>

                <Input
                  value={form.e_waybill_number}
                  onChange={(e) =>
                    setForm({ ...form, e_waybill_number: e.target.value })
                  }
                />
              </div>

              {/* CHALLAN */}

              <div>
                <Label>Challan Number</Label>

                <Input
                  value={form.challan_number}
                  onChange={(e) =>
                    setForm({ ...form, challan_number: e.target.value })
                  }
                />
              </div>

              {/* DATE */}

              <div>
                <Label>Date Supplied</Label>

                <Input
                  type="date"
                  onChange={(e) =>
                    setForm({ ...form, date_supplied: e.target.value })
                  }
                />
              </div>

              {/* REMARKS */}

              <div>
                <Label>Remarks</Label>

                <Input
                  value={form.remarks}
                  onChange={(e) =>
                    setForm({ ...form, remarks: e.target.value })
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
          </CardContent>
        </Card>
      </div>

      {/* SUPPLIER CARD AT END */}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Suppliers</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.gst}</TableCell>
                  <TableCell>{s.address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddSupplierDialog
        open={supplierDialog}
        setOpen={setSupplierDialog}
        reload={loadSuppliers}
      />
    </MainLayout>
  );
}
