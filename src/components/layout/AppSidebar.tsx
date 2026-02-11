"use client";

import { useEffect, useState, useTransition } from "react";
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
  PlusCircle,
  Loader2,
  Book,
  User,
  ChevronsUpDown,
  LogOut,
  Play,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "@/lib/menu-items";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClerk, useUser } from "@clerk/nextjs";
import { continueLearning } from "@/actions/study-session";
import { continueQuiz } from "@/actions/quiz-session";

interface SimpleCourse {
  _id: string;
  topic: string;
  status: string;
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const clerk = useClerk();

  const [isPending, startTransition] = useTransition();
  const [courses, setCourses] = useState<SimpleCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const courseIdMatch = pathname.match(/\/dashboard\/course\/([^\/]+)/);
  const activeCourseId = courseIdMatch ? courseIdMatch[1] : null;

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
  }, [activeCourseId]);

  // Handler for Resume Learning
  const handleResumeClick = () => {
    if (!activeCourseId) return;
    startTransition(async () => {
      await continueLearning(activeCourseId);
    });
  };

  // 2. Handler for Quiz Click
  const handleQuizClick = () => {
    if (!activeCourseId) return;
    startTransition(async () => {
      await continueQuiz(activeCourseId);
    });
  };

  return (
    <Sidebar side="left" collapsible="icon" className="border-r">
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

        {activeCourseId && <SidebarSeparator />}

        {activeCourseId && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300 p-2">
            {/* Resume Learning Button */}
            <SidebarMenu className="mb-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleResumeClick}
                  disabled={isPending}
                  className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white group"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 fill-current" />
                  )}
                  <span className="font-semibold">Resume Learning</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            {menuItems.map((group) => (
              <SidebarMenu key={group.title}>
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                {group.items.map((item) => {
                  // --- CASE 1: Study Session (Resume) ---
                  if (item.label === "Study Session") {
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          onClick={handleResumeClick}
                          disabled={isPending}
                          tooltip={item.label}
                          className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer text-blue-600"
                        >
                          {isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <item.icon className="h-5 w-5" />
                          )}
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  // --- CASE 3: Standard Links ---
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.imageUrl}
                      alt={user?.fullName || ""}
                    />
                    <AvatarFallback className="rounded-lg">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.fullName || "User"}
                    </span>
                    <span className="truncate text-xs">
                      {user?.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.imageUrl}
                        alt={user?.fullName || ""}
                      />
                      <AvatarFallback className="rounded-lg">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.fullName || "User"}
                      </span>
                      <span className="truncate text-xs">
                        {user?.primaryEmailAddress?.emailAddress}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => clerk.signOut({ redirectUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
