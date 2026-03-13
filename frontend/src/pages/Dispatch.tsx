import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import { Send, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { useToast } from "@/hooks/use-toast";

import {
  createDispatch,
  getDispatchHistory,
  DispatchRecord,
} from "@/api/dispatch";

import { getProductData } from "@/api/product";
import { getSuppliers } from "@/api/supplier";

const Dispatch = () => {
  const { toast } = useToast();

  const [dispatches, setDispatches] = useState<DispatchRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);

  const [productOpen, setProductOpen] = useState(false);
  const [partyOpen, setPartyOpen] = useState(false);

  const [formData, setFormData] = useState({
    product_id: "",
    quantity: "",
    recipient: "",
    party_id: "",
  });

  const fetchDispatches = async () => {
    setLoading(true);

    try {
      const data = await getDispatchHistory();
      setDispatches(data.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load dispatch history",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const loadDropdowns = async () => {
    try {
      const productData = await getProductData();
      const partyData = await getSuppliers();
      setProducts(productData.data.data.data);
      setParties(partyData.data.data.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load dropdown data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDispatches();
    loadDropdowns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createDispatch({
        product_id: Number(formData.product_id),
        quantity: Number(formData.quantity),
        recipient: formData.recipient,
        party_id: Number(formData.party_id),
      });

      toast({
        title: "Success",
        description: "Dispatch created successfully",
      });

      setFormData({
        product_id: "",
        quantity: "",
        recipient: "",
        party_id: "",
      });

      fetchDispatches();
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || "Failed to create dispatch",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout title="Dispatch" subtitle="Send products to destinations">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* DISPATCH FORM */}

        <Card>
          <CardHeader>
            <CardTitle>New Dispatch</CardTitle>
            <CardDescription>Create dispatch record</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* PRODUCT DROPDOWN */}

              <div>
                <Label>Product</Label>

                <Popover open={productOpen} onOpenChange={setProductOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {formData.product_id
                        ? products.find((p) => p.id == formData.product_id)
                            ?.name
                        : "Select product"}

                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search product..." />
                      <CommandEmpty>No product found</CommandEmpty>

                      <CommandGroup>
                        {products.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={product.name}
                            onSelect={() => {
                              setFormData({
                                ...formData,
                                product_id: product.id,
                              });
                              setProductOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.product_id == product.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {product.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* QUANTITY */}

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* RECIPIENT */}

              <div>
                <Label>Recipient</Label>
                <Input
                  value={formData.recipient}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recipient: e.target.value,
                    })
                  }
                  placeholder="Warehouse / Party name"
                  required
                />
              </div>

              {/* PARTY DROPDOWN */}

              <div>
                <Label>Party</Label>

                <Popover open={partyOpen} onOpenChange={setPartyOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {formData.party_id
                        ? parties.find((p) => p.id == formData.party_id)?.name
                        : "Select party"}

                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search party..." />
                      <CommandEmpty>No party found</CommandEmpty>

                      <CommandGroup>
                        {parties.map((party) => (
                          <CommandItem
                            key={party.id}
                            value={party.name}
                            onSelect={() => {
                              setFormData({
                                ...formData,
                                party_id: party.id,
                              });
                              setPartyOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.party_id == party.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {party.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Button className="w-full" type="submit">
                <Send className="mr-2 h-4 w-4" />
                Create Dispatch
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* DISPATCH HISTORY */}

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dispatch History</CardTitle>
            <CardDescription>Recent dispatch records</CardDescription>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {dispatches.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.id}</TableCell>
                    <TableCell>{d.product_id}</TableCell>
                    <TableCell>{d.quantity}</TableCell>
                    <TableCell>{d.recipient}</TableCell>
                    <TableCell>{d.date_dispatched}</TableCell>
                  </TableRow>
                ))}

                {loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dispatch;
