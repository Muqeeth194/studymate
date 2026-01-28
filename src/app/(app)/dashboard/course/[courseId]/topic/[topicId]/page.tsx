"use client";

import { useState, useEffect } from "react";
import { Clock, Target, Bot, Send, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function StudySessionPage() {
  const params = useParams();
  // Assuming the route is /dashboard/course/[courseId]/topic/[topicId]
  const { courseId, topicId } = params as { courseId: string; topicId: string };

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 1. Fetch Content on Mount
  useEffect(() => {
    const fetchContent = async () => {
      if (!courseId || !topicId) return;

      try {
        setLoading(true);
        // Call the API route we created in the previous step
        const res = await fetch(
          `/api/courses/${courseId}/topics/${topicId}/generate`,
          {
            method: "POST",
          },
        );

        if (!res.ok) throw new Error("Failed to load lesson");

        const data = await res.json();
        setContent(data.content);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [courseId, topicId]);

  return (
    // h-screen and overflow-hidden prevent the whole window from scrolling
    <div className="h-[calc(100vh-2rem)] bg-gray-50 flex flex-col overflow-hidden">
      {/* 1. HEADER (Fixed at top) */}
      <header className="bg-blue-600 text-white px-6 py-4 shadow-md shrink-0 z-10 rounded-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold">
              {loading ? "Loading Lesson..." : "React Deep Dive"}
              {/* You could also fetch the topic title in the API response */}
            </h1>
            <p className="text-indigo-100 text-sm flex items-center gap-2">
              <span>Topic: {topicId ? topicId.slice(0, 8) : "..."}</span>
              <span>•</span>
              <span>AI Generated Module</span>
            </p>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-4 text-sm font-medium text-indigo-100">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>25m estimated</span>
              </div>
            </div>

            <Link href={`/dashboard/course/${courseId}`}>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-none"
              >
                End Session
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT GRID (Fills remaining height) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* LEFT COLUMN: Learning Content (Scrollable) */}
        {/* 'overflow-y-auto' allows this specific column to scroll while chat stays put */}
        <div className="lg:col-span-2 h-full overflow-y-auto pr-2 custom-scrollbar">
          <Card className="border-none shadow-md min-h-full">
            <CardContent className="p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  <p className="text-muted-foreground">
                    Generating your personalized lesson...
                  </p>
                </div>
              ) : content ? (
                // Prose class automatically styles Markdown (requires @tailwindcss/typography)
                <div className="prose prose-blue max-w-none dark:prose-invert">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-red-500">
                  <AlertCircle className="h-10 w-10 mb-2" />
                  <p>Failed to load content.</p>
                </div>
              )}

              {/* Action Buttons at bottom of content */}
              {!loading && content && (
                <div className="pt-8 mt-8 border-t flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Mark as Complete
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Take Quiz
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: AI Assistant (Static / Sticky) */}
        <div className="lg:col-span-1 h-full flex flex-col">
          <Card className="flex-1 flex flex-col border-none shadow-md overflow-hidden">
            {/* AI Header */}
            <div className="p-4 border-b flex items-center gap-2 bg-white shrink-0">
              <Bot className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-sm">AI Study Assistant</span>
            </div>

            {/* Chat Area - Inner Scroll */}
            <ScrollArea className="flex-1 p-4 bg-gray-50/50">
              <div className="space-y-4">
                {/* Initial Bot Message */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="bg-white border rounded-lg p-3 text-sm text-gray-700 shadow-sm max-w-[85%]">
                    I've loaded the study material for this topic. Feel free to
                    ask me to clarify any concepts or generate examples!
                  </div>
                </div>

                {/* You can map over real chat history here later */}
              </div>
            </ScrollArea>

            {/* Input Area (Pinned to bottom) */}
            <div className="p-4 border-t bg-white shrink-0">
              <div className="relative">
                <Input
                  placeholder="Ask about this topic..."
                  className="pr-10"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full text-muted-foreground hover:text-primary"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
