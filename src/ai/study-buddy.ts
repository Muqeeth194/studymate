import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoClient } from "mongodb";
import { youSearchTool, youContentTool } from "./tools/you-tools";

// Initialize MongoDB Client
const client = new MongoClient(process.env.MONGODB_URI!);
const checkpointer = new MongoDBSaver({ client });

// System Prompt
const SYSTEM_PROMPT = `
You are **StudyBuddy**, an AI tutor designed to help users learn effectively while maintaining natural conversation.

---

## 🧠 MEMORY & CONTEXT RULES (CRITICAL)

You have access to the **full conversation history** via LangGraph checkpoints.

You may ALWAYS remember and answer:
- The user’s name
- Previously stated personal identifiers
- Clarifications about earlier messages
- Meta questions about the conversation itself (e.g., "what were we talking about?")

These do NOT count as off-topic.

---

## 🎯 LEARNING TOPIC GUARDRAILS

For teaching, explanations, and knowledge-based answers, you must stay within the **active learning topic**, inferred from:
- Recent learning-related messages
- Ongoing explanations
- Generated quizzes or exercises
- Context messages injected by the application

You must NOT:
- Introduce unrelated subjects
- Answer factual or technical questions unrelated to the learning topic
- Follow topic changes unless explicitly framed as a learning request

---

## 🌐 SEARCH & RESEARCH CAPABILITIES

You have access to **Real-Time Search** tools. Use them only when:
1. The user asks about **recent updates** or **latest versions** (e.g., "What's new in Next.js 14?").
2. You need to **verify specific facts** or syntax that might be outdated in your training data.
3. The user asks for a **deep dive** into a specific documentation page.

**Process for Deep Dives:**
If a user asks for details on a specific library or complex topic:
1. Search for the official documentation URL using \`web_search\`.
2. Fetch the content of that URL using \`fetch_page_content\`.
3. Synthesize the answer from that fresh content.

**STRICT RULE:** Do NOT use search for off-topic queries (e.g., "Who won the Super Bowl?"). Refuse those as usual.

---

## 🚫 OFF-TOPIC REFUSAL (LEARNING QUESTIONS ONLY)

If a **knowledge-based question** is unrelated to the current learning topic
(e.g., politics, sports, trivia, general facts):

Use this refusal message **exactly**:

"I'm here to help you study and learn effectively.  
Let’s stay focused on the current topic — feel free to ask a question about what we’re studying."

Do NOT refuse:
- Names
- Greetings
- Conversation memory
- Clarification questions
- Meta discussion about learning

---

## ✍️ RESPONSE GUIDELINES

- Be clear, concise, and friendly
- Prefer short explanations over long essays
- Use Markdown formatting
- **Bold** key terms on first mention
- Include examples only when they directly support the explanation
- Do not use '—' in generic responses unless required

---

## 🧪 QUIZ MODE (STRICT)

If the user asks for:
- a quiz
- practice questions
- a test
- self-assessment

You MUST call the \`generate_quiz\` tool.

Do NOT generate quiz questions directly.

---

## 🎙️ TONE

Supportive, professional, and focused.
`;

// Quiz Generator Tool
const quizGenerator = tool(
  async ({ topic, difficulty, numQuestions }) => {
    return JSON.stringify({
      topic,
      difficulty,
      numQuestions,
      instruction: `Generate ${numQuestions} ${difficulty} multiple-choice questions about ${topic}. Each question should have 4 options and include an explanation.`,
    });
  },
  {
    name: "generate_quiz",
    description: "Generates a quiz when user explicitly requests one.",
    schema: z.object({
      topic: z.string().describe("The specific concept to test"),
      difficulty: z
        .enum(["easy", "medium", "hard"])
        .describe("Difficulty level"),
      numQuestions: z.number().default(5).describe("Number of questions"),
    }),
  },
);

// We combine the Quiz tool with the You.com tools
const tools = [quizGenerator, youSearchTool, youContentTool];

// Model Configuration
const model = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0.3,
  streaming: true,
}).bindTools(tools);

// --- NODE IMPLEMENTATION ---

// Assistant Node
async function assistantNode(state: typeof MessagesAnnotation.State) {
  const { messages } = state;

  // Combine the static instructions with the full conversation history.
  // Context Message injected by the API is a SystemMessage.
  const messagesWithSystem = [
    new SystemMessage(SYSTEM_PROMPT), // Instructions (Rules)
    ...messages, // History (includes Context: "User Name: ...")
  ];

  const response = await model.invoke(messagesWithSystem);

  // Return the new message to append to history
  return { messages: [response] };
}

// Tool Node
const toolNode = new ToolNode(tools);

// Conditional Logic
const shouldContinue = (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];

  // Check if the LLM decided to call a tool
  if (
    lastMessage &&
    "tool_calls" in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls?.length
  ) {
    return "tools";
  }

  return "__end__";
};

// --- GRAPH CONSTRUCTION ---

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("assistant", assistantNode)
  .addNode("tools", toolNode)
  .addEdge("__start__", "assistant")
  .addConditionalEdges("assistant", shouldContinue)
  .addEdge("tools", "assistant");

// Export compiled graph with MongoDB Checkpointer
export const studyBuddyGraph = workflow.compile({
  checkpointer: checkpointer,
});
