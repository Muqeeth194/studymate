import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { studyBuddyGraph } from "@/ai/study-buddy";
import { HumanMessage } from "@langchain/core/messages";
import connectDB from "@/db/connectDB";
import LearningPath from "@/models/LearningPath";
import User from "@/models/User";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; topicId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // 1. Parse Input
    const body = await req.json();
    const { message, threadId } = body;
    const { courseId, topicId } = await params;

    if (!message) {
      return new NextResponse("Message is required", { status: 400 });
    }

    // 2. Fetch Context (The Lesson Content)
    await connectDB();
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const course = await LearningPath.findOne({
      _id: courseId,
      userId: user._id,
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Locate the topic to get its markdown content
    let topicContent = "";
    let topicTitle = "";

    for (const week of course.roadmap.syllabus) {
      const topic = week.topics.find((t: any) => t.id === topicId);
      if (topic) {
        topicContent = topic.markdownContent || "No content generated yet.";
        topicTitle = topic.title;
        break;
      }
    }

    if (!topicTitle) {
      return new NextResponse("Topic not found", { status: 404 });
    }

    // 3. Define the System Prompt (Context Injection)
    const systemPrompt = `You are an expert AI Tutor and Senior Software Engineer.

**YOUR GOAL:** Help the student understand the topic: "${topicTitle}".

**CONTEXT (The Lesson Material):**
"""
${topicContent.slice(0, 20000)}
"""

**INSTRUCTIONS:**
1. Answer questions primarily using the provided CONTEXT.
2. If the user is confused, explain using simple analogies and examples.
3. If the user asks for a quiz, call the 'generate_quiz' tool.
4. Keep answers concise with limited words. No need to generate huge content. Answer in the summarized way with examples. 
5. Do not just repeat the text, explain it in your own words.
6. Use markdown formatting for code examples and structured content.

Be helpful, patient, and educational.`;

    // 4. Run the Graph with Streaming
    const config = {
      configurable: {
        thread_id: threadId || `${userId}-${courseId}-${topicId}`,
      },
    };

    // Create the input - on first message, include system prompt
    // The graph will handle maintaining conversation history via checkpointer
    const inputs = {
      messages: [new HumanMessage(message)],
    };

    // For the first message in a thread, we should inject the system prompt
    // This is a simplified approach - you might want to track this better
    const state = await studyBuddyGraph.getState(config);
    const isFirstMessage =
      !state.values.messages || state.values.messages.length === 0;

    if (isFirstMessage) {
      // Inject system prompt by updating the graph state
      await studyBuddyGraph.updateState(config, {
        messages: [{ role: "system", content: systemPrompt }],
      });
    }

    // 5. Stream Response Back
    const encoder = new TextEncoder();
    let fullResponse = "";

    const customStream = new ReadableStream({
      async start(controller) {
        try {
          // Use streamEvents for token-by-token streaming
          const eventStream = studyBuddyGraph.streamEvents(inputs, {
            ...config,
            version: "v2",
          });

          for await (const event of eventStream) {
            // We're looking for streaming tokens from the LLM
            if (
              event.event === "on_chat_model_stream" &&
              event.data?.chunk?.content
            ) {
              const content = event.data.chunk.content;
              if (typeof content === "string" && content.length > 0) {
                fullResponse += content;
                controller.enqueue(encoder.encode(content));
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(customStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: any) {
    console.error("Chat Error:", error);
    return new NextResponse(error.message || "Internal Server Error", {
      status: 500,
    });
  }
}
