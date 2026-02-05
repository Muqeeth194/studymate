import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { You } from "@youdotcom-oss/sdk";
import type {
  SearchRequest,
  ContentsRequest,
} from "@youdotcom-oss/sdk/models/operations";

// Initialize SDK
const youClient = new You({ apiKeyAuth: process.env.YOU_API_KEY });

// 1. WEB SEARCH TOOL (SDK)
export const youSearchTool = tool(
  async ({ query }) => {
    try {
      const request: SearchRequest = { query };
      const result = await youClient.search(request);

      const hits = result.results?.web || [];

      return JSON.stringify(
        hits.map((hit: any) => ({
          title: hit.title,
          url: hit.url,
          // Using 'description' as primary snippet, falling back to 'snippets' array if needed
          snippet: hit.description || (hit.snippets ? hit.snippets[0] : ""),
        })),
      );
    } catch (error) {
      return `Search failed: ${error}`;
    }
  },
  {
    name: "web_search",
    description:
      "Search for general information, trends, and documentation URLs.",
    schema: z.object({ query: z.string() }),
  },
);

// 2. NEWS TOOL (Recent News Updates)
export const youNewsTool = tool(
  async ({ query }) => {
    // Using the 'livenews' endpoint  for "news till date"
    const url = `https://api.ydc-index.io/livenews?q=${encodeURIComponent(query)}`;
    const options = {
      method: "GET",
      headers: { "X-API-Key": process.env.YOU_API_KEY! },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      const articles = data.news?.results || [];

      return JSON.stringify(
        articles.slice(0, 5).map((n: any) => ({
          title: n.title,
          description: n.description,
          url: n.url,
          date: n.page_age, // "2025-06-25T11:41:00"
          source: n.source_name,
        })),
      );
    } catch (error) {
      return `News search failed: ${error}`;
    }
  },
  {
    name: "news_search",
    description: "Finds recent news articles and breakthroughs.",
    schema: z.object({ query: z.string() }),
  },
);

// 3. CONTENT TOOL (Fetch Full Page Content)
export const youContentTool = tool(
  async ({ url }) => {
    try {
      const request: ContentsRequest = {
        urls: [url],
        // Requesting markdown is usually better for LLMs, but we include HTML as fallback
        formats: ["markdown", "html", "metadata"],
      };

      // The SDK returns an array of results directly: [{ url, title, html, ... }]
      const result = await youClient.contents(request);

      if (!result || result.length === 0) {
        return "No content retrieved.";
      }

      const item = result[0] as any;

      // Prefer markdown if available, otherwise use HTML
      // Note: The SDK maps the format requested to the key in the response
      const content = item.markdown || item.html || "";

      // Limit length to prevent token overflow
      return content.slice(0, 15000);
    } catch (error) {
      return `Content fetch failed: ${error}`;
    }
  },
  {
    name: "fetch_page_content",
    description: "Extracts full text and code examples from a specific URL.",
    schema: z.object({ url: z.string().url() }),
  },
);
