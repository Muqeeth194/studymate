import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  BookOpen,
  Code,
  Layers,
  Loader2,
  PlayCircle,
  Lock, // Import Lock icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Topic {
  id: string;
  title: string;
  type: "theory" | "practical" | "project";
  estimatedMinutes: number;
  isCompleted: boolean;
  markdownContent?: string | null;
}

interface Week {
  weekNumber: number;
  title: string;
  topics: Topic[];
}

interface RoadmapViewProps {
  syllabus: Week[];
}

export function RoadmapView({ syllabus }: RoadmapViewProps) {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [loadingTopicId, setLoadingTopicId] = useState<string | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case "practical":
        return <Code className="h-4 w-4 text-blue-500" />;
      case "project":
        return <Layers className="h-4 w-4 text-purple-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-orange-500" />;
    }
  };

  const handleTopicClick = async (topicId: string) => {
    if (loadingTopicId) return;

    setLoadingTopicId(topicId);

    try {
      const res = await fetch(
        `/api/courses/${params.courseId}/topics/${topicId}/generate`,
        { method: "POST" },
      );

      // 1. Handle Locked State (403)
      if (res.status === 403) {
        const data = await res.json();
        toast({
          title: "Topic Locked 🔒",
          description:
            data.message || "Please complete the previous topic first.",
          variant: "destructive", // or "default" if you prefer less aggressive color
        });
        setLoadingTopicId(null);
        return; // Stop execution
      }

      if (!res.ok) throw new Error("Failed to generate lesson");

      // 2. Success - Navigate
      router.push(`/dashboard/course/${params.courseId}/topic/${topicId}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not generate the lesson. Please try again.",
        variant: "destructive",
      });
      setLoadingTopicId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold font-headline">Your Learning Path</h3>
      <Accordion type="single" collapsible className="w-full space-y-4">
        {syllabus.map((week) => (
          <AccordionItem
            key={week.weekNumber}
            value={`week-${week.weekNumber}`}
            className="border rounded-lg px-4 bg-card"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex flex-col items-start text-left">
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  Week {week.weekNumber}
                </div>
                <div className="font-bold text-lg">{week.title}</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-2">
              {week.topics.map((topic, index) => {
                const isThisLoading = loadingTopicId === topic.id;
                const isInProgress =
                  !topic.isCompleted && !!topic.markdownContent;

                // Optional: Visually indicate locked status based on previous topic
                // Note: Finding previous topic in nested map is tricky visually,
                // so we rely on the click handler toast for now.

                return (
                  <div
                    key={topic.id}
                    onClick={() => handleTopicClick(topic.id)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-md border transition-all cursor-pointer group",
                      topic.isCompleted
                        ? "bg-muted/50 border-transparent"
                        : isInProgress
                          ? "bg-blue-50 border-blue-200 shadow-sm"
                          : "bg-background hover:bg-accent/50",
                      loadingTopicId ? "opacity-60 pointer-events-none" : "",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {isThisLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : topic.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : isInProgress ? (
                        <PlayCircle className="h-5 w-5 text-blue-600 fill-blue-100" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}

                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          {topic.title}
                          {isThisLoading && (
                            <span className="text-xs text-muted-foreground animate-pulse">
                              (Generating...)
                            </span>
                          )}
                          {isInProgress && !isThisLoading && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 px-1.5 bg-blue-100 text-blue-700 border-blue-200"
                            >
                              In Progress
                            </Badge>
                          )}
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 px-1.5 font-normal"
                          >
                            {topic.estimatedMinutes}m
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {getIcon(topic.type)}
                      <span className="capitalize">{topic.type}</span>
                    </div>
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
