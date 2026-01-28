import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ChatOpenAI } from "@langchain/openai";
import connectDB from "@/db/connectDB";
import LearningPath from "@/models/LearningPath";
import User from "@/models/User";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; topicId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { courseId, topicId } = await params;

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return new NextResponse("User not found", { status: 404 });

    // 1. Fetch the Course
    const course = await LearningPath.findOne({
      _id: courseId,
      userId: user._id,
    });

    if (!course) return new NextResponse("Course not found", { status: 404 });

    // 2. Find the specific Topic in the nested arrays
    // We have to loop through weeks -> topics to find the matching ID
    let foundTopic = null;
    let weekIndex = -1;
    let topicIndex = -1;

    for (let i = 0; i < course.roadmap.syllabus.length; i++) {
      const week = course.roadmap.syllabus[i];
      const tIndex = week.topics.findIndex((t: any) => t.id === topicId);

      if (tIndex !== -1) {
        foundTopic = week.topics[tIndex];
        weekIndex = i;
        topicIndex = tIndex;
        break;
      }
    }

    if (!foundTopic) {
      return new NextResponse("Topic not found", { status: 404 });
    }

    // 3. COST SAVER: If content exists, return it immediately (don't regenerate)
    if (foundTopic.markdownContent) {
      return NextResponse.json({
        content: foundTopic.markdownContent,
        cached: true,
      });
    }

    // 4. Initialize LLM
    const model = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.3, // Slightly higher than 0 to allow for creative explanations
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // 5. Generate Content
    console.log(`Generating content for topic: ${foundTopic.title}`);

    const systemPrompt = `
      You are a Senior Software Engineer and expert tutor. 
      Your task is to write a comprehensive, engaging study module for a student.

      Context:
      - Course Topic: ${course.topic}
      - Student Level: ${course.preferences.level}
      - Current Lesson: ${foundTopic.title}
      - Lesson Type: ${foundTopic.type} (theory/practical/project)

      Requirements:
      1. Structure the response in clean Markdown.
      2. Start with a "Concept Overview".
      3. If type is "practical", provide heavy code examples with comments.
      4. If type is "theory", use analogies and real-world examples.
      5. Include a "Common Pitfalls" section.
      6. End with a brief "Summary".
      7. Keep the tone encouraging but technical.
    `;

    const aiResponse = await model.invoke(systemPrompt);
    const generatedContent = aiResponse.content as string;

    // 6. Save to MongoDB
    // We modify the document directly and save() to persist changes
    course.roadmap.syllabus[weekIndex].topics[topicIndex].markdownContent =
      generatedContent;
    await course.save();

    return NextResponse.json({
      content: generatedContent,
      cached: false,
    });
  } catch (error: any) {
    console.error("Content Generation Error:", error);
    return new NextResponse(error.message || "Internal Server Error", {
      status: 500,
    });
  }
}
