"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectDB from "@/db/connectDB";
import LearningPath from "@/models/LearningPath";
import User from "@/models/User";

export async function continueQuiz(courseId: string) {
  const { userId } = await auth();
  if (!userId) return redirect("/");

  await connectDB();

  // 1. Get the user
  const user = await User.findOne({ clerkId: userId });
  if (!user) return redirect("/");

  // 2. Fetch the Course
  const course = await LearningPath.findOne({
    _id: courseId,
    userId: user._id,
  });

  if (!course) return redirect("/dashboard");

  // 3. Find the first topic with an INCOMPLETE quiz
  let nextQuizTopicId = null;

  for (const week of course.roadmap.syllabus) {
    for (const topic of week.topics) {
      // Check if quiz is NOT passed (pending, generated, or failed)
      if (topic.quizStatus !== "passed") {
        nextQuizTopicId = topic.id;
        break;
      }
    }
    if (nextQuizTopicId) break;
  }

  // 4. Redirect Logic
  if (nextQuizTopicId) {
    redirect(`/dashboard/course/${courseId}/topic/${nextQuizTopicId}/quiz`);
  } else {
    // Fallback: If all quizzes passed, go to the last topic's quiz page (Review mode)
    const lastWeek =
      course.roadmap.syllabus[course.roadmap.syllabus.length - 1];
    const lastTopic = lastWeek.topics[lastWeek.topics.length - 1];
    redirect(`/dashboard/course/${courseId}/topic/${lastTopic.id}/quiz`);
  }
}
