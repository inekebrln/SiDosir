import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid, ClipboardList, Users, Camera, BarChart3, TrendingUp,Activity
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavGrouped } from '@/components/nav-grouped';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavGroup, User } from '@/types';


const csNavGroups: NavGroup[] = [
    {
        label: 'Menu Utama',
        items: [
            { title: 'Dashboard',    href: '/dashboard',   icon: LayoutGrid },
        ],
    },
    {
        label: 'Peminjaman Dosir',
        items: [
            { title: 'Catat Peminjaman', href: '/peminjaman', icon: Camera },
        ],
    },
];


const adminNavGroups: NavGroup[] = [
    {
        label: 'Menu Utama',
        items: [
            { title: 'Dashboard',    href: '/dashboard',          icon: LayoutGrid },
        ],
    },
    {
        label: 'Peminjaman Dosir',
        items: [
            { title: 'Catat Peminjaman', href: '/peminjaman',        icon: Camera },
            { title: 'Monitoring',       href: '/admin/peminjaman',  icon: BarChart3 },
        ],
    },
    {
        label: 'Analitcs & Logs',
        items: [
            { title: 'Laporan & Analitik', href: '/admin/laporan',  icon: TrendingUp },
            { title: 'Log Activity', href: '/admin/log-activity',  icon: Activity },
        ],
    },
  
    {
        label: 'Pengaturan',
        items: [
            { title: 'Kelola User',  href: '/admin/users',        icon: Users },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const isAdmin = auth.user.role === 'admin';
    const navGroups = isAdmin ? adminNavGroups : csNavGroups;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavGrouped groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
