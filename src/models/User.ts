import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  clerkId: string; // Critical: Links this doc to the Clerk Auth User
  email: string;
  name?: string;

  // Preferences (Always present due to defaults)
  defaultPreferences: {
    quizFrequency: "daily" | "after-topic" | "weekly";
    difficultyPreference: "challenge" | "manageable";
    explanationStyle: "eli5" | "technical" | "examples";
  };

  // Gamification (Always present due to defaults)
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  achievements: string[];

  // Timestamps
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    // Removed avatar field

    defaultPreferences: {
      quizFrequency: {
        type: String,
        enum: ["daily", "after-topic", "weekly"],
        default: "after-topic",
      },
      difficultyPreference: {
        type: String,
        enum: ["challenge", "manageable"],
        default: "manageable",
      },
      explanationStyle: {
        type: String,
        enum: ["eli5", "technical", "examples"],
        default: "eli5",
      },
    },

    totalPoints: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    achievements: {
      type: [String],
      default: [],
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// 3. Create and Export the Model
// We check models.User first to prevent overwriting the model during hot reloads
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
