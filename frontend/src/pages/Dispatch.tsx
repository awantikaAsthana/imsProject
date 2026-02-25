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
import { Send, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DispatchRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  destination: string;
  dispatchDate: string;
  status: "pending" | "in-transit" | "delivered";
}

const Dispatch = () => {
  const { toast } = useToast();
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([
    {
      id: "1",
      productId: "1",
      productName: "Wireless Keyboard",
      quantity: 25,
      destination: "New York Warehouse",
      dispatchDate: "2024-01-15",
      status: "delivered",
    },
    {
      id: "2",
      productId: "4",
      productName: "Monitor Stand",
      quantity: 10,
      destination: "Los Angeles Store",
      dispatchDate: "2024-01-16",
      status: "in-transit",
    },
  ]);

  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    destination: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    const newDispatch: DispatchRecord = {
      id: Date.now().toString(),
      productId: formData.productId,
      productName: product.name,
      quantity: parseInt(formData.quantity),
      destination: formData.destination,
      dispatchDate: new Date().toISOString().split("T")[0],
      status: "pending",
    };

    setDispatches([newDispatch, ...dispatches]);
    setFormData({ productId: "", quantity: "", destination: "" });
    
    toast({
      title: "Dispatch Created",
      description: `${newDispatch.quantity} units of ${product.name} dispatched to ${newDispatch.destination}`,
    });
  };

  const getStatusColor = (status: DispatchRecord["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "in-transit":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  return (
    <MainLayout title="Dispatch" subtitle="Send products to destinations">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Dispatch Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              New Dispatch
            </CardTitle>
            <CardDescription>Enter product dispatch details</CardDescription>
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
                    {products.filter(p => p.quantity > 0).map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          {product.name} ({product.quantity} available)
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
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="Enter destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={!formData.productId}>
                <Send className="h-4 w-4 mr-2" />
                Create Dispatch
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Dispatch History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dispatch History</CardTitle>
            <CardDescription>Recent product dispatches</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dispatches.map((dispatch) => (
                  <TableRow key={dispatch.id}>
                    <TableCell className="font-medium">{dispatch.productName}</TableCell>
                    <TableCell>{dispatch.quantity}</TableCell>
                    <TableCell>{dispatch.destination}</TableCell>
                    <TableCell>{dispatch.dispatchDate}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(dispatch.status)}>
                        {dispatch.status}
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

export default Dispatch;
