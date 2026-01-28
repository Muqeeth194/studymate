import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/db/connectDB";
import LearningPath from "@/models/LearningPath";
import User from "@/models/User";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });

    if (!user) return new NextResponse("User not found", { status: 404 });

    // Fetch only necessary fields for the sidebar/list
    const courses = await LearningPath.find({ userId: user._id })
      .select("topic status progress.percentComplete updatedAt")
      .sort({ updatedAt: -1 }); // Most recent first

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
