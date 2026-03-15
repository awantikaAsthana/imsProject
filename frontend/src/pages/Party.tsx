import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";

import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/api/supplier";

import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

import { Plus, Edit, Trash2 } from "lucide-react";

interface Party {
  id: number;
  name: string;
  gst?: string;
  address?: string;
}

const Parties = () => {
  const { toast } = useToast();

  const [parties, setParties] = useState<Party[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);

  const [form, setForm] = useState({
    name: "",
    gst: "",
    address: "",
  });

  const loadParties = async () => {
    try {
      const res = await getSuppliers();
      setParties(res.data.data.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load parties",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadParties();
  }, []);

  const openAdd = () => {
    setEditingParty(null);
    setForm({ name: "", gst: "", address: "" });
    setDialogOpen(true);
  };

  const openEdit = (party: Party) => {
    setEditingParty(party);
    setForm({
      name: party.name,
      gst: party.gst || "",
      address: party.address || "",
    });
    setDialogOpen(true);
  };

  const saveParty = async () => {
    try {
      if (editingParty) {
        await updateSupplier(editingParty.id, form);

        toast({
          title: "Updated",
          description: "Party updated successfully",
        });
      } else {
        await createSupplier(form);

        toast({
          title: "Created",
          description: "Party created successfully",
        });
      }

      setDialogOpen(false);
      loadParties();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save party",
        variant: "destructive",
      });
    }
  };

  const deleteParty = async (id: number) => {
    try {
      await deleteSupplier(id);

      setParties(parties.filter((p) => p.id !== id));

      toast({
        title: "Deleted",
        description: "Party deleted successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete party",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout title="Parties" subtitle="Manage suppliers / parties">
      {/* ADD BUTTON */}

      <div className="flex justify-end mb-6">
        <Button onClick={openAdd} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Party
        </Button>
      </div>

      {/* PARTY TABLE */}

      <div className="rounded-xl border bg-card overflow-x-auto">
        <Table className="min-w-[480px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>GST</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {parties.map((party) => (
              <TableRow key={party.id}>
                <TableCell>{party.name}</TableCell>

                <TableCell>{party.gst}</TableCell>

                <TableCell>{party.address}</TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(party)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deleteParty(party.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ADD / EDIT DIALOG */}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingParty ? "Edit Party" : "Add Party"}
            </DialogTitle>
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
              <Label>GST</Label>
              <Input
                value={form.gst}
                onChange={(e) =>
                  setForm({ ...form, gst: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>

            <Button onClick={saveParty}>
              {editingParty ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Parties;