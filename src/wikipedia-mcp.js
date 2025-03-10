// Wikipedia MCP - Model Context Provider for accessing Wikipedia content
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const fetch = require('node-fetch');

async function fetchFromWikipedia(endpoint) {
  try {
    const baseUrl = 'https://en.wikipedia.org/api/rest_v1';
    const response = await fetch(`${baseUrl}${endpoint}`);

    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching from Wikipedia API: ${error.message}`);
    throw error;
  }
}

// Create the MCP server
const server = new McpServer({
  name: "Wikipedia MCP",
  version: "1.0.0"
});


// Get article summary tool
server.tool(
  "get-article-summary",
  { title: z.string() },
  async ({ title }) => {
    try {
      const data = await fetchFromWikipedia(`/page/summary/${encodeURIComponent(title)}`);
      return {
        content: [{
          type: "text",
          text: data.extract || "No summary available"
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error retrieving article summary: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Get article segments tool
server.tool(
  "get-article-segments",
  { title: z.string() },
  async ({ title }) => {
    try {
      const data = await fetchFromWikipedia(`/page/segments/${encodeURIComponent(title)}`);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2) || "No segments available"
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error retrieving article segments: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Related articles tool
server.tool(
  "find-related-articles",
  { title: z.string() },
  async ({ title }) => {
    try {
      const data = await fetchFromWikipedia(`/page/related/${encodeURIComponent(title)}`);
      const relatedArticles = data.pages ? data.pages.map(page => page.title).join("\n- ") : "No related articles";

      return {
        content: [{
          type: "text",
          text: `Related articles to "${title}":\n- ${relatedArticles}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error finding related articles: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Random article tool
server.tool(
  "random-article",
  {},
  async () => {
    try {
      const data = await fetchFromWikipedia('/page/random/summary');

      return {
        content: [{
          type: "text",
          text: `Random article: ${data.title}\n\n${data.extract || "No summary available"}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching random article: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Search articles tool
server.tool(
  "search-wikipedia",
  { query: z.string() },
  async ({ query }) => {
    try {
      // Wikipedia search API is not part of the v1 REST API, but we can use the action API
      const searchResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json`);
      const searchData = await searchResponse.json();

      if (!searchResponse.ok || !searchData.query || !searchData.query.search) {
        throw new Error(`Search error: ${searchResponse.status} ${searchResponse.statusText}`);
      }

      const results = searchData.query.search.map(item => `- ${item.title}: ${item.snippet.replace(/<\/?[^>]+(>|$)/g, "")}`).join("\n");

      return {
        content: [{
          type: "text",
          text: `Search results for "${query}":\n${results || "No results found"}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error searching Wikipedia: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Get article content with pagination support
server.tool(
  "get-article-content",
  {
    title: z.string(),
    start: z.number().optional().default(0),
    length: z.number().optional().default(5000)
  },
  async ({ title, start, length }) => {
    try {
      const baseUrl = 'https://en.wikipedia.org/api/rest_v1';
      const url = `${baseUrl}/page/html/${encodeURIComponent(title)}`;

      // Set up headers for range request
      const headers = {
        'Range': `bytes=${start}-${start + length - 1}`
      };

      const response = await fetch(url, { headers });

      // First request may return 206 Partial Content if range is valid
      // or 200 OK if the server doesn't support range requests
      if (response.status !== 200 && response.status !== 206) {
        throw new Error(`Wikipedia API error: ${response.status} ${response.statusText}`);
      }

      // Get the HTML content as text
      const htmlContent = await response.text();

      // Get content length info if available
      let totalLength = null;
      let hasMore = false;
      if (response.headers.get('Content-Range')) {
        const rangeInfo = response.headers.get('Content-Range');
        totalLength = parseInt(rangeInfo.split('/')[1], 10);
        hasMore = start + htmlContent.length < totalLength;
      }

      // Include pagination info at the end of the content
      let contentInfo = '';
      if (start > 0 || hasMore) {
        contentInfo = `\n\n--- Article content (bytes ${start}-${start + htmlContent.length - 1}`;
        if (totalLength) {
          contentInfo += ` of ${totalLength}`;
        }
        contentInfo += `) ---\n`;
        if (hasMore) {
          contentInfo += `To read more, request bytes starting from ${start + htmlContent.length}\n`;
        }
      }

      return {
        content: [{
          type: "text",
          text: htmlContent + contentInfo
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error retrieving article content: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Function to start the MCP server
async function startServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Wikipedia MCP server started");
  } catch (error) {
    console.error("Failed to start Wikipedia MCP server:", error);
  }
}

// Export the server and start function
module.exports = {
  server,
  startServer
};

// Auto-start if this is the main module
if (require.main === module) {
  startServer();
}
