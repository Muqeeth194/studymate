import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectDB from "@/db/connectDB";
import LearningPath from "@/models/LearningPath";
import User from "@/models/User";

// This is a Server Component (no 'use client') so it runs instantly on the server
export default async function StudySessionRedirect({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const { userId } = await auth();

  if (!userId) return redirect("/");

  await connectDB();

  // 1. Get the user (to map Clerk ID to Mongo ID)
  const user = await User.findOne({ clerkId: userId });
  if (!user) return redirect("/");

  // 2. Fetch the Course
  const course = await LearningPath.findOne({
    _id: courseId,
    userId: user._id,
  });

  if (!course) return redirect("/dashboard");

  // 3. Find the first INCOMPLETE topic
  // We flatten the syllabus structure to search efficiently
  let nextTopicId = null;

  // Loop through weeks
  for (const week of course.roadmap.syllabus) {
    // Loop through topics in that week
    for (const topic of week.topics) {
      if (!topic.isCompleted) {
        nextTopicId = topic.id;
        break; // Found it!
      }
    }
    if (nextTopicId) break; // Break outer loop if found
  }

  // 4. Redirect Logic
  if (nextTopicId) {
    // If we found an incomplete topic, go there
    return redirect(`/dashboard/course/${courseId}/topic/${nextTopicId}`);
  } else {
    // If ALL topics are complete, maybe send them to the roadmap or a "Course Complete" page
    // For now, let's send them to the last topic of the last week as a fallback
    const lastWeek =
      course.roadmap.syllabus[course.roadmap.syllabus.length - 1];
    const lastTopic = lastWeek.topics[lastWeek.topics.length - 1];
    return redirect(`/dashboard/course/${courseId}/topic/${lastTopic.id}`);
  }
}
