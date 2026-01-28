"use client";

import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  BookOpenCheck,
  LogOut,
  Settings,
  PlusCircle,
  Loader2,
  Book,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "@/lib/menu-items";

interface SimpleCourse {
  _id: string;
  topic: string;
  status: string;
}

export function AppSidebar() {
  const pathname = usePathname();
  const [courses, setCourses] = useState<SimpleCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper: Extract current course ID from URL if present
  // URL structure: /dashboard/course/[id]/...
  const courseIdMatch = pathname.match(/\/dashboard\/course\/([^\/]+)/);
  const activeCourseId = courseIdMatch ? courseIdMatch[1] : null;

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <Sidebar side="left" collapsible="icon" className="border-r">
      {/* LOGO */}
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xl font-bold font-headline text-sidebar-foreground px-2 py-2"
        >
          <BookOpenCheck className="h-6 w-6 text-sidebar-primary" />
          <span className="group-data-[state=collapsed]:hidden">
            StudyMate AI
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* LEARNING PATHS */}
        <SidebarGroup>
          <SidebarGroupLabel>My Learning Paths</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {courses.map((course) => (
                    <SidebarMenuItem key={course._id}>
                      <Link href={`/dashboard/course/${course._id}`}>
                        <SidebarMenuButton
                          isActive={activeCourseId === course._id}
                          tooltip={course.topic}
                          className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-white hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                          <Book className="h-4 w-4" />
                          <span>{course.topic}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}

                  <SidebarMenuItem>
                    <Link href="/onboarding">
                      <SidebarMenuButton className="text-muted-foreground hover:text-primary">
                        <PlusCircle className="h-4 w-4" />
                        <span>New Learning Path</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator only shows if we have tools to show */}
        {activeCourseId && <SidebarSeparator />}

        {/* 2. Standard Menu Items (Visible ONLY when a course is active) */}
        {activeCourseId && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300 p-2">
            {menuItems.map((group) => (
              <SidebarMenu key={group.title}>
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                {group.items.map((item) => {
                  // Construct dynamic link: /dashboard/course/[id]/[tool-path]
                  // Assuming item.href is something like "/roadmap" or "/quiz" in your menu-items file
                  // We remove the leading slash if present to append correctly
                  const subPath = item.href.startsWith("/")
                    ? item.href
                    : `/${item.href}`;
                  const dynamicHref = `/dashboard/course/${activeCourseId}${subPath}`;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <Link href={dynamicHref}>
                        <SidebarMenuButton
                          isActive={pathname === dynamicHref}
                          tooltip={item.label}
                          className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-white hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            ))}
          </div>
        )}
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
            <Link href="/">
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
