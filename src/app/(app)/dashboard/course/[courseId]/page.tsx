"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { RoadmapView } from "@/components/dashboard/RoadmapView";
import {
  BarChart,
  Clock,
  Target,
  Trophy,
  Loader2,
  CheckCircle,
  Circle,
  Trash2,
} from "lucide-react";

export default function CourseDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!params.courseId) return;
      try {
        const res = await fetch(`/api/courses/${params.courseId}`);
        if (!res.ok) throw new Error("Failed to load course");
        const data = await res.json();
        setCourse(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.courseId]);

  const handleContinue = () => {
    if (!course) return;
    let targetTopicId = null;
    for (const week of course.roadmap.syllabus) {
      for (const topic of week.topics) {
        if (!topic.isCompleted) {
          targetTopicId = topic.id;
          break;
        }
      }
      if (targetTopicId) break;
    }

    // If finished, maybe go to last topic or a special completed page
    if (!targetTopicId) {
      const lastWeek =
        course.roadmap.syllabus[course.roadmap.syllabus.length - 1];
      const lastTopic = lastWeek.topics[lastWeek.topics.length - 1];
      targetTopicId = lastTopic.id;
    }

    router.push(`/dashboard/course/${params.courseId}/topic/${targetTopicId}`);
  };

  // --- DELETE FUNCTION ---
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course? This action cannot be undone.",
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/courses/${params.courseId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete course");
      }

      // Redirect to main dashboard after deletion
      router.push("/dashboard");
      router.refresh(); // Ensure the dashboard list updates
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete the course. Please try again.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return <div>Course not found.</div>;
  }

  const totalWeeks = course.roadmap.totalWeeks;
  const currentWeek = course.progress.currentWeek;
  const percentComplete = course.progress.percentComplete;

  // Calculate total lessons
  let totalLessons = 0;
  let completedLessons = 0;
  course.roadmap.syllabus.forEach((week: any) => {
    week.topics.forEach((topic: any) => {
      totalLessons++;
      if (topic.isCompleted) completedLessons++;
    });
  });

  // SVG Calculations for the circle
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (percentComplete / 100) * circumference;

  return (
    <div className="space-y-8 p-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
              {course.preferences.level}
            </span>
            <span>•</span>
            <span>{course.preferences.totalDurationWeeks} Weeks</span>
          </div>
          <h2 className="text-3xl font-bold font-headline">{course.topic}</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </Button>

          <Button
            size="lg"
            className="shadow-lg shadow-primary/20"
            onClick={handleContinue}
          >
            Continue Week {currentWeek}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Course Progress"
          value={`${Math.round(percentComplete)}%`}
          icon={<BarChart className="text-blue-500" />}
          description="Keep it up!"
        />
        <StatCard
          title="Current Week"
          value={`Week ${currentWeek}`}
          icon={<Clock className="text-orange-500" />}
          description={`of ${totalWeeks} weeks`}
        />
        <StatCard
          title="Topics Mastered"
          value={course.progress.completedTopicIds.length.toString()}
          icon={<Target className="text-green-500" />}
          description="Concepts learned"
        />
        <StatCard
          title="Project Scope"
          value={course.preferences.projectScope}
          icon={<Trophy className="text-purple-500" />}
          description="Build strategy"
        />
      </div>

      {/* Main Roadmap Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Col: Syllabus (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <RoadmapView syllabus={course.roadmap.syllabus} />
        </div>

        {/* Right Col: Simple Progress Overview */}
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm sticky top-6">
            <h3 className="font-semibold text-lg mb-4">Overall Status</h3>

            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              {/* Circular Progress (SVG Implementation) */}
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background Circle (Gray Track) */}
                  <circle
                    className="text-muted stroke-current"
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                  />
                  {/* Progress Circle (Primary Color) */}
                  <circle
                    className="text-primary stroke-current"
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 50 50)"
                    style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
                  />
                </svg>
                {/* Centered Text */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold">
                    {Math.round(percentComplete)}%
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground text-sm text-center px-4">
                You have completed <strong>{completedLessons}</strong> out of{" "}
                <strong>{totalLessons}</strong> lessons.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Completed
                </span>
                <span className="font-medium">{completedLessons}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Circle className="w-4 h-4" />
                  Remaining
                </span>
                <span className="font-medium">
                  {totalLessons - completedLessons}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
