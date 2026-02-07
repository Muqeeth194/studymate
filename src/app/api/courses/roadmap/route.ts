import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { randomUUID } from "crypto";
import connectDB from "@/db/connectDB";
import LearningPath from "@/models/LearningPath";
import User from "@/models/User";

// 1. Define the Strict Zod Schema
const topicSchema = z.object({
  title: z.string().describe("Title of the specific lesson/topic"),
  type: z
    .enum(["theory", "practical", "project"])
    .describe("Type of learning activity"),
  estimatedMinutes: z
    .number()
    .describe("Estimated time to complete in minutes"),
  description: z.string().describe("Brief description of what will be covered"),
});

const weekSchema = z.object({
  weekNumber: z.number(),
  title: z.string().describe("Theme or main focus of the week"),
  topics: z.array(topicSchema),
});

const roadmapSchema = z.object({
  totalWeeks: z.number(),
  syllabus: z.array(weekSchema),
});

type RoadmapType = z.infer<typeof roadmapSchema>;

export async function POST(req: Request) {
  try {
    // 2. Auth Check
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { topic, level, totalDurationWeeks, projectScope, goals } =
      await req.json();

    // 3. Connect DB & Get User
    await connectDB();
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return new NextResponse(
        "User not found in DB. Please sign out and sign in again.",
        { status: 404 },
      );
    }

    // 4. Initialize Agent
    const model = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.2,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // 5. Create Structured Chain
    const structuredLlm =
      model.withStructuredOutput<RoadmapType>(roadmapSchema);

    // ✅ UPDATED: Prompt now uses totalWeeks and projectScope
    const systemPrompt = `
      You are an expert curriculum designer. 
      Create a detailed learning path for a student with the following profile:
      - Topic: ${topic}
      - Current Level: ${level}
      - Duration: ${totalDurationWeeks} weeks
      - Goal: ${goals}
      - Project Style: ${projectScope}

      Rules:
      1. Break the course into exactly ${totalDurationWeeks} weekly modules.
      2. Project Style Guidelines:
         - If '${projectScope}' is 'small': Include distinct, isolated mini-projects each week.
         - If '${projectScope}' is 'capstone': The projects should build upon each other week-by-week to form one large final application.
         - If '${projectScope}' is 'real-world': Focus on cloning specific features from popular apps (e.g. Netflix slider, Trello board).
      3. Include a mix of Theory and Practical topics.
      4. Be specific with topic titles.
      5. The output must be valid JSON matching the schema provided.
    `;

    // 6. Execute Agent
    console.log(
      `Agent generating ${totalDurationWeeks}-week curriculum for: ${topic}`,
    );
    const aiResponse = await structuredLlm.invoke(systemPrompt);

    // 7. Save to Database
    const newPath = await LearningPath.create({
      userId: user._id,
      topic: topic,
      status: "active",

      preferences: {
        level,
        totalDurationWeeks,
        projectScope,
        goals,
        quizFrequency: "weekly", // Default
      },

      roadmap: {
        totalWeeks: aiResponse.totalWeeks,
        syllabus: aiResponse.syllabus.map((week) => ({
          weekNumber: week.weekNumber,
          title: week.title,
          topics: week.topics.map((t) => ({
            id: randomUUID(),
            title: t.title,
            type: t.type,
            estimatedMinutes: t.estimatedMinutes,
            isCompleted: false,
          })),
        })),
      },

      progress: {
        percentComplete: 0,
        currentWeek: 1,
        completedTopicIds: [],
        totalStudyMinutes: 0,
      },
    });

    console.log("Course created successfully with ID:", newPath._id);

    return NextResponse.json({ courseId: newPath._id });
  } catch (error: any) {
    console.error("Course Generation Error:", error);
    return new NextResponse(error.message || "Internal Server Error", {
      status: 500,
    });
  }
}
