import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/db/connectDB";
import LearningPath from "@/models/LearningPath";
import User from "@/models/User";
import { studyBuddyGraph } from "@/ai/study-buddy";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

// Define strict output structure for the Quiz
const QuizOutputSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correctAnswer: z
          .string()
          .describe("Must be an exact string match to one of the options"),
        explanation: z
          .string()
          .describe("Brief explanation of why this answer is correct"),
      }),
    )
    .min(10)
    .max(15),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; topicId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // const body = await req.json();
    // const { userId } = body;
    const { courseId, topicId } = await params;

    await connectDB();
    const user = await User.findOne({ clerkId: userId });

    // 1. Fetch Course & Topic Data
    const course = await LearningPath.findOne({
      _id: courseId,
      userId: user._id,
    });
    if (!course) return new NextResponse("Course not found", { status: 404 });

    // Locate the topic
    let targetTopic = null;
    let topicTitle = "";
    let topicContent = "";

    for (const week of course.roadmap.syllabus) {
      const t = week.topics.find((t: any) => t.id === topicId);
      if (t) {
        targetTopic = t;
        topicTitle = t.title;
        topicContent = t.markdownContent || "";
        break;
      }
    }

    if (!targetTopic)
      return new NextResponse("Topic not found", { status: 404 });

    // Prevent re-generating if passed
    if (targetTopic.quizStatus === "passed") {
      return NextResponse.json({
        message: "Quiz already passed",
        quiz: targetTopic.quiz,
      });
    }

    // Prevent re-generating if generated
    if (targetTopic.quizStatus === "generated") {
      return NextResponse.json({
        message: "Quiz is Already Generated",
        quiz: targetTopic.quiz,
      });
    }

    // 2. Retrieve Chat History from LangGraph State
    // We use the same thread_id logic: `${userId}-${courseId}-${topicId}`
    const threadId = `${userId}-${courseId}-${topicId}`;
    const graphConfig = { configurable: { thread_id: threadId } };

    let userContext = "No prior questions asked.";
    try {
      const state = await studyBuddyGraph.getState(graphConfig);
      if (state.values.messages && state.values.messages.length > 0) {
        // Get last 10 messages to analyze user struggles
        const relevantMsgs = state.values.messages.slice(-10);
        userContext = relevantMsgs
          .map((m: any) => `${m.role}: ${m.content}`)
          .join("\n");
      }
    } catch (e) {
      console.log("No chat history found, proceeding with generic quiz.");
    }

    // 3. Generate Quiz (Structured Output)
    const model = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.5,
    }).withStructuredOutput(QuizOutputSchema);

    const prompt = `
      Generate a customized quiz for the topic: "${topicTitle}".
      
      **TOPIC MATERIAL:**
      ${topicContent.slice(0, 15000)}

      **USER'S RECENT QUESTIONS (Address their confusion):**
      ${userContext}

      **INSTRUCTIONS:**
      1. Generate 10-15 multiple-choice questions.
      2. Ensure 4 options per question.
      3. Focus on key concepts and specifically target areas where the user asked questions in the chat history.
    `;

    const generatedQuiz = await model.invoke(prompt);

    // ---------------------------------------------------------
    // CRITICAL FIX: Re-fetch the document to get the latest version
    // ---------------------------------------------------------
    const freshCourse = await LearningPath.findOne({ _id: courseId });

    if (!freshCourse) {
      return new NextResponse("Course no longer exists", { status: 404 });
    }

    // 2. Find the topic again in the FRESH document
    let freshTopic = null;
    for (const week of freshCourse.roadmap.syllabus) {
      const t = week.topics.find((t: any) => t.id === topicId);
      if (t) {
        freshTopic = t;
        break;
      }
    }

    if (!freshTopic) {
      return new NextResponse("Topic not found during save", { status: 404 });
    }

    // 3. Update the FRESH topic
    freshTopic.quiz = generatedQuiz.questions;
    freshTopic.quizStatus = "generated";

    // 4. Save the FRESH document
    freshCourse.markModified("roadmap.syllabus");
    await freshCourse.save();

    // 5. Return Response
    const clientSideQuiz = generatedQuiz.questions.map((q: any) => ({
      question: q.question,
      options: q.options,
    }));

    return NextResponse.json({ success: true, quiz: clientSideQuiz });
  } catch (error: any) {
    console.error("Quiz Gen Error:", error);
    return new NextResponse(error.message, { status: 500 });
  }
}
