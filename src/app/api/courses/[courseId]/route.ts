import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/db/connectDB";
import LearningPath from "@/models/LearningPath";
import User from "@/models/User"; // Don't forget this import

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { courseId } = await params;

    await connectDB();

    // 1. Find the internal MongoDB User ID using the Clerk ID
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // 2. Find the course AND confirm ownership in one query
    const course = await LearningPath.findOne({
      _id: courseId,
      userId: user._id, // This prevents users from accessing others' courses
    });

    if (!course) {
      // If it doesn't exist OR doesn't belong to them, return 404
      return new NextResponse("Course not found", { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
