import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { studyBuddyGraph } from "@/ai/study-buddy";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import connectDB from "@/db/connectDB";
import LearningPath from "@/models/LearningPath";
import User from "@/models/User";
import { SystemMessage } from "@langchain/core/messages";

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

    // 2. Fetch Context (User, Course, Topic)
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const course = await LearningPath.findOne({
      _id: courseId,
      userId: user._id,
    });
    if (!course) return new NextResponse("Course not found", { status: 404 });

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

    // 3. Graph config (thread-aware)
    const config = {
      configurable: {
        thread_id: threadId || `${userId}-${courseId}-${topicId}`,
      },
    };

    // 4. Check if this is the first message in the thread
    const state = await studyBuddyGraph.getState(config);
    const isFirstMessage =
      !state.values.messages || state.values.messages.length === 0;

    // 5. Inject CONTEXT message ONCE (NOT a system prompt)
    if (isFirstMessage) {
      // Update the graph state with the topic details
      await studyBuddyGraph.updateState(config, {
        messages: [
          new SystemMessage(
            `
STUDY CONTEXT (AUTHORITATIVE — DO NOT IGNORE):

User Name: ${user.name ?? "Buddy"}
Learning Level: ${course.preferences?.level ?? "unspecified"}

ACTIVE LEARNING TOPIC:
${topicTitle}

LESSON CONTENT:
${topicContent.slice(0, 20000)}
    `.trim(),
          ),
        ],
      });
    }

    // 6. User input
    const inputs = {
      messages: [new HumanMessage(message)],
    };

    // 7. Stream Response Back
    const encoder = new TextEncoder();

    const customStream = new ReadableStream({
      async start(controller) {
        try {
          const eventStream = studyBuddyGraph.streamEvents(inputs, {
            ...config,
            version: "v2",
          });

          for await (const event of eventStream) {
            if (
              event.event === "on_chat_model_stream" &&
              event.data?.chunk?.content
            ) {
              const content = event.data.chunk.content;
              if (typeof content === "string" && content.length > 0) {
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
