import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { lessonGraph } from "@/ai/lesson-generator";
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

    // --- GATEKEEPER RESTRICTION LOGIC START ---
    // Flatten syllabus to identify the sequence and find the previous topic
    let flatTopics: any[] = [];
    let currentGlobalIndex = -1;

    course.roadmap.syllabus.forEach((week: any) => {
      week.topics.forEach((topic: any) => {
        flatTopics.push(topic);
        if (topic.id === topicId) {
          currentGlobalIndex = flatTopics.length - 1;
        }
      });
    });

    // Check if this is NOT the first topic
    if (currentGlobalIndex > 0) {
      const previousTopic = flatTopics[currentGlobalIndex - 1];

      // If the previous topic is NOT complete, block access
      if (!previousTopic.isCompleted) {
        return NextResponse.json(
          {
            error: "LOCKED",
            message: `Please complete the quiz for '${previousTopic.title}' before proceeding.`,
          },
          { status: 403 },
        );
      }
    }
    // --- GATEKEEPER RESTRICTION LOGIC END ---

    // 3. COST SAVER: If content exists, return it immediately (don't regenerate)
    if (foundTopic.markdownContent) {
      return NextResponse.json({
        content: foundTopic.markdownContent,
        title: foundTopic.title,
        type: foundTopic.type,
        estimatedMinutes: foundTopic.estimatedMinutes,
        cached: true,
      });
    }

    // 4. GENERATE CONTENT (Using Researcher Graph)
    console.log(`🔍 Starting Researcher Graph for topic: ${foundTopic.title}`);

    // The graph handles planning -> searching -> fetching docs -> writing
    // We pass the context required by the updated graph state
    const graphResponse = await lessonGraph.invoke({
      topic: foundTopic.title,
      courseTopic: course.topic,
      studentLevel: course.preferences.level,
      lessonType: foundTopic.type,
      estimatedTime: foundTopic.estimatedMinutes,
    });

    const generatedContent = graphResponse.finalLesson;

    // 5. Save to MongoDB
    // We modify the document directly and save() to persist changes
    course.roadmap.syllabus[weekIndex].topics[topicIndex].markdownContent =
      generatedContent;
    await course.save();

    return NextResponse.json({
      content: generatedContent,
      title: foundTopic.title,
      type: foundTopic.type,
      estimatedMinutes: foundTopic.estimatedMinutes,
      cached: false,
    });
  } catch (error: any) {
    console.error("Content Generation Error:", error);
    return new NextResponse(error.message || "Internal Server Error", {
      status: 500,
    });
  }
}
