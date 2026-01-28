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

export function TopicCard({ topic }: { topic: any }) {
  // Styles based on status
  let cardStyles = "border-border bg-card/50 opacity-70"; // Default (Upcoming)
  let icon = <Circle className="h-5 w-5 text-muted-foreground" />;
  let statusText = "Upcoming";

  if (topic.isCompleted) {
    cardStyles =
      "border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800";
    icon = (
      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
    );
    statusText = "Completed";
  } else if (topic.inProgress || (!topic.isCompleted && topic.isStarted)) {
    // Assuming you might add an 'isStarted' flag later, or logic for current item
    cardStyles =
      "border-purple-200 bg-purple-50/50 dark:bg-purple-900/10 dark:border-purple-800";
    icon = <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />;
    statusText = "In Progress";
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", cardStyles)}>
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 font-semibold">
            {icon}
            <span>{topic.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {topic.estimatedMinutes} mins
          </span>
          <span className="flex items-center gap-1 capitalize">
            {topic.type === "quiz" ? (
              <FileQuestion className="h-3 w-3" />
            ) : (
              <BookOpen className="h-3 w-3" />
            )}
            {topic.type}
          </span>
        </div>

        {/* Status Badges (Like the image) */}
        <div className="flex gap-2 mt-1">
          {topic.isCompleted ? (
            <>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
              >
                Theory
              </Badge>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
              >
                Quiz: 92%
              </Badge>
            </>
          ) : (
            <Badge variant="outline" className="opacity-70">
              {statusText}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
