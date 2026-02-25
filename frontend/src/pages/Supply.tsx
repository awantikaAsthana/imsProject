import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { products } from "@/data/mockData";
import { PackagePlus, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupplyRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  supplier: string;
  supplyDate: string;
  status: "ordered" | "shipped" | "received";
}

const Supply = () => {
  const { toast } = useToast();
  const [supplies, setSupplies] = useState<SupplyRecord[]>([
    {
      id: "1",
      productId: "3",
      productName: "Ergonomic Mouse",
      quantity: 50,
      supplier: "Tech Supplies Inc.",
      supplyDate: "2024-01-14",
      status: "received",
    },
    {
      id: "2",
      productId: "2",
      productName: "USB-C Hub",
      quantity: 30,
      supplier: "Global Electronics",
      supplyDate: "2024-01-16",
      status: "shipped",
    },
  ]);

  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    supplier: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    const newSupply: SupplyRecord = {
      id: Date.now().toString(),
      productId: formData.productId,
      productName: product.name,
      quantity: parseInt(formData.quantity),
      supplier: formData.supplier,
      supplyDate: new Date().toISOString().split("T")[0],
      status: "ordered",
    };

    setSupplies([newSupply, ...supplies]);
    setFormData({ productId: "", quantity: "", supplier: "" });
    
    toast({
      title: "Supply Order Created",
      description: `Ordered ${newSupply.quantity} units of ${product.name} from ${newSupply.supplier}`,
    });
  };

  const getStatusColor = (status: SupplyRecord["status"]) => {
    switch (status) {
      case "ordered":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "received":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  return (
    <MainLayout title="Supply" subtitle="Add products to inventory">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Supply Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5" />
              New Supply Order
            </CardTitle>
            <CardDescription>Order products from suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          {product.name} (Current: {product.quantity})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="Enter supplier name"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={!formData.productId}>
                <PackagePlus className="h-4 w-4 mr-2" />
                Create Supply Order
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Supply History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Supply History</CardTitle>
            <CardDescription>Recent supply orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplies.map((supply) => (
                  <TableRow key={supply.id}>
                    <TableCell className="font-medium">{supply.productName}</TableCell>
                    <TableCell>{supply.quantity}</TableCell>
                    <TableCell>{supply.supplier}</TableCell>
                    <TableCell>{supply.supplyDate}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(supply.status)}>
                        {supply.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Supply;
