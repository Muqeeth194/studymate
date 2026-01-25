# StudyMate AI - Project Context Document

## 🎯 Project Overview

**StudyMate AI** is an AI-powered personalized learning companion that helps users master any topic through adaptive roadmaps, intelligent quizzes, voice-based interactions, and document-aware study plans. The platform combines generative AI with Retrieval Augmented Generation (RAG) to create customized learning experiences tailored to each user's goals, preferences, and study materials.

## 🌟 Core Concept

StudyMate AI transforms traditional learning by:
1. **Generating personalized learning roadmaps** based on user preferences (skill level, time commitment, learning style, goals)
2. **Supporting document uploads** (PDFs, DOCX) to create material-specific study plans
3. **Providing voice-first interactions** for natural, conversational learning
4. **Creating adaptive quizzes** that adjust to user performance
5. **Tracking progress** with detailed analytics and gamification

## 🎨 User Journey

### Landing Page → Authentication → Onboarding → Dashboard → Learning

**1. Landing Page**
- Detailed introduction to StudyMate AI features
- Value propositions: personalized learning, AI-powered assistance, voice interaction
- Call-to-action: "Get Started" or "Sign Up"
- Feature highlights with visual examples

**2. User Authentication**
- New users: Sign up with email/password or OAuth
- Existing users: Login
- Upon successful registration → Redirect to onboarding questionnaire

**3. Onboarding Questionnaire (7 Steps)**
First-time users complete a comprehensive preference collection form:

- **Step 1: Topic Selection** - What do you want to learn?
- **Step 2: Skill Level** - Beginner, Intermediate, or Advanced?
- **Step 3: Time Commitment** - Hours per week available (1-40 hours slider)
- **Step 4: Target Date** - When do you want to complete learning?
- **Step 5: Learning Style** - Visual, Reading, Hands-on, or Mixed?
- **Step 6: Learning Goals** - What do you want to achieve?
- **Step 7: Upload Materials (Optional)** - Add textbooks/notes for customized roadmap

**4. Dashboard Generation**
After completing the questionnaire:
- AI generates a personalized learning roadmap
- Creates week-by-week breakdown with milestones
- Sets up initial quizzes and practice exercises
- User is redirected to their customized dashboard

**5. Active Learning Experience**
Users engage with their learning path through:
- Study sessions with AI explanations
- Voice-based Q&A with the AI assistant
- Adaptive quizzes based on progress
- Practice exercises and projects
- Progress tracking and analytics

## 🏗️ Application Architecture

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Voice**: Web Speech API / Whisper API for transcription
- **Text-to-Speech**: ElevenLabs or browser TTS
- **State Management**: React hooks (useState, useContext)
- **Deployment**: Vercel

### Backend
- **API**: Next.js API Routes (serverless)
- **Database**: MongoDB Atlas (managed)
- **Vector Database**: Pinecone (for RAG)
- **File Storage**: AWS S3 / Vercel Blob

### AI/ML Stack
- **Primary LLM**: Claude API (Anthropic) - Sonnet 4.5
- **Embeddings**: OpenAI text-embedding-3-small
- **Document Processing**: LangChain, pdf-parse, mammoth
- **Voice Processing**: Whisper API, ElevenLabs

## 📊 Data Model

### Core Collections (MongoDB)

**1. users**
- User authentication data
- Default preferences
- Gamification stats (points, streaks, achievements)

**2. learning_paths**
- One active learning path per user (constraint)
- User preferences for this specific topic
- AI-generated roadmap structure
- Progress tracking
- Document metadata (if material uploaded)

**3. quizzes**
- Quiz questions and answers
- User responses and scores
- Performance analysis (weak/strong concepts)
- Time tracking

**4. documents**
- Uploaded file metadata
- Processing status
- Pinecone namespace reference
- Extracted topics and chapters

**5. study_sessions** (optional)
- Session timing and duration
- Activities completed
- AI interactions logged

**6. voice_conversations** (optional)
- Conversation history
- Transcriptions
- Learning outcomes tracked

## 🎯 Key Features

### 1. Personalized Roadmap Generation

**Without Uploaded Materials:**
```
User Preferences → Claude API → Generates:
- Week-by-week learning plan
- Topic breakdown (theory, practice, quizzes)
- Milestone deadlines
- Estimated hours per topic
```

**With Uploaded Materials:**
```
User Preferences + Document Upload → 
  → Document Processing (chunking, embedding) → 
  → Pinecone Vector Store → 
  → RAG-powered Roadmap Generation → 
  → Material-specific study plan (chapter-by-chapter)
```

### 2. Voice-First Learning

Users can:
- Ask questions verbally during study sessions
- Receive spoken explanations from AI
- Have natural conversations about concepts
- Navigate the app using voice commands

**Voice Flow:**
```
User speaks → Whisper API (transcription) → 
  → Claude API (understanding + response) → 
  → ElevenLabs (text-to-speech) → 
  → Audio playback to user
```

