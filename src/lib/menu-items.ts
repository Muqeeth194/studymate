import { LayoutDashboard, Book, Target, BarChart, Trophy, type LucideIcon } from 'lucide-react';

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
    title: "Main",
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        href: '/roadmap',
        label: 'Roadmap',
        icon: Book,
      },
      {
        href: '/quizzes',
        label: 'Quizzes',
        icon: Target,
      },
      {
        href: '/analytics',
        label: 'Analytics',
        icon: BarChart,
      },
      {
        href: '/achievements',
        label: 'Achievements',
        icon: Trophy,
      },
    ],
  },
];
