import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ChatOpenAI } from "@langchain/openai";
import connectDB from "@/db/connectDB";
import LearningPath from "@/models/LearningPath";
import User from "@/models/User";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; topicId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { courseId, topicId } = await params;

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return new NextResponse("User not found", { status: 404 });

    // 1. Fetch the Course
    const course = await LearningPath.findOne({
      _id: courseId,
      userId: user._id,
    });

    if (!course) return new NextResponse("Course not found", { status: 404 });

    // 2. Find the specific Topic in the nested arrays
    // We have to loop through weeks -> topics to find the matching ID
    let foundTopic = null;
    let weekIndex = -1;
    let topicIndex = -1;

    for (let i = 0; i < course.roadmap.syllabus.length; i++) {
      const week = course.roadmap.syllabus[i];
      const tIndex = week.topics.findIndex((t: any) => t.id === topicId);

      if (tIndex !== -1) {
        foundTopic = week.topics[tIndex];
        weekIndex = i;
        topicIndex = tIndex;
        break;
      }
    }

    if (!foundTopic) {
      return new NextResponse("Topic not found", { status: 404 });
    }

    // 3. COST SAVER: If content exists, return it immediately (don't regenerate)
    if (foundTopic.markdownContent) {
      return NextResponse.json({
        content: foundTopic.markdownContent,
        title: foundTopic.title,
        type: foundTopic.type,
        estimatedMinutes: foundTopic.estimatedMinutes,
        cached: true,
      });
    }

    // 4. Initialize LLM
    const model = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.3, // Slightly higher than 0 to allow for creative explanations
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // 5. Generate Content
    console.log(`Generating content for topic: ${foundTopic.title}`);

    const systemPrompt = `
You are an expert educator and senior software engineer specializing in creating world-class learning content. Your mission is to craft study material that is clear, engaging, professionally structured, and optimized for deep understanding.

## Context
- **Course Topic**: ${course.topic}
- **Student Level**: ${course.preferences.level}
- **Current Lesson**: ${foundTopic.title}
- **Estimated Time**: ${foundTopic.estimatedMinutes} minutes
- **Lesson Type**: ${foundTopic.type}

## Content Structure Requirements

Your response MUST follow this exact structure in clean, minimal Markdown:

### 1. **Learning Objectives** (2-3 bullet points)
- What the student will be able to do after this lesson
- Keep focused and measurable


### 2. **Concept Overview** (2-3 paragraphs)
- Start with the "why" - why does this concept matter?
- Provide a high-level explanation suitable for ${course.preferences.level} level
- Use analogies or real-world comparisons to build intuition


### 3. **Core Concepts** (Main Content)
${
  foundTopic.type === "theory"
    ? `
- Break down into digestible sub-concepts
- Use **bold** for key terms (first mention only)
- Include real-world examples and use cases
- Add visual analogies or comparisons
- Use > blockquotes for important notes or tips
`
    : foundTopic.type === "practical"
      ? `
- Provide 3-5 progressive code examples
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
- List 3-5 mistakes ${course.preferences.level} learners commonly make
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
- Optional: link to further reading topics (not URLs, just topics)

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
  course.preferences.level === "beginner"
    ? `
- Define technical terms when first used
- Provide more context and background
- Use simpler analogies
- Smaller code examples with more explanation
- Emphasize fundamentals over advanced patterns
`
    : course.preferences.level === "intermediate"
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
- Total: Roughly ${Math.round(foundTopic.estimatedMinutes * 100)}-${Math.round(foundTopic.estimatedMinutes * 150)} words

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

## Spacing Requirements (IMPORTANT)
- Between major sections (### headers): TWO blank lines
- Between paragraphs within a section: ONE blank line
- Between code blocks and text: ONE blank line
- Between list items and following text: ONE blank line
- This creates professional, readable content that's easy on the eyes

## Quality Checklist (Internal - don't output this)
- [ ] Clear learning objectives stated upfront
- [ ] Concept explained with analogy/real-world example
- [ ] Progressive complexity (simple → advanced)
- [ ] Code examples are practical and commented
- [ ] Common mistakes addressed proactively
- [ ] Summary reinforces key points
- [ ] Tone is professional but encouraging
- [ ] All markdown is properly formatted
- [ ] Proper spacing: TWO lines between sections, ONE line between paragraphs
- [ ] No broken code blocks or formatting
- [ ] Content matches estimated time allocation

Now generate the study module following this structure exactly. Make it exceptional and well-spaced for optimal readability.
`;

    const aiResponse = await model.invoke(systemPrompt);
    const generatedContent = aiResponse.content as string;

    // 6. Save to MongoDB
    // We modify the document directly and save() to persist changes
    course.roadmap.syllabus[weekIndex].topics[topicIndex].markdownContent =
      generatedContent;
    await course.save();

    return NextResponse.json({
      content: generatedContent,
      title: foundTopic.title,
      type: foundTopic.type,
      estimatedMinutes: foundTopic.estimatedMinutes,
      cached: false,
    });
  } catch (error: any) {
    console.error("Content Generation Error:", error);
    return new NextResponse(error.message || "Internal Server Error", {
      status: 500,
    });
  }
}
