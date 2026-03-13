import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  getProductData,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/api/product";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  description?: string;
  hsn?: string;
  sp: number;
  cp: number;
  stock: number;
  unit: string;
}

const statusStyles: any = {
  "in-stock": "bg-success/10 text-success border-success/20",
  "low-stock": "bg-warning/10 text-warning border-warning/20",
  "out-of-stock": "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: any = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
};

const Products = () => {
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [productList, setProductList] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    hsn: "",
    cp: "",
    sp: "",
    stock: "",
    unit: "",
  });

  const fetchProducts = async () => {
    try {
      const res = await getProductData();
      const products = res.data?.data?.data ?? [];
      setProductList(products);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = productList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatus = (stock: number) => {
    if (stock === 0) return "out-of-stock";
    if (stock < 10) return "low-stock";
    return "in-stock";
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      description: "",
      hsn: "",
      cp: "",
      sp: "",
      stock: "",
      unit: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);

    setForm({
      name: product.name,
      description: product.description || "",
      hsn: product.hsn || "",
      cp: String(product.cp),
      sp: String(product.sp),
      stock: String(product.stock),
      unit: product.unit,
    });

    setIsDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      const payload = {
        name: form.name,
        description: form.description,
        hsn: form.hsn,
        cp: parseFloat(form.cp),
        sp: parseFloat(form.sp),
        stock: parseInt(form.stock),
        unit: form.unit,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);

        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await createProduct(payload);

        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      setIsDialogOpen(false);
      fetchProducts();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProduct(id);

      setProductList(productList.filter((p) => p.id !== id));

      toast({
        title: "Deleted",
        description: "Product deleted successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout title="Products" subtitle="Manage your inventory items">
      {/* TOP BAR */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />

          <Input
            placeholder="Search products..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* TABLE */}

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>HSN</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Selling</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredProducts.map((product) => {
              const status = getStatus(product.stock);

              return (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>

                  <TableCell>{product.id}</TableCell>

                  <TableCell>{product.hsn}</TableCell>

                  <TableCell className="text-right">{product.stock}</TableCell>

                  <TableCell className="text-right">₹{product.cp}</TableCell>

                  <TableCell className="text-right">₹{product.sp}</TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(statusStyles[status])}
                    >
                      {statusLabels[status]}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ADD / EDIT POPUP */}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>

            <DialogDescription>
              Fill the product details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>HSN</Label>
              <Input
                value={form.hsn}
                onChange={(e) =>
                  setForm({ ...form, hsn: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cost Price</Label>
                <Input
                  type="number"
                  value={form.cp}
                  onChange={(e) =>
                    setForm({ ...form, cp: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Selling Price</Label>
                <Input
                  type="number"
                  value={form.sp}
                  onChange={(e) =>
                    setForm({ ...form, sp: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({ ...form, stock: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Unit</Label>
                <Input
                  value={form.unit}
                  onChange={(e) =>
                    setForm({ ...form, unit: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button onClick={handleSaveProduct}>
              {editingProduct ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Products;