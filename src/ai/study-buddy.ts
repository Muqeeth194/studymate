import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import {
  StateGraph,
  MessagesAnnotation,
  Annotation,
} from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";

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

// Define the state type explicitly
type GraphState = {
  messages: Array<SystemMessage | AIMessage | any>;
};

// Assistant Node with explicit return type
async function assistantNode(state: GraphState): Promise<{ messages: any[] }> {
  try {
    const messages = state.messages;
    const messagesWithSystem =
      messages.length === 0 || !(messages[0] instanceof SystemMessage)
        ? [new SystemMessage(SYSTEM_PROMPT), ...messages]
        : messages;

    const response = await model.invoke(messagesWithSystem);
    return { messages: [response] };
  } catch (error) {
    console.error("Assistant node error:", error);
    return {
      messages: [new AIMessage("I encountered an error. Please try again.")],
    };
  }
}

// Tool Node
const toolNode = new ToolNode([quizGenerator]);

// Build Graph with explicit typing
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("assistant", assistantNode)
  .addNode("tools", toolNode)
  .addEdge("__start__", "assistant")
  .addConditionalEdges("assistant", ((state: any) => {
    const lastMessage = state.messages[state.messages.length - 1];

    if (
      "tool_calls" in lastMessage &&
      Array.isArray(lastMessage.tool_calls) &&
      lastMessage.tool_calls.length > 0
    ) {
      return "tools";
    }
    return "__end__";
  }) as any)
  .addEdge("tools", "assistant");

// Export compiled graph
export const studyBuddyGraph = workflow.compile({
  checkpointer: new MemorySaver(),
});
