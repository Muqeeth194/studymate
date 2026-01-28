"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PlusCircle, BookOpen, Loader2 } from "lucide-react";

interface Course {
  _id: string;
  topic: string;
  // other fields...
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const checkCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(data);

          // LOGIC: If courses exist, redirect to the most recent one immediately
          if (data.length > 0) {
            router.push(`/dashboard/course/${data[0]._id}`);
          }
        }
      } catch (error) {
        console.error("Failed to check courses", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      checkCourses();
    }
  }, [isLoaded, user, router]);

  // 1. Loading State
  if (!isLoaded || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Redirecting State (Prevent flash of empty content while pushing route)
  if (courses.length > 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          Redirecting to your course...
        </span>
      </div>
    );
  }

  // 3. Empty State (Only shown if API returns [] courses)
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-8 p-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4 max-w-lg">
        <h1 className="text-4xl font-bold font-headline">
          Welcome, {user?.firstName}! 👋
        </h1>
        <p className="text-xl text-muted-foreground">
          You haven't started any learning paths yet. Let's create your first
          personalized roadmap.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Create New Card */}
        <Link href="/onboarding" className="block">
          <Card className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <PlusCircle className="h-6 w-6" />
                Create New Path
              </CardTitle>
              <CardDescription>
                Tell AI what you want to learn, and we'll build a custom
                schedule for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-primary/5 rounded-md flex items-center justify-center">
                <span className="text-5xl">🚀</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
