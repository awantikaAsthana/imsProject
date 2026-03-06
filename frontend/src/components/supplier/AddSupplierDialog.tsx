import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupplier } from "@/api/supply";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  reload: () => void;
}

export default function AddSupplierDialog({ open, setOpen, reload }: Props) {
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    address: "",
    gst: "",
  });

  const handleSubmit = async () => {
    try {
      await createSupplier(form);

      toast({
        title: "Supplier Created",
        description: "New supplier added successfully",
      });

      setOpen(false);
      reload();
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to create supplier",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Supplier</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div>
            <Label>GST</Label>
            <Input
              value={form.gst}
              onChange={(e) => setForm({ ...form, gst: e.target.value })}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit}>
            Create Supplier
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
