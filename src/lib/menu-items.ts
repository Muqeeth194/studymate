import {
  LayoutDashboard,
  Book,
  Target,
  BarChart,
  Trophy,
  type LucideIcon,
  BookOpen,
} from "lucide-react";

type MenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

export const menuItems: MenuGroup[] = [
  {
    title: "Menu",
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        href: "",
        label: "Study Session",
        icon: BookOpen,
      },
      {
        href: "/roadmap",
        label: "Roadmap",
        icon: Book,
      },
      {
        href: "/quizzes",
        label: "Quizzes",
        icon: Target,
      },
      {
        href: "/analytics",
        label: "Analytics",
        icon: BarChart,
      },
    ],
  },
];
