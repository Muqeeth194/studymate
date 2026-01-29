"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Loader2,
  Trophy,
  Target,
  Clock,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalyticsData {
  stats: {
    totalCourses: number;
    completedCourses: number;
    totalTopics: number;
    completedTopics: number;
    globalAvgScore: number;
    overallProgress: number;
    minutesSpent: number;
    totalEstimatedMinutes: number;
  };
  charts: {
    coursePerformance: {
      name: string;
      avgScore: number;
      progress: number;
    }[];
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) return <div>Failed to load data</div>;

  const { stats, charts } = data;

  // Helper to format minutes to Hours
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your learning progress and performance.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Study Time"
          value={formatTime(stats.minutesSpent)}
          subValue={`Target: ${formatTime(stats.totalEstimatedMinutes)}`}
          icon={<Clock className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="Avg. Quiz Score"
          value={`${stats.globalAvgScore}%`}
          subValue="Across all courses"
          icon={<Trophy className="h-5 w-5 text-yellow-500" />}
        />
        <StatCard
          title="Topics Completed"
          value={`${stats.completedTopics} / ${stats.totalTopics}`}
          subValue={`${stats.overallProgress}% Completion Rate`}
          icon={<Target className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          title="Active Courses"
          value={stats.totalCourses.toString()}
          subValue={`${stats.completedCourses} Fully Completed`}
          icon={<BookOpen className="h-5 w-5 text-purple-500" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Course Performance */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Course Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.coursePerformance}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) =>
                    val.length > 15 ? `${val.slice(0, 15)}...` : val
                  } // Truncate long names
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#F3F4F6" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend />
                <Bar
                  name="Avg Quiz Score (%)"
                  dataKey="avgScore"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
                <Bar
                  name="Progress (%)"
                  dataKey="progress"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Course Progress List */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Detailed Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {charts.coursePerformance.map((course, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium truncate max-w-[70%]">
                    {course.name}
                  </span>
                  <span className="text-muted-foreground">
                    {course.progress}%
                  </span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            ))}

            {charts.coursePerformance.length === 0 && (
              <div className="text-center text-muted-foreground py-10">
                No active courses found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Simple Stat Card Component
function StatCard({
  title,
  value,
  subValue,
  icon,
}: {
  title: string;
  value: string;
  subValue: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
      </CardContent>
    </Card>
  );
}