### 3. Adaptive Quiz System

Quizzes dynamically adjust based on:
- User's performance history
- Identified weak areas
- Selected difficulty preference
- Material context (if document uploaded)

**Quiz Generation:**
```
Topic + User Level + Context (RAG if document exists) → 
  → Claude API → 
  → 5-10 questions with explanations
```

### 4. RAG-Powered Study Sessions

When users upload materials:
```
User Question → 
  → Embed question → 
  → Semantic search in Pinecone → 
  → Retrieve relevant chunks from uploaded document → 
  → Claude API (question + context) → 
  → Answer specific to user's material
```

### 5. Progress Tracking & Analytics

Dashboard displays:
- Overall progress percentage
- Weekly study hours
- Quiz performance by topic
- Weak areas identification
- Achievement badges
- Study streak tracking

## 🔐 User Constraints

### Single Active Learning Path
- Users can have **only ONE active learning path** at a time
- Constraint enforced at application level
- Users can:
  - Pause current path
  - Delete current path
  - Archive completed paths
- To start a new topic, users must:
  - Complete current path, OR
  - Delete/archive current path
  - Go through questionnaire again for new topic

### Journey Management
```
Active Journey Actions:
- Continue learning
- View progress
- Take quizzes
- Pause journey
- Delete journey

Paused/Completed Journey Actions:
- Resume
- View analytics
- Archive
- Delete

Create New Journey:
- Only if no active journey exists
- Triggers new questionnaire flow
```

## 🎮 Gamification Elements

- **Streaks**: Daily login/study streaks
- **Points**: Earned from quiz completion, practice exercises
- **Achievements**: Unlocked for milestones (7-day streak, perfect quiz, etc.)
- **Progress Bars**: Visual feedback on roadmap completion
- **Leaderboards** (future): Compare with other learners (optional)

## 🔄 Core Workflows

### Workflow 1: New User → First Learning Path
```
1. User lands on landing page
2. User signs up
3. Redirected to 7-step questionnaire
4. User fills preferences, optionally uploads document
5. Clicks "Generate My Roadmap"
6. Backend processes:
   - Stores user preferences in MongoDB
   - If document uploaded: processes and stores in Pinecone
   - Calls Claude API to generate roadmap
   - Creates learning_path document
7. User redirected to dashboard with new roadmap
8. Dashboard displays:
   - Roadmap timeline
   - Next study session prompt
   - Progress stats (all at 0%)
```

### Workflow 2: Study Session with Voice
```
1. User clicks "Start Study Session" from dashboard
2. Opens study interface:
   - Left: Content display (AI-generated explanations)
   - Right: AI chat sidebar
3. User clicks voice button
4. User asks: "Explain useEffect with an example"
5. Voice transcribed → sent to Claude API
6. If document uploaded: RAG retrieves relevant sections
7. Claude generates explanation with context
8. Response converted to speech → played back
9. Answer also displayed in text in chat sidebar
10. Session tracked in study_sessions collection
```

### Workflow 3: Taking a Quiz
```
1. User clicks "Take Quiz" for a topic
2. Backend generates quiz:
   - Queries learning_path for context
   - If hasUploadedMaterial: retrieves chunks from Pinecone
   - Sends to Claude API with difficulty level
3. Quiz displayed with timer
4. User answers questions
5. On submit:
   - Scores calculated
   - Weak concepts identified
   - Results stored in quizzes collection
   - Updates learning_path progress
6. User sees results with explanations
7. AI suggests: "You struggled with X, want to review?"
```

### Workflow 4: Deleting & Creating New Journey
```
1. User wants to learn a new topic
2. Clicks "Delete Journey" in settings
3. Confirmation modal appears
4. On confirm:
   - learning_path.status = 'deleted'
   - Document references cleared (but file kept in documents collection)
5. User redirected to questionnaire
6. Process repeats as new user flow
```

## 🎨 UI Screens

### 1. Landing Page
- Hero section with value proposition
- Feature highlights (voice, personalization, RAG)
- How it works (step-by-step visual)
- Testimonials/demo video
- CTA: "Get Started Free"

### 2. Dashboard (Main Screen)
- **Header**: Welcome message, voice assistant quick-start button
- **Stats Cards**: Progress %, active paths, study hours, quiz scores
- **Roadmap Section**: Week-by-week timeline with completion status
- **Quick Actions**: Continue learning, take quiz, upload materials
- **Recent Activity**: Latest quizzes, study sessions
- **Upload Materials Card**: If no document uploaded

### 3. Study Session Screen
- **Left Panel (70%)**: Content area with AI explanations, code examples
- **Right Panel (30%)**: AI chat sidebar with voice button
- **Top Bar**: Session timer, topic title, progress indicator
- **Bottom**: Quick action buttons (Take Quiz, Practice Exercise)

### 4. Roadmap Screen
- Visual timeline with weeks/milestones
- Color-coded status (completed, in-progress, upcoming)
- Expandable topic cards with:
  - Estimated hours
  - Learning objectives
  - Quiz availability
  - Practice exercises

