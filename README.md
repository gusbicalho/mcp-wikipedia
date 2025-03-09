# MCP Wikipedia

A Wikipedia Model Context Provider for AI applications using the [Model Context Protocol](https://github.com/modelcontextprotocol/mcp).

## Overview

This project provides a server that enables AI models to access Wikipedia content through standardized interfaces using the Model Context Protocol (MCP). It offers tools for retrieving article summaries, segments, related articles, random articles, and searching Wikipedia content.

## Features

- **Article Summary**: Retrieve concise summaries of Wikipedia articles
- **Article Segments**: Retrieve structured sections of Wikipedia articles
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

This MCP server uses the Wikipedia REST API v1 for most functionality, with the search feature using the MediaWiki Action API.

### Tools

- `get-article-summary` - Get a summary of a Wikipedia article
  - Parameters: `title` (string) - The title of the Wikipedia article

- `get-article-segments` - Get article segments/sections
  - Parameters: `title` (string) - The title of the Wikipedia article

- `find-related-articles` - Find articles related to a given title
  - Parameters: `title` (string) - The title of the Wikipedia article

- `random-article` - Get a random Wikipedia article
  - Parameters: none

- `search-wikipedia` - Search Wikipedia for articles matching a query
  - Parameters: `query` (string) - The search query

## License

MIT
