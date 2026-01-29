import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/db/connectDB";
import LearningPath from "@/models/LearningPath";
import User from "@/models/User";
import { updateCourseProgress } from "@/lib/progress-helper";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; topicId: string }> },
) {
  try {
    const { userId } = await auth();
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

    if (!targetTopic || !targetTopic.quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    // 1. Calculate Score
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
    const PASS_THRESHOLD = 70;

    // 2. Update Status based on 70% Threshold
    targetTopic.quizScore = percentage;

    if (percentage >= PASS_THRESHOLD) {
      targetTopic.quizStatus = "passed";
      targetTopic.isCompleted = true; // Unlocks next topic
    } else {
      targetTopic.quizStatus = "failed";
      targetTopic.isCompleted = false; // Keeps next topic locked
    }

    // 3. Save
    course.markModified("roadmap.syllabus");
    await course.save();

    // 4. Update Global Progress
    // We update progress regardless of pass/fail to record study minutes,
    // but the percentage only moves if they passed (handled inside helper)
    await updateCourseProgress(course._id.toString());

    return NextResponse.json({
      passed: percentage >= PASS_THRESHOLD,
      score: percentage,
      results,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
