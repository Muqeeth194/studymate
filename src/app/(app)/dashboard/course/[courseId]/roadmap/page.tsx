"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Loader2,
  CheckCircle2,
  Circle,
  PlayCircle,
  Clock,
  BookOpen,
  FileQuestion,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TopicCard } from "@/components/dashboard/TopicCard";

export default function RoadmapPage() {
  const params = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Course Data
  useEffect(() => {
    const fetchCourse = async () => {
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) return <div>Course not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Learning Roadmap</h1>
          <p className="text-muted-foreground">
            Your personalized path to mastery
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total Weeks:{course.roadmap.totalWeeks}</span>
        </div>
      </div>

      <div className="mt-10 relative">
        {/* Vertical Timeline Line */}
        <div className="absolute left-[23px] top-4 bottom-0 w-0.5 bg-border -z-10" />

        {/* Weeks Rendering */}
        <div className="space-y-12">
          {course.roadmap.syllabus.map((week: any, index: number) => {
            // Determine Week Status based on its topics
            const completedTopics = week.topics.filter(
              (t: any) => t.isCompleted,
            ).length;
            const totalTopics = week.topics.length;
            const isWeekCompleted = completedTopics === totalTopics;
            const isWeekStarted = completedTopics > 0;

            // Dynamic Colors for the Week Indicator
            let indicatorColor = "bg-muted text-muted-foreground"; // Default Gray
            if (isWeekCompleted)
              indicatorColor = "bg-primary text-primary-foreground"; // Completed
            else if (isWeekStarted) indicatorColor = "bg-purple-600 text-white"; // In Progress

            return (
              <div key={week.weekNumber} className="relative flex gap-8">
                {/* W1/W2 Circle Indicator */}
                <div
                  className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm z-10 border-4 border-background",
                    indicatorColor,
                  )}
                >
                  W{week.weekNumber}
                </div>

                <div className="flex-1 space-y-4">
                  {/* Week Header */}
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold">{week.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      Week {week.weekNumber}
                    </span>
                  </div>

                  {/* Topics Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {week.topics.map((topic: any) => (
                      <TopicCard key={topic.id} topic={topic} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
