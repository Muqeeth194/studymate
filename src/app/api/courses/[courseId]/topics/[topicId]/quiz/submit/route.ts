import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/db/connectDB";
import LearningPath from "@/models/LearningPath";
import User from "@/models/User";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; topicId: string }> },
) {
  try {
    const { userId } = await auth();
    // userAnswers is an array of selected strings matching the options
    const { userAnswers } = await req.json();
    const { courseId, topicId } = await params;

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    const course = await LearningPath.findOne({
      _id: courseId,
      userId: user._id,
    });

    let targetTopic = null;
    for (const week of course.roadmap.syllabus) {
      const t = week.topics.find((t: any) => t.id === topicId);
      if (t) {
        targetTopic = t;
        break;
      }
    }

    if (!targetTopic || !targetTopic.quiz || targetTopic.quiz.length === 0) {
      return new NextResponse("Quiz not generated yet", { status: 404 });
    }

    // 1. Grading Logic
    let correctCount = 0;
    const totalQuestions = targetTopic.quiz.length;

    const results = targetTopic.quiz.map((q: any, index: number) => {
      const selected = userAnswers[index];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        questionIndex: index,
        isCorrect,
        userSelected: selected,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      };
    });

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const PASS_THRESHOLD = 70; // 70% required to pass

    // 2. Update Database
    targetTopic.quizScore = percentage;

    if (percentage >= PASS_THRESHOLD) {
      targetTopic.quizStatus = "passed";
      targetTopic.isCompleted = true; // <--- UNLOCKS NEXT TOPIC
    } else {
      targetTopic.quizStatus = "failed";
      targetTopic.isCompleted = false;
    }

    course.markModified("roadmap.syllabus");
    await course.save();

    return NextResponse.json({
      passed: percentage >= PASS_THRESHOLD,
      score: percentage,
      results, // Frontend can now show which were wrong + explanations
    });
  } catch (error: any) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
