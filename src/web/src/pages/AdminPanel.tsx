import { useTranslation } from 'react-i18next';
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Settings, Users, Zap, MoreVertical, Trash, UserX, UserCheck, Edit } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

const initialUsers = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', status: 'Active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', status: 'Active' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', status: 'Suspended' },
    { id: 4, name: 'David Lee', email: 'david@example.com', status: 'Active' },
    { id: 5, name: 'Eva Martinez', email: 'eva@example.com', status: 'Active' },
  ]

export default function AdminPanel() {
  const { t } = useTranslation();
  return <div>{t('users')}</div>
}