### 5. Analytics Screen
- Study time charts (daily/weekly)
- Performance by topic (bar charts)
- Quiz score trends (line graphs)
- Weak areas identification
- Achievement showcase

### 6. Questionnaire (Onboarding)
- 7-step wizard with progress bar
- Each step focused on single preference
- Visual/interactive inputs (sliders, cards, date pickers)
- Smart defaults and suggestions
- Optional file upload with drag-drop
- Preview of what roadmap will include

## 🔧 Technical Implementation Details

### Document Processing Pipeline
```
1. User uploads PDF/DOCX
2. Extract text using pdf-parse or mammoth
3. Chunk text (1000 chars, 200 overlap)
4. Generate embeddings for each chunk
5. Store in Pinecone with metadata:
   - userId
   - documentId
   - chunkIndex
   - pageNumber
   - chapterTitle
6. Update document status to 'ready'
7. Enable material-specific features
```

### Roadmap Generation Prompt Structure
```
System: You are an expert learning path designer.

User Preferences:
- Topic: {topic}
- Level: {level}
- Hours/week: {hoursPerWeek}
- Target: {targetDate}
- Style: {learningStyle}
- Goals: {goals}

{IF document uploaded:}
Document Context:
- Title: {documentTitle}
- Chapters: {extractedChapters}
- Key Topics: {extractedTopics}

Task: Generate a week-by-week learning roadmap as JSON with:
- Weeks array (title, topics, hours, dates)
- Milestones
- Practice exercises
- Quiz checkpoints

{IF document uploaded:}
Align roadmap with document chapters and structure.
```

### Quiz Generation with RAG
```
1. User requests quiz for topic "useState Hook"
2. System checks if learning_path.hasUploadedMaterial
3. If yes:
   - Embed query: "useState Hook React"
   - Query Pinecone: top 5 relevant chunks
   - Retrieve document sections
4. Build prompt:
   Context: {retrieved chunks}
   Topic: useState Hook
   Level: {user level}
   Generate 5 questions (MCQ)
5. Claude generates quiz with explanations
6. Return to frontend
```

## 🚀 Deployment Strategy

- **Frontend & API**: Vercel (auto-deploy from GitHub)
- **Database**: MongoDB Atlas (free tier: 512MB)
- **Vector Store**: Pinecone (free tier: 1 index, 100K vectors)
- **File Storage**: Vercel Blob or AWS S3
- **Environment Variables**:
  - `MONGODB_URI`
  - `PINECONE_API_KEY`
  - `ANTHROPIC_API_KEY`
  - `OPENAI_API_KEY`
  - `ELEVENLABS_API_KEY`

## 🎯 Success Metrics (for Hackathon Demo)

1. **Functionality**: Complete user flow from signup → roadmap → quiz
2. **AI Integration**: Working Claude API calls with context
3. **RAG Demo**: Show difference with/without uploaded material
4. **Voice Feature**: Live demo of voice question → AI answer
5. **UI/UX**: Polished, modern interface
6. **Innovation**: Unique combination of features (voice + RAG + personalization)

## 💡 Future Enhancements (Post-Hackathon)

- Multiple active learning paths support
- Collaborative learning (study groups)
- Mobile app (React Native)
- Integration with calendars (Google Calendar sync)
- Spaced repetition algorithms
- Video content generation
- Real-time code execution for programming topics
- AI tutor scheduling
- Progress sharing on social media

---

## 📝 Key Technical Decisions Summary

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Framework | Next.js 14 | Full-stack, serverless, easy deployment |
| Database | MongoDB Atlas | Flexible schema, free tier, managed |
| Vector DB | Pinecone | Managed, easy RAG, free tier |
| LLM | Claude Sonnet 4.5 | Best for long context, explanations |
| Voice | Whisper + ElevenLabs | High accuracy + natural TTS |
| Deployment | Vercel | Zero-config, auto-deploy, free tier |
| Constraint | One active path | Simplifies MVP, focuses user attention |

---

## 🎓 Example Use Cases

**Use Case 1: College Student Learning React**
- Uploads React textbook PDF
- Sets goal: "Pass final exam in 4 weeks"
- Gets chapter-by-chapter study plan
- Takes quizzes based on textbook examples
- Asks voice questions during study sessions

**Use Case 2: Professional Learning Python**
- No upload, selects "Python for Data Science"
- Wants intensive learning (20 hrs/week)
- Gets general curriculum with projects
- Practices coding exercises
- Tracks progress toward job readiness

**Use Case 3: Self-Learner Exploring ML**
- Uploads online course materials (PDFs)
- Beginner level, relaxed pace
- Gets simplified explanations (ELI5 style)
- Voice-based learning (listens while commuting)
- Gamification keeps engagement high

---

This document serves as the complete context for what StudyMate AI is, how it works, and what it aims to achieve. Use this to brief AI assistants, developers, or stakeholders on the project.