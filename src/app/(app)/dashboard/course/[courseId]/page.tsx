"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Added useRouter
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { RoadmapView } from "@/components/dashboard/RoadmapView";
import { BarChart, Clock, Target, Trophy, Loader2 } from "lucide-react"; // Removed Share2
import { Progress } from "@/components/ui/progress";

export default function CourseDashboardPage() {
  const params = useParams();
  const router = useRouter(); // Initialize router
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  // --- NEW: Helper to find the next active topic ---
  const handleContinue = () => {
    if (!course) return;

    let targetTopicId = null;

    // Iterate through weeks and topics to find the first incomplete one
    for (const week of course.roadmap.syllabus) {
      for (const topic of week.topics) {
        if (!topic.isCompleted) {
          targetTopicId = topic.id;
          break; // Found it, stop searching topics
        }
      }
      if (targetTopicId) break; // Found it, stop searching weeks
    }

    // If no incomplete topic found, they finished the course!
    // Default to the very last topic or show a finished state.
    if (!targetTopicId) {
      // Optional: Navigate to a "Course Completed" page instead
      // For now, just go to the last topic of the last week
      const lastWeek =
        course.roadmap.syllabus[course.roadmap.syllabus.length - 1];
      const lastTopic = lastWeek.topics[lastWeek.topics.length - 1];
      targetTopicId = lastTopic.id;
    }

    // Navigate
    router.push(`/dashboard/course/${params.courseId}/topic/${targetTopicId}`);
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

  // Calculate some stats for the cards
  const totalWeeks = course.roadmap.totalWeeks;
  const currentWeek = course.progress.currentWeek;
  const percentComplete = course.progress.percentComplete;

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
          {/* Removed Share Button */}
          <Button
            size="lg"
            className="shadow-lg shadow-primary/20"
            onClick={handleContinue} // Attached handler here
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

        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4 sticky top-6">
            <h3 className="font-semibold text-lg">Goal Checklist</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Completion</span>
                  <span className="font-bold">{percentComplete}%</span>
                </div>
                <Progress value={percentComplete} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                  Primary Goal
                </h4>
                <p className="text-sm italic">"{course.preferences.goals}"</p>
              </div>
            </div>
            {/* Kept this button but it currently does nothing logic-wise */}
            <Button variant="secondary" className="w-full">
              Update Goals
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
