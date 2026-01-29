import mongoose, { Schema, Document, Model } from "mongoose";

// Add these interfaces to your existing file
interface QuizQuestion {
  question: string;
  options: string[]; // Array of 4 options
  correctAnswer: string; // The correct string matches one option
  explanation: string; // Why it's correct
}

// Update the Topic Interface
interface ITopic {
  id: string;
  title: string;
  isCompleted: boolean;
  markdownContent?: string;
  // NEW FIELDS
  quizStatus: "pending" | "generated" | "passed" | "failed";
  quiz?: QuizQuestion[];
  quizScore?: number;
}

// Sub-schema for individual topics
const QuizQuestionSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true }, // Stored securely
  explanation: { type: String },
});

const TopicSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  markdownContent: { type: String },
  type: { type: String, default: "theory" },
  estimatedMinutes: { type: Number, default: 15 },
  // NEW FIELDS
  quizStatus: {
    type: String,
    enum: ["pending", "generated", "passed", "failed"],
    default: "pending",
  },
  quiz: [QuizQuestionSchema],
  quizScore: { type: Number, default: 0 },
});

// Sub-schema for Weeks
const WeekSchema = new Schema({
  weekNumber: { type: Number, required: true },
  title: { type: String, required: true },
  topics: [TopicSchema],
});

export interface ILearningPath extends Document {
  userId: mongoose.Types.ObjectId;
  topic: string;
  status: "generating" | "active" | "completed" | "archived";
  preferences: {
    level: string;
    totalDurationWeeks: number;
    goals: string;
    projectScope: "small" | "capstone" | "real-world";
    quizFrequency: string;
  };
  roadmap: {
    totalWeeks: number;
    syllabus: any[];
  };
  progress: {
    percentComplete: number;
    currentWeek: number;
    completedTopicIds: string[];
    totalStudyMinutes: number;
    lastStudySession: Date;
  };
}

const LearningPathSchema: Schema<ILearningPath> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["generating", "active", "completed", "archived"],
      default: "generating",
      index: true,
    },

    preferences: {
      level: { type: String, required: true },
      totalDurationWeeks: { type: Number, required: true },
      goals: { type: String },
      projectScope: {
        type: String,
        enum: ["small", "capstone", "real-world"],
        default: "small",
      },
      quizFrequency: { type: String },
    },

    roadmap: {
      totalWeeks: { type: Number },
      syllabus: [WeekSchema],
    },

    progress: {
      percentComplete: { type: Number, default: 0 },
      currentWeek: { type: Number, default: 1 },
      completedTopicIds: { type: [String], default: [] },
      totalStudyMinutes: { type: Number, default: 0 },
      lastStudySession: { type: Date },
    },
  },
  {
    timestamps: true,
  },
);

LearningPathSchema.index({ userId: 1, status: 1 });

const LearningPath: Model<ILearningPath> =
  mongoose.models.LearningPath ||
  mongoose.model<ILearningPath>("LearningPath", LearningPathSchema);

export default LearningPath;
