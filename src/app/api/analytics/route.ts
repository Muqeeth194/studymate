import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/db/connectDB";
import LearningPath from "@/models/LearningPath";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return new NextResponse("User not found", { status: 404 });

    // Fetch ALL courses for this user
    const courses = await LearningPath.find({ userId: user._id });

    // --- AGGREGATION LOGIC ---
    let totalCourses = courses.length;
    let completedCourses = 0;
    let totalTopics = 0;
    let completedTopics = 0;
    let totalQuizScore = 0;
    let quizzesTaken = 0;
    let totalEstimatedMinutes = 0;
    let minutesSpent = 0;

    // Data for Charts
    const coursePerformance = courses.map((course) => {
      let courseTotalScore = 0;
      let courseQuizzes = 0;
      let courseCompletedTopics = 0;
      let courseTotalTopics = 0;

      course.roadmap.syllabus.forEach((week: any) => {
        week.topics.forEach((topic: any) => {
          totalTopics++;
          courseTotalTopics++;
          totalEstimatedMinutes += topic.estimatedMinutes || 0;

          if (topic.isCompleted) {
            completedTopics++;
            courseCompletedTopics++;
            minutesSpent += topic.estimatedMinutes || 0;
          }

          if (topic.quizScore !== undefined && topic.quizStatus !== "pending") {
            totalQuizScore += topic.quizScore;
            quizzesTaken++;
            courseTotalScore += topic.quizScore;
            courseQuizzes++;
          }
        });
      });

      // Check if course is fully complete
      if (
        courseCompletedTopics === courseTotalTopics &&
        courseTotalTopics > 0
      ) {
        completedCourses++;
      }

      return {
        name: course.topic,
        avgScore:
          courseQuizzes > 0 ? Math.round(courseTotalScore / courseQuizzes) : 0,
        progress:
          courseTotalTopics > 0
            ? Math.round((courseCompletedTopics / courseTotalTopics) * 100)
            : 0,
      };
    });

    const globalAvgScore =
      quizzesTaken > 0 ? Math.round(totalQuizScore / quizzesTaken) : 0;
    const overallProgress =
      totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return NextResponse.json({
      stats: {
        totalCourses,
        completedCourses,
        totalTopics,
        completedTopics,
        globalAvgScore,
        overallProgress,
        minutesSpent,
        totalEstimatedMinutes,
      },
      charts: {
        coursePerformance, // Array of { name, avgScore, progress }
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
