"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectDB from "@/db/connectDB";
import LearningPath from "@/models/LearningPath";
import User from "@/models/User";

export async function continueLearning(courseId: string) {
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

  // 3. Find the first INCOMPLETE topic
  let nextTopicId = null;

  for (const week of course.roadmap.syllabus) {
    for (const topic of week.topics) {
      if (!topic.isCompleted) {
        nextTopicId = topic.id;
        break;
      }
    }
    if (nextTopicId) break;
  }

  // 4. Redirect Logic
  // In Server Actions, redirect() throws an error that Next.js catches to handle navigation.
  if (nextTopicId) {
    redirect(`/dashboard/course/${courseId}/topic/${nextTopicId}/studysession`);
  } else {
    // Fallback to the last topic if everything is done
    const lastWeek =
      course.roadmap.syllabus[course.roadmap.syllabus.length - 1];
    const lastTopic = lastWeek.topics[lastWeek.topics.length - 1];
    redirect(
      `/dashboard/course/${courseId}/topic/${lastTopic.id}/studysession`,
    );
  }
}
