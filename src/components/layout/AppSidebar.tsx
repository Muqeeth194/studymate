'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { BookOpenCheck, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { menuItems } from '@/lib/menu-items';

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="left" collapsible="icon" className="border-r">
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xl font-bold font-headline text-sidebar-foreground group-data-[state=collapsed]:hidden"
        >
          <BookOpenCheck className="h-6 w-6 text-sidebar-primary" />
          <span>StudyVerse AI</span>
        </Link>
        <Link
          href="/dashboard"
          className="hidden items-center gap-2 text-xl font-bold font-headline text-sidebar-foreground group-data-[state=collapsed]:flex"
        >
          <BookOpenCheck className="h-6 w-6 text-sidebar-primary" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarMenu key={group.title}>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/" passHref legacyBehavior>
                <SidebarMenuButton tooltip="Logout">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
                </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
