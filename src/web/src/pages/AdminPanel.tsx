import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreVertical, Trash, UserX, UserCheck, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  id: number;
  name: string;
  email: string;
  status: "Active" | "Suspended";
}

const initialUsers: User[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    status: "Active",
  },
  { id: 2, name: "Bob Smith", email: "bob@example.com", status: "Active" },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie@example.com",
    status: "Suspended",
  },
  { id: 4, name: "David Lee", email: "david@example.com", status: "Active" },
  { id: 5, name: "Eva Martinez", email: "eva@example.com", status: "Active" },
];

export default function AdminPanel() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter((user) => user.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
    }
  };

  const handleToggleUserStatus = () => {
    if (selectedUser) {
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? {
              ...user,
              status: user.status === "Active" ? "Suspended" : "Active",
            }
            : user
        )
      );
      setIsStatusDialogOpen(false);
    }
  };

  const handleEditUser = (editedUser: User) => {
    setUsers(
      users.map((user) => (user.id === editedUser.id ? editedUser : user))
    );
    setIsEditDialogOpen(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm)
  );

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">{t("admin.title")}</h2>
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.usersTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by name, email, or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.users.id")}</TableHead>
                  <TableHead>{t("admin.users.name")}</TableHead>
                  <TableHead>{t("admin.users.email")}</TableHead>
                  <TableHead>{t("admin.users.status")}</TableHead>
                  <TableHead>{t("admin.users.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">
                              {t("admin.openMenu")}
                            </span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {t("admin.users.actions")}
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {t("admin.users.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setIsStatusDialogOpen(true);
                            }}
                          >
                            {user.status === "Active" ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                {t("admin.suspend")}
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                {t("admin.activate")}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            {t("admin.users.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.confirmDeleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("admin.confirmDelete", { userName: selectedUser?.name || "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("admin.users.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              {t("admin.users.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.confirmStatusTitle")}</DialogTitle>
            <DialogDescription>
              {t("admin.confirmStatus", {
                status:
                  selectedUser?.status === "Active" ? "suspend" : "activate",
                userName: selectedUser?.name,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              {t("admin.users.cancel")}
            </Button>
            <Button onClick={handleToggleUserStatus}>
              {t("admin.users.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.editTitle")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const editedUser: User = {
                id: selectedUser?.id || 0,
                name: formData.get("name") as string,
                email: formData.get("email") as string,
                status: formData.get("status") as "Active" | "Suspended",
              };
              handleEditUser(editedUser);
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t("admin.users.name")}
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedUser?.name || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  {t("admin.users.email")}
                </Label>
                <Input
                  id="email"
                  name="email"
                  defaultValue={selectedUser?.email || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  {t("admin.users.status")}
                </Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={selectedUser?.status || "Active"}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Active">{t("admin.active")}</option>
                  <option value="Suspended">{t("admin.suspended")}</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t("admin.saveChanges")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
