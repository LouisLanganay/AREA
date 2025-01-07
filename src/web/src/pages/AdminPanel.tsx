import { deleteUser, getUsers, setStatus } from '@/api/User';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/interfaces/User';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const { token } = useAuth();
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{id: string, status: string} | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
        const fetchedUsers = await getUsers(token);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast({
          variant: 'destructive',
          description: t('admin.fetchError'),
        });
      }
    };

    fetchUsers();
  }, [token]);

  const handleDeleteUser = async (userId: string) => {
    if (!token) return;
    try {
      await deleteUser(token, userId);
      setUsers(users.filter(user => user.id !== userId));
      toast({
        description: t('admin.deleteSuccess'),
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        variant: 'destructive',
        description: t('admin.deleteError'),
      });
    }
    setConfirmDelete(null);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (!token) return;
    try {
      await setStatus(token, userId, newStatus as 'active' | 'suspended');
      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: newStatus as 'active' | 'suspended' } : user
      ));
      toast({
        description: t('admin.statusChangeSuccess'),
      });
    } catch (error) {
      console.error('Failed to change user status:', error);
      toast({
        variant: 'destructive',
        description: t('admin.statusChangeError'),
      });
    }
    setConfirmStatus(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
        <p className="text-muted-foreground">{t('admin.usersTitle')}</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.users.id')}</TableHead>
              <TableHead>{t('admin.users.name')}</TableHead>
              <TableHead>{t('admin.users.email')}</TableHead>
              <TableHead>{t('admin.users.status')}</TableHead>
              <TableHead className="text-right">{t('admin.users.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono">{user.id}</TableCell>
                <TableCell>{user.displayName || user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                    {t(`admin.${user.status}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                        <span className="sr-only">{t('admin.openMenu')}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setConfirmStatus({
                        id: user.id,
                        status: user.status === 'active' ? 'suspended' : 'active'
                      })}>
                        {user.status === 'active' ? t('admin.suspend') : t('admin.activate')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setConfirmDelete(user.id)}
                      >
                        {t('admin.users.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.confirmDeleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('admin.confirmDelete', {
                userName: users.find(u => u.id === confirmDelete)?.displayName ||
                          users.find(u => u.id === confirmDelete)?.username
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              {t('admin.users.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDelete && handleDeleteUser(confirmDelete)}
            >
              {t('admin.users.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmStatus} onOpenChange={() => setConfirmStatus(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.confirmStatusTitle')}</DialogTitle>
            <DialogDescription>
              {t('admin.confirmStatus', {
                status: confirmStatus?.status === 'active' ? t('admin.activate') : t('admin.suspend'),
                userName: users.find(u => u.id === confirmStatus?.id)?.displayName ||
                        users.find(u => u.id === confirmStatus?.id)?.username
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmStatus(null)}>
              {t('admin.users.cancel')}
            </Button>
            <Button
              variant="default"
              onClick={() => confirmStatus && handleStatusChange(confirmStatus.id, confirmStatus.status)}
            >
              {t('admin.users.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
