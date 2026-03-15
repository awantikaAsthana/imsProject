import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { getUsers, createAdmin, updateUserStatus, User } from "@/api/users";
import { useDebounce } from "@/hooks/useDebounce";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

import { Plus, Search, PauseCircle, PlayCircle } from "lucide-react";

const statusStyles = {
  active: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-700",
};

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  });

const fetchUsers = async () => {
  setLoading(true);

  const data = await getUsers(page, 10, debouncedSearch);

  setUsers(data.users);
  setTotalPages(data.pagination.pages);

  setLoading(false);
};

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch]);

  const handleCreate = async () => {
    await createAdmin(newUser);

    setCreateOpen(false);

    setNewUser({
      name: "",
      email: "",
      password: "",
    });

    fetchUsers();
  };

  const handleSuspend = (user: User) => {
    setSelectedUser(user);
    setConfirmOpen(true);
  };

  const confirmSuspend = async () => {
    if (!selectedUser) return;

    const newStatus =
      selectedUser.status === "active" ? "suspended" : "active";

    await updateUserStatus(selectedUser.id, newStatus);

    setConfirmOpen(false);
    fetchUsers();
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <MainLayout title="Users" subtitle="Manage users & permissions">
      {/* Search + Add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </div>

      {/* TABLE */}

      <div className="border rounded-xl bg-card overflow-x-auto">
        <Table className="min-w-[540px]">
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex gap-3 items-center">
                    <Avatar>
                      <AvatarFallback>
                        {initials(user.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge>{user.role}</Badge>
                </TableCell>

                <TableCell>
                  <Badge className={statusStyles[user.status]}>
                    {user.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuspend(user)}
                  >
                    {user.status === "active" ? (
                      <>
                        <PauseCircle className="h-4 w-4 mr-1" />
                        Suspend
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Loading users...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}

      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </Button>

        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>

      {/* CREATE USER */}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Admin</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    password: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SUSPEND CONFIRM */}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.status === "active"
                ? "Suspend User?"
                : "Activate User?"}
            </DialogTitle>
          </DialogHeader>

          <p>
            Are you sure you want to change status for{" "}
            <b>{selectedUser?.name}</b>?
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>

            <Button onClick={confirmSuspend}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default UsersPage;