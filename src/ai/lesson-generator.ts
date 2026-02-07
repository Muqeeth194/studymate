import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { youSearchTool, youNewsTool, youContentTool } from "./tools/you-tools";

// 1. Define Rich Graph State
const ResearchState = Annotation.Root({
  topic: Annotation<string>(), // Current Lesson Title
  courseTopic: Annotation<string>(), // Main Course Topic (e.g. "Python Mastery")
  studentLevel: Annotation<string>(), // "beginner", "intermediate", "advanced"
  lessonType: Annotation<string>(), // "theory", "practical", "project"
  estimatedTime: Annotation<number>(), // in minutes

  // Internal Graph State
  queries: Annotation<{ search: string; news: string; docs_keyword: string }>(),
  researchContext: Annotation<string>(),
  finalLesson: Annotation<string>(),
});

const model = new ChatOpenAI({ model: "gpt-4o", temperature: 0 });

// --- NODE 1: PLANNER ---
const plannerNode = async (state: typeof ResearchState.State) => {
  const { topic, studentLevel, courseTopic } = state;

  const prompt = `
    You are a Research Planner for a technical course on "${courseTopic}". 
    Current Lesson: "${topic}"
    Target Audience: ${studentLevel}

    Generate 3 specific queries to gather comprehensive info:
    1. 'search': General trends and broad context.
    2. 'news': Recent breakthroughs/updates.
    3. 'docs_keyword': The best search term to find the OFFICIAL documentation URL.
    
    Return ONLY a JSON object: { "search": "...", "news": "...", "docs_keyword": "..." }
  `;

  const res = await model.invoke([new HumanMessage(prompt)]);

  // Strip markdown code blocks before parsing
  let content = res.content as string;
  const cleanContent = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const queries = JSON.parse(cleanContent);
  return { queries };
};

// --- NODE 2: RESEARCHER ---
const researcherNode = async (state: typeof ResearchState.State) => {
  const { queries } = state;

  console.log("🔍 Executing Research Strategy:", queries);

  const [trendsResult, newsResult, docsSearchResult] = await Promise.all([
    youSearchTool.invoke({ query: queries.search }),
    youNewsTool.invoke({ query: queries.news }),
    youSearchTool.invoke({ query: queries.docs_keyword }),
  ]);

  let docsContent = "No deep documentation found.";
  try {
    const docsHits = JSON.parse(docsSearchResult);
    if (docsHits.length > 0) {
      const bestUrl = docsHits[0].url;
      console.log(`📄 Fetching Deep Docs from: ${bestUrl}`);
      docsContent = await youContentTool.invoke({ url: bestUrl });
    }
  } catch (e) {
    console.error("Failed to parse/fetch doc content", e);
  }

  const combinedContext = `
    === 🌍 GENERAL TRENDS & CONTEXT ===
    ${trendsResult}

    === 📰 LATEST NEWS & BREAKTHROUGHS ===
    ${newsResult}

    === 📚 DEEP DIVE (OFFICIAL DOCS CONTENT) ===
    ${docsContent}
  `;

  return { researchContext: combinedContext };
};

