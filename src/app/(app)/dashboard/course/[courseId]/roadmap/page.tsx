"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Loader2,
  CheckCircle2,
  Circle,
  PlayCircle,
  Clock,
  BookOpen,
  Code,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"; // Ensure you have this hook

export default function RoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTopicId, setLoadingTopicId] = useState<string | null>(null);

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

  // Handle Topic Click (Generate & Navigate)
  const handleTopicClick = async (topicId: string) => {
    if (loadingTopicId) return;
    setLoadingTopicId(topicId);

    try {
      // Trigger Generation (or check cache)
      const res = await fetch(
        `/api/courses/${params.courseId}/topics/${topicId}/generate`,
        { method: "POST" },
      );

      if (!res.ok) throw new Error("Failed to generate lesson");

      // Navigate
      router.push(`/dashboard/course/${params.courseId}/topic/${topicId}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not load the lesson. Please try again.",
        variant: "destructive",
      });
      setLoadingTopicId(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "practical":
        return <Code className="h-4 w-4" />;
      case "project":
        return <Layers className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

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
          <Badge variant="outline" className="px-3 py-1">
            {course.roadmap.totalWeeks} Weeks
          </Badge>
        </div>
      </div>

      <div className="mt-10 relative">
        {/* Vertical Timeline Line */}
        <div className="absolute left-[23px] top-4 bottom-0 w-0.5 bg-border -z-10" />

        {/* Weeks Rendering */}
        <div className="space-y-12">
          {course.roadmap.syllabus.map((week: any) => {
            // Determine Week Status
            const completedTopics = week.topics.filter(
              (t: any) => t.isCompleted,
            ).length;
            const totalTopics = week.topics.length;
            const isWeekCompleted = completedTopics === totalTopics;
            const isWeekStarted = completedTopics > 0;

            // Week Indicator Color
            let indicatorColor = "bg-muted text-muted-foreground";
            if (isWeekCompleted)
              indicatorColor = "bg-primary text-primary-foreground";
            else if (isWeekStarted) indicatorColor = "bg-purple-600 text-white";

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
                    {week.topics.map((topic: any) => {
                      const isThisLoading = loadingTopicId === topic.id;
                      const isInProgress =
                        !topic.isCompleted && !!topic.markdownContent;

                      return (
                        <Card
                          key={topic.id}
                          onClick={() => handleTopicClick(topic.id)}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md border-l-4",
                            // Conditional Styling
                            topic.isCompleted
                              ? "border-l-green-500 bg-muted/20"
                              : isInProgress
                                ? "border-l-blue-500 bg-blue-50/50 border-blue-200"
                                : "border-l-transparent hover:border-l-primary/50",

                            loadingTopicId
                              ? "opacity-70 pointer-events-none"
                              : "",
                          )}
                        >
                          <CardContent className="p-4 flex gap-4 items-start">
                            {/* Icon Box */}
                            <div
                              className={cn(
                                "mt-1 p-2 rounded-full flex items-center justify-center",
                                topic.isCompleted
                                  ? "bg-green-100 text-green-600"
                                  : isInProgress
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-muted text-muted-foreground",
                              )}
                            >
                              {isThisLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : topic.isCompleted ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : isInProgress ? (
                                <PlayCircle className="h-5 w-5" />
                              ) : (
                                <Circle className="h-5 w-5" />
                              )}
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <span
                                  className={cn(
                                    "font-semibold",
                                    topic.isCompleted &&
                                      "text-muted-foreground line-through decoration-green-500/50",
                                  )}
                                >
                                  {topic.title}
                                </span>
                                {isInProgress && !isThisLoading && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-blue-100 text-blue-700 border-blue-200"
                                  >
                                    Resume
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{topic.estimatedMinutes}m</span>
                                </div>
                                <div className="flex items-center gap-1 capitalize">
                                  {getIcon(topic.type)}
                                  <span>{topic.type}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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
