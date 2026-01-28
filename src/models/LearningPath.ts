import mongoose, { Schema, Document, Model } from "mongoose";

// Sub-schema for individual topics
const TopicSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ["theory", "practical", "quiz", "project"],
    required: true,
  },
  estimatedMinutes: { type: Number, required: true },
  isCompleted: { type: Boolean, default: false },
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
