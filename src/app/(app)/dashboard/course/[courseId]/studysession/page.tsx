"use client";

import { useState } from "react";
import {
  Clock,
  Target,
  Bot,
  ChevronLeft,
  Send,
  MoreVertical,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function StudySessionPage() {
  const params = useParams();

  // Mock Data to match image
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. FOCUS HEADER */}
      <header className="bg-blue-600 text-white px-6 py-4 shadow-md rounded-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 ">
          <div className="space-y-1">
            <h1 className="text-xl font-bold">
              useState & useEffect Deep Dive
            </h1>
            <p className="text-indigo-100 text-sm flex items-center gap-2">
              <span>Session 2 of 8</span>
              <span>•</span>
              <span>Chapter 3: React Textbook</span>
            </p>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm font-medium text-indigo-100">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>23:45 elapsed</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>65% complete</span>
              </div>
            </div>

            {/* End Session Action */}
            <Link href={`/dashboard/course/${params.courseId}`}>
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

      {/* 2. MAIN CONTENT GRID */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Learning Content (Takes 2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md h-full">
            <CardContent className="p-8 space-y-8">
              {/* Content Header */}
              <div>
                <h2 className="text-2xl font-bold font-headline mb-4">
                  Understanding useEffect Hook
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  The{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-primary">
                    useEffect
                  </code>{" "}
                  Hook lets you perform side effects in function components. It
                  serves the same purpose as{" "}
                  <code className="text-xs">componentDidMount</code>,{" "}
                  <code className="text-xs">componentDidUpdate</code>, and{" "}
                  <code className="text-xs">componentWillUnmount</code> in React
                  class components, but unified into a single API.
                </p>
              </div>

              {/* Key Concept Box (blue styling from image) */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                <h3 className="text-blue-700 font-bold text-sm mb-1 uppercase tracking-wide">
                  Key Concept
                </h3>
                <p className="text-blue-900 text-sm">
                  Effects run after every completed render by default, but you
                  can control when they execute by passing a dependency array.
                </p>
              </div>

              {/* Code Snippet (Dark theme) */}
              <div className="rounded-lg overflow-hidden bg-[#1e1e1e] text-gray-300 font-mono text-sm shadow-inner">
                <div className="bg-[#2d2d2d] px-4 py-2 text-xs text-gray-400 flex justify-between">
                  <span>Basic useEffect example</span>
                  <span>JSX</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre>{`useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]); // Only re-run if count changes`}</pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Take Quiz
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Practice Exercise
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: AI Assistant (Takes 1/3 width) */}
        <div className="lg:col-span-1">
          <Card className="h-[600px] flex flex-col border-none shadow-md">
            {/* AI Header */}
            <div className="p-4 border-b flex items-center gap-2 bg-white rounded-t-lg">
              <Bot className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-sm">AI Study Assistant</span>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4 bg-gray-50/50">
              <div className="space-y-4">
                {/* Bot Message */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="bg-white border rounded-lg p-3 text-sm text-gray-700 shadow-sm max-w-[85%]">
                    I noticed you're learning about useEffect. Would you like me
                    to explain the cleanup function?
                  </div>
                </div>

                {/* User Message */}
                <div className="flex gap-3 flex-row-reverse">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold">ME</span>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-800 max-w-[85%]">
                    Yes, please explain with an example
                  </div>
                </div>

                {/* Bot Message */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="bg-white border rounded-lg p-3 text-sm text-gray-700 shadow-sm max-w-[85%]">
                    Great! The cleanup function in useEffect is crucial for
                    preventing memory leaks...
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-white rounded-b-lg">
              <div className="relative">
                <Input
                  placeholder="Ask about this topic..."
                  className="pr-10"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