// --- NODE 3: WRITER ---
const writerNode = async (state: typeof ResearchState.State) => {
  const {
    topic,
    courseTopic,
    studentLevel,
    lessonType,
    estimatedTime,
    researchContext,
  } = state;

  // We reconstruct your detailed System Prompt here, injecting the
  // dynamic state variables and the You.com Research Context.
  const prompt = `
    You are an expert educator and senior software engineer specializing in creating world-class learning content. Your mission is to craft study material that is clear, engaging, professionally structured, and optimized for deep understanding.

    ## Context
    - **Course Topic**: ${courseTopic}
    - **Student Level**: ${studentLevel}
    - **Current Lesson**: ${topic}
    - **Estimated Time**: ${estimatedTime} minutes
    - **Lesson Type**: ${lessonType}

    ## 🧠 RESEARCH DATA (CRITICAL)
    You have just performed real-time research. You MUST incorporate the following information into the "Concept Overview" and "Core Concepts" sections where relevant. Do not ignore this.
    
    ${researchContext}

    ## Content Structure Requirements

    Your response MUST follow this exact structure in clean, minimal Markdown:

    ### 1. **Learning Objectives** (2-3 bullet points)
    - What the student will be able to do after this lesson
    - Keep focused and measurable

    ### 2. **Concept Overview & Industry Trends** (2-3 paragraphs)
    - Start with the "why" - why does this concept matter?
    - **INTEGRATE RESEARCH**: Mention 2026 trends or recent news from the research data provided above.
    - Provide a high-level explanation suitable for ${studentLevel} level
    - Use analogies or real-world comparisons to build intuition

    ### 3. **Core Concepts** (Main Content)
    ${
      lessonType === "theory"
        ? `
    - Break down into digestible sub-concepts
    - **INTEGRATE RESEARCH**: Use the "Official Docs Content" to ensure technical accuracy.
    - Use **bold** for key terms (first mention only)
    - Include real-world examples and use cases
    - Add visual analogies or comparisons
    - Use > blockquotes for important notes or tips
    `
        : lessonType === "practical"
          ? `
    - Provide 3-5 progressive code examples
    - **INTEGRATE RESEARCH**: Use patterns found in the "Official Docs Content".
    - Start simple, build complexity gradually
    - Every code block must have:
      * Brief description above the code
      * Inline comments explaining key lines
      * Expected output or behavior explanation below
    - Use real-world scenarios, not "foo/bar" examples
    - Show common patterns and best practices
    `
          : `
    - Present a practical project/exercise
    - Clearly define the problem to solve
    - List specific requirements
    - Provide starter code or architecture guidance
    - Suggest implementation steps
    - Include testing/validation criteria
    `
    }

    ### 4. **Common Pitfalls & Mistakes**
    - List 3-5 mistakes ${studentLevel} learners commonly make
    - Explain WHY each is wrong and HOW to avoid it
    - Use ❌ for wrong approach, ✅ for correct approach

    ### 5. **Practice Checkpoint** (Quick Self-Check)
    - 2-3 thought-provoking questions to test understanding
    - NOT multiple choice - open-ended conceptual questions
    - Example: "Explain in your own words when you would use X vs Y"

    ### 6. **Key Takeaways**
    - 3-5 bullet points summarizing the lesson
    - Each point should be a complete, actionable insight
    - What should stick in the student's mind?

    ### 7. **Next Steps**
    - What to practice or explore next
    - How this connects to upcoming lessons

    ## Writing Guidelines

    **Tone & Style:**
    - Professional yet approachable - like a senior mentor explaining to a colleague
    - Use "you" to address the student directly
    - Avoid condescension - respect the student's intelligence
    - Be encouraging but realistic about complexity
    - No fluff - every sentence must add value

    **Technical Quality:**
    - All code must be production-quality, not pseudocode
    - Use current best practices and modern syntax
    - Include error handling where relevant
    - Comment meaningfully, not obviously (bad: "// create variable", good: "// cache DOM query for performance")

    **Formatting:**
    - Use headers (###) for sections only, not randomly
    - Code blocks must specify language: \`\`\`javascript, \`\`\`python, etc.
    - Use **bold** sparingly for key terms (not for emphasis)
    - Use *italics* for emphasis only
    - Lists should be parallel in structure
    - Keep paragraphs to 3-4 sentences max
    - **CRITICAL**: Add TWO blank lines between each major section (after each ### header's content)
    - Add ONE blank line between subsections and paragraphs for readability

    **Adapt to Level:**
    ${
      studentLevel === "beginner"
        ? `
    - Define technical terms when first used
    - Provide more context and background
    - Use simpler analogies
    - Smaller code examples with more explanation
    - Emphasize fundamentals over advanced patterns
    `
        : studentLevel === "intermediate"
          ? `
    - Assume familiarity with basics
    - Focus on deeper "why" and "how it works internally"
    - Compare alternative approaches
    - Introduce optimization and best practices
    - Reference common design patterns
    `
          : `
    - Assume strong foundation
    - Dive into internals and edge cases
    - Discuss trade-offs and architectural decisions
    - Reference industry standards and advanced patterns
    - Challenge with complex scenarios
    `
    }

    **Length Guidelines:**
    - Concept Overview: 150-250 words
    - Core Concepts: 400-800 words (varies by complexity)
    - Common Pitfalls: 150-300 words
    - Total: Roughly ${Math.round(estimatedTime * 100)}-${Math.round(
      estimatedTime * 150,
    )} words

    ## Example Code Block Format

    \`\`\`javascript
    // Brief explanation of what this code demonstrates
    const example = (param) => {
      // Explain non-obvious logic here
      const result = processData(param);
      
      return result; // What gets returned and why
    };

    // Expected output: ...
    // Use case: When you need to...
    \`\`\`

    Now generate the study module following this structure exactly. Make it exceptional and well-spaced for optimal readability.
  `;

  const res = await model.invoke([new SystemMessage(prompt)]);
  return { finalLesson: res.content as string };
};

// --- COMPILE GRAPH ---
export const lessonGraph = new StateGraph(ResearchState)
  .addNode("planner", plannerNode)
  .addNode("researcher", researcherNode)
  .addNode("writer", writerNode)
  .addEdge("__start__", "planner")
  .addEdge("planner", "researcher")
  .addEdge("researcher", "writer")
  .addEdge("writer", "__end__")
  .compile();
