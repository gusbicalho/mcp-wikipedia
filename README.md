# MCP Wikipedia

A Wikipedia Model Context Provider for AI applications using the [Model Context Protocol](https://github.com/modelcontextprotocol/mcp).

## Overview

This project provides a server that enables AI models to access Wikipedia content through standardized interfaces. It offers resources for retrieving article summaries and content, plus tools for searching Wikipedia, finding related articles, and fetching random articles.

## Features

- **Article Summary**: Retrieve concise summaries of Wikipedia articles
- **Article Content**: Access the full HTML content of Wikipedia articles
- **Related Articles**: Find articles related to a specific topic
- **Random Article**: Discover random Wikipedia articles
- **Search**: Search Wikipedia for specific topics

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-wikipedia.git
cd mcp-wikipedia

# Install dependencies
npm install
```

## Usage

Start the MCP server:

```bash
npm start
```

Or run it directly with npx:

```bash
# From the package directory
npx .

# From anywhere (after installing globally or from a specific path)
npx mcp-wikipedia
# OR
npx /path/to/mcp-wikipedia
```

The server uses standard input/output for communication following the MCP protocol.

## API

### Resources

- `wikipedia://summary/{title}` - Get a summary of a Wikipedia article
- `wikipedia://content/{title}` - Get the full HTML content of a Wikipedia article

### Tools

- `find-related-articles` - Find articles related to a given title
- `random-article` - Get a random Wikipedia article
- `search-wikipedia` - Search Wikipedia for articles matching a query

## License

MIT