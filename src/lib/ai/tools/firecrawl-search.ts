import { tool } from 'ai';
import { z } from 'zod';

type FirecrawlSearchProps = {
  // No session needed - uses API key from env
};

export const firecrawlSearch = ({}: FirecrawlSearchProps) =>
  tool({
    description:
      'Search the web using Firecrawl to find experts, research topics, and validate podcast ideas. Use this for guest prospecting, competitor research, and content topic validation.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('Search query - what to search for (e.g., "AI experts", "podcast about cooking", "guest speakers on sustainability")'),
      limit: z
        .number()
        .optional()
        .default(10)
        .describe('Maximum number of results to return (default: 10, max: 20)'),
    }),
    execute: async ({ query, limit = 10 }) => {
      try {
        if (!process.env.FIRECRAWL_API_KEY) {
          return {
            error: 'Firecrawl API key is not configured. Please contact support.',
          };
        }

        // Use Firecrawl search API (using the MCP-style search endpoint)
        // Note: Adjust endpoint if Firecrawl API structure differs
        const response = await fetch('https://api.firecrawl.dev/v0/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          },
          body: JSON.stringify({
            query,
            limit: Math.min(limit, 20), // Cap at 20
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            error: `Firecrawl API error: ${errorData.message || response.statusText}`,
          };
        }

        const data = await response.json();

        return {
          success: true,
          query,
          results: data.data?.map((result: any) => ({
            title: result.title,
            url: result.url,
            description: result.description,
            publishedDate: result.publishedDate,
          })) || [],
          count: data.data?.length || 0,
        };
      } catch (error) {
        console.error('Error in firecrawlSearch tool:', error);

        if (error instanceof Error) {
          return {
            error: `Failed to search with Firecrawl: ${error.message}`,
          };
        }

        return {
          error: 'An unexpected error occurred while searching.',
        };
      }
    },
  });

