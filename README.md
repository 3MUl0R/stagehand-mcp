# Stagehand MCP

A Model Context Protocol (MCP) server that provides AI-driven web browser automation using the Stagehand library with local browser support.

## Features

- **Browser Navigation**: Open and navigate to any URL
- **Screenshots**: Capture full-page or element-specific screenshots
- **Action Execution**: Perform actions on web pages based on natural language instructions
- **Data Extraction**: Extract structured data from web pages using JSON schemas
- **Element Observation**: Identify possible interactions on web pages
- **Form Handling**: Fill out and submit forms with natural language instructions
- **Robust Error Handling**: Automatic recovery from disconnected browser sessions
- **Multiple Browser Support**: Works with Chromium, Firefox, or WebKit

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/stagehand-mcp.git
cd stagehand-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

Add the server to your MCP settings file (`cline_mcp_settings.json`).

The file location depends on your operating system:
- Windows: `C:\Users\<USERNAME>\AppData\Roaming\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\cline_mcp_settings.json`
- macOS: `~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`
- Linux: `~/.config/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`

For Claude Desktop app:
- Windows: `C:\Users\<USERNAME>\AppData\Roaming\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

Add the following configuration to the `mcpServers` section:

```json
{
  "mcpServers": {
    "stagehand-local": {
      "command": "node",
      "args": ["C:/localDev/stagehand-mcp/dist/index.js"],
      "env": {
        "PLAYWRIGHT_BROWSER": "chromium",
        "HEADLESS": "false",
        "VIEWPORT_WIDTH": "1280",
        "VIEWPORT_HEIGHT": "800",
        "DEBUG": "true",
        "ANTHROPIC_API_KEY": "your-api-key",
        "ANTHROPIC_API_URL": "https://api.anthropic.com/v1"
      },
      "disabled": false,
      "alwaysAllow": [
        "stagehand_act",
        "stagehand_extract",
        "stagehand_observe",
        "stagehand_navigate",
        "stagehand_screenshot"
      ]
    }
  }
}
```

**Note**: After making changes to the MCP settings file, you'll need to restart VSCode or the Claude Desktop app for the changes to take effect.

## Environment Variables

- `PLAYWRIGHT_BROWSER`: Browser to use (chromium, firefox, webkit)
- `HEADLESS`: Whether to run the browser in headless mode (true/false)
- `VIEWPORT_WIDTH`: Width of the browser viewport
- `VIEWPORT_HEIGHT`: Height of the browser viewport
- `DEBUG`: Enable debug logging (true/false)

## Available Tools

### stagehand_navigate

Navigate to a URL in the browser.

```javascript
use_mcp_tool({
  server_name: "stagehand-local",
  tool_name: "stagehand_navigate",
  arguments: {
    url: "https://www.example.com"
  }
})
```

### stagehand_screenshot

Takes a screenshot of the current page or a specific element.

```javascript
use_mcp_tool({
  server_name: "stagehand-local",
  tool_name: "stagehand_screenshot",
  arguments: {
    name: "example_screenshot",
    fullPage: true,
    selector: "optional-css-or-xpath-selector"
  }
})
```

### stagehand_act

Performs an action on the web page.

```javascript
use_mcp_tool({
  server_name: "stagehand-local",
  tool_name: "stagehand_act",
  arguments: {
    action: "Click the login button",
    variables: {
      username: "testuser",
      password: "testpassword"
    }
  }
})
```

### stagehand_extract

Extracts structured data from the web page.

```javascript
use_mcp_tool({
  server_name: "stagehand-local",
  tool_name: "stagehand_extract",
  arguments: {
    instruction: "Extract the main product information",
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        price: { type: "string" },
        rating: { type: "number" }
      },
      required: ["name", "price"]
    }
  }
})
```

### stagehand_observe

Identifies possible interactions on the web page.

```javascript
use_mcp_tool({
  server_name: "stagehand-local",
  tool_name: "stagehand_observe",
  arguments: {
    instruction: "Find all clickable buttons on the page"
  }
})
```

## Screenshots

All screenshots are saved to `C:\Users\<USERNAME>\Pictures\StagehandScreenshots\` with timestamped filenames.

## Testing

This repository includes a test environment to verify Stagehand MCP functionality without requiring the full MCP system:

### Setting Up a Web Server for Testing

For testing the Stagehand MCP server, you'll need a web page to interact with. You can use the included `test-page.html` file, which provides:
- Search functionality
- Product listings
- Form testing components

To serve this test page, start a simple HTTP server:

```bash
# Using npx http-server (simplest option)
npx http-server . -p 3000

