import { BookOpenCheck } from "lucide-react";
import Link from "next/link";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 mt-16 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 items-center gap-4">
        <div className="flex items-center gap-2 justify-self-center md:justify-self-start">
            <BookOpenCheck className="h-5 w-5 text-primary" />
            <span className="font-bold font-headline">StudyVerse AI</span>
        </div>
        <p className="text-sm text-muted-foreground justify-self-center">
          &copy; {currentYear} StudyVerse AI. All rights reserved.
        </p>
        <div className="flex items-center gap-4 justify-self-center md:justify-self-end">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};
