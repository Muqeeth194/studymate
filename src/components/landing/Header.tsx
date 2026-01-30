import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpenCheck } from "lucide-react";

export const Header = () => {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl font-headline"
          >
            <BookOpenCheck className="h-6 w-6 text-primary" />
            <span>StudyMate AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="#features"
              className="hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-primary transition-colors"
            >
              How It Works
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
