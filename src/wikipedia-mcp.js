// Wikipedia MCP - Model Context Provider for accessing Wikipedia content
const { McpServer, ResourceTemplate } = require('@modelcontextprotocol/sdk/server/mcp.js');
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

// Article summary resource
server.resource(
  "summary",
  new ResourceTemplate("wikipedia://summary/{title}", { list: undefined }),
  async (uri, { title }) => {
    try {
      const data = await fetchFromWikipedia(`/page/summary/${encodeURIComponent(title)}`);
      return {
        contents: [{
          uri: uri.href,
          text: data.extract || "No summary available"
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          text: `Error retrieving summary: ${error.message}`
        }]
      };
    }
  }
);

// Article content resource
server.resource(
  "content",
  new ResourceTemplate("wikipedia://content/{title}", { list: undefined }),
  async (uri, { title }) => {
    try {
      const data = await fetchFromWikipedia(`/page/html/${encodeURIComponent(title)}`);
      return {
        contents: [{
          uri: uri.href,
          text: typeof data === 'string' ? data : JSON.stringify(data)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          text: `Error retrieving content: ${error.message}`
        }]
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