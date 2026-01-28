import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, BookOpen, Code, Layers } from "lucide-react";
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
  const router = useRouter(); // 2. Initialize router
  const params = useParams(); // 3. Get courseId from URL
  const { toast } = useToast();

  // Track which specific topic is currently loading
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

  // Handle Click Function
  const handleTopicClick = async (topicId: string) => {
    if (loadingTopicId) return; // Prevent multiple clicks

    setLoadingTopicId(topicId);

    try {
      // 1. Call the Generate API
      // Note: We don't need the return data here, just the success confirmation
      // The next page will fetch the content again (or we could pass it via context/state)
      // But usually, standard practice is to let the next page fetch the "cached" data
      const res = await fetch(
        `/api/courses/${params.courseId}/topics/${topicId}/generate`,
        {
          method: "POST",
        },
      );

      if (!res.ok) throw new Error("Failed to generate lesson");

      // 2. Navigate on Success
      router.push(`/dashboard/course/${params.courseId}/topic/${topicId}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not generate the lesson. Please try again.",
        variant: "destructive",
      });
      setLoadingTopicId(null); // Stop loading only on error (on success, we navigate away)
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
              {week.topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleTopicClick(topic.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-md border transition-colors hover:bg-accent/50 cursor-pointer group",
                    topic.isCompleted
                      ? "bg-muted/50 border-transparent"
                      : "bg-background",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {topic.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {topic.title}
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
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