# Or using Python
python -m http.server 3000

# Or using Node.js Express
# Create a simple express.js file first or use any other server of your choice
```

The test page will be available at http://localhost:3000/test-page.html

### Testing with Real MCP Tools

Once you've installed the server in your MCP settings file and restarted your application (VSCode or Claude Desktop), you can perform real functional testing using actual MCP tools.

Complete testing workflow:

#### 1. Start the web server to serve the test page

```bash
npx http-server . -p 3000
```

#### 2. Test Usage

All screenshots will be saved to `C:\Users\<USERNAME>\Pictures\StagehandScreenshots\` with timestamped filenames.

1. Start a local HTTP server to serve the test page:
   ```bash
   npx http-server . -p 3000
   ```

2. Test the MCP server using various tools in sequence:
   ```javascript
   // Navigate to the test page
   use_mcp_tool({
     server_name: "stagehand-local",
     tool_name: "stagehand_navigate",
     arguments: {
       url: "http://localhost:3000/test-page.html"
     }
   })

   // Take a screenshot
   use_mcp_tool({
     server_name: "stagehand-local",
     tool_name: "stagehand_screenshot",
     arguments: {
       name: "test_page_full",
       fullPage: true
     }
   })

   // Perform a search action
   use_mcp_tool({
     server_name: "stagehand-local",
     tool_name: "stagehand_act",
     arguments: {
       action: "Type 'test query' in the search box and click the search button"
     }
   })

   // Extract product data
   use_mcp_tool({
     server_name: "stagehand-local",
     tool_name: "stagehand_extract",
     arguments: {
       instruction: "Extract information about all products on the page",
       schema: {
         type: "object",
         properties: {
           products: {
             type: "array",
             items: {
               type: "object",
               properties: {
                 name: { type: "string" },
                 price: { type: "string" },
                 rating: { type: "string" }
               },
               required: ["name", "price"]
             }
           }
         },
         required: ["products"]
       }
     }
   })

   // Observe page interactions
   use_mcp_tool({
     server_name: "stagehand-local",
     tool_name: "stagehand_observe",
     arguments: {
       instruction: "Find all clickable buttons on the page"
     }
   })

   // Test form filling
   use_mcp_tool({
     server_name: "stagehand-local",
     tool_name: "stagehand_act",
     arguments: {
       action: "Fill out the form with name 'Test User', email 'test@example.com', message 'This is a test message' and click the Submit button"
     }
   })
   ```

3. Check the results:
   - Screenshots will be saved to the configured directory
   - Tool responses will provide detailed information about extracted data and actions performed

### Test Page

The `test-page.html` file provides a simple web interface with:
- Search functionality
- Product listings
- Form testing

This allows testing all Stagehand MCP capabilities in a controlled environment.

## Advanced Features

### Robust Browser Session Handling

The implementation includes intelligent browser session management:

- **Automatic Recovery**: Detects and recovers from disconnected or crashed browser sessions
- **Clean Navigation**: Forces browser reinitialization when navigating to new URLs
- **Session Verification**: Tests browser session validity before performing actions

### Error Handling

Comprehensive error handling with:

- Detailed operation logs for debugging
- Graceful recovery from common errors
- Clear error messages and troubleshooting information

## License

MIT