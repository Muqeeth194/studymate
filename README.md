# 🎓 StudyMate AI

**Master Any Topic with Your Personal AI Learning Companion**

StudyMate AI is an intelligent learning platform that generates personalized course roadmaps, provides interactive study sessions, and uses a context-aware AI tutor to help users master new skills. It features a **gatekeeper progression system** where learners must pass adaptive quizzes to unlock subsequent lessons.

🔗 **[Try it live](https://studymate-sigma-six.vercel.app/)**

---

## ✨ Key Features

- **🗺️ Personalized Learning Roadmaps**  
  AI-generated week-by-week study plans tailored to your skill level (Beginner/Intermediate/Advanced), time commitment, and learning goals

- **🤖 Context-Aware AI Tutor**  
  Built with **LangGraph**, the tutor remembers conversation history, user identity, and your active learning topic. It stays focused on your studies while allowing natural conversation and clarifications

- **🔒 Progressive Learning System**  
  Future lessons remain locked until you pass the current topic's quiz with a score of **70% or higher**, ensuring mastery before advancement

- **📝 Adaptive Quizzes**  
  Multiple-choice quizzes dynamically generated based on the exact lesson content and your performance level

- **📊 Smart Analytics Dashboard**  
  Visualize your study time, completion rates, and quiz performance with interactive charts powered by **Recharts**

- **🔐 Secure Authentication**  
  Complete sign-up and sign-in flows with email verification powered by **Clerk**

- **🎨 Modern, Responsive UI**  
  Beautiful interface built with **Shadcn UI**, **Tailwind CSS**, and **Lucide Icons** that works seamlessly across all devices

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** Shadcn UI, Radix UI
- **Icons:** Lucide React
- **Charts:** Recharts

### Backend & Database

- **Database:** MongoDB (via Mongoose)
- **Authentication:** Clerk
- **API Layer:** Next.js Route Handlers & Server Actions

### AI & LLM

- **Model:** OpenAI GPT-4o
- **Orchestration:** LangChain
- **State Management:** LangGraph
- **Memory:** MongoDB Checkpointer (persistent chat history)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** v18 or higher
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB)
- **OpenAI API** key
- **Clerk** account

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/studymate-ai.git
cd studymate-ai
```

2. **Install dependencies**

```bash
npm install
# OR
yarn install
```

3. **Install LangGraph specific dependencies**

```bash
npm install @langchain/langgraph @langchain/langgraph-checkpoint-mongodb mongodb
```

4. **Set up environment variables**  
   Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/studymate

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# AI
OPENAI_API_KEY=sk-...
```

5. **Run the development server**

```bash
npm run dev
```

6. **Open your browser**  
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🧠 AI Architecture

### 1. The "Gatekeeper" Progression System

We implement a strict progression system to ensure mastery before advancing.

- **Logic:** Topic B cannot be accessed until Topic A is marked as `isCompleted`
- **Trigger:** Completing a quiz with a score of ≥70% triggers a server-side update to unlock the next node in the MongoDB syllabus
- **Purpose:** Ensures learners master fundamentals before moving to advanced concepts

### 2. LangGraph Memory System

Unlike standard stateless chatbots, our AI tutor uses **LangGraph with MongoDB Checkpointing** for intelligent, contextual conversations.

- **Persistence:** Every chat message is saved to a `checkpoints` collection in MongoDB, keyed by `thread_id`
- **Context Injection:** When a user enters a chat, we inject a specialized system message containing:
  - User's name and skill level
  - Current course topic
  - Lesson content and objectives
- **Guardrails:** The system prompt uses Chain of Thought reasoning to detect and refuse off-topic questions (sports, politics, etc.) to keep users focused on studying

### 3. Dynamic Content Generation

- **Roadmap Generation:** AI analyzes user preferences (topic, level, time commitment, goals) to create personalized week-by-week learning plans
- **Quiz Generation:** Questions are dynamically created based on lesson content, ensuring alignment with what was taught
- **Adaptive Difficulty:** Quiz difficulty adjusts based on user performance and selected proficiency level

---

## 📂 Project Structure

```
studymate-ai/
├── src/
│   ├── app/
│   │   ├── api/              # Backend API routes (Courses, Quizzes, Analytics)
│   │   ├── (auth)/           # Clerk authentication pages
│   │   ├── dashboard/        # Protected application routes
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── dashboard/        # Dashboard components (RoadmapView, StatCard)
│   │   ├── ui/               # Shadcn UI reusable components
│   │   └── landing/          # Landing page sections (Hero, Features)
│   ├── lib/
│   │   ├── ai/               # LangChain/LangGraph configuration
│   │   └── utils.ts          # Helper functions
│   ├── models/               # Mongoose schemas (User, LearningPath, Quiz)
│   └── db/                   # Database connection logic
├── public/                   # Static assets
├── .env.local               # Environment variables (not committed)
└── package.json
```

---

## 🎯 How It Works

### User Journey

1. **Sign Up** → User creates an account via Clerk authentication
2. **Onboarding** → Complete 7-step questionnaire about learning preferences:
   - Topic selection
   - Skill level (Beginner/Intermediate/Advanced)
   - Time commitment (hours/week)
   - Target completion date
   - Learning style (Visual/Reading/Hands-on/Mixed)
   - Learning goals
   - Optional: Upload study materials
3. **Roadmap Generation** → AI generates personalized week-by-week study plan
4. **Study & Learn** → Access lessons with AI tutor support
5. **Quiz & Progress** → Pass quizzes (≥70%) to unlock next lessons
6. **Track Performance** → Monitor progress via analytics dashboard

### Data Flow

```
User Input → AI Processing (GPT-4o) → MongoDB Storage →
Frontend Display → User Interaction → Progress Tracking →
Quiz Validation → Unlock Next Lesson
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### How to Contribute

1. **Fork the Project**
2. **Create your Feature Branch**

```bash
git checkout -b feature/AmazingFeature
```

3. **Commit your Changes**

```bash
git commit -m 'Add some AmazingFeature'
```

4. **Push to the Branch**

```bash
git push origin feature/AmazingFeature
```

5. **Open a Pull Request**

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [OpenAI](https://openai.com/) - GPT-4o model
- [LangChain](https://www.langchain.com/) - AI orchestration
- [LangGraph](https://github.com/langchain-ai/langgraph) - State management
- [Clerk](https://clerk.dev/) - Authentication
- [MongoDB](https://www.mongodb.com/) - Database
- [Shadcn UI](https://ui.shadcn.com/) - UI components
- [Vercel](https://vercel.com/) - Deployment platform

---

## 📧 Contact

**Project Link:** [https://github.com/your-username/studymate-ai](https://github.com/your-username/studymate-ai)  
**Live Demo:** [https://studymate-sigma-six.vercel.app/](https://studymate-sigma-six.vercel.app/)

---

**Built with ❤️ for learners everywhere**
