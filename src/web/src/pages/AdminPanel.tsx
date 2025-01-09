import { deleteUser, getUsers, setStatus } from '@/api/User';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { User } from '@/interfaces/User';
import { PlayIcon, StopIcon, TrashIcon, EyeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const { token } = useAuth();
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
        const fetchedUsers = await getUsers(token);
        if (fetchedUsers.length > 0)
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
        variant: 'success',
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
        variant: 'success',
        description: t('admin.statusChangeSuccess'),
      });
    } catch (error) {
      console.error('Failed to change user status:', error);
      toast({
        variant: 'destructive',
        description: t('admin.statusChangeError'),
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      variant: 'success',
      description: t('admin.copyToClipboard'),
    });
  };

  return (
    <div className='space-y-4'>
      <div>
        <h1 className='text-2xl font-bold'>{t('admin.title')}</h1>
        <p className='text-muted-foreground'>{t('admin.usersTitle')}</p>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.users.id')}</TableHead>
              <TableHead>{t('admin.users.name')}</TableHead>
              <TableHead>{t('admin.users.email')}</TableHead>
              <TableHead>{t('admin.users.status')}</TableHead>
              <TableHead className='text-right'>{t('admin.users.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell
                  className='font-mono'
                  onClick={() => handleCopy(user.id)}>
                  <Tooltip>
                    <TooltipTrigger className='text-sm max-w-10 md:max-w-20 truncate cursor-copy'>
                      {user.id}
                    </TooltipTrigger>
                    <TooltipContent className='text-foreground' side='top'>
                      {t('admin.copyToClipboard')}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className='max-w-14 md:max-w-full truncate'>
                  {user.displayName || user.username}
                </TableCell>
                <TableCell className='max-w-14 md:max-w-full truncate'>
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'outline' : 'destructiveOutline'}>
                    {user.status === 'active' ? <PlayIcon className='size-4 mr-1 hidden md:block' /> : <StopIcon className='size-4 mr-1 hidden md:block' />}
                    {t(`admin.${user.status}`)}
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='iconSm'>
                        <EllipsisHorizontalIcon className='h-5 w-5' />
                        <span className='sr-only'>{t('admin.openMenu')}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-48'>
                      <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                        <EyeIcon className='size-4' />
                        {t('admin.viewProfile')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}>
                        {user.status === 'active' ? <StopIcon className='size-4' /> : <PlayIcon className='size-4' />}
                        {user.status === 'active' ? t('admin.suspend') : t('admin.activate')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className='text-destructive'
                        onClick={() => setConfirmDelete(user.id)}
                      >
                        <TrashIcon className='size-4' />
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
            <Button variant='outline' onClick={() => setConfirmDelete(null)}>
              {t('admin.users.cancel')}
            </Button>
            <Button
              variant='destructive'
              onClick={() => confirmDelete && handleDeleteUser(confirmDelete)}
            >
              {t('admin.users.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className='max-w-2xl'>
          {selectedUser && (
            <div className='space-y-6'>
              <div className='flex items-center gap-4'>
                {selectedUser.avatarUrl && (
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.displayName || selectedUser.username}
                    className='rounded-full w-16 h-16'
                  />
                )}
                <div>
                  <h2 className='text-lg font-semibold'>
                    {selectedUser.displayName || selectedUser.username}
                  </h2>
                  <p className='text-muted-foreground text-md'>{selectedUser.email}</p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <h2 className='font-medium text-sm'>{t('admin.users.id')}</h2>
                  <p className='font-mono text-sm'>{selectedUser.id}</p>
                </div>
                <div>
                  <h2 className='font-medium text-sm'>{t('admin.users.provider')}</h2>
                  <p className='capitalize text-sm'>{selectedUser.provider}</p>
                </div>
                <div>
                  <h2 className='font-medium text-sm'>{t('admin.users.role')}</h2>
                  <span className='flex items-center'>
                    <p className='uppercase text-sm'>{selectedUser.role}</p>
                    {selectedUser.role === 'admin' && (
                      <ShieldCheckIcon className='size-4 ml-1' />
                    )}
                  </span>
                </div>
                <div>
                  <h2 className='font-medium text-sm'>{t('admin.users.status')}</h2>
                  <p className='capitalize text-sm'>{t(`admin.${selectedUser.status}`)}</p>
                </div>
                <div>
                  <h2 className='font-medium text-sm'>{t('admin.users.createdAt')}</h2>
                  <p className='text-sm'>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h2 className='font-medium text-sm'>{t('admin.users.lastConnection')}</h2>
                  <p className='text-sm'>{selectedUser.lastConnection ? new Date(selectedUser.lastConnection).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <h2 className='font-medium text-sm'>{t('admin.users.updatedAt')}</h2>
                  <p className='text-sm'>{new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setSelectedUser(null)}>
              {t('admin.users.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
