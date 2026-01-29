"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, Bot, Send, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface LessonResponse {
  content: string;
  title: string;
  type: string;
  estimatedMinutes: number;
  cached: boolean;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function StudySessionPage() {
  const params = useParams();
  const { courseId, topicId } = params as { courseId: string; topicId: string };

  const [responseData, setResponseData] = useState<LessonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");

  // FIX 1: Use a ref specifically for the bottom of the list
  const scrollBottomRef = useRef<HTMLDivElement>(null);
  const threadId = `${courseId}-${topicId}`;

  // 1. Fetch Content
  useEffect(() => {
    const fetchContent = async () => {
      if (!courseId || !topicId) return;
      try {
        setLoading(true);
        const res = await fetch(
          `/api/courses/${courseId}/topics/${topicId}/generate`,
          { method: "POST" },
        );
        if (!res.ok) throw new Error("Failed to load lesson");
        const data = await res.json();
        setResponseData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [courseId, topicId]);

  // FIX 2: Scroll the bottom ref into view whenever messages change
  useEffect(() => {
    if (scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, streamingMessage, isSending]);

  // 3. Handle Send
  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;
    const userMessage = message.trim();
    setMessage("");

    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);
    setIsSending(true);
    setStreamingMessage("");

    try {
      const response = await fetch(
        `/api/courses/${courseId}/topics/${topicId}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            courseId,
            topicId,
            threadId,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulatedMessage += chunk;
          setStreamingMessage(accumulatedMessage);
        }
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: accumulatedMessage },
        ]);
        setStreamingMessage("");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] bg-gray-50 flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="bg-blue-600 text-white px-6 py-4 shadow-md shrink-0 z-10 rounded-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold">
              {loading ? "Loading Lesson..." : responseData?.title}
            </h1>
            <p className="text-indigo-100 text-sm flex items-center gap-2">
              <span>Type: {responseData?.type}</span>
            </p>
          </div>
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-4 text-sm font-medium text-indigo-100">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{responseData?.estimatedMinutes} min estimated</span>
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

      {/* MAIN CONTENT GRID */}
      <main className="flex-1 w-full mx-auto p-4 md:px-0 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* LEFT COL: Learning Content */}
        <div className="lg:col-span-2 h-full overflow-y-auto custom-scrollbar">
          <Card className="border-none shadow-md min-h-full">
            <CardContent className="p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  <p className="text-muted-foreground">Generating lesson...</p>
                </div>
              ) : responseData?.content ? (
                <div className="prose prose-blue max-w-none dark:prose-invert">
                  <ReactMarkdown>{responseData?.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-red-500">
                  <AlertCircle className="h-10 w-10 mb-2" />
                  <p>Failed to load content.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COL: AI Assistant */}
        <div className="lg:col-span-1 h-full flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col border-none shadow-md overflow-hidden min-h-0">
            {/* AI Header */}
            <div className="p-4 border-b flex items-center gap-2 bg-white shrink-0">
              <Bot className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-sm">AI Study Assistant</span>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-hidden min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Initial Message */}
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="bg-white border rounded-lg p-3 text-sm text-gray-700 shadow-sm max-w-[85%]">
                      I've loaded the study material. Ask me anything!
                    </div>
                  </div>

                  {/* Chat Messages */}
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${
                        msg.role === "user" ? "justify-end" : ""
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      <div
                        className={`rounded-lg p-3 text-sm shadow-sm max-w-[85%] min-w-0 ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white border text-gray-700"
                        }`}
                      >
                        {/* FIX: 'grid grid-cols-1' forces children to respect the container width */}
                        <div className="prose prose-sm max-w-none dark:prose-invert grid grid-cols-1 break-words">
                          <ReactMarkdown
                            components={{
                              // Simplified Code Block Handler
                              pre: ({ children }) => (
                                // This outer div handles the scrolling and width constraint
                                <div className="w-full overflow-x-auto my-2 rounded-md bg-gray-900 p-3">
                                  <pre className="text-xs text-gray-100 font-mono">
                                    {children}
                                  </pre>
                                </div>
                              ),
                              code: ({ inline, children, ...props }: any) =>
                                inline ? (
                                  <code
                                    className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs break-all"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                ) : (
                                  <code
                                    className="break-words whitespace-pre-wrap"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                ),
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0 break-words">
                                  {children}
                                </p>
                              ),
                              a: ({ children, href }) => (
                                <a
                                  href={href}
                                  className="text-blue-600 hover:underline break-all"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                      {msg.role === "user" && (
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white text-xs font-semibold">
                          You
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Streaming Message */}
                  {streamingMessage && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="bg-white border rounded-lg p-3 text-sm text-gray-700 shadow-sm max-w-[85%] min-w-0">
                        {/* FIX: Applied 'grid grid-cols-1' here as well */}
                        <div className="prose prose-sm max-w-none dark:prose-invert grid grid-cols-1 break-words">
                          <ReactMarkdown
                            components={{
                              pre: ({ children }) => (
                                <div className="w-full overflow-x-auto my-2 rounded-md bg-gray-900 p-3">
                                  <pre className="text-xs text-gray-100 font-mono">
                                    {children}
                                  </pre>
                                </div>
                              ),
                              code: ({ inline, children, ...props }: any) =>
                                inline ? (
                                  <code
                                    className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs break-all"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                ) : (
                                  <code
                                    className="break-words whitespace-pre-wrap"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                ),
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0 break-words">
                                  {children}
                                </p>
                              ),
                            }}
                          >
                            {streamingMessage}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loading State */}
                  {isSending && !streamingMessage && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="bg-white border rounded-lg p-3 shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}

                  {/* Scroll anchor */}
                  <div ref={scrollBottomRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white shrink-0">
              <div className="relative">
                <Input
                  placeholder="Ask about this topic..."
                  className="pr-10"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading || isSending}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full text-muted-foreground hover:text-primary disabled:opacity-50"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isSending}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
