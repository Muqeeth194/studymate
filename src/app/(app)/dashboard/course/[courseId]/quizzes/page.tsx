"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Lock,
  CheckCircle2,
  PlayCircle,
  Loader2,
  Trophy,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function CourseQuizzesPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Course Data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${params.courseId}`);
        if (!res.ok) throw new Error("Failed to load course");
        const data = await res.json();
        setCourse(data);
      } catch (error) {
        console.error("Error loading course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.courseId]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Course not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // 2. Flatten Syllabus to handle linear progression logic
  const allTopics: any[] = [];
  course.roadmap.syllabus.forEach((week: any) => {
    week.topics.forEach((topic: any) => {
      allTopics.push({
        ...topic,
        weekNumber: week.weekNumber,
        weekTitle: week.title,
      });
    });
  });

  const completedCount = allTopics.filter((t) => t.isCompleted).length;
  const progressPercent = (completedCount / allTopics.length) * 100;

  return (
    <div className="container max-w-5xl mx-auto p-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Quiz Dashboard
          </h1>
          <p className="text-muted-foreground">
            Test your knowledge to unlock new topics. You must pass each quiz to
            proceed.
          </p>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Overall Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allTopics.map((topic, index) => {
          // LOGIC: A topic is locked if the PREVIOUS topic is NOT completed.
          // The first topic (index 0) is always unlocked.
          const isPreviousCompleted =
            index === 0 || allTopics[index - 1].isCompleted;
          const isLocked = !isPreviousCompleted;

          // Status Determination
          let status: "locked" | "active" | "completed" = "locked";
          if (topic.isCompleted) status = "completed";
          else if (!isLocked) status = "active";

          return (
            <Card
              key={topic.id}
              className={cn(
                "transition-all duration-200 flex flex-col",
                status === "locked"
                  ? "opacity-60 bg-muted/50"
                  : "hover:shadow-md border-primary/20",
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs uppercase tracking-wider mb-2"
                  >
                    Week {topic.weekNumber}
                  </Badge>
                  {status === "completed" && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                      Passed
                    </Badge>
                  )}
                  {status === "active" && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 animate-pulse">
                      Ready
                    </Badge>
                  )}
                  {status === "locked" && (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-muted-foreground"
                    >
                      <Lock className="h-3 w-3" /> Locked
                    </Badge>
                  )}
                </div>
                <CardTitle className="line-clamp-2 text-lg leading-tight">
                  {topic.title}
                </CardTitle>
                <CardDescription className="line-clamp-1 text-xs mt-1">
                  {topic.weekTitle}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {topic.type === "theory"
                      ? "Theory Lesson"
                      : "Practical Exercise"}
                  </span>
                </div>
              </CardContent>

              <div className="p-6 pt-0 mt-auto">
                <Button
                  className={cn(
                    "w-full gap-2",
                    status === "completed"
                      ? "bg-green-600 hover:bg-green-700"
                      : "",
                  )}
                  variant={status === "locked" ? "outline" : "default"}
                  disabled={status === "locked"}
                  onClick={() => {
                    // Navigate to the quiz page we built earlier
                    router.push(
                      `/dashboard/course/${params.courseId}/topic/${topic.id}/quiz`,
                    );
                  }}
                >
                  {status === "locked" ? (
                    <>
                      <Lock className="h-4 w-4" />
                      Complete Previous
                    </>
                  ) : status === "completed" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Review Quiz
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      Start Quiz
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
