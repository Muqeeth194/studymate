# 🎓 StudyMate AI

**Master Any Topic with Your Personal AI Learning Companion**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://studymate-sigma-six.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

StudyMate AI is an intelligent learning platform that generates personalized course roadmaps, provides interactive study sessions, and uses a context-aware AI tutor to help users master new skills. It features a **gatekeeper progression system** where learners must pass adaptive quizzes to unlock subsequent lessons.

🔗 **[Try it live](https://studymate-sigma-six.vercel.app/)**

---

## ✨ Key Features

- **🗺️ Personalized Learning Roadmaps**  
  AI-generated week-by-week study plans tailored to your skill level (Beginner/Intermediate/Advanced), time commitment, and learning goals

- **🌐 Real-Time Web Research**  
  Unlike static AI models, StudyMate fetches **live data** using **You.com APIs**. It searches for 2026 trends, recent news, breakthroughs, and official documentation to ensure your lessons are never outdated

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
- **Web Research:** You.com APIs (Search, News, Content)
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
- **You.com API** key
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

# AI Services
OPENAI_API_KEY=sk-...
YOU_API_KEY=...  # Required for Researcher Graph & Agents
```

5. **Run the development server**

```bash
npm run dev
```

6. **Open your browser**  
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🧠 AI Architecture

### 1. The "Researcher" Graph (LangGraph + You.com)

We utilize a dedicated **Researcher Graph** to generate high-quality lesson content. Instead of hallucinating facts, the AI performs a 3-step research process before writing any content:

**Flow:**

1. **Planner Node** - Analyzes the topic and generates optimized queries for "Trends", "News", and "Official Docs"
2. **Researcher Node** - Executes three parallel searches:
   - **Search Tool:** Fetches broad context and current trends
   - **News Tool:** Fetches the latest breakthroughs (e.g., updates from last week)
   - **Content Tool:** Identifies official documentation URLs and scrapes full page content for code accuracy
3. **Writer Node** - Synthesizes the research data into a structured markdown lesson

### 2. The "Gatekeeper" Progression System

We implement a strict progression system to ensure mastery before advancing:

- **Logic:** Topic B cannot be accessed until Topic A is marked as `isCompleted`
- **Trigger:** Completing a quiz with a score of ≥70% triggers a server-side update to unlock the next node
- **Purpose:** Ensures learners master fundamentals before moving to advanced concepts

### 3. Study Buddy Agent (Context-Aware)

The chat assistant is powered by **LangGraph** with persistent memory:

- **Persistence:** Every chat message is saved to MongoDB keyed by `thread_id`
- **Live Research:** The agent has access to the You.com Search Tool. If a user asks "What is the latest version of Next.js?", the agent detects the need for external data, searches the web, and answers with up-to-the-minute accuracy
- **Guardrails:** Refuses off-topic questions (sports, politics) to keep focus on the curriculum

### 4. Agent-Based Curriculum Design

**Roadmap Generation:** We use You.com's "Advanced" Agent to design the curriculum. This agent is optimized for complex reasoning and planning, ensuring that the generated week-by-week plan is logical, comprehensive, and tailored to the user's specific project scope (e.g., "Capstone" vs "Mini-projects").

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
3. **Roadmap Generation** → AI generates personalized week-by-week study plan using You.com Agent
4. **Study & Learn** → Access lessons with AI tutor support (powered by Researcher Graph)
5. **Quiz & Progress** → Pass quizzes (≥70%) to unlock next lessons
6. **Track Performance** → Monitor progress via analytics dashboard

### Data Flow

```
User Input → You.com Agent (Curriculum Design) → MongoDB Storage →
Researcher Graph (Live Web Research) → Lesson Generation →
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
- [You.com](https://you.com/) - Search, News, and Agent APIs
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
