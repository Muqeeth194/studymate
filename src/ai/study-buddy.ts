import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoClient } from "mongodb";

// Initialize MongoDB Client
const client = new MongoClient(process.env.MONGODB_URI!);
const checkpointer = new MongoDBSaver({ client });

// System Prompt
const SYSTEM_PROMPT = `You are a helpful study buddy AI. Help users learn through clear explanations and generate quizzes when they're ready to test their knowledge.`;

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

// Model Configuration
const model = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0.3,
  streaming: true,
}).bindTools([quizGenerator]);

// --- NODE IMPLEMENTATION ---

// Assistant Node
async function assistantNode(state: typeof MessagesAnnotation.State) {
  const { messages } = state;

  // Ensure System Message is present in the context
  const messagesWithSystem = [
    new SystemMessage(SYSTEM_PROMPT),
    ...messages.filter((m) => m.getType() !== "system"),
  ];

  const response = await model.invoke(messagesWithSystem);

  // Return the new message to append to history
  return { messages: [response] };
}

// Tool Node
const toolNode = new ToolNode([quizGenerator]);

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
